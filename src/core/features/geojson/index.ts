import * as turf from '@turf/turf';
import { s3 } from 'core/aws/clients';
import * as db from 'core/db';
import { Feature, FeatureCollection } from '@turf/turf';
import cloneDeep from 'lodash.clonedeep';
import { invalidateCloudfrontCache } from 'core/aws/cloudfront';

export const refreshMainGeoJSONFiles = async (opts: { onlyUpdateIds?: string[] } = {}) => {
  let mainGeoJSON: FeatureCollection;

  const idsToUpdate = opts.onlyUpdateIds ?? [];
  if (idsToUpdate.length > 0) {
    mainGeoJSON = await getFromS3('geojson/main.geojson');

    const featuresToUpdate: Feature[] = [];
    for (const id of idsToUpdate) {
      turf.featureEach(mainGeoJSON, (feature) => {
        if (feature.properties?.id === id) {
          featuresToUpdate.push(feature);
        }
      });
      mainGeoJSON.features = mainGeoJSON.features.filter((f) => f.properties?.id !== id);
    }
    for (const feature of featuresToUpdate) {
      const line = await db.getLineDetails(feature.properties?.id);
      if (line) {
        const lineGeoJson = JSON.parse(line.geoJson) as FeatureCollection;
        for (const feature of lineGeoJson.features) {
          mainGeoJSON.features.push(optimizeFeature(feature));
        }
      }
    }
  } else {
    mainGeoJSON = {
      type: 'FeatureCollection',
      features: [],
    };
    const allLines = await db.getAllLines({ fields: ['geoJson'] });
    const allSpots = await db.getAllSpots({ fields: ['geoJson'] });

    for (const line of allLines.items) {
      const lineGeoJson = JSON.parse(line.geoJson) as FeatureCollection;
      for (const feature of lineGeoJson.features) {
        mainGeoJSON.features.push(optimizeFeature(feature));
      }
    }
    for (const spot of allSpots.items) {
      const spotGeoJson = JSON.parse(spot.geoJson) as FeatureCollection;
      mainGeoJSON.features.push(...spotGeoJson.features);
    }
  }

  const pointsGeoJSON = generatePointsGeoJson(mainGeoJSON);

  await writeToS3('geojson/main.geojson', mainGeoJSON);
  await writeToS3('geojson/points.geojson', pointsGeoJSON);
  await invalidateCloudfrontCache(process.env.SLACKMAP_APPLICATION_DATA_CLOUDFRONT_ID, '/geojson/*');
};

const generatePointsGeoJson = (geoJson: FeatureCollection) => {
  const pointsGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  const exisitingIds: string[] = [];
  turf.featureEach(geoJson, (feature) => {
    if (exisitingIds.includes(feature.properties?.id)) {
      return;
    }
    const pointFeature = generatePointFeature(feature);
    pointsGeoJson.features.push(optimizeFeature(pointFeature));
    exisitingIds.push(pointFeature.properties?.id);
  });
  return pointsGeoJson;
};

const optimizeFeature = (feature: Feature) => {
  const f = cloneDeep(feature);

  // Reduce precision of coordinates
  turf.coordEach(feature, (currentCoord, coordinateIndex) => {
    const temp = [];
    for (const n of currentCoord) {
      const rounded = turf.round(n, 5);
      temp.push(rounded);
    }
    if ('coordinates' in f.geometry) {
      if (f.geometry.type === 'Point') {
        f.geometry.coordinates = temp;
      } else {
        f.geometry.coordinates[coordinateIndex] = temp;
      }
    }
  });
  return f;
};

const generatePointFeature = (feature: Feature) => {
  const coordinates = calculatePoint(feature);
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
