import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ddb } from 'core/aws/clients';
import { ConvertKeysToInterface, DDBAttributeItem, TransformerParams } from 'core/db/types';
import {
  INDEX_NAMES,
  TABLE_NAME,
  chunkArray,
  composeKey,
  composeKeyStrictly,
  destructKey,
  transformUtils,
} from 'core/db/utils';

import { DDBSpotDetailAttrs, DDBSpotDetailItem } from './types';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK', 'GSI2', 'GSI2_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBSpotDetailItem, keyof DDBSpotDetailAttrs>,
    ConvertKeysToInterface<typeof keysUsed>
  >,
>(
  v: T,
) => {
  return v;
};

const keyUtils = typeSafeCheck({
  PK: {
    fields: ['spotId'],
    compose: (params) => composeKey('spot', params.spotId),
    destruct: (key) => ({
      spotId: destructKey(key, 1),
    }),
  },
  SK_GSI: {
    compose: () => 'spotDetails',
  },
  GSI_SK: {
    fields: ['spotId'],
    compose: (params) => composeKey('spot', params.spotId),
  },
  GSI2: {
    fields: ['country'],
    compose: (params) => composeKeyStrictly('country', params.country),
    destruct: (key) => ({
      country: destructKey(key, 1),
    }),
  },
  GSI2_SK: {
    fields: ['country'],
    compose: () => 'featureType:spot',
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBSpotDetailItem,
  DDBSpotDetailAttrs,
  typeof keysUsed
>(keyUtils);

export const spotDetailsDBUtils = {
  isDDBRecordTypeMatching: (keys: { [key: string]: any }) => {
    for (const [key, value] of Object.entries(keys)) {
      if (!isKeyValueMatching(key as any, value)) {
        return false;
      }
    }
    return true;
  },
  attrsToItem: (attrs: DDBAttributeItem) => attrsToItem(attrs as DDBSpotDetailAttrs),
};

export const getAllSpots = async <T extends keyof DDBSpotDetailAttrs>(
  opts: { startKey?: any; limit?: number; fields?: T[] } = {},
) => {
  let exclusiveStartKey: any = opts.startKey;
  const fields = opts.fields?.length == 0 ? keysUsed : opts.fields;

  const items: DDBSpotDetailItem[] = [];
  do {
    const queryResult = await ddb
      .send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: INDEX_NAMES.GSI,
          Limit: opts.limit,
          ExclusiveStartKey: exclusiveStartKey,
          KeyConditionExpression: '#SK_GSI = :SK_GSI',
          ProjectionExpression: fields ? fields.join(', ') : undefined,
          ExpressionAttributeNames: {
            '#SK_GSI': keyFields.SK_GSI,
          },
          ExpressionAttributeValues: {
            ':SK_GSI': keyUtils.SK_GSI.compose(),
          },
        }),
      )
      .then((data) => {
        return {
          lastEvaluatedKey: data.LastEvaluatedKey,
          items: (data.Items || []).map((i) => attrsToItem(i as DDBSpotDetailAttrs)),
        };
      });
    items.push(...queryResult.items);

    exclusiveStartKey = queryResult.lastEvaluatedKey;
  } while (exclusiveStartKey && (opts.limit ? items.length < opts.limit : true));
  return {
    items,
    lastEvaluatedKey: exclusiveStartKey,
  };
};

export const getMultipleSpotDetails = async (spotIds: string[]) => {
  const allKeys = chunkArray(
    spotIds.map((id) => key({ spotId: id })),
    100,
  );

  const items: DDBSpotDetailItem[] = [];
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
            items: items.map((i) => attrsToItem(i as DDBSpotDetailAttrs)),
            unprocessedKeys: r.UnprocessedKeys,
          };
        });
      items.push(...result.items);
      keysToLoad = (result.unprocessedKeys?.[TABLE_NAME]?.Keys as any) ?? [];
    }
  }
  return items;
};

export const getSpotDetails = async <T extends keyof DDBSpotDetailAttrs>(
  spotId: string,
  opts: {
    fields?: T[];
  } = {},
) => {
  const fields = opts.fields?.length == 0 ? keysUsed : opts.fields;
  return ddb
    .send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: key({ spotId }),
        ProjectionExpression: fields ? fields.join(', ') : undefined,
      }),
    )
    .then((data) => {
      if (data.Item) {
        return attrsToItem(data.Item as DDBSpotDetailAttrs);
      }
      return null;
    });
};

export const putSpot = async (spot: DDBSpotDetailItem) => {
  return ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: itemToAttrs(spot) }));
};

export const updateSpotField = async <T extends keyof DDBSpotDetailAttrs>(
  spotId: string,
  field: T,
  value: DDBSpotDetailAttrs[T],
) => {
  return ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key({ spotId }),
      UpdateExpression: 'SET #field = :value',
      ExpressionAttributeNames: { '#field': field },
      ExpressionAttributeValues: { ':value': value },
      ConditionExpression: 'attribute_exists(PK)',
    }),
  );
};

export const updateSpotCountry = async (spotId: string, country: string) => {
  return ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key({ spotId }),
      UpdateExpression: 'SET #GSI2 = :GSI2, #GSI2_SK = :GSI2_SK',
      ExpressionAttributeNames: { '#GSI2': keyFields.GSI2, '#GSI2_SK': keyFields.GSI2_SK },
      ExpressionAttributeValues: {
        ':GSI2': keyUtils.GSI2.compose({ country }),
        ':GSI2_SK': country ? keyUtils.GSI2_SK.compose() : undefined,
      },
      ConditionExpression: 'attribute_exists(PK)',
    }),
  );
};

export const deleteSpot = async (spotId: string) => {
  return ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: key({ spotId }) }));
};
