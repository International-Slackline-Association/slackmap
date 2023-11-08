import { DDBTableKeyAttrs } from 'core/db/types';
import { SlacklineRestrictionLevel, SlacklineType } from 'core/types';

interface ParsedKeyAttrs {
  lineId: string;
  type: SlacklineType;
  country: string;
}

interface NonKeyAttrs {
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
}

export type DDBLineDetailItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBLineDetailAttrs = DDBTableKeyAttrs & NonKeyAttrs;
