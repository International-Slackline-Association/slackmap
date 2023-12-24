import { ddb } from 'core/aws/clients';
import { DDBMapFeatureChangelogItem, DDBMapFeatureChangelogAttrs } from './types';
import { TransformerParams, ConvertKeysToInterface, DDBAttributeItem } from 'core/db/types';
import {
  chunkArray,
  composeKey,
  composeKeyStrictly,
  destructKey,
  INDEX_NAMES,
  TABLE_NAME,
  transformUtils,
} from 'core/db/utils';
import { MapFeatureType } from 'core/types';
import {
  BatchGetCommand,
  BatchWriteCommand,
  BatchWriteCommandInput,
  DeleteCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const keysUsed = ['PK', 'SK_GSI', 'GSI2', 'GSI2_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBMapFeatureChangelogItem, keyof DDBMapFeatureChangelogAttrs>,
    ConvertKeysToInterface<typeof keysUsed>
  >,
>(
  v: T,
) => {
  return v;
};

const keyUtils = typeSafeCheck({
  PK: {
    fields: ['featureId', 'featureType'],
    compose: (params) => composeKey('feature', params.featureId, params.featureType),
    destruct: (key) => ({
      featureId: destructKey(key, 1),
      featureType: destructKey(key, 2) as MapFeatureType,
    }),
  },
  SK_GSI: {
    fields: ['date'],
    compose: (params) => composeKey('changelog', params.date),
    destruct: (key) => ({
      date: destructKey(key, 1),
    }),
  },
  GSI2: {
    fields: ['country'],
    compose: (params) => composeKeyStrictly('country', params.country),
    destruct: (key) => ({
      country: destructKey(key, 1),
    }),
  },
  GSI2_SK: {
    fields: ['date'],
    compose: (params) => composeKey('featureChangelog', params.date),
    destruct: (key) => ({
      date: destructKey(key, 1),
    }),
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBMapFeatureChangelogItem,
  DDBMapFeatureChangelogAttrs,
  typeof keysUsed
>(keyUtils);

export const featureChangelogDBUtils = {
  isDDBRecordTypeMatching: (keys: { [key: string]: any }) => {
    for (const [key, value] of Object.entries(keys)) {
      if (!isKeyValueMatching(key as any, value)) {
        return false;
      }
    }
    return true;
  },
  attrsToItem: (attrs: DDBAttributeItem) => attrsToItem(attrs as DDBMapFeatureChangelogAttrs),
};

export const getFeatureChangelogs = async (
  featureId: string,
  featureType: MapFeatureType,
  opts: { startKey?: any; limit?: number } = {},
) => {
  return ddb
    .send(
      new QueryCommand({
        TableName: TABLE_NAME,
        Limit: opts.limit,
        ExclusiveStartKey: opts.startKey,
        ScanIndexForward: false,
        KeyConditionExpression: '#PK = :PK AND begins_with(#SK_SGI, :SK_SGI)',
        ExpressionAttributeNames: {
          '#PK': keyFields.PK,
          '#SK_SGI': keyFields.SK_GSI,
        },
        ExpressionAttributeValues: {
          ':PK': keyUtils.PK.compose({ featureId, featureType }),
          ':SK_SGI': keyUtils.SK_GSI.compose({}),
        },
      }),
    )
    .then((data) => {
      const items = data.Items || [];
      return {
        items: items.map((i) => attrsToItem(i as DDBMapFeatureChangelogAttrs)),
        lastEvaluatedKey: data.LastEvaluatedKey,
      };
    });
};

export const getMultipleFeatureChangelog = async (
  changelogs: { featureId: string; featureType: MapFeatureType; date: string }[],
) => {
  const allKeys = chunkArray(
    changelogs.map((c) => key({ featureId: c.featureId, featureType: c.featureType, date: c.date })),
    100,
  );

  const items: DDBMapFeatureChangelogItem[] = [];
  for (let keysToLoad of allKeys) {
    while (keysToLoad.length > 0) {
      const result = await ddb
        .send(
          new BatchGetCommand({
            RequestItems: {
              [TABLE_NAME]: {
                Keys: keysToLoad,
              },
            },
          }),
        )
        .then((r) => {
          const items = r.Responses?.[TABLE_NAME] ?? [];
          return {
            items: items.map((i) => attrsToItem(i as DDBMapFeatureChangelogAttrs)),
            unprocessedKeys: r.UnprocessedKeys,
          };
        });
      items.push(...result.items);
      keysToLoad = (result.unprocessedKeys?.[TABLE_NAME]?.Keys as any) ?? [];
    }
  }
  return items;
};

export const putFeatureChangelog = async (changelog: DDBMapFeatureChangelogItem) => {
  return ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: itemToAttrs(changelog) }));
};

export const deleteFeatureChangelog = async (featureId: string, featureType: MapFeatureType, date: string) => {
  return ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: key({ featureId, featureType, date }) }));
};

export const deleteAllFeatureChangelogs = async (featureId: string, featureType: MapFeatureType) => {
  const { items } = await getFeatureChangelogs(featureId, featureType);

  // chunk array in 25 items
  const editorsBatch = chunkArray(items, 25);

  for (const editors of editorsBatch) {
    const processingItems: BatchWriteCommandInput['RequestItems'] = {
      [TABLE_NAME]: editors.map((m) => ({
        DeleteRequest: {
          Key: key({ featureId, featureType, date: m.date }),
        },
      })),
    };
    while (processingItems[TABLE_NAME]?.length > 0) {
      const unprocessedItems = await ddb
        .send(
          new BatchWriteCommand({
            RequestItems: processingItems,
          }),
        )
        .then((r) => r.UnprocessedItems);

      processingItems[TABLE_NAME] = unprocessedItems?.[TABLE_NAME] ?? [];
    }
  }
};
