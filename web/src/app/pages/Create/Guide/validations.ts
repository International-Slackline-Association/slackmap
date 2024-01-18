import { Feature } from 'geojson';

export const validateGuideFeatures = (features: Feature[]): string[] => {
  const errors: string[] = [];
  if (features.length === 0) {
    errors.push('You need to draw a feature');
  }
  for (const feature of features) {
    if ('coordinates' in feature.geometry) {
      if (feature.geometry?.coordinates.length > 100) {
        errors.push('Guides can NOT have more than 100 edges');
      }
    }
  }
  return errors;
};
