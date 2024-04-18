import { DDBGenericItemTypes } from 'core/db/utils/types';
import { SlacklineRestrictionLevel } from 'core/types';

type PrimaryKeyAttrs = {
  spotId: string;
};

type IndexedKeyAttrs = {
  country: string;
};

type NonKeyAttrs = {
  creatorUserId: string;
  geoJson: string;
  name?: string;
  description?: string;
  accessInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  restrictionInfo?: string;
  extraInfo?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  images?: { s3Key: string; id: string; isCover?: boolean }[];
};

export type DDBSpotDetailTypes = DDBGenericItemTypes<PrimaryKeyAttrs, IndexedKeyAttrs, NonKeyAttrs>;
