import { DDBTableKeyAttrs } from 'core/db/types';
import { SlacklineRestrictionLevel, SlacklineType } from 'core/types';

interface ParsedKeyAttrs {
  lineId: string;
  type: SlacklineType;
}

interface NonKeyAttrs {
  creatorUserId: string;
  geoJson: string;
  name?: string;
  description?: string;
  city?: string;
  length?: number;
  height?: number;
  accessInfo?: string;
  anchorsInfo?: string;
  gearInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  extraInfo?: string;
  coverImageUrl?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
}

export type DDBLineDetailItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBLineDetailAttrs = DDBTableKeyAttrs & NonKeyAttrs;
