import type { Handler } from 'aws-lambda';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import {
  refreshGuideGeoJsonFiles,
  refreshLineGeoJsonFiles,
  refreshSpotGeoJsonFiles,
} from 'core/features/geojson';
import { genericFeatureFromItem } from 'core/features/mapFeature';
import { refreshRepresentativeEditorsOfMapFeature } from 'core/features/mapFeature/editors';
import { logger } from 'core/utils/logger';

logger.updateMeta({ lambdaName: 'cronJob' });

interface EventPayload {
  // featureId?: string;
}

const cronJobHandler: Handler<EventPayload> = async (event, context, callback) => {
  try {
    // const featureId = event?.featureId;
    await runGenericCronJob();
  } catch (err) {
    if (err instanceof Error) {
      logger.error('cronJobHandler failed', { message: err.message, stack: err.stack });
    }
  } finally {
    callback(null);
  }
};

const runGenericCronJob = async () => {
  const { updatedLines } = await refreshLineGeoJsonFiles();
  const { updatedSpots } = await refreshSpotGeoJsonFiles();
  const { updatedGuides } = await refreshGuideGeoJsonFiles();

  const allFeatures = [
    ...(updatedLines?.items ?? []),
    ...(updatedSpots?.items ?? []),
    ...(updatedGuides?.items ?? []),
  ];

  console.log('Lines:', updatedLines?.items?.length);
  console.log('Spots:', updatedSpots?.items?.length);
  console.log('Guides:', updatedGuides?.items?.length);
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

const batchProcessFeatures = async (
  features: (DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem)[],
) => {
  const promises = [];
  for (const f of features) {
    const feature = genericFeatureFromItem(f);
    promises.push(
      refreshRepresentativeEditorsOfMapFeature(feature.id, feature.type, {
        countryCode: feature.country,
      }),
    );
  }
  return Promise.all(promises);
};

export const main = cronJobHandler;
