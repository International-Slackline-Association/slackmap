import { FeatureCollection } from '@turf/turf';
import { MapFeatureChangelogAction } from 'core/db/mapFeature/changelog/types';
import { MapFeatureType } from 'core/types';

export interface MapFeatureChangelog {
  featureId: string;
  featureType: MapFeatureType;
  userName: string;
  date: string;
  htmlText: string;
  actionType: MapFeatureChangelogAction;
}

export interface GenericFeature {
  type: MapFeatureType;
  id: string;
  geoJson: FeatureCollection;
  country: string;
  createdDateTime: string;
  creatorUserId: string;
}
