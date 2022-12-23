import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBSpotDetailAttrs, DDBSpotDetailItem } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import { composeKey, destructKey, INDEX_NAMES, TABLE_NAME, transformUtils } from 'core/db/utils';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK'] as const;

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
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBSpotDetailItem,
  DDBSpotDetailAttrs,
  typeof keysUsed
>(keyUtils);

export const getAllSpots = async <T extends keyof DDBSpotDetailItem>(
  opts: { startKey?: any; limit?: number; fields?: T[] } = {},
) => {
  let exclusiveStartKey: any = opts.startKey;
  const items: DDBSpotDetailItem[] = [];
  do {
    const params: DocumentClient.QueryInput = {
      TableName: TABLE_NAME,
      IndexName: INDEX_NAMES.GSI,
      Limit: opts.limit,
      ExclusiveStartKey: exclusiveStartKey,
      KeyConditionExpression: '#SK_GSI = :SK_GSI',
      ProjectionExpression: opts.fields ? opts.fields.join(', ') : undefined,
      ExpressionAttributeNames: {
        '#SK_GSI': keyFields.SK_GSI,
      },
      ExpressionAttributeValues: {
        ':SK_GSI': keyUtils.SK_GSI.compose(),
      },
    };

    const queryResult = await ddb
      .query(params)
      .promise()
      .then((data) => {
        return {
          lastEvaluatedKey: data.LastEvaluatedKey,
          items: (data.Items || []).map((i) => attrsToItem(i as DDBSpotDetailAttrs)),
        };
      });
    items.push(...queryResult.items);

    exclusiveStartKey = queryResult.lastEvaluatedKey;
  } while (exclusiveStartKey && opts.limit && items.length < opts.limit);
  return {
    items,
    lastEvaluatedKey: exclusiveStartKey,
  };
};

export const getSpotDetails = async (spotId: string) => {
  return ddb
    .get({ TableName: TABLE_NAME, Key: key({ spotId }) })
    .promise()
    .then((data) => {
      if (data.Item) {
        return attrsToItem(data.Item as DDBSpotDetailAttrs);
      }
      return null;
    });
};

export const putSpot = async (spot: DDBSpotDetailItem) => {
  return ddb.put({ TableName: TABLE_NAME, Item: itemToAttrs(spot) }).promise();
};
