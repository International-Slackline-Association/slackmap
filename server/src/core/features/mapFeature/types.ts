import { FeatureCollection } from '@turf/turf';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { MapFeatureChangelogAction } from 'core/db/mapFeature/changelog/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { MapFeatureType } from 'core/types';

export type GenericMapFeatureItemType = DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem;
export interface MapFeatureChangelog {
  featureId: string;
  featureType: MapFeatureType;
  userName: string;
  date: string;
  htmlText: string;
  actionType: MapFeatureChangelogAction;
}

export interface GenericMapFeature {
  type: MapFeatureType;
  id: string;
  geoJson: FeatureCollection;
  country: string;
  createdDateTime: string;
  creatorUserId: string;
}
