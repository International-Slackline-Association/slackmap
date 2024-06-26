import { FeatureCollection, Geometry } from 'geojson';

import { hasGeometryCoordinates } from '../geojson/utils';

export const validateGuideGeoJson = (geoJson: FeatureCollection<Geometry>) => {
  if (geoJson.features.length === 0) {
    throw new Error(`Validation: There must be at least 1 feature drawn`);
  }
  for (const feature of geoJson.features) {
    if (hasGeometryCoordinates(feature.geometry) && feature.geometry?.coordinates.length > 100) {
      throw new Error(`Validation: Guides features can NOT have more than 100 edges`);
    }
  }
  return true;
};
