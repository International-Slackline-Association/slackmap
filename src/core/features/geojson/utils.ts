import { Feature } from '@turf/turf';
import cloneDeep from 'lodash.clonedeep';
import * as turf from '@turf/turf';

export const optimizeGeoJsonFeature = <T extends Feature>(feature: T): T => {
  let f = cloneDeep(feature);
  f = turf.truncate(feature, { precision: 5, mutate: true });
  return f;
};
