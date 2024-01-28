import type { Handler } from 'aws-lambda';
import {
  refreshGuideGeoJsonFiles,
  refreshLineGeoJsonFiles,
  refreshSpotGeoJsonFiles,
} from 'core/features/geojson';
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

  console.log('Lines:', updatedLines?.items?.length);
  console.log('Spots:', updatedSpots?.items?.length);
  console.log('Guides:', updatedGuides?.items?.length);

  // const allFeatures = [
  //   ...(updatedLines?.items ?? []),
  //   ...(updatedSpots?.items ?? []),
  //   ...(updatedGuides?.items ?? []),
  // ];

  // let position = 0;
  // const batchSize = 100;
  // while (position < allFeatures.length) {
  //   const itemsForBatch = allFeatures.slice(position, position + batchSize);
  //   if (itemsForBatch.length === 0) {
  //     break;
  //   }
  //   await batchProcessFeatures(itemsForBatch);
  //   position += batchSize;
  // }
};

// const batchProcessFeatures = async (
//   features: (DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem)[],
// ) => {
//   const promises = [];
//   for (const f of features) {
//     const feature = genericFeatureFromItem(f);
//     //
//   }
//   return Promise.all(promises);
// };

export const main = cronJobHandler;
