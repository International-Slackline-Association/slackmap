import { Polygon, area } from '@turf/turf';
import { Feature } from 'geojson';

export const validateSpotFeatures = (features: Feature[]): string[] => {
  const errors: string[] = [];
  if (features.length === 0) {
    errors.push('You need to draw a polygon');
  }
  for (const feature of features) {
    if (!isFeatureSpot(feature)) {
      errors.push('Only Polygon features are allowed');
    } else {
      if (feature.geometry?.coordinates.length > 50) {
        errors.push('Spots can NOT have more than 50 edges');
      }
      const aream2 = area(feature);
      if (aream2 < 100 || aream2 > 500000) {
        throw new Error(`Spot drawn should be between 100 and 500000 square meters`);
      }
    }
  }
  return errors;
};

const isFeatureSpot = (feature: Feature): feature is Feature<Polygon> => {
  return feature.geometry?.type === 'Polygon';
};
