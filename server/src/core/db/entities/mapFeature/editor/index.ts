import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from 'core/aws/clients';
import {
  KEY_FIELDS,
  TABLE_NAME,
  batchDelete,
  composeKey,
  composeKeyStrictly,
  destructKey,
} from 'core/db/utils';
import {
  DDBEntityConverter,
  EntityKeysComposer,
  EntityKeysParser,
} from 'core/db/utils/entityConverter';
import { MapFeatureType } from 'core/types';

import { DDBMapFeatureEditorTypes, EditorType, EditorshipReason } from './types';

type PrimaryKeyAttrs = DDBMapFeatureEditorTypes['PrimaryKeyAttrs'];
type AllKeyAttrs = DDBMapFeatureEditorTypes['AllKeyAttrs'];
type Entity = DDBMapFeatureEditorTypes['Entity'];
type Item = DDBMapFeatureEditorTypes['Item'];

const keyAttrs: (keyof AllKeyAttrs)[] = ['featureId', 'featureType', 'userId', 'type', 'reason'];
const keyComposers = (<T extends EntityKeysComposer<PrimaryKeyAttrs, AllKeyAttrs>>(p: T) => p)({
  PK: (item: { featureId: string; featureType: MapFeatureType }) =>
    composeKey('feature', item.featureId, item.featureType),
  SK_GSI: (item: { userId?: string }) => composeKey('featureEditor', item.userId),
  LSI: (item) => composeKey('editorReason', item.reason),
  GSI_SK: (item) => composeKeyStrictly('type', item.type),
});
const keyParsers: EntityKeysParser<AllKeyAttrs> = {
  PK: (key) => ({
    featureId: destructKey(key, 1),
    featureType: destructKey(key, 2) as MapFeatureType,
  }),
  SK_GSI: (key) => ({
    userId: destructKey(key, 1),
  }),
  LSI: (key) => ({
    reason: destructKey(key, 1) as EditorshipReason,
  }),
  GSI_SK: (key) => ({
    type: destructKey(key, 1) as EditorType,
  }),
};

const converter = new DDBEntityConverter<PrimaryKeyAttrs, AllKeyAttrs, Entity, Item>(
  keyAttrs,
  keyComposers,
  keyParsers,
);

const getFeatureEditor = async (featureId: string, featureType: MapFeatureType, userId: string) => {
  return ddb
    .send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: converter.key({ featureId, featureType, userId }),
      }),
    )
    .then((data) => {
      if (data.Item) {
        return converter.itemToEntity(data.Item as Item);
      }
      return null;
    });
};

const getFeatureEditors = async (
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
          '#PK': KEY_FIELDS.PK,
          '#SK_SGI': KEY_FIELDS.SK_GSI,
        },
        ExpressionAttributeValues: {
          ':PK': keyComposers.PK({ featureId, featureType }),
          ':SK_SGI': keyComposers.SK_GSI({}),
        },
      }),
    )
    .then((data) => {
      const items = data.Items || [];
      return items.map((i) => converter.itemToEntity(i as Item));
    });
};

const putFeatureEditor = async (editor: Entity) => {
  return ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: converter.entityToItem(editor) }));
};

const deleteFeatureEditor = async (
  featureId: string,
  featureType: MapFeatureType,
  userId: string,
) => {
  return ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: converter.key({ featureId, featureType, userId }),
    }),
  );
};

const deleteAllFeatureEditors = async (
  featureId: string,
  featureType: MapFeatureType,
  opts: { reason?: EditorshipReason[] } = {},
) => {
  let allEditors = await getFeatureEditors(featureId, featureType);

  if (opts.reason) {
    allEditors = allEditors.filter((m) => opts.reason?.includes(m.reason));
  }

  await batchDelete(
    allEditors.map((m) => converter.key({ featureId, featureType, userId: m.userId })),
  );
};

export const mapFeatureDB = {
  converter,
  getFeatureEditor,
  getFeatureEditors,
  putFeatureEditor,
  deleteFeatureEditor,
  deleteAllFeatureEditors,
};
