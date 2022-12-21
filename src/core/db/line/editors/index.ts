import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb } from 'core/aws/clients';
import { DDBLineEditorItem, DDBLineEditorAttrs } from './types';
import { TransformerParams, ConvertKeysToInterface } from 'core/db/types';
import { composeKey, destructKey, INDEX_NAMES, TABLE_NAME, transformUtils } from 'core/db/utils';

const keysUsed = ['PK', 'SK_GSI', 'GSI_SK'] as const;

const typeSafeCheck = <
  T extends TransformerParams<
    Omit<DDBLineEditorItem, keyof DDBLineEditorAttrs>,
    ConvertKeysToInterface<typeof keysUsed>
  >,
>(
  v: T,
) => {
  return v;
};

const keyUtils = typeSafeCheck({
  PK: {
    fields: ['lineId'],
    compose: (params) => composeKey('line', params.lineId),
    destruct: (key) => ({
      lineId: destructKey(key, 1),
    }),
  },
  SK_GSI: {
    fields: ['editorUserId'],
    compose: (params) => composeKey('lineEditor', params.editorUserId),
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
  DDBLineEditorItem,
  DDBLineEditorAttrs,
  typeof keysUsed
>(keyUtils);
