import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBMapFeatureEditorItem, DDBMapFeatureEditorAttrs } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import { composeKey, destructKey, INDEX_NAMES, TABLE_NAME, transformUtils } from 'core/db/utils';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBMapFeatureEditorItem, keyof DDBMapFeatureEditorAttrs>,
    ConvertKeysToInterface<typeof keysUsed>
  >,
>(
  v: T,
) => {
  return v;
};

const keyUtils = typeSafeCheck({
  PK: {
    fields: ['featureId'],
    compose: (params) => composeKey('feature', params.featureId),
    destruct: (key) => ({
      featureId: destructKey(key, 1),
    }),
  },
  SK_GSI: {
    fields: ['editorUserId'],
    compose: (params) => composeKey('editor', params.editorUserId),
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
  DDBMapFeatureEditorItem,
  DDBMapFeatureEditorAttrs,
  typeof keysUsed
>(keyUtils);

export const getMapFeatureEditor = async (featureId: string, editorUserId: string) => {
  return ddb
    .get({
      TableName: TABLE_NAME,
      Key: key({ featureId, editorUserId }),
    })
    .promise()
    .then((data) => {
      if (data.Item) {
        return attrsToItem(data.Item as DDBMapFeatureEditorAttrs);
      }
      return null;
    });
};

export const getMapFeatureEditors = async (featureId: string) => {
  return ddb
    .query({
      TableName: TABLE_NAME,
      KeyConditionExpression: '#PK = :PK AND begins_with(#SK_SGI, :SK_SGI)',
      ExpressionAttributeNames: {
        '#PK': keyFields.PK,
        '#SK_SGI': keyFields.SK_GSI,
      },
      ExpressionAttributeValues: {
        ':PK': keyUtils.PK.compose({ featureId }),
        ':SK_SGI': keyUtils.SK_GSI?.compose({}),
      },
    })
    .promise()
    .then((data) => {
      const items = data.Items || [];
      return items.map((i) => attrsToItem(i as DDBMapFeatureEditorAttrs));
    });
};

export const putMapFeatureEditor = async (editor: DDBMapFeatureEditorItem) => {
  return ddb.put({ TableName: TABLE_NAME, Item: itemToAttrs(editor) }).promise();
};

export const deleteMapFeatureEditor = async (featureId: string, editorUserId: string) => {
  return ddb.delete({ TableName: TABLE_NAME, Key: key({ featureId, editorUserId }) }).promise();
};

export const deleteAllMapFeatureEditors = async (featureId: string) => {
  const editors = await getMapFeatureEditors(featureId);

  let processingItems: DocumentClient.BatchWriteItemRequestMap = {
    [TABLE_NAME]: editors.map((m) => ({
      DeleteRequest: {
        Key: key({ featureId, editorUserId: m.editorUserId }),
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
