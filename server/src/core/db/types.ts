import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';

export interface DDBTableRequiredKeyAttrs {
  readonly PK: string;
  readonly SK_GSI: string;
}
export interface DDBTableKeyAttrs extends DDBTableRequiredKeyAttrs {
  readonly LSI: string;
  readonly LSI2: string;
  readonly GSI_SK: string;
  readonly GSI2: string;
  readonly GSI2_SK: string;
}

export interface DDBGSIKeyAttrs {
  readonly PK: string;
  readonly SK_GSI: string;
  readonly GSI_SK: string;
}

export interface DDBGSI2KeyAttrs {
  readonly PK: string;
  readonly SK_GSI: string;
  readonly GSI2: string;
  readonly GSI2_SK: string;
}

export interface LSILastEvaluatedKey {
  readonly PK: string;
  readonly SK_GSI: string;
  readonly LSI: string;
}

export interface LSI2LastEvaluatedKey {
  readonly PK: string;
  readonly SK_GSI: string;
  readonly LSI2: string;
}

export interface GSILastEvaluatedKey {
  readonly PK: string;
  readonly SK_GSI: string;
  readonly GSI_SK: string;
}

export interface GSI2LastEvaluatedKey {
  readonly PK: string;
  readonly GSI2: string;
  readonly GSI2_SK: string;
}

export type TransformerParams<T, U> = {
  [key in keyof U]: {
    fields?: (keyof T)[];
    compose?: (params: { [key in keyof T]?: T[key] }) => string | undefined;
    destruct?: (key: string) => { [key in keyof T]?: T[key] };
  };
};

export type ConvertKeysToInterface<T extends readonly (keyof DDBTableKeyAttrs)[]> = {
  [key in T[number]]: any;
};

export type DDBAttributeItem = Record<string, NativeAttributeValue>;
