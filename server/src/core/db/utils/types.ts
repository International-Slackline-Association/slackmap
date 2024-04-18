import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';

export interface DDBTableRequiredKeyAttrs {
  PK: string;
  SK_GSI: string;
}
export interface DDBTableOptionalKeyAttrs {
  LSI?: string;
  LSI2?: string;
  GSI_SK?: string;
  GSI2?: string;
  GSI2_SK?: string;
  GSI3?: string;
  GSI3_SK?: string;
}
export type DDBTableKeyAttrs = DDBTableRequiredKeyAttrs & DDBTableOptionalKeyAttrs;

export type DDBGenericItemTypes<PrimaryKeyAttrs, IndexedKeyAttrs, NonKeyAttrs> = Prettify<{
  readonly PrimaryKeyAttrs: PrimaryKeyAttrs;
  readonly AllKeyAttrs: PrimaryKeyAttrs & IndexedKeyAttrs;
  readonly Entity: PrimaryKeyAttrs & IndexedKeyAttrs & NonKeyAttrs;
  readonly Item: DDBTableKeyAttrs & NonKeyAttrs;
}>;

export type DDBAttributeItem = Record<string, NativeAttributeValue>;
