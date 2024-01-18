import * as crypto from 'crypto';
import lodashAssignWith from 'lodash.assignwith';
import cloneDeep from 'lodash.clonedeep';

type NullablePartial<T> = {
  [P in keyof T]?: T[P] | null;
};

export const assignFromSourceToTarget = <T>(
  target: NullablePartial<T>,
  source: T,
  defaultValuesForNulls?: { [P in keyof T]?: T[P] },
): T => {
  function customizer(
    targetValue: any,
    srcValue: T,
    key: keyof T,
    target: NullablePartial<T>,
    source: T,
  ) {
    if (targetValue === undefined) {
      return srcValue;
    } else if (targetValue === null) {
      if (defaultValuesForNulls?.[key] !== undefined) {
        return defaultValuesForNulls[key];
      } else {
        delete target[key];
        delete source[key];
        return undefined;
      }
    } else {
      return targetValue;
    }
  }
  return lodashAssignWith(cloneDeep(target), cloneDeep(source), customizer);
};

export const generateISAIdFromUsername = (username: string) => {
  const hash = crypto.createHash('sha256').update(username).digest('hex');
  return `ISA_${hash.substring(0, 8)}`.toUpperCase();
};
