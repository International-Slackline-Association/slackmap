import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ddb } from 'core/aws/clients';
import {
  INDEX_NAMES,
  KEY_FIELDS,
  TABLE_NAME,
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

import { DDBGuideDetailTypes } from './types';

type PrimaryKeyAttrs = DDBGuideDetailTypes['PrimaryKeyAttrs'];
type AllKeyAttrs = DDBGuideDetailTypes['AllKeyAttrs'];
type Entity = DDBGuideDetailTypes['Entity'];
type Item = DDBGuideDetailTypes['Item'];

const keyAttrs: (keyof AllKeyAttrs)[] = ['guideId', 'country'];
const keyComposers = (<T extends EntityKeysComposer<PrimaryKeyAttrs, AllKeyAttrs>>(p: T) => p)({
  PK: (item: { guideId: string }) => composeKey('guide', item.guideId),
  SK_GSI: () => 'guideDetails',
  GSI2: (item) => composeKeyStrictly('country', item.country),
  GSI2_SK: () => composeKey('featureType', 'guide'),
});
const keyParsers: EntityKeysParser<AllKeyAttrs> = {
  PK: (key) => ({
    guideId: destructKey(key, 1),
  }),
  SK_GSI: () => ({}),

  GSI2: (key) => ({
    country: destructKey(key, 1),
  }),
};

const converter = new DDBEntityConverter<PrimaryKeyAttrs, AllKeyAttrs, Entity, Item>(
  keyAttrs,
  keyComposers,
  keyParsers,
);

const getAllGuides = async (opts: { startKey?: any; limit?: number } = {}) => {
  const results = await recursiveQuery(async (lastEvaluatedKey) => {
    return ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: INDEX_NAMES.GSI,
        Limit: opts.limit,
        ExclusiveStartKey: lastEvaluatedKey,
        KeyConditionExpression: '#SK_GSI = :SK_GSI',
        ExpressionAttributeNames: {
          '#SK_GSI': KEY_FIELDS.SK_GSI,
        },
        ExpressionAttributeValues: {
          ':SK_GSI': keyComposers.SK_GSI(),
        },
      }),
    );
  }, opts);
  return results.items.map((r) => converter.itemToEntity(r as Item));
};

const getGuideDetails = async (guideId: string) => {
  return ddb
    .send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: converter.key({ guideId }),
      }),
    )
    .then((data) => {
      if (data.Item) {
        return converter.itemToEntity(data.Item as Item);
      }
      return null;
    });
};
const putGuide = async (guide: Entity) => {
  return ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: converter.entityToItem(guide) }));
};

const updateGuideField = async <T extends keyof Item>(
  guideId: string,
  field: T,
  value: Item[T],
) => {
  return ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: converter.key({ guideId }),
      UpdateExpression: 'SET #field = :value',
      ExpressionAttributeNames: { '#field': field },
      ExpressionAttributeValues: { ':value': value },
      ConditionExpression: 'attribute_exists(PK)',
    }),
  );
};

const updateGuideCountry = async (guideId: string, country: string) => {
  return ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: converter.key({ guideId }),
      UpdateExpression: 'SET #GSI2 = :GSI2, #GSI2_SK = :GSI2_SK',
      ExpressionAttributeNames: { '#GSI2': KEY_FIELDS.GSI2, '#GSI2_SK': KEY_FIELDS.GSI2_SK },
      ExpressionAttributeValues: {
        ':GSI2': keyComposers.GSI2({ country }),
        ':GSI2_SK': keyComposers.GSI2_SK(),
      },
      ConditionExpression: 'attribute_exists(PK)',
    }),
  );
};

const deleteGuide = async (guideId: string) => {
  return ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: converter.key({ guideId }) }));
};

export const guideDetailsDB = {
  converter,
  getAllGuides,
  getGuideDetails,
  putGuide,
  updateGuideField,
  updateGuideCountry,
  deleteGuide,
};
