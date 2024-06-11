import * as turf from '@turf/turf';
import { getCountryCode } from 'core/externalApi/geonames-api';
import { GeometryCollection } from 'geojson';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import cloneDeep from 'lodash.clonedeep';

export const optimizeGeoJsonFeature = <T extends Feature>(feature: T): T => {
  let f = cloneDeep(feature);
  f = turf.truncate(feature, { precision: 5, mutate: true });
  return f;
};

export const calculateCenterOfFeature = (geoJson: Feature | FeatureCollection) => {
  return turf.centerOfMass(geoJson).geometry.coordinates;
};

export const getCountryCodeOfGeoJson = async <Throw = false>(
  geoJson: Feature | FeatureCollection,
  opts: {
    dontThrowError?: Throw;
  } = {},
): Promise<Throw extends true ? string | undefined : string> => {
  const lineCenter = calculateCenterOfFeature(geoJson);
  const countryCode = await getCountryCode(lineCenter[1], lineCenter[0]);
  if (!countryCode && !opts.dontThrowError) {
    throw new Error('Country code cannot be determined from the coordinates');
  }
  return countryCode?.toUpperCase() as string;
};

export const hasGeometryCoordinates = (
  feature: Geometry,
): feature is Exclude<Geometry, GeometryCollection> => {
  return feature.type !== 'GeometryCollection' && !!feature.coordinates;
};
