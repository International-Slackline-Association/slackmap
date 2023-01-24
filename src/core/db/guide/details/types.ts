import { DDBTableKeyAttrs } from 'core/db/types';
import { GuideType, SlacklineType } from 'core/types';

interface ParsedKeyAttrs {
  guideId: string;
}

interface NonKeyAttrs {
  type: GuideType;
  creatorUserId: string;
  geoJson: string; // Always FeatureCollection type
  description?: string;
  city?: string;
  country?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  images?: { s3Key: string; id: string; isCover?: boolean }[];
}

export type DDBGuideDetailItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBGuideDetailAttrs = DDBTableKeyAttrs & NonKeyAttrs;
