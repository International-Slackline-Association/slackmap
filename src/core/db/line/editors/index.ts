import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBLineEditorItem, DDBLineEditorAttrs } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import { composeKey, destructKey, INDEX_NAMES, TABLE_NAME, transformUtils } from 'core/db/utils';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBLineEditorItem, keyof DDBLineEditorAttrs>,
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
    fields: ['editorUserId'],
    compose: (params) => composeKey('lineEditor', params.editorUserId),
    destruct: (key) => ({
      editorUserId: destructKey(key, 1),
    }),
  },
  GSI_SK: {
    fields: ['userIdentityType'],
    compose: (params) => composeKey('identityType', params.userIdentityType),
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBLineEditorItem,
  DDBLineEditorAttrs,
  typeof keysUsed
>(keyUtils);

export const getLineEditor = async (lineId: string, editorUserId: string) => {
  return ddb
    .get({
      TableName: TABLE_NAME,
      Key: key({ lineId, editorUserId }),
    })
    .promise()
    .then((data) => {
      if (data.Item) {
        return attrsToItem(data.Item as DDBLineEditorAttrs);
      }
      return null;
    });
};

export const getLineEditors = async (lineId: string) => {
  return ddb
    .query({
      TableName: TABLE_NAME,
      KeyConditionExpression: '#PK = :PK AND begins_with(#SK_SGI, :SK_SGI)',
      ExpressionAttributeNames: {
        '#PK': keyFields.PK,
        '#SK_SGI': keyFields.SK_GSI,
      },
      ExpressionAttributeValues: {
        ':PK': keyUtils.PK.compose({ lineId }),
        ':SK_SGI': keyUtils.SK_GSI?.compose({}),
      },
    })
    .promise()
    .then((data) => {
      const items = data.Items || [];
      return items.map((i) => attrsToItem(i as DDBLineEditorAttrs));
    });
};

export const putLineEditor = async (line: DDBLineEditorItem) => {
  return ddb.put({ TableName: TABLE_NAME, Item: itemToAttrs(line) }).promise();
};

export const deleteLineEditor = async (lineId: string, editorUserId: string) => {
  return ddb.delete({ TableName: TABLE_NAME, Key: key({ lineId, editorUserId }) }).promise();
};

export const deleteAllLineEditors = async (lineId: string) => {
  const members = await getLineEditors(lineId);

  let processingItems: DocumentClient.BatchWriteItemRequestMap = {
    [TABLE_NAME]: members.map((m) => ({
      DeleteRequest: {
        Key: key({ lineId, editorUserId: m.editorUserId }),
      },
    })),
  };
  while (processingItems[TABLE_NAME]?.length > 0) {
    const unprocessedItems = await ddb
      .batchWrite({
        RequestItems: processingItems,
      })
      .promise()
      .then((r) => r.UnprocessedItems);

    processingItems = unprocessedItems as any;
  }
};
