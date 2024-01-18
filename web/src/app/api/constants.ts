import { countryISO2Mapping } from 'utils/countryCodes';

const baseAppDataUrl = 'https://data.slackmap.com';
const baseApiUrl = 'https://api.slackmap.com';
const slacklineDataBaseUrl =
  'https://raw.githubusercontent.com/International-Slackline-Association/slackline-data/master/data';

export const geoJsonURL = {
  linePoints: baseAppDataUrl + '/geojson/lines/points.geojson',
  lines: baseAppDataUrl + '/geojson/lines/all.geojson',
  spotPoints: baseAppDataUrl + '/geojson/spots/points.geojson',
  spots: baseAppDataUrl + '/geojson/spots/all.geojson',
  guidePoints: baseAppDataUrl + '/geojson/guides/points.geojson',
  guides: baseAppDataUrl + '/geojson/guides/all.geojson',
  clustersAll: baseAppDataUrl + '/geojson/clusters/all.geojson',
  countryPoints: baseAppDataUrl + '/geojson/countries/points.geojson',
  countryPolygons: (code: string) =>
    `https://raw.githubusercontent.com/AshKyd/geojson-regions/master/countries/10m/${countryISO2Mapping[code]}.geojson`,
  groups: slacklineDataBaseUrl + '/communities/groups/groups.geojson',
  communityCountries: baseApiUrl + '/communities/countriesGeoJson',
};

export const slacklineGroupEditGoogleFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSdEPV1ZV8TjmkQUGmKP8L0LrrkyUlspnfGFZ3dw32ocJ_zXVQ/viewform?usp=pp_url&entry.677223950=Edit+existing+data&entry.1762852981=';
export const slacklineGroupsGithubUrl =
  'https://github.com/International-Slackline-Association/slackline-data/tree/master/data/communities/groups';
