import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBGuideDetailAttrs, DDBGuideDetailItem } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import { chunkArray, composeKey, destructKey, INDEX_NAMES, TABLE_NAME, transformUtils } from 'core/db/utils';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBGuideDetailItem, keyof DDBGuideDetailAttrs>,
    ConvertKeysToInterface<typeof keysUsed>
  >,
>(
  v: T,
) => {
  return v;
};

const keyUtils = typeSafeCheck({
  PK: {
    fields: ['guideId'],
    compose: (params) => composeKey('guide', params.guideId),
    destruct: (key) => ({
      guideId: destructKey(key, 1),
    }),
  },
  SK_GSI: {
    compose: () => 'guideDetails',
  },
  GSI_SK: {
    fields: ['guideId'],
    compose: (params) => composeKey('guide', params.guideId),
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBGuideDetailItem,
  DDBGuideDetailAttrs,
  typeof keysUsed
>(keyUtils);

export const guideDetailsDBUtils = {
  isDDBRecordTypeMatching: (keys: { [key: string]: any }) => {
    for (const [key, value] of Object.entries(keys)) {
      if (!isKeyValueMatching(key as any, value)) {
        return false;
      }
    }
    return true;
  },
  attrsToItem: (attrs: DocumentClient.AttributeMap) => attrsToItem(attrs as DDBGuideDetailAttrs),
};

export const getAllGuides = async <T extends keyof DDBGuideDetailAttrs>(
  opts: { startKey?: any; limit?: number; fields?: T[] } = {},
) => {
  let exclusiveStartKey: any = opts.startKey;
  const items: DDBGuideDetailItem[] = [];
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
          items: (data.Items || []).map((i) => attrsToItem(i as DDBGuideDetailAttrs)),
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

export const getGuideDetails = async <T extends keyof DDBGuideDetailAttrs>(
  guideId: string,
  opts: {
    fields?: T[];
  } = {},
) => {
  return ddb
    .get({
      TableName: TABLE_NAME,
      Key: key({ guideId }),
      ProjectionExpression: opts.fields ? opts.fields.join(', ') : undefined,
    })
    .promise()
    .then((data) => {
      if (data.Item) {
        return attrsToItem(data.Item as DDBGuideDetailAttrs);
      }
      return null;
    });
};
export const putGuide = async (line: DDBGuideDetailItem) => {
  return ddb.put({ TableName: TABLE_NAME, Item: itemToAttrs(line) }).promise();
};

export const deleteGuide = async (guideId: string) => {
  return ddb.delete({ TableName: TABLE_NAME, Key: key({ guideId }) }).promise();
};