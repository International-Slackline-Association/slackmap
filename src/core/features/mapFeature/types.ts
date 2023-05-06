import { MapFeatureType } from 'core/types';

export interface MapFeatureChangelog {
  featureId: string;
  featureType: MapFeatureType;
  changelogText: string;
  date: string;
}
