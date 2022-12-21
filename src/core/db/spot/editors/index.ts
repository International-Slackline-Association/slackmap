import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBSpotEditorItem, DDBSpotEditorAttrs } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import { composeKey, destructKey, INDEX_NAMES, TABLE_NAME, transformUtils } from 'core/db/utils';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBSpotEditorItem, keyof DDBSpotEditorAttrs>,
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
    fields: ['editorUserId'],
    compose: (params) => composeKey('spotEditor', params.editorUserId),
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
  DDBSpotEditorItem,
  DDBSpotEditorAttrs,
  typeof keysUsed
>(keyUtils);
