import { DDBTableKeyAttrs } from 'core/db/types';
import { SlacklineRestrictionLevel, SlacklineType } from 'core/types';

interface ParsedKeyAttrs {
  spotId: string;
}

interface NonKeyAttrs {
  creatorUserId: string;
  geoJson: string;
  name?: string;
  description?: string;
  accessInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  extraInfo?: string;
  coverImageUrl?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
}

export type DDBSpotDetailItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBSpotDetailAttrs = DDBTableKeyAttrs & NonKeyAttrs;
