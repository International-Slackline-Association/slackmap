import { DDBTableKeyAttrs } from 'core/db/types';
import { GuideType } from 'core/types';

interface ParsedKeyAttrs {
  guideId: string;
  country: string;
}

export interface NonKeyAttrs {
  type: GuideType;
  creatorUserId: string;
  geoJson: string; // Always FeatureCollection type
  description?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  images?: { s3Key: string; id: string; isCover?: boolean }[];
}

export type DDBGuideDetailItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBGuideDetailAttrs = DDBTableKeyAttrs & NonKeyAttrs;
