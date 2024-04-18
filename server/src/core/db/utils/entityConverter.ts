import cloneDeep from 'lodash.clonedeep';

import { DDBTableKeyAttrs, DDBTableOptionalKeyAttrs, DDBTableRequiredKeyAttrs } from './types';

type RequiredKeys<T> = { [K in keyof T as undefined extends T[K] ? never : K]: T[K] };

export type EntityKeysComposer<PrimaryKeyAttrs, AllKeyAttrs> = {
  PK: (params: { [key in keyof RequiredKeys<PrimaryKeyAttrs>]: PrimaryKeyAttrs[key] }) => string;
  SK_GSI: (params: {
    [key in keyof RequiredKeys<PrimaryKeyAttrs>]: PrimaryKeyAttrs[key];
  }) => string;
} & {
  [key in keyof DDBTableOptionalKeyAttrs]?: (params: Partial<AllKeyAttrs>) => string | undefined;
};

export type EntityKeysParser<AllKeyAttrs> = {
  PK: (key: string) => { [key in keyof RequiredKeys<AllKeyAttrs>]?: AllKeyAttrs[key] };
  SK_GSI: (key: string) => { [key in keyof RequiredKeys<AllKeyAttrs>]?: AllKeyAttrs[key] };
} & {
  [key in keyof DDBTableOptionalKeyAttrs]?: (key: string) => Partial<AllKeyAttrs>;
};

export class DDBEntityConverter<
  PrimaryKeyAttrs extends { [key: string]: any },
  AllKeyAttrs extends PrimaryKeyAttrs,
  DDBEntity extends AllKeyAttrs,
  DDBItem extends DDBTableKeyAttrs & Omit<DDBEntity, keyof AllKeyAttrs> = DDBTableKeyAttrs &
    Omit<DDBEntity, keyof AllKeyAttrs>,
> {
  constructor(
    private keyAttrs: readonly (keyof AllKeyAttrs)[],
    private keyComposers: EntityKeysComposer<PrimaryKeyAttrs, AllKeyAttrs>,
    private keyParsers: EntityKeysParser<AllKeyAttrs>,
  ) {}

  public key = (params: PrimaryKeyAttrs) => {
    return { PK: this.keyComposers.PK(params), SK_GSI: this.keyComposers.SK_GSI(params) };
  };

  public itemToEntity = (item: DDBItem): DDBEntity => {
    const { PK, SK_GSI, LSI, GSI_SK, GSI2, GSI2_SK, GSI3, GSI3_SK, LSI2, ...rest } = item;
    let entity = { ...rest } as unknown as DDBEntity;
    for (const [parserKey, parserFunc] of Object.entries(this.keyParsers)) {
      const key = parserKey as keyof DDBItem;
      const destructedValues = parserFunc(item[key]);
      entity = { ...entity, ...destructedValues };
    }
    return entity;
  };

  public entityToItem = (entity: DDBEntity): DDBItem => {
    const item = cloneDeep(entity) as unknown as DDBItem;
    for (const attr of this.keyAttrs) {
      delete item[attr as keyof DDBItem];
    }

    for (const [parserKey, composerFunc] of Object.entries(this.keyComposers)) {
      const key = parserKey as keyof typeof this.keyComposers;
      const composedValue = composerFunc(entity);
      if (composedValue) {
        item[key] = composedValue;
      }
    }
    return item;
  };

  public isItemMatching = (item: DDBTableKeyAttrs | Record<string, any>) => {
    return this.isKeyValueMatching('PK', item.PK) && this.isKeyValueMatching('SK_GSI', item.SK_GSI);
  };

  private isKeyValueMatching = (key: keyof DDBTableRequiredKeyAttrs, value: string) => {
    const destructedValue = this.keyParsers[key]?.(value);
    const computedValue = this.keyComposers[key](destructedValue as any);
    if (value === computedValue) {
      return true;
    } else {
      return false;
    }
  };
}
