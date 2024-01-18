import * as turf from '@turf/turf';
import * as db from 'core/db';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Feature, FeatureCollection, featureCollection } from '@turf/turf';
import { s3 } from 'core/aws/clients';
import { GuideType, SlacklineType } from 'core/types';
import countriesJson from 'data/countryInfoDict.json';
import { AsyncReturnType } from 'type-fest';
import zlib from 'zlib';

import { guideTypeLabel } from '../guide';
import { calculateCenterOfFeature, optimizeGeoJsonFeature } from './utils';

export const processLineGeoJson = (
  geoJson: FeatureCollection,
  meta: {
    lineId: string;
    type?: SlacklineType;
    length?: number;
    country: string;
  },
): FeatureCollection => {
  const features: Feature[] = [];
  for (const feature of geoJson.features) {
    const f = optimizeGeoJsonFeature(feature);
    delete f['id'];
    f.properties = f.properties || {};
    f.properties['id'] = meta.lineId;
    f.properties['ft'] = 'l';
    f.properties['l'] = meta.length && `${meta.length.toFixed(1)}m`;
    if (meta.type && meta.type !== 'other') {
      f.properties['lt'] = meta.type?.substring(0, 1);
    }
    if (meta.country) {
      f.properties['c'] = meta.country;
    }
    features.push(f);
  }

  return { type: 'FeatureCollection', features };
};

export const processSpotGeoJson = (
  geoJson: FeatureCollection,
  meta: {
    spotId: string;
    country: string;
  },
): FeatureCollection => {
  const features: Feature[] = [];
  for (const feature of geoJson.features) {
    const f = optimizeGeoJsonFeature(feature);
    delete f['id'];
    f.properties = f.properties || {};
    f.properties['id'] = meta.spotId;
    f.properties['ft'] = 's';
    if (meta.country) {
      f.properties['c'] = meta.country;
    }
    features.push(f);
  }
  return { type: 'FeatureCollection', features };
};

export const processGuideGeoJson = (
  geoJson: FeatureCollection,
  meta: {
    guideId: string;
    type?: GuideType;
    country: string;
  },
): FeatureCollection => {
  const features: Feature[] = [];
  for (const feature of geoJson.features) {
    const f = optimizeGeoJsonFeature(feature);
    delete f['id'];
    f.properties = f.properties || {};
    f.properties['id'] = meta.guideId;
    f.properties['ft'] = 'g';
    f.properties['l'] = meta.type && guideTypeLabel(meta.type);
    if (meta.country) {
      f.properties['c'] = meta.country;
    }
    features.push(f);
  }

  return { type: 'FeatureCollection', features };
};

export const refreshLineGeoJsonFiles = async (
  opts: {
    lineIdToUpdate?: string;
  } = {},
) => {
  let mainGeoJSON: FeatureCollection;
  let updatedLines: AsyncReturnType<typeof db.getAllLines> | undefined;

  if (opts.lineIdToUpdate) {
    const line = await db.getLineDetails(opts.lineIdToUpdate);
    mainGeoJSON = await getFromS3('geojson/lines/all.geojson');
    mainGeoJSON.features = mainGeoJSON.features.filter(
      (f) => f.properties?.id !== opts.lineIdToUpdate,
    );
    if (line) {
      const geoJson = processLineGeoJson(JSON.parse(line.geoJson), {
        lineId: line.lineId,
        type: line.type,
        length: line.length,
        country: line.country,
      });
      mainGeoJSON.features.push(...geoJson.features);
      updatedLines = { items: [line], lastEvaluatedKey: undefined };
    }
  } else {
    mainGeoJSON = {
      type: 'FeatureCollection',
      features: [],
    };
    updatedLines = await db.getAllLines();
    for (const line of updatedLines.items) {
      if (line) {
        const geoJson = processLineGeoJson(JSON.parse(line.geoJson), {
          lineId: line.lineId,
          type: line.type,
          length: line.length,
          country: line.country,
        });
        for (const feature of geoJson.features) {
          mainGeoJSON.features.push(feature);
        }
      }
    }
  }

  await writeToS3('geojson/lines/all.geojson', mainGeoJSON);
  const pointsGeoJSON = generatePointsGeoJson(mainGeoJSON);
  await writeToS3('geojson/lines/points.geojson', pointsGeoJSON);
  await refreshClusterPointsGeoJsonFiles({ linePoints: pointsGeoJSON });
  return { mainGeoJSON, pointsGeoJSON, updatedLines };
};

export const refreshSpotGeoJsonFiles = async (
  opts: {
    spotIdToUpdate?: string;
  } = {},
) => {
  let mainGeoJSON: FeatureCollection;
  let updatedSpots: AsyncReturnType<typeof db.getAllSpots> | undefined;

  if (opts.spotIdToUpdate) {
    const spot = await db.getSpotDetails(opts.spotIdToUpdate);
    mainGeoJSON = await getFromS3('geojson/spots/all.geojson');
    mainGeoJSON.features = mainGeoJSON.features.filter(
      (f) => f.properties?.id !== opts.spotIdToUpdate,
    );
    if (spot) {
      const geoJson = processSpotGeoJson(JSON.parse(spot.geoJson), {
        spotId: spot.spotId,
        country: spot.country,
      });
      mainGeoJSON.features.push(...geoJson.features);
      updatedSpots = { items: [spot], lastEvaluatedKey: undefined };
    }
  } else {
    mainGeoJSON = {
      type: 'FeatureCollection',
      features: [],
    };
    updatedSpots = await db.getAllSpots();
    for (const spot of updatedSpots.items) {
      if (spot) {
        const geoJson = processSpotGeoJson(JSON.parse(spot.geoJson), {
          spotId: spot.spotId,
          country: spot.country,
        });
        for (const feature of geoJson.features) {
          mainGeoJSON.features.push(feature);
        }
      }
    }
  }

  await writeToS3('geojson/spots/all.geojson', mainGeoJSON);
  const pointsGeoJSON = generatePointsGeoJson(mainGeoJSON);
  await writeToS3('geojson/spots/points.geojson', pointsGeoJSON);
  await refreshClusterPointsGeoJsonFiles({ spotPoints: pointsGeoJSON });
  return { mainGeoJSON, pointsGeoJSON, updatedSpots };
};

