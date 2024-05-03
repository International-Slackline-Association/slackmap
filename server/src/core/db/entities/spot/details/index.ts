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

import { DDBSpotDetailTypes } from './types';

type PrimaryKeyAttrs = DDBSpotDetailTypes['PrimaryKeyAttrs'];
type AllKeyAttrs = DDBSpotDetailTypes['AllKeyAttrs'];
type Entity = DDBSpotDetailTypes['Entity'];
type Item = DDBSpotDetailTypes['Item'];

const keyAttrs: (keyof AllKeyAttrs)[] = ['spotId', 'country'];
const keyComposers = (<T extends EntityKeysComposer<PrimaryKeyAttrs, AllKeyAttrs>>(p: T) => p)({
  PK: (item: { spotId: string }) => composeKey('spot', item.spotId),
  SK_GSI: () => 'spotDetails',
  GSI_SK: (item) => composeKeyStrictly('spot', item.spotId),
  GSI2: (item) => composeKeyStrictly('country', item.country),
  GSI2_SK: () => composeKey('featureType', 'spot'),
});
const keyParsers: EntityKeysParser<AllKeyAttrs> = {
  PK: (key) => ({
    spotId: destructKey(key, 1),
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

const getAllSpots = async (opts: { limit?: number } = {}) => {
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

const getMultipleSpotDetails = async (spotIds: string[]) => {
  const items = await batchGet(spotIds.map((id) => converter.key({ spotId: id })));
  return items.map((i) => converter.itemToEntity(i as Item));
};

const getSpotDetails = async (spotId: string) => {
  return ddb
    .send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: converter.key({ spotId }),
      }),
    )
    .then((data) => {
      if (data.Item) {
        return converter.itemToEntity(data.Item as Item);
      }
      return null;
    });
};

const putSpot = async (spot: Entity) => {
  return ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: converter.entityToItem(spot) }));
};

const updateSpotField = async <T extends keyof Item>(spotId: string, field: T, value: Item[T]) => {
  return ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: converter.key({ spotId }),
      UpdateExpression: 'SET #field = :value',
      ExpressionAttributeNames: { '#field': field },
      ExpressionAttributeValues: { ':value': value },
      ConditionExpression: 'attribute_exists(PK)',
    }),
  );
};

const updateSpotCountry = async (spotId: string, country: string) => {
  return ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: converter.key({ spotId }),
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

const deleteSpot = async (spotId: string) => {
  return ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: converter.key({ spotId }) }));
};

export const spotDetailsDB = {
  converter,
  getAllSpots,
  getMultipleSpotDetails,
  getSpotDetails,
  putSpot,
  updateSpotField,
  updateSpotCountry,
  deleteSpot,
};
