import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import type { DynamoDBRecord, DynamoDBStreamHandler } from 'aws-lambda';
import { guideDetailsDB } from 'core/db/entities/guide/details';
import { lineDetailsDB } from 'core/db/entities/line/details';
import { mapFeatureChangelogDB } from 'core/db/entities/mapFeature/changelog';
import { spotDetailsDB } from 'core/db/entities/spot/details';
import { logger } from 'core/utils/logger';

import { processFeatureChangelogOperation } from './changelogHandler';
import { processGuideDetailsOperation } from './guideHandler';
import { processLineDetailsOperation } from './lineHandler';
import { processSpotDetailsOperation } from './spotHandler';

logger.updateMeta({ lambdaName: 'ddbStreams' });

const dynamodbStreamEventHandler: DynamoDBStreamHandler = async (event, context, callback) => {
  const promises = [];
  if (process.env.DISABLE_STREAMS === 'true') {
    callback(null);
    return;
  }
  for (const record of event.Records) {
    promises.push(
      processRecord(record).catch((err) => {
        logger.error('processing streams', {
          data: {
            record: record,
            err: err.message,
            stack: err.stack,
          },
        });
      }),
    );
  }
  await Promise.all(promises.map(reflect));
  callback(null);
};

const processRecord = async (record: DynamoDBRecord) => {
  const { newItem, oldItem, keys, eventName } = parseRecord(record);
  if (lineDetailsDB.converter.isItemMatching(keys)) {
    await processLineDetailsOperation(newItem, oldItem, eventName);
    console.log('Processed line details operation:', { newItem, oldItem, eventName });
  }
  if (spotDetailsDB.converter.isItemMatching(keys)) {
    await processSpotDetailsOperation(newItem, oldItem, eventName);
    console.log('Processed spot details operation:', { newItem, oldItem, eventName });
  }
  if (guideDetailsDB.converter.isItemMatching(keys)) {
    await processGuideDetailsOperation(newItem, oldItem, eventName);
    console.log('Processed guide details operation:', { newItem, oldItem, eventName });
  }
  if (mapFeatureChangelogDB.converter.isItemMatching(keys)) {
    await processFeatureChangelogOperation(newItem, oldItem, eventName);
    console.log('Processed feature changelog operation:', { newItem, oldItem, eventName });
  }
};

const parseRecord = (record: DynamoDBRecord) => {
  const newImage = record.dynamodb?.NewImage;
  const oldImage = record.dynamodb?.OldImage;
  const keysAttrs = record.dynamodb?.Keys;

  if ((!newImage && !oldImage) || !keysAttrs) {
    throw new Error('Validation: Invalid dynamodb streams record');
  }

  const newItem = newImage ? unmarshall(newImage as Record<string, AttributeValue>) : undefined;
  const oldItem = oldImage ? unmarshall(oldImage as Record<string, AttributeValue>) : undefined;
  const keys = unmarshall(keysAttrs as Record<string, AttributeValue>);

  return { newItem, oldItem, keys: keys, eventName: record.eventName };
};

const reflect = (promise: Promise<any>) => {
  return promise.then(
    (v) => {
      return { v: v, status: 'resolved' };
    },
    (e) => {
      return { e: e, status: 'rejected' };
    },
  );
};

export const main = dynamodbStreamEventHandler;