export const refreshGuideGeoJsonFiles = async (
  opts: {
    guideIdToUpdate?: string;
  } = {},
) => {
  let mainGeoJSON: FeatureCollection;
  let updatedGuides: AsyncReturnType<typeof db.getAllGuides> | undefined;

  if (opts.guideIdToUpdate) {
    const guide = await db.getGuideDetails(opts.guideIdToUpdate);
    mainGeoJSON = await getFromS3('geojson/guides/all.geojson');
    mainGeoJSON.features = mainGeoJSON.features.filter(
      (f) => f.properties?.id !== opts.guideIdToUpdate,
    );
    if (guide) {
      const geoJson = processGuideGeoJson(JSON.parse(guide.geoJson), {
        guideId: guide.guideId,
        type: guide.type,
        country: guide.country,
      });
      mainGeoJSON.features.push(...geoJson.features);
      updatedGuides = { items: [guide], lastEvaluatedKey: undefined };
    }
  } else {
    mainGeoJSON = {
      type: 'FeatureCollection',
      features: [],
    };
    updatedGuides = await db.getAllGuides();
    for (const guide of updatedGuides.items) {
      if (guide) {
        const geoJson = processGuideGeoJson(JSON.parse(guide.geoJson), {
          guideId: guide.guideId,
          type: guide.type,
          country: guide.country,
        });
        for (const feature of geoJson.features) {
          mainGeoJSON.features.push(feature);
        }
      }
    }
  }

  await writeToS3('geojson/guides/all.geojson', mainGeoJSON);
  const pointsGeoJSON = generatePointsGeoJson(mainGeoJSON);
  await writeToS3('geojson/guides/points.geojson', pointsGeoJSON);
  await refreshClusterPointsGeoJsonFiles({ guidePoints: pointsGeoJSON });
  return { mainGeoJSON, pointsGeoJSON, updatedGuides };
};

const refreshClusterPointsGeoJsonFiles = async (
  opts: {
    linePoints?: FeatureCollection;
    spotPoints?: FeatureCollection;
    guidePoints?: FeatureCollection;
  } = {},
) => {
  const linesPointGeoJSON = opts.linePoints || (await getFromS3('geojson/lines/points.geojson'));
  const spotsPointGeoJSON = opts.spotPoints || (await getFromS3('geojson/spots/points.geojson'));
  const guidesPointGeoJSON = opts.guidePoints || (await getFromS3('geojson/guides/points.geojson'));

  const allPoints = featureCollection([
    ...linesPointGeoJSON.features,
    ...spotsPointGeoJSON.features,
    ...guidesPointGeoJSON.features,
  ]);

  await writeToS3('geojson/clusters/all.geojson', allPoints);
  await refreshCountryPointsGeoJson({ allPoints });
  return { allPoints };
};

const refreshCountryPointsGeoJson = async (opts: { allPoints?: FeatureCollection }) => {
  const allPointsGeoJson = opts.allPoints || (await getFromS3('geojson/clusters/all.geojson'));

  const countriesHavingFeatures = new Set<string>();
  turf.propEach(allPointsGeoJson, (currentProp) => {
    const countryId = currentProp?.['c'];
    if (countryId) {
      countriesHavingFeatures.add(countryId);
    }
  });

  const geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  for (const code of countriesHavingFeatures) {
    const countryInfo = countriesJson[code as keyof typeof countriesJson];
    if (!countryInfo) {
      throw new Error(`Country ${code} not found in countries.json`);
    }
    geojson.features.push({
      type: 'Feature',
      properties: {
        name: countryInfo.name,
        id: code,
        ft: 'ct',
      },
      geometry: countryInfo.geometry,
    });
  }

  await writeToS3('geojson/countries/points.geojson', geojson);
};

const generatePointsGeoJson = (geoJson: FeatureCollection) => {
  const pointsGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  const exisitingIds: string[] = [];
  turf.featureEach(geoJson, (feature) => {
    const id = feature.properties?.id as string;
    if (exisitingIds.includes(id)) {
      return;
    }
    const pointFeature = generatePointFeature(feature);
    pointsGeoJson.features.push(pointFeature);
    exisitingIds.push(id);
  });
  return pointsGeoJson;
};

const generatePointFeature = (feature: Feature) => {
  const coordinates = calculateCenterOfFeature(feature);
  const newFeature: Feature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: feature.properties,
  };
  return newFeature;
};

const writeToS3 = async (key: string, geoJson: FeatureCollection) => {
  const body = zlib.gzipSync(JSON.stringify(geoJson));

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.SLACKMAP_APPLICATION_DATA_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, no-cache',
      ContentEncoding: 'gzip',
    }),
  );
};

const getFromS3 = async (key: string) => {
  const s3Image = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.SLACKMAP_APPLICATION_DATA_S3_BUCKET,
      Key: key,
    }),
  );

  const streamToString = await s3Image.Body!.transformToString('base64');
  const body = zlib.gunzipSync(Buffer.from(streamToString, 'base64')).toString('utf-8');

  if (!body) {
    throw new Error('Could not get geojson from S3');
  }
  return JSON.parse(body) as FeatureCollection;
};
