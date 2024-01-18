import * as turf from '@turf/turf';
import { Feature, FeatureCollection, LineString } from '@turf/turf';

export const validateLineGeoJson = (
  geoJson: FeatureCollection,
  givenLength?: number,
): geoJson is FeatureCollection<LineString> => {
  if (geoJson.features.length !== 1) {
    throw new Error(`Validation: There must be at least 1 feature drawn`);
  }
  const feature = geoJson.features[0];
  if (!isFeatureLine(feature)) {
    throw new Error(`Validation: Feature drawn must be a line`);
  }
  if (feature.geometry?.coordinates.length > 2) {
    throw new Error(`Validation: Lines can NOT have more than 2 edges`);
  }
  const drawLength = turf.length(feature, { units: 'meters' });
  if (drawLength < 5 || drawLength > 3000) {
    throw new Error(`Validation: Line drawn should be between 5 and 3000 meters`);
  }
  if (givenLength && drawLength / givenLength > 3) {
    throw new Error(`Validation: Lines cannot be drawn more than 3x the given length`);
  }
  return true;
};

const isFeatureLine = (feature: Feature): feature is Feature<LineString> => {
  return feature.geometry?.type === 'LineString';
};
