import { BatchGetCommand, BatchWriteCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import { ddb } from 'core/aws/clients';

import { DDBTableKeyAttrs, DDBTableRequiredKeyAttrs } from './types';

export const TABLE_NAME = process.env.SLACKMAP_TABLE_NAME;

export const INDEX_NAMES = {
  LSI: 'LSI',
  LSI2: 'LSI2',
  GSI: 'GSI',
  GSI2: 'GSI2',
  GSI3: 'GSI3',
};

export const KEY_FIELDS = {
  PK: 'PK',
  SK_GSI: 'SK_GSI',
  LSI: 'LSI',
  LSI2: 'LSI2',
  GSI_SK: 'GSI_SK',
  GSI2: 'GSI2',
  GSI2_SK: 'GSI2_SK',
  GSI3: 'GSI3',
  GSI3_SK: 'GSI3_SK',
};

export const recursiveQuery = async (
  queryFunc: (lastEvaluatedKey: any) => Promise<QueryCommandOutput>,
  opts: {
    startKey?: any;
    limit?: number;
  } = {},
) => {
  let lastEvaluatedKey: any = opts.startKey;
  const items: DDBTableKeyAttrs[] = [];
  do {
    const result = await queryFunc(lastEvaluatedKey);
    items.push(...(result.Items as DDBTableKeyAttrs[]));
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey && (!opts.limit || items.length < opts.limit));
  return { items, lastEvaluatedKey };
};

const chunkArray = <T>(array: T[], chunkSize: number) => {
  const temp = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    temp.push(array.slice(i, i + chunkSize));
  }

  return temp;
};
export const batchGet = async (keys: DDBTableRequiredKeyAttrs[]) => {
  const allKeys = chunkArray(keys, 100);
  const items: DDBTableKeyAttrs[] = [];
  for (let keysToLoad of allKeys) {
    while (keysToLoad.length > 0) {
      const result = await ddb.send(
        new BatchGetCommand({
          RequestItems: {
            [TABLE_NAME]: {
              Keys: keysToLoad,
            },
          },
        }),
      );
      items.push(...((result.Responses?.[TABLE_NAME] ?? []) as DDBTableKeyAttrs[]));
      keysToLoad = (result.UnprocessedKeys?.[TABLE_NAME]?.Keys as DDBTableKeyAttrs[]) ?? [];
    }
  }
  // Sort items by keys order
  return keys.map((key) => items.find((item) => item.PK === key.PK && item.SK_GSI === key.SK_GSI));
};

export const batchDelete = async (keys: DDBTableRequiredKeyAttrs[]) => {
  const allKeys = chunkArray(keys, 25);
  for (let keysToDelete of allKeys) {
    while (keysToDelete.length > 0) {
      const result = await ddb.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: keysToDelete.map((key) => ({
              DeleteRequest: {
                Key: key,
              },
            })),
          },
        }),
      );
      keysToDelete =
        result.UnprocessedItems?.[TABLE_NAME]?.map(
          (item) => item.DeleteRequest?.Key as DDBTableRequiredKeyAttrs,
        ) ?? [];
    }
  }
};

const delimeter = ':';
export const composeKey = (base: string, ...params: (string | undefined)[]) => {
  let str = base;
  for (const param of params) {
    if (param !== undefined && param !== null) {
      str = str + delimeter + param;
    } else {
      break;
    }
  }
  return str;
};

export const composeKeyStrictly = (base: string, ...params: (string | undefined)[]) => {
  if (!params || params.length === 0 || !params.some((param) => param !== undefined)) {
    return undefined;
  }
  return composeKey(base, ...params);
};

export const destructKey = (key: string, index: number) => {
  if (!key) {
    return undefined;
  }
  const regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g;
  // replace with placeholder to avoid splitting on date and them re-adding it
  const keyWithoutDate = key.replace(regex, 'DATE_PLACEHOLDER');
  const token = keyWithoutDate.split(delimeter)[index];
  if (token === 'DATE_PLACEHOLDER') {
    return key.match(regex)?.[0];
  }
  return token;
};
