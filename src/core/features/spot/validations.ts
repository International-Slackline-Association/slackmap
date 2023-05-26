import * as turf from '@turf/turf';
import { Feature, FeatureCollection, Polygon } from '@turf/turf';
import { logger } from 'core/utils/logger';

export const validateSpotGeoJson = (geoJson: FeatureCollection): geoJson is FeatureCollection<Polygon> => {
  if (geoJson.features.length === 0) {
    throw new Error(`Validation: There must be at least 1 feature drawn`);
  }
  for (const feature of geoJson.features) {
    if (!isFeatureSpot(feature)) {
      throw new Error(`Validation: Feature drawn must be a polygon`);
    }
    if (feature.geometry?.coordinates.length > 50) {
      throw new Error(`Validation: Spots can NOT have more than 50 edges`);
    }
    const area = turf.area(feature);
    if (area < 100 || area > 500000) {
      throw new Error(`Validation: Spot drawn should be between 100 and 500000(0.5 square kilometer) square meters`);
    }
  }
  return true;
};

const isFeatureSpot = (feature: Feature): feature is Feature<Polygon> => {
  return feature.geometry?.type === 'Polygon';
};
