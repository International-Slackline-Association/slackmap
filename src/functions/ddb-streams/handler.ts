import type { DynamoDBRecord, DynamoDBStreamHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { guideDetailsDBUtils, lineDetailsDBUtils, spotDetailsDBUtils } from 'core/db';
import { logger } from 'core/utils/logger';
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
  if (lineDetailsDBUtils.isDDBRecordTypeMatching(keys)) {
    await processLineDetailsOperation(newItem, oldItem, eventName);
    console.log('Processed line details operation:', { newItem, oldItem, eventName });
  }
  if (spotDetailsDBUtils.isDDBRecordTypeMatching(keys)) {
    await processSpotDetailsOperation(newItem, oldItem, eventName);
    console.log('Processed spot details operation:', { newItem, oldItem, eventName });
  }
  if (guideDetailsDBUtils.isDDBRecordTypeMatching(keys)) {
    await processGuideDetailsOperation(newItem, oldItem, eventName);
    console.log('Processed guide details operation:', { newItem, oldItem, eventName });
  }
};

const parseRecord = (record: DynamoDBRecord) => {
  const newImage = record.dynamodb?.NewImage;
  const oldImage = record.dynamodb?.OldImage;
  const keysAttrs = record.dynamodb?.Keys;

  if ((!newImage && !oldImage) || !keysAttrs) {
    throw new Error('Validation: Invalid dynamodb streams record');
  }

  const newItem = newImage ? AWS.DynamoDB.Converter.unmarshall(newImage) : undefined;
  const oldItem = oldImage ? AWS.DynamoDB.Converter.unmarshall(oldImage) : undefined;
  const keys = AWS.DynamoDB.Converter.unmarshall(keysAttrs);

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
