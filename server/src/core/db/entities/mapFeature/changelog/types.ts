import { DDBGenericItemTypes } from 'core/db/utils/types';
import { MapFeatureChangelogAction, MapFeatureType } from 'core/types';

type PrimaryKeyAttrs = {
  featureId: string;
  featureType: MapFeatureType;
  date: string;
};

type IndexedKeyAttrs = {
  country: string;
};

type NonKeyAttrs = {
  userId: string;
  action: MapFeatureChangelogAction;
  updatedPaths?: string[];
};

export type DDBMapFeatureChangelogTypes = DDBGenericItemTypes<
  PrimaryKeyAttrs,
  IndexedKeyAttrs,
  NonKeyAttrs
>;
