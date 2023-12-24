import { ddb } from 'core/aws/clients';
import { DDBMapFeatureEditorItem, DDBMapFeatureEditorAttrs, EditorshipReason, EditorType } from './types';
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
import { MapFeatureType } from 'core/types';
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const keysUsed = ['PK', 'SK_GSI', 'LSI', 'GSI_SK'] as const;

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
    fields: ['featureId', 'featureType'],
    compose: (params) => composeKey('feature', params.featureId, params.featureType),
    destruct: (key) => ({
      featureId: destructKey(key, 1),
      featureType: destructKey(key, 2) as MapFeatureType,
    }),
  },
  SK_GSI: {
    fields: ['userId'],
    compose: (params) => composeKey('featureEditor', params.userId),
    destruct: (key) => ({
      userId: destructKey(key, 1),
    }),
  },
  LSI: {
    fields: ['reason'],
    compose: (params) => composeKey('editorReason', params.reason),
    destruct: (key) => ({
      reason: destructKey(key, 1) as EditorshipReason,
    }),
  },
  GSI_SK: {
    fields: ['type'],
    compose: (params) => composeKeyStrictly('type', params.type),
    destruct: (key) => ({
      type: destructKey(key, 1) as EditorType,
    }),
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBMapFeatureEditorItem,
  DDBMapFeatureEditorAttrs,
  typeof keysUsed
>(keyUtils);

export const getFeatureEditor = async (featureId: string, featureType: MapFeatureType, userId: string) => {
  return ddb
    .send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: key({ featureId, featureType, userId }),
      }),
    )
    .then((data) => {
      if (data.Item) {
        return attrsToItem(data.Item as DDBMapFeatureEditorAttrs);
      }
      return null;
    });
};

export const getFeatureEditors = async (
  featureId: string,
  featureType: MapFeatureType,
  opts: { limit?: number } = {},
) => {
  return ddb
    .send(
      new QueryCommand({
        TableName: TABLE_NAME,
        Limit: opts.limit,
        KeyConditionExpression: '#PK = :PK AND begins_with(#SK_SGI, :SK_SGI)',
        ExpressionAttributeNames: {
          '#PK': keyFields.PK,
          '#SK_SGI': keyFields.SK_GSI,
        },
        ExpressionAttributeValues: {
          ':PK': keyUtils.PK.compose({ featureId, featureType }),
          ':SK_SGI': keyUtils.SK_GSI?.compose({}),
        },
      }),
    )
    .then((data) => {
      const items = data.Items || [];
      return items.map((i) => attrsToItem(i as DDBMapFeatureEditorAttrs));
    });
};

export const putFeatureEditor = async (editor: DDBMapFeatureEditorItem) => {
  return ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: itemToAttrs(editor) }));
};

export const deleteFeatureEditor = async (featureId: string, featureType: MapFeatureType, userId: string) => {
  return ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: key({ featureId, featureType, userId }) }));
};

export const deleteAllFeatureEditors = async (
  featureId: string,
  featureType: MapFeatureType,
  opts: { reason?: EditorshipReason[] } = {},
) => {
  let allEditors = await getFeatureEditors(featureId, featureType);

  if (opts.reason) {
    allEditors = allEditors.filter((m) => opts.reason?.includes(m.reason));
  }
  // chunk array in 25 items
  const editorsBatch = chunkArray(allEditors, 25);

  for (const editors of editorsBatch) {
    const processingItems: BatchWriteCommandInput['RequestItems'] = {
      [TABLE_NAME]: editors.map((m) => ({
        DeleteRequest: {
          Key: key({ featureId, featureType, userId: m.userId }),
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
