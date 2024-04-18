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
import { SlacklineType } from 'core/types';

import { DDBLineDetailTypes } from './types';

type PrimaryKeyAttrs = DDBLineDetailTypes['PrimaryKeyAttrs'];
type AllKeyAttrs = DDBLineDetailTypes['AllKeyAttrs'];
type Entity = DDBLineDetailTypes['Entity'];
type Item = DDBLineDetailTypes['Item'];

const keyAttrs: (keyof AllKeyAttrs)[] = ['lineId', 'country', 'type'];
const keyComposers = (<T extends EntityKeysComposer<PrimaryKeyAttrs, AllKeyAttrs>>(p: T) => p)({
  PK: (item: { lineId: string }) => composeKey('line', item.lineId),
  SK_GSI: () => 'lineDetails',
  GSI_SK: (item) => composeKeyStrictly('type', item.type),
  GSI2: (item) => composeKeyStrictly('country', item.country),
  GSI2_SK: () => composeKey('featureType', 'line'),
});
const keyParsers: EntityKeysParser<AllKeyAttrs> = {
  PK: (key) => ({
    lineId: destructKey(key, 1),
  }),
  SK_GSI: () => ({}),
  GSI_SK: (key) => ({
    type: destructKey(key, 1) as SlacklineType,
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

const getAllLines = async (opts: { startKey?: any; limit?: number } = {}) => {
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

const getMultipleLineDetails = async (lineIds: string[]) => {
  const items = await batchGet(lineIds.map((id) => converter.key({ lineId: id })));
  return items.map((i) => converter.itemToEntity(i as Item));
};

const getLineDetails = async (lineId: string) => {
  return ddb
    .send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: converter.key({ lineId }),
      }),
    )
    .then((data) => {
      if (data.Item) {
        return converter.itemToEntity(data.Item as Item);
      }
      return null;
    });
};

const putLine = async (line: Entity) => {
  return ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: converter.entityToItem(line) }));
};

const updateLineField = async <T extends keyof Item>(lineId: string, field: T, value: Item[T]) => {
  return ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: converter.key({ lineId }),
      UpdateExpression: 'SET #field = :value',
      ExpressionAttributeNames: { '#field': field },
      ExpressionAttributeValues: { ':value': value },
      ConditionExpression: 'attribute_exists(PK)',
    }),
  );
};

const updateLineCountry = async (lineId: string, country: string) => {
  return ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: converter.key({ lineId }),
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

const deleteLine = async (lineId: string) => {
  return ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: converter.key({ lineId }) }));
};

export const lineDetailsDB = {
  converter,
  getAllLines,
  getMultipleLineDetails,
  getLineDetails,
  putLine,
  updateLineField,
  updateLineCountry,
  deleteLine,
};
