import { DDBGenericItemTypes } from 'core/db/utils/types';
import { SlacklineRestrictionLevel, SlacklineType } from 'core/types';

type PrimaryKeyAttrs = {
  lineId: string;
};

type IndexedKeyAttrs = {
  type: SlacklineType;
  country: string;
};

type NonKeyAttrs = {
  creatorUserId: string;
  geoJson: string; // Always FeatureCollection type
  name?: string;
  description?: string;
  length?: number;
  height?: number;
  isMeasured?: boolean;
  accessInfo?: string;
  anchorsInfo?: string;
  gearInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  restrictionInfo?: string;
  extraInfo?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  anchorImages?: { s3Key: string; id: string; isCover?: boolean }[];
  images?: { s3Key: string; id: string; isCover?: boolean }[];
};

export type DDBLineDetailTypes = DDBGenericItemTypes<PrimaryKeyAttrs, IndexedKeyAttrs, NonKeyAttrs>;
