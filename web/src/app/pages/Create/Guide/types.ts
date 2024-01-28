import { GuideType } from '@server/core/types';
import { S3PhotoMeta } from 'app/components/ImageList';

export interface GuideDetailsForm {
  description?: string;
  type: GuideType;
  images?: S3PhotoMeta[];
}
