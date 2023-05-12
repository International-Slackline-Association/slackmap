import * as turf from '@turf/turf';
import { s3 } from 'core/aws/clients';
import * as db from 'core/db';
import { Feature, featureCollection, FeatureCollection, LineString } from '@turf/turf';
import { invalidateCloudfrontCache } from 'core/aws/cloudfront';
import { calculateCenterOfFeature, optimizeGeoJsonFeature } from './utils';
import zlib from 'zlib';
import { guideTypeLabel } from '../guide';
import { GuideType, SlacklineType } from 'core/types';
import { AsyncReturnType } from 'type-fest';

export const processLineGeoJson = (
  geoJson: FeatureCollection,
  meta: {
    lineId: string;
    type?: SlacklineType;
    length?: number;
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
    features.push(f);
  }

  return { type: 'FeatureCollection', features };
};

export const processSpotGeoJson = (
  geoJson: FeatureCollection,
  meta: {
    spotId: string;
  },
): FeatureCollection => {
  const features: Feature[] = [];
  for (const feature of geoJson.features) {
    const f = optimizeGeoJsonFeature(feature);
    delete f['id'];
    f.properties = f.properties || {};
    f.properties['id'] = meta.spotId;
    f.properties['ft'] = 's';
    features.push(f);
  }
  return { type: 'FeatureCollection', features };
};

export const processGuideGeoJson = (
  geoJson: FeatureCollection,
  meta: {
    guideId: string;
    type?: GuideType;
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
    mainGeoJSON.features = mainGeoJSON.features.filter((f) => f.properties?.id !== opts.lineIdToUpdate);
    if (line) {
      const geoJson = processLineGeoJson(JSON.parse(line.geoJson), {
        lineId: line.lineId,
        type: line.type,
        length: line.length,
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
    mainGeoJSON.features = mainGeoJSON.features.filter((f) => f.properties?.id !== opts.spotIdToUpdate);
    if (spot) {
      const geoJson = processSpotGeoJson(JSON.parse(spot.geoJson), {
        spotId: spot.spotId,
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
    mainGeoJSON.features = mainGeoJSON.features.filter((f) => f.properties?.id !== opts.guideIdToUpdate);
    if (guide) {
      const geoJson = processGuideGeoJson(JSON.parse(guide.geoJson), {
        guideId: guide.guideId,
        type: guide.type,
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
  opts: { linePoints?: FeatureCollection; spotPoints?: FeatureCollection; guidePoints?: FeatureCollection } = {},
) => {
  const linesPointGeoJSON = opts.linePoints || (await getFromS3('geojson/lines/points.geojson'));
  const spotsPointGeoJSON = opts.spotPoints || (await getFromS3('geojson/spots/points.geojson'));
  const guidesPointGeoJSON = opts.guidePoints || (await getFromS3('geojson/guides/points.geojson'));

  const promises: Promise<void>[] = [];

  writeToS3(
    'geojson/clusters/all.geojson',
    featureCollection([...linesPointGeoJSON.features, ...spotsPointGeoJSON.features, ...guidesPointGeoJSON.features]),
  );
  await Promise.all(promises);
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

  await s3
    .putObject({
      Bucket: process.env.SLACKMAP_APPLICATION_DATA_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, no-cache',
      ContentEncoding: 'gzip',
    })
    .promise();
};

const getFromS3 = async (key: string) => {
  const body = await s3
    .getObject({
      Bucket: process.env.SLACKMAP_APPLICATION_DATA_S3_BUCKET,
      Key: key,
    })
    .promise()
    .then((data) => {
      if (data.Body) {
        const body = zlib.gunzipSync(data.Body as Buffer);
        return body.toString('utf-8');
      }
    });
  if (!body) {
    throw new Error('Could not get geojson from S3');
  }
  return JSON.parse(body) as FeatureCollection;
};
