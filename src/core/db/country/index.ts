import { ddb } from 'core/aws/clients';
import { DDBCountryAttrs, DDBCountryItem } from './types';
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
import { MapFeatureType, SlacklineType } from 'core/types';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { QueryInput } from '@aws-sdk/client-dynamodb';

const keysUsed = ['PK', 'SK_GSI', 'GSI2', 'GSI2_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<Omit<DDBCountryItem, keyof DDBCountryAttrs>, ConvertKeysToInterface<typeof keysUsed>>,
>(
  v: T,
) => {
  return v;
};

const keyUtils = typeSafeCheck({
  PK: {
    fields: ['featureId', 'featureType', 'changelogDate'],
    compose: (params) => {
      if (params.changelogDate) {
        return composeKey('feature', params.featureId, params.featureType);
      } else if (params.featureType && params.featureId) {
        return composeKey(params.featureType, params.featureId);
      }
    },
    destruct: (key) => ({
      featureId: destructKey(key, 1),
      featureType: key.startsWith('feature') ? (destructKey(key, 2) as MapFeatureType) : undefined,
    }),
  },
  SK_GSI: {
    fields: ['changelogDate'],
    compose: (params) => composeKeyStrictly('changelog', params.changelogDate),
    destruct: (key) => ({
      changelogDate: destructKey(key, 1),
    }),
  },
  GSI2: {
    fields: ['code'],
    compose: (params) => composeKey('country', params.code),
    destruct: (key) => ({
      code: destructKey(key, 1),
    }),
  },
  GSI2_SK: {
    fields: ['featureType', 'changelogDate'],
    compose: (params) => {
      return (
        composeKeyStrictly('featureChangelog', params.changelogDate) ||
        composeKeyStrictly('featureType', params.featureType)
      );
    },
    destruct: (key) => ({
      featureType: key.startsWith('featureType') ? (destructKey(key, 1) as MapFeatureType) : undefined,
      changelogDate: key.startsWith('featureChangelog') ? destructKey(key, 1) : undefined,
    }),
  },
});

const { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching } = transformUtils<
  DDBCountryItem,
  DDBCountryAttrs,
  typeof keysUsed
>(keyUtils);

export const getCountryFeatures = async (code: string) => {
  let exclusiveStartKey: any = undefined;
  const items: DDBCountryItem[] = [];
  do {
    const queryResult = await ddb
      .send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: INDEX_NAMES.GSI2,
          ExclusiveStartKey: exclusiveStartKey,
          KeyConditionExpression: '#GSI2 = :GSI2 AND begins_with(#GSI2_SK, :GSI2_SK)',
          ExpressionAttributeNames: {
            '#GSI2': keyFields.GSI2,
            '#GSI2_SK': keyFields.GSI2_SK,
          },
          ExpressionAttributeValues: {
            ':GSI2': keyUtils.GSI2.compose({ code }),
            ':GSI2_SK': keyUtils.GSI2_SK.compose({ featureType: '' as any }),
          },
        }),
      )
      .then((data) => {
        return {
          lastEvaluatedKey: data.LastEvaluatedKey,
          items: (data.Items || []).map((i) => attrsToItem(i as DDBCountryAttrs)),
        };
      });
    items.push(...queryResult.items);

    exclusiveStartKey = queryResult.lastEvaluatedKey;
  } while (exclusiveStartKey);

  return items;
};

export const getCountryChangelogs = async (code: string, opts: { startKey?: any; limit?: number } = {}) => {
  return ddb
    .send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: INDEX_NAMES.GSI2,
        ExclusiveStartKey: opts.startKey,
        Limit: opts.limit,
        ScanIndexForward: false,
        KeyConditionExpression: '#GSI2 = :GSI2 AND begins_with(#GSI2_SK, :GSI2_SK)',
        ExpressionAttributeNames: {
          '#GSI2': keyFields.GSI2,
          '#GSI2_SK': keyFields.GSI2_SK,
        },
        ExpressionAttributeValues: {
          ':GSI2': keyUtils.GSI2.compose({ code }),
          ':GSI2_SK': keyUtils.GSI2_SK.compose({ changelogDate: '' }),
        },
      }),
    )
    .then((data) => {
      return {
        lastEvaluatedKey: data.LastEvaluatedKey,
        items: (data.Items || []).map((i) => attrsToItem(i as DDBCountryAttrs)),
      };
    });
};
