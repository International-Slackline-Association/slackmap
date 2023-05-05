import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBLineDetailItem, DDBLineDetailAttrs } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import {
  chunkArray,
  composeKey,
  composeKeyStrictly,
  destructKey,
  INDEX_NAMES,
  TABLE_NAME,
  transformUtils,
} from 'core/db/utils';
import { SlacklineType } from 'core/types';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK', 'GSI2', 'GSI2_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBLineDetailItem, keyof DDBLineDetailAttrs>,
    ConvertKeysToInterface<typeof keysUsed>
  >,
>(
  v: T,
) => {
  return v;
};

const keyUtils = typeSafeCheck({
  PK: {
    fields: ['lineId'],
    compose: (params) => composeKey('line', params.lineId),
    destruct: (key) => ({
      lineId: destructKey(key, 1),
    }),
  },
  SK_GSI: {
    compose: () => 'lineDetails',
  },
  GSI_SK: {
    fields: ['type'],
    compose: (params) => composeKeyStrictly('type', params.type),
    destruct: (key) => ({
      type: destructKey(key, 1) as SlacklineType,
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
    fields: ['country'],
    compose: () => 'featureType:line',
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBLineDetailItem,
  DDBLineDetailAttrs,
  typeof keysUsed
>(keyUtils);

export const lineDetailsDBUtils = {
  isDDBRecordTypeMatching: (keys: { [key: string]: any }) => {
    for (const [key, value] of Object.entries(keys)) {
      if (!isKeyValueMatching(key as any, value)) {
        return false;
      }
    }
    return true;
  },
  attrsToItem: (attrs: DocumentClient.AttributeMap) => attrsToItem(attrs as DDBLineDetailAttrs),
};

export const getAllLines = async <T extends keyof DDBLineDetailAttrs>(
  opts: { startKey?: any; limit?: number; fields?: T[] } = {},
) => {
  let exclusiveStartKey: any = opts.startKey;
  const fields = opts.fields?.length == 0 ? keysUsed : opts.fields;
  const items: DDBLineDetailItem[] = [];
  do {
    const params: DocumentClient.QueryInput = {
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
    };

    const queryResult = await ddb
      .query(params)
      .promise()
      .then((data) => {
        return {
          lastEvaluatedKey: data.LastEvaluatedKey,
          items: (data.Items || []).map((i) => attrsToItem(i as DDBLineDetailAttrs)),
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

export const getMultipleLineDetails = async (lineIds: string[]) => {
  const allKeys = chunkArray(
    lineIds.map((id) => key({ lineId: id })),
    100,
  );

  const items: DDBLineDetailItem[] = [];
  for (let keysToLoad of allKeys) {
    while (keysToLoad.length > 0) {
      const result = await ddb
        .batchGet({
          RequestItems: {
            [TABLE_NAME]: {
              Keys: keysToLoad,
            },
          },
        })
        .promise()
        .then((r) => {
          const items = r.Responses?.[TABLE_NAME] ?? [];
          return {
            items: items.map((i) => attrsToItem(i as DDBLineDetailAttrs)),
            unprocessedKeys: r.UnprocessedKeys,
          };
        });
      items.push(...result.items);
      keysToLoad = (result.unprocessedKeys?.[TABLE_NAME]?.Keys as any) ?? [];
    }
  }
  return items;
};

export const getLineDetails = async <T extends keyof DDBLineDetailAttrs>(
  lineId: string,
  opts: {
    fields?: T[];
  } = {},
) => {
  return ddb
    .get({
      TableName: TABLE_NAME,
      Key: key({ lineId }),
      ProjectionExpression: opts.fields ? opts.fields.join(', ') : undefined,
    })
    .promise()
    .then((data) => {
      if (data.Item) {
        return attrsToItem(data.Item as DDBLineDetailAttrs);
      }
      return null;
    });
};

export const putLine = async (line: DDBLineDetailItem) => {
  return ddb.put({ TableName: TABLE_NAME, Item: itemToAttrs(line) }).promise();
};

export const updateLineField = async <T extends keyof DDBLineDetailAttrs>(
  lineId: string,
  field: T,
  value: DDBLineDetailAttrs[T],
) => {
  return ddb
    .update({
      TableName: TABLE_NAME,
      Key: key({ lineId }),
      UpdateExpression: 'SET #field = :value',
      ExpressionAttributeNames: { '#field': field },
      ExpressionAttributeValues: { ':value': value },
      ConditionExpression: 'attribute_exists(PK)',
    })
    .promise();
};

export const updateLineCountry = async (lineId: string, country: string) => {
  return ddb
    .update({
      TableName: TABLE_NAME,
      Key: key({ lineId }),
      UpdateExpression: 'SET #GSI2 = :GSI2, #GSI2_SK = :GSI2_SK',
      ExpressionAttributeNames: { '#GSI2': keyFields.GSI2, '#GSI2_SK': keyFields.GSI2_SK },
      ExpressionAttributeValues: {
        ':GSI2': keyUtils.GSI2.compose({ country }),
        ':GSI2_SK': country ? keyUtils.GSI2_SK.compose() : undefined,
      },
      ConditionExpression: 'attribute_exists(PK)',
    })
    .promise();
};

export const deleteLine = async (lineId: string) => {
  return ddb.delete({ TableName: TABLE_NAME, Key: key({ lineId }) }).promise();
};
