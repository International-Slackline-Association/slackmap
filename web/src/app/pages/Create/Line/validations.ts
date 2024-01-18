import { Feature, LineString } from 'geojson';

export const validateLineFeatures = (features: Feature[]): string[] => {
  const errors: string[] = [];
  if (features.length === 0) {
    errors.push('You need to draw a line');
  }
  if (features.length > 1) {
    errors.push('Only 1 line feature is allowed');
  }
  for (const feature of features) {
    if (!isFeatureLine(feature)) {
      errors.push('Only LineString features are allowed');
    } else {
      if (feature.geometry?.coordinates.length > 2) {
        errors.push('Lines can NOT have more than 2 edges');
      }
    }
  }
  return errors;
};

const isFeatureLine = (feature: Feature): feature is Feature<LineString> => {
  return feature.geometry?.type === 'LineString';
};
