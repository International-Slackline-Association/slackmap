import { S3PhotoMeta } from 'app/components/ImageList';

export interface SpotDetailsForm {
  name?: string;
  description?: string;
  accessInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  restrictionInfo?: string;
  extraInfo?: string;
  images?: S3PhotoMeta[];
}
