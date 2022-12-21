import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBLineDetailItem, DDBLineDetailAttrs } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import { composeKey, destructKey, INDEX_NAMES, TABLE_NAME, transformUtils } from 'core/db/utils';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK'] as const;

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
    compose: (params) => composeKey('type', params.type),
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBLineDetailItem,
  DDBLineDetailAttrs,
  typeof keysUsed
>(keyUtils);

export const getLineDetails = async (lineId: string) => {
  return ddb
    .get({ TableName: TABLE_NAME, Key: key({ lineId }) })
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
