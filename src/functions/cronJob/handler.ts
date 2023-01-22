import type { ScheduledHandler } from 'aws-lambda';
import * as db from 'core/db';
import { logger } from 'core/utils/logger';

logger.updateMeta({ lambdaName: 'cronJob' });

const cronJobHandler: ScheduledHandler = async (event, context, callback) => {
  try {
    await runGenericCronJob();
  } catch (err) {
    logger.error('cronJobHandler failed', { err });
  } finally {
    logger.info('cronJobHandler finished');
    callback(null);
  }
};

const runGenericCronJob = async () => {
  // refresh all lines
  // refresh all spots

  // load associations geojson

  // for each line and spot
    // find assoc containing it
    // remove all implicit editors
    // add isa admin as implicit editor
    // for each assoc
      // get all members
      // add all members as implicit editors
      // add assoc as implicit editor
};

export const main = cronJobHandler;
