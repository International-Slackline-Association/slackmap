import type { Handler } from 'aws-lambda';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { refreshGuideGeoJsonFiles, refreshLineGeoJsonFiles, refreshSpotGeoJsonFiles } from 'core/features/geojson';
import { logger } from 'core/utils/logger';
import { FeatureCollection } from '@turf/turf';

logger.updateMeta({ lambdaName: 'cronJob' });

interface EventPayload {
  featureId?: string;
}

const cronJobHandler: Handler<EventPayload> = async (event, context, callback) => {
  try {
    const featureId = event?.featureId;
    await runGenericCronJob(featureId);
  } catch (err) {
    if (err instanceof Error) {
      logger.error('cronJobHandler failed', { message: err.message, stack: err.stack });
    }
  } finally {
    callback(null);
  }
};

const runGenericCronJob = async (onlyForFeature?: string) => {
  const { allLines } = await refreshLineGeoJsonFiles();
  const { allSpots } = await refreshSpotGeoJsonFiles();
  const { allGuides } = await refreshGuideGeoJsonFiles();

  const allFeatures = [...(allLines?.items ?? []), ...(allSpots?.items ?? []), ...(allGuides?.items ?? [])];

  console.log('Lines:', allLines?.items?.length);
  console.log('Spots:', allSpots?.items?.length);
  console.log('Guides:', allGuides?.items?.length);
  for (const f of allFeatures.slice(0, 900)) {
    const feature = genericFeature(f);

    if (!feature) {
      continue;
    }

    if (onlyForFeature && onlyForFeature !== feature.id) {
      continue;
    }
  }
};

const genericFeature = (feature: DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem) => {
  if ('lineId' in feature) {
    return {
      type: 'line',
      id: feature.lineId,
      geoJson: JSON.parse(feature.geoJson) as FeatureCollection,
      country: feature.country,
    };
  }
  if ('spotId' in feature) {
    return {
      type: 'spot',
      id: feature.spotId,
      geoJson: JSON.parse(feature.geoJson) as FeatureCollection,
      country: feature.country,
    };
  }
  if ('guideId' in feature) {
    return {
      type: 'guide',
      id: feature.guideId,
      geoJson: JSON.parse(feature.geoJson) as FeatureCollection,
      country: feature.country,
    };
  }
};

export const main = cronJobHandler;
