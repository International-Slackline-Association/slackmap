import { DDBTableKeyAttrs } from 'core/db/types';
import { SlacklineRestrictionLevel, SlacklineType } from 'core/types';

interface ParsedKeyAttrs {
  lineId: string;
}

interface NonKeyAttrs {
  type?: SlacklineType;
  creatorUserId: string;
  geoJson: string; // Always FeatureCollection type
  name?: string;
  description?: string;
  city?: string;
  country?: string;
  length?: number;
  height?: number;
  isMeasurementAccurate?: boolean;
  accessInfo?: string;
  anchorsInfo?: string;
  gearInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  restrictionInfo?: string;
  extraInfo?: string;
  coverImageUrl?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
}

export type DDBLineDetailItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBLineDetailAttrs = DDBTableKeyAttrs & NonKeyAttrs;
