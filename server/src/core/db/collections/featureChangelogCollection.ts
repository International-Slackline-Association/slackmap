import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from 'core/aws/clients';
import { INDEX_NAMES, TABLE_NAME, composeKeyStrictly, recursiveQuery } from 'core/db/utils';

import { mapFeatureChangelogDB } from '../entities/mapFeature/changelog';
import { DDBMapFeatureChangelogTypes } from '../entities/mapFeature/changelog/types';
import { KEY_FIELDS, composeKey } from '../utils';
import { CollectionKeysComposer, DDBCollectionQueryParser } from '../utils/collectionParser';
import { DDBTableKeyAttrs } from '../utils/types';

const keyComposers = (<T extends CollectionKeysComposer>(p: T) => p)({
  GSI2: (code: string) => composeKey('country', code),
  GSI2_SK: (date: string) => composeKeyStrictly('featureChangelog', date),
  GSI3: () => 'global',
  GSI3_SK: (date: string) => composeKeyStrictly('featureChangelog', date),
});

type QueryReturnType = {
  mapFeatureChangelogs: DDBMapFeatureChangelogTypes['AllKeyAttrs'][];
};

const parser = new DDBCollectionQueryParser<QueryReturnType>({
  mapFeatureChangelogs: { converter: mapFeatureChangelogDB.converter },
});

export const getCountryChangelogs = async (
  code: string,
  opts: { startKey?: any; limit?: number } = {},
) => {
  const results = await recursiveQuery(async (lastEvaluatedKey) => {
    return ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: INDEX_NAMES.GSI2,
        ExclusiveStartKey: lastEvaluatedKey,
        ScanIndexForward: false,
        Limit: opts.limit,
        KeyConditionExpression: '#GSI2 = :GSI2 AND begins_with(#GSI2_SK, :GSI2_SK)',
        ExpressionAttributeNames: {
          '#GSI2': KEY_FIELDS.GSI2,
          '#GSI2_SK': KEY_FIELDS.GSI2_SK,
        },
        ExpressionAttributeValues: {
          ':GSI2': keyComposers.GSI2(code),
          ':GSI2_SK': keyComposers.GSI2_SK(''),
        },
      }),
    );
  }, opts);
  return {
    items: parser.parseQueryItems(results.items as DDBTableKeyAttrs[]),
    lastEvaluatedKey: results.lastEvaluatedKey,
  };
};

export const getGlobalChangelogs = async (opts: { startKey?: any; limit?: number } = {}) => {
  const results = await recursiveQuery(async (lastEvaluatedKey) => {
    return ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: INDEX_NAMES.GSI3,
        ExclusiveStartKey: lastEvaluatedKey,
        ScanIndexForward: false,
        Limit: opts.limit,
        KeyConditionExpression: '#GSI3 = :GSI3 AND begins_with(#GSI3_SK, :GSI3_SK)',
        ExpressionAttributeNames: {
          '#GSI3': KEY_FIELDS.GSI3,
          '#GSI3_SK': KEY_FIELDS.GSI3_SK,
        },
        ExpressionAttributeValues: {
          ':GSI3': keyComposers.GSI3(),
          ':GSI3_SK': keyComposers.GSI3_SK(''),
        },
      }),
    );
  }, opts);
  return {
    items: parser.parseQueryItems(results.items as DDBTableKeyAttrs[]),
    lastEvaluatedKey: results.lastEvaluatedKey,
  };
};

export const countryChangelogCollection = {
  getCountryChangelogs,
  getGlobalChangelogs,
};
