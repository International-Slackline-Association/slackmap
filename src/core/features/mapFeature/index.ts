import { FeatureCollection } from '@turf/turf';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { MapFeatureType } from 'core/types';

export const genericFeatureFromItem = (
  feature: DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem,
): {
  type: MapFeatureType;
  id: string;
  geoJson: FeatureCollection;
  country: string;
  createdDateTime: string;
  creatorUserId: string;
} => {
  if ('lineId' in feature) {
    return {
      type: 'line',
      id: feature.lineId,
      geoJson: JSON.parse(feature.geoJson),
      country: feature.country,
      createdDateTime: feature.createdDateTime,
      creatorUserId: feature.creatorUserId,
    };
  }
  if ('spotId' in feature) {
    return {
      type: 'spot',
      id: feature.spotId,
      geoJson: JSON.parse(feature.geoJson),
      country: feature.country,
      createdDateTime: feature.createdDateTime,
      creatorUserId: feature.creatorUserId,
    };
  }
  if ('guideId' in feature) {
    return {
      type: 'guide',
      id: feature.guideId,
      geoJson: JSON.parse(feature.geoJson),
      country: feature.country,
      createdDateTime: feature.createdDateTime,
      creatorUserId: feature.creatorUserId,
    };
  }
  throw new Error('Invalid feature type');
};
