import { FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import axios from 'axios';

const cache = {
  associationsGeoJson: undefined as FeatureCollection<Polygon | MultiPolygon> | undefined,
  associationsInfo: undefined as { [key: string]: { id: string; name: string } } | undefined,
};
export const slacklineDataApi = axios.create({
  baseURL: `https://raw.githubusercontent.com/International-Slackline-Association/slackline-data/master`,
});

export const getAssociationsData = async () => {
  if (cache.associationsGeoJson && cache.associationsInfo) {
    return {
      associationsGeoJson: cache.associationsGeoJson,
      associationsInfo: cache.associationsInfo,
    };
  }
  const geoJson = await slacklineDataApi.get('/communities/organizations/organizations.geojson').then((r) => r.data);
  const details = await slacklineDataApi.get('/communities/organizations/organizations.json').then((r) => r.data);

  const info: { [key: string]: { id: string; name: string } } = {};

  for (const a of details) {
    info[a.id] = a;
  }

  cache.associationsGeoJson = geoJson as FeatureCollection<Polygon | MultiPolygon>;
  cache.associationsInfo = info;

  return {
    associationsGeoJson: cache.associationsGeoJson,
    associationsInfo: cache.associationsInfo,
  };
};
