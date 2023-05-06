import { DDBTableKeyAttrs } from 'core/db/types';
import { SlacklineRestrictionLevel, SlacklineType } from 'core/types';

interface ParsedKeyAttrs {
  spotId: string;
  country: string;
}

interface NonKeyAttrs {
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
}

export type DDBSpotDetailItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBSpotDetailAttrs = DDBTableKeyAttrs & NonKeyAttrs;
