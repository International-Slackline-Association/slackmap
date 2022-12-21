import cloneDeep from 'lodash.clonedeep';
import { ConvertKeysToInterface, DDBTableKeyAttrs, DDBTableRequiredKeyAttrs, TransformerParams } from 'core/db/types';

export const TABLE_NAME = process.env.SLACKMAP_TABLE_NAME as string;

export const INDEX_NAMES = {
  LSI: 'LSI',
  LSI2: 'LSI2',
  GSI: 'GSI',
  GSI2: 'GSI2',
};

export const transformUtils = <
  DDBItem extends Record<string, any>,
  DDBAttrs extends DDBTableKeyAttrs,
  UsedKeys extends readonly (keyof DDBTableKeyAttrs)[],
>(
  keyUtils: TransformerParams<
    Omit<DDBItem, keyof DDBAttrs>,
    Partial<ConvertKeysToInterface<UsedKeys>> & DDBTableRequiredKeyAttrs
  >,
) => {
  const keyFields: { [P in keyof DDBTableKeyAttrs]: P } = {
    PK: 'PK',
    SK_GSI: 'SK_GSI',
    LSI: 'LSI',
    LSI2: 'LSI2',
    GSI_SK: 'GSI_SK',
    GSI2: 'GSI2',
    GSI2_SK: 'GSI2_SK',
  };

  const key = (params: Partial<Omit<DDBItem, keyof DDBAttrs>>) => {
    if (keyUtils.PK.compose && keyUtils.SK_GSI.compose) {
      return { PK: keyUtils.PK.compose(params || {}), SK_GSI: keyUtils.SK_GSI.compose(params || {}) };
    } else {
      throw new Error('Missing PK or SK_GSI compose function');
    }
  };

  const attrsToItem = (attrs: DDBAttrs): DDBItem => {
    const { PK, SK_GSI, LSI, GSI_SK, GSI2, GSI2_SK, LSI2, ...rest } = attrs;
    let item = { ...rest };
    for (const [key, value] of Object.entries(keyUtils)) {
      if (value.destruct) {
        item = { ...item, ...value.destruct((attrs[key as keyof DDBAttrs] as string) || '') };
      }
    }
    return item as unknown as DDBItem;
  };

  const itemToAttrs = (item: DDBItem): DDBAttrs => {
    const attrs = cloneDeep<Record<string, any>>(item);

    for (const [key, value] of Object.entries(keyUtils)) {
      const composeParams = {} as any;
      for (const field of value.fields || []) {
        const fieldValue = item[field];
        if (fieldValue) {
          composeParams[field] = item[field];
          delete attrs[field as string];
        }
      }
      if (value.compose) {
        attrs[key] = value.compose(composeParams || {});
      }
    }
    return attrs as unknown as DDBAttrs;
  };

  const isKeyValueMatching = (key: keyof DDBTableRequiredKeyAttrs, value: string) => {
    const keyUtil = keyUtils[key];
    if (keyUtil.compose) {
      let computedValue: string | undefined;
      if (keyUtil.destruct) {
        computedValue = keyUtil.compose(keyUtil.destruct(value || ''));
      } else {
        computedValue = keyUtil.compose({});
      }
      if (value === computedValue) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  return { key, attrsToItem, itemToAttrs, keyFields, isKeyValueMatching };
};

const delimeter = ':';
export const composeKey = (base: string, ...params: (string | undefined)[]) => {
  let str = base;
  for (const param of params) {
    if (param !== undefined && param !== null && param.length > 0) {
      str = str + delimeter + param;
    } else {
      break;
    }
  }
  return str;
};

export const composeKeyStrictly = (base: string, ...params: (string | undefined)[]) => {
  if (!params || params.length === 0 || !params.some((param) => param !== undefined)) {
    return undefined;
  }
  return composeKey(base, ...params);
};

export const destructKey = (key: string, index: number) => {
  if (!key) {
    return undefined;
  }
  const token = key.split(delimeter)[index];
  return token;
};
