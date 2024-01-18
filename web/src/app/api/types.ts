import { FeatureCollection } from 'geojson';

interface S3PhotoMetaRead {
  s3Key: string;
  isCover?: boolean;
}

type S3PhotoMetaWrite = {
  isInProcessingBucket?: boolean;
  id?: string;
} & Partial<S3PhotoMetaRead>;

export interface GetLineDetailsAPIResponse {
  id: string;
  geoJson: FeatureCollection;
  type?: SlacklineType;
  creatorUserId: string;
  name?: string;
  description?: string;
  length?: number;
  height?: number;
  accessInfo?: string;
  anchorsInfo?: string;
  gearInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  extraInfo?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  restrictionInfo?: string;
  isMeasured?: boolean;
  anchorImages?: S3PhotoMetaRead[];
  images?: S3PhotoMetaRead[];
  isUserEditor?: boolean;
}

export interface UpdateLineDetailsPayload {
  geoJson: FeatureCollection;
  type?: SlacklineType | '';
  name?: string;
  description?: string;
  length?: number;
  height?: number;
  accessInfo?: string;
  anchorsInfo?: string;
  gearInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  extraInfo?: string;
  restrictionInfo?: string;
  isMeasured?: boolean;
  images?: S3PhotoMetaWrite[];
}

export interface CreateLineDetailsPayload {
  geoJson: FeatureCollection;
  type?: SlacklineType | '';
  name?: string;
  description?: string;
  length?: number;
  height?: number;
  accessInfo?: string;
  anchorsInfo?: string;
  gearInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  extraInfo?: string;
  restrictionInfo?: string;
  isMeasured?: boolean;
  anchorImages?: S3PhotoMetaWrite[];
  images?: S3PhotoMetaWrite[];
}

export interface GetSpotDetailsAPIResponse {
  id: string;
  geoJson: FeatureCollection;
  creatorUserId: string;
  name?: string;
  description?: string;
  accessInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  extraInfo?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  restrictionInfo?: string;
  images?: S3PhotoMetaRead[];
  isUserEditor?: boolean;
}

export interface UpdateSpotDetailsPayload {
  geoJson: FeatureCollection;
  name?: string;
  description?: string;
  accessInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  restrictionInfo?: string;
  extraInfo?: string;
  images?: S3PhotoMetaWrite[];
}

export interface CreateSpotDetailsPayload {
  geoJson: FeatureCollection;
  name?: string;
  description?: string;
  accessInfo?: string;
  contactInfo?: string;
  restrictionLevel?: SlacklineRestrictionLevel;
  restrictionInfo?: string;
  extraInfo?: string;
  images?: S3PhotoMetaWrite[];
}

export interface GetGuideDetailsAPIResponse {
  id: string;
  geoJson: FeatureCollection;
  creatorUserId: string;
  description?: string;
  type: GuideType;
  typeLabel: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  isUserEditor?: boolean;
  images?: S3PhotoMetaRead[];
}

export interface UpdateGuideDetailsPayload {
  geoJson: FeatureCollection;
  description?: string;
  type: GuideType;
  images?: S3PhotoMetaWrite[];
}

export interface CreateGuideDetailsPayload {
  geoJson: FeatureCollection;
  description?: string;
  type: GuideType;
  images?: S3PhotoMetaWrite[];
}

export interface GetUserBasicDetailsAPIResponse {
  name: string;
  surname?: string;
  email: string;
  profilePictureUrl?: string;
  isaId: string;
}

export interface MapFeatureChangelogResponse {
  items: {
    featureId: string;
    featureType: SlacklineMapFeatureType;
    userName: string;
    date: string;
    htmlText: string;
    actionType: MapFeatureChangelogAction;
  }[];
  pagination: {
    cursor: string;
  };
}

export interface GetCountryDetailsAPIResponse {
  name: string;
}

export interface GetCountryChangelogsAPIResponse {
  items: {
    featureId: string;
    featureType: SlacklineMapFeatureType;
    userName: string;
    date: string;
    htmlText: string;
    actionType: MapFeatureChangelogAction;
  }[];
  pagination: {
    cursor: string;
  };
}

interface SlacklineGroupInfoItem {
  id: string;
  name: string;
  createdDateTime: string; // only date
  updatedDateTime: string; // only date
  email?: string;
  facebookPage?: string;
  facebookGroup?: string;
  telegram?: string;
  instagram?: string;
  whatsapp?: string;
  webpage?: string;
}

export interface GetCommunityCountryDetailsAPIResponse {
  name: string;
  isaMembers: {
    country: string;
    name: string;
    joinedDate?: string;
    email: string;
    infoUrl?: string;
    profilePictureUrl?: string;
    groupId?: string;
    memberType: 'national' | 'observer' | 'partner' | 'associate';
  }[];
  slacklineGroups: SlacklineGroupInfoItem[];
}

export interface GetSlacklineGroupDetailsAPIResponse {
  info: SlacklineGroupInfoItem;
}
