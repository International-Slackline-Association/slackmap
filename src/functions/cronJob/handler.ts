import type { Handler } from 'aws-lambda';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { refreshGuideGeoJsonFiles, refreshLineGeoJsonFiles, refreshSpotGeoJsonFiles } from 'core/features/geojson';
import { logger } from 'core/utils/logger';
import { FeatureCollection } from '@turf/turf';
import { refreshOrganizationMemberEditorsOfFeature } from 'core/features/mapFeature';

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
  let position = 0;
  const batchSize = 100;
  while (position < allFeatures.length) {
    const itemsForBatch = allFeatures.slice(position, position + batchSize);
    if (itemsForBatch.length === 0) {
      break;
    }
    await batchProcessFeatures(itemsForBatch);
    position += batchSize;
  }
};

const batchProcessFeatures = async (features: (DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem)[]) => {
  const promises = [];
  for (const f of features) {
    const feature = genericFeature(f);
    if (!feature) {
      continue;
    }
    promises.push(
      refreshOrganizationMemberEditorsOfFeature(feature.id, {
        countryCode: feature.country,
        geoJson: feature.geoJson,
      }),
    );
  }
  return Promise.all(promises);
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
