import * as turf from '@turf/turf';
import { s3 } from 'core/aws/clients';
import * as db from 'core/db';
import { Feature, FeatureCollection, LineString } from '@turf/turf';
import { invalidateCloudfrontCache } from 'core/aws/cloudfront';
import { optimizeGeoJsonFeature } from './utils';

export const processLineGeoJson = (
  geoJson: FeatureCollection,
  meta: {
    lineId: string;
    type?: string;
    length?: number;
  },
): FeatureCollection => {
  const features: Feature[] = [];
  for (const feature of geoJson.features) {
    const f = optimizeGeoJsonFeature(feature);
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

export const refreshLineGeoJsonFiles = async (opts: { onlyUpdateIds?: string[] } = {}) => {
  let mainGeoJSON: FeatureCollection;

  const idsToUpdate = opts.onlyUpdateIds ?? [];
  if (idsToUpdate.length > 0) {
    mainGeoJSON = await getFromS3('geojson/lines/main.geojson');
    for (const id of idsToUpdate) {
      const line = await db.getLineDetails(id);
      if (line) {
        const geoJson = processLineGeoJson(JSON.parse(line.geoJson), {
          lineId: line.lineId,
          type: line.type,
          length: line.length,
        });
        for (const feature of geoJson.features) {
          const existingFeatureIndex = mainGeoJSON.features.findIndex((f) => f.id === feature.id);
          if (existingFeatureIndex > -1) {
            mainGeoJSON.features[existingFeatureIndex] = feature;
          } else {
            mainGeoJSON.features.push(feature);
          }
        }
      } else {
        mainGeoJSON.features = mainGeoJSON.features.filter((f) => f.properties?.id !== id);
      }
    }
  } else {
    mainGeoJSON = {
      type: 'FeatureCollection',
      features: [],
    };
    const allLines = await db.getAllLines();
    for (const line of allLines.items) {
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

  await writeToS3('geojson/lines/main.geojson', mainGeoJSON);
  const pointsGeoJSON = generatePointsGeoJson(mainGeoJSON);
  await writeToS3('geojson/lines/points.geojson', pointsGeoJSON);
  invalidateCloudfrontCache(process.env.SLACKMAP_APPLICATION_DATA_CLOUDFRONT_ID, '/geojson/lines/*');
};

export const updateSpotGeoJsonFiles = async (opts: { onlyUpdateIds?: string[] } = {}) => {
  // let mainGeoJSON: FeatureCollection;

  const mainGeoJSON: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  const allSpots = await db.getAllSpots({ fields: ['geoJson'] });
  for (const spot of allSpots.items) {
    const spotGeoJson = JSON.parse(spot.geoJson) as FeatureCollection;
    for (const feature of spotGeoJson.features) {
      const f = optimizeGeoJsonFeature(feature);
      f.id = f.properties?.id;
      if (f.properties) {
        f.properties['ft'] = 's';
      }
      mainGeoJSON.features.push(f);
    }
  }
  await writeToS3('geojson/spots/main.geojson', mainGeoJSON);
  const pointsGeoJSON = generatePointsGeoJson(mainGeoJSON);
  await writeToS3('geojson/spots/points.geojson', pointsGeoJSON);
  invalidateCloudfrontCache(process.env.SLACKMAP_APPLICATION_DATA_CLOUDFRONT_ID, '/geojson/spots/*');
};

export const updateClusterPointsGeoJsonFiles = async () => {
  const linesPointGeoJSON = await getFromS3('geojson/lines/points.geojson');
  const spotsPointGeoJSON = await getFromS3('geojson/spots/points.geojson');

  const mainGeoJSON: FeatureCollection = {
    type: 'FeatureCollection',
    features: linesPointGeoJSON.features.concat(spotsPointGeoJSON.features),
  };

  await writeToS3('geojson/clusters/main.geojson', mainGeoJSON);
  invalidateCloudfrontCache(process.env.SLACKMAP_APPLICATION_DATA_CLOUDFRONT_ID, '/geojson/clusters/main.geojson');
};

const generatePointsGeoJson = (geoJson: FeatureCollection) => {
  const pointsGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  const exisitingIds: string[] = [];
  turf.featureEach(geoJson, (feature) => {
    const id = feature.id as string;
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
  const coordinates = calculatePoint(feature);
  const newFeature: Feature = {
    id: feature.id,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: { ...feature.properties, id: feature.id },
  };
  return newFeature;
};

const calculatePoint = (geoJson: Feature) => {
  return turf.centerOfMass(geoJson).geometry.coordinates;
};

const writeToS3 = async (key: string, geoJson: FeatureCollection) => {
  await s3
    .putObject({
      Bucket: process.env.SLACKMAP_APPLICATION_DATA_S3_BUCKET,
      Key: key,
      Body: JSON.stringify(geoJson),
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=180, must-revalidate',
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
      return data.Body?.toString('utf-8');
    });
  if (!body) {
    throw new Error('Could not get geojson from S3');
  }
  return JSON.parse(body) as FeatureCollection;
};
