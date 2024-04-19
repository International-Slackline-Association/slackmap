import { DeleteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from 'core/aws/clients';
import {
  KEY_FIELDS,
  TABLE_NAME,
  batchDelete,
  batchGet,
  composeKey,
  composeKeyStrictly,
  destructKey,
  recursiveQuery,
} from 'core/db/utils';
import {
  DDBEntityConverter,
  EntityKeysComposer,
  EntityKeysParser,
} from 'core/db/utils/entityConverter';
import { MapFeatureType } from 'core/types';

import { DDBMapFeatureChangelogTypes } from './types';

type PrimaryKeyAttrs = DDBMapFeatureChangelogTypes['PrimaryKeyAttrs'];
type AllKeyAttrs = DDBMapFeatureChangelogTypes['AllKeyAttrs'];
type Entity = DDBMapFeatureChangelogTypes['Entity'];
type Item = DDBMapFeatureChangelogTypes['Item'];

const keyAttrs: (keyof AllKeyAttrs)[] = ['featureId', 'featureType', 'date', 'country'];
const keyComposers = (<T extends EntityKeysComposer<PrimaryKeyAttrs, AllKeyAttrs>>(p: T) => p)({
  PK: (item: { featureId: string; featureType: MapFeatureType }) =>
    composeKey('feature', item.featureId, item.featureType),
  SK_GSI: (item: { date?: string }) => composeKey('changelog', item.date),
  GSI2: (item) => composeKeyStrictly('country', item.country),
  GSI2_SK: (item) => composeKey('featureChangelog', item.date),
  GSI3: () => 'global',
  GSI3_SK: (item) => composeKey('featureChangelog', item.date),
});
const keyParsers: EntityKeysParser<AllKeyAttrs> = {
  PK: (key) => ({
    featureId: destructKey(key, 1),
    featureType: destructKey(key, 2) as MapFeatureType,
  }),
  SK_GSI: (key) => ({
    date: destructKey(key, 1),
  }),
  GSI2: (key) => ({
    country: destructKey(key, 1),
  }),
};

const converter = new DDBEntityConverter<PrimaryKeyAttrs, AllKeyAttrs, Entity, Item>(
  keyAttrs,
  keyComposers,
  keyParsers,
);

const getFeatureChangelogs = async (
  featureId: string,
  featureType: MapFeatureType,
  opts: { startKey?: any; limit?: number } = {},
) => {
  const results = await recursiveQuery(async (lastEvaluatedKey) => {
    return ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        Limit: opts.limit,
        ExclusiveStartKey: lastEvaluatedKey,
        ScanIndexForward: false,
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
    );
  }, opts);
  return {
    items: results.items.map((r) => converter.itemToEntity(r as Item)),
    lastEvaluatedKey: results.lastEvaluatedKey,
  };
};

const getMultipleFeatureChangelog = async (
  changelogs: { featureId: string; featureType: MapFeatureType; date: string }[],
) => {
  const items = await batchGet(
    changelogs.map((i) =>
      converter.key({ featureId: i.featureId, featureType: i.featureType, date: i.date }),
    ),
  );

  return items.map((i) => converter.itemToEntity(i as Item));
};

const putFeatureChangelog = async (changelog: Entity) => {
  return ddb.send(
    new PutCommand({ TableName: TABLE_NAME, Item: converter.entityToItem(changelog) }),
  );
};

const deleteFeatureChangelog = async (
  featureId: string,
  featureType: MapFeatureType,
  date: string,
) => {
  return ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: converter.key({ featureId, featureType, date }),
    }),
  );
};

const deleteAllFeatureChangelogs = async (featureId: string, featureType: MapFeatureType) => {
  const { items } = await getFeatureChangelogs(featureId, featureType);
  await batchDelete(items.map((i) => converter.key({ featureId, featureType, date: i.date })));
};

export const mapFeatureChangelogDB = {
  converter,
  getFeatureChangelogs,
  getMultipleFeatureChangelog,
  putFeatureChangelog,
  deleteFeatureChangelog,
  deleteAllFeatureChangelogs,
};
