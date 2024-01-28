import { GenericMapFeature, GenericMapFeatureItemType } from './types';

export const genericFeatureFromItem = (feature: GenericMapFeatureItemType): GenericMapFeature => {
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
