import { DDBGenericItemTypes } from 'core/db/utils/types';
import { GuideType } from 'core/types';

type PrimaryKeyAttrs = {
  guideId: string;
};

type IndexedKeyAttrs = {
  country: string;
};

type NonKeyAttrs = {
  type: GuideType;
  creatorUserId: string;
  geoJson: string; // Always FeatureCollection type
  description?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  images?: { s3Key: string; id: string; isCover?: boolean }[];
};

export type DDBGuideDetailTypes = DDBGenericItemTypes<
  PrimaryKeyAttrs,
  IndexedKeyAttrs,
  NonKeyAttrs
>;
