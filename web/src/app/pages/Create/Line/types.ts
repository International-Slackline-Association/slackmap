import { SlacklineRestrictionLevel, SlacklineType } from '@server/core/types';
import { S3PhotoMeta } from 'app/components/ImageList';

export interface LineDetailsForm {
  type: SlacklineType;
  name?: string;
  description?: string;
  length?: number;
  height?: number;
  isMeasured: boolean;
  accessInfo?: string;
  anchorsInfo?: string;
  gearInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  restrictionInfo?: string;
  extraInfo?: string;
  anchorImages?: S3PhotoMeta[];
  images?: S3PhotoMeta[];
}
