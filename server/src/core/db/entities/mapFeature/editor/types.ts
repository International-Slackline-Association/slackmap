import { DDBGenericItemTypes } from 'core/db/utils/types';
import { MapFeatureType } from 'core/types';

type PrimaryKeyAttrs = {
  featureId: string;
  featureType: MapFeatureType;
  userId: string;
};
type IndexedKeyAttrs = {
  reason: EditorshipReason;
  type?: EditorType;
};

type NonKeyAttrs = {
  grantedByUserId?: string;
  ddb_ttl?: number;
  createdDateTime: string;
  lastModifiedDateTime?: string;
};

export type EditorshipReason = 'explicit' | 'temporary' | 'admin';
export type EditorType = 'owner';
export type DDBMapFeatureEditorTypes = DDBGenericItemTypes<
  PrimaryKeyAttrs,
  IndexedKeyAttrs,
  NonKeyAttrs
>;
