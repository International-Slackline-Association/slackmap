import { Feature, FeatureCollection } from '@turf/turf';
import cloneDeep from 'lodash.clonedeep';
import * as turf from '@turf/turf';
import { getCountryCode } from 'core/externalApi/geonames-api';

export const optimizeGeoJsonFeature = <T extends Feature>(feature: T): T => {
  let f = cloneDeep(feature);
  f = turf.truncate(feature, { precision: 5, mutate: true });
  return f;
};

export const calculateCenterOfFeature = (geoJson: Feature | FeatureCollection) => {
  return turf.centerOfMass(geoJson).geometry.coordinates;
};

export const getCountryCodeOfGeoJson = async (geoJson: Feature | FeatureCollection) => {
  const lineCenter = calculateCenterOfFeature(geoJson);
  const countryCode = await getCountryCode(lineCenter[1], lineCenter[0]);
  return countryCode;
};
