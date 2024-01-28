import { DDBTableKeyAttrs } from 'core/db/types';
import { MapFeatureType } from 'core/types';

interface ParsedKeyAttrs {
  featureId: string;
  featureType: MapFeatureType;
  userId: string;
  reason: EditorshipReason;
  type?: EditorType;
}

interface NonKeyAttrs {
  grantedByUserId?: string;
  ddb_ttl?: number;
  createdDateTime: string;
  lastModifiedDateTime?: string;
}

export type EditorshipReason = 'explicit' | 'temporary' | 'admin';
export type EditorType = 'owner';
export type DDBMapFeatureEditorItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBMapFeatureEditorAttrs = DDBTableKeyAttrs & NonKeyAttrs;
