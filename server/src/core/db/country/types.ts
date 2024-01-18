import { DDBTableKeyAttrs } from 'core/db/types';
import { MapFeatureType } from 'core/types';

interface ParsedKeyAttrs {
  code: string;
  featureId: string;
  featureType?: MapFeatureType;
  changelogDate?: string;
}

// Country is GSI2 indexed item and GSS2 are KEYS_ONLY.
// Unless, changing projection type to all keep this empty.
interface NonKeyAttrs {}

export type DDBCountryItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBCountryAttrs = DDBTableKeyAttrs & NonKeyAttrs;
