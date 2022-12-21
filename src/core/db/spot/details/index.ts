import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBSpotDetailAttrs, DDBSpotDetailItem } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import { composeKey, destructKey, INDEX_NAMES, TABLE_NAME, transformUtils } from 'core/db/utils';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBSpotDetailItem, keyof DDBSpotDetailAttrs>,
    ConvertKeysToInterface<typeof keysUsed>
  >,
>(
  v: T,
) => {
  return v;
};

const keyUtils = typeSafeCheck({
  PK: {
    fields: ['spotId'],
    compose: (params) => composeKey('spot', params.spotId),
    destruct: (key) => ({
      spotId: destructKey(key, 1),
    }),
  },
  SK_GSI: {
    compose: () => 'spotDetails',
  },
  GSI_SK: {
    fields: ['spotId'],
    compose: (params) => composeKey('spot', params.spotId),
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBSpotDetailItem,
  DDBSpotDetailAttrs,
  typeof keysUsed
>(keyUtils);

export const getSpotDetails = async (spotId: string) => {
  return ddb
    .get({ TableName: TABLE_NAME, Key: key({ spotId }) })
    .promise()
    .then((data) => {
      if (data.Item) {
        return attrsToItem(data.Item as DDBSpotDetailAttrs);
      }
      return null;
    });
};

export const putSpot = async (spot: DDBSpotDetailItem) => {
  return ddb.put({ TableName: TABLE_NAME, Item: itemToAttrs(spot) }).promise();
};
