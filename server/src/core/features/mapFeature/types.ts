import { FeatureCollection } from '@turf/turf';
import { DDBGuideDetailTypes } from 'core/db/entities/guide/details/types';
import { DDBLineDetailTypes } from 'core/db/entities/line/details/types';
import { DDBSpotDetailTypes } from 'core/db/entities/spot/details/types';
import { MapFeatureChangelogAction, MapFeatureType } from 'core/types';

export type GenericMapFeatureItemType =
  | DDBLineDetailTypes['Entity']
  | DDBSpotDetailTypes['Entity']
  | DDBGuideDetailTypes['Entity'];
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
