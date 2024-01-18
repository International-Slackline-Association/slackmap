import { FeatureCollection, Geometry } from '@turf/turf';
import axios from 'axios';
import { SimpleCache } from 'core/utils/cache';

const api = axios.create({
  baseURL: `https://raw.githubusercontent.com/International-Slackline-Association/slackline-data/master/data`,
});

interface IsaMember {
  country: string;
  name: string;
  joinedDate?: string;
  email: string;
  infoUrl?: string;
  groupId?: string;
  memberType: 'national' | 'observer' | 'partner' | 'associate';
  profilePictureUrl?: string;
}

interface SlacklineGroupGeoJsonProperties {
  id: string;
  ft: 'sg';
  c: string; // country
}

interface SlacklineGroup {
  id: string;
  name: string;
  createdDateTime: string; // only date
  updatedDateTime: string; // only date
  email?: string;
  facebookPage?: string;
  facebookGroup?: string;
  telegram?: string;
  instagram?: string;
  whatsapp?: string;
  webpage?: string;
}

const isaMembersCache = new SimpleCache<IsaMember[]>(5);
const slacklineGroupsGeoJsonCache = new SimpleCache<
  FeatureCollection<Geometry, SlacklineGroupGeoJsonProperties>
>(5);
const slacklineGroupsCache = new SimpleCache<SlacklineGroup[]>(5);

const getIsaMembersList = async () => {
  const cache = isaMembersCache.get();
  if (cache) return cache;

  const response = await api.get(`/communities/isa/members.json`);
  isaMembersCache.set(undefined, response.data);

  return response.data as IsaMember[];
};

const getSlacklineGroupsGeoJson = async () => {
  const cache = slacklineGroupsGeoJsonCache.get();
  if (cache) return cache;

  const response = await api.get(`/communities/groups/groups.geojson`);
  slacklineGroupsGeoJsonCache.set(undefined, response.data);

  return response.data as FeatureCollection<Geometry, SlacklineGroupGeoJsonProperties>;
};

const getSlacklineGroups = async () => {
  const cache = slacklineGroupsCache.get();
  if (cache) return cache;

  const response = await api.get(`/communities/groups/groups.json`);
  slacklineGroupsCache.set(undefined, response.data);

  return response.data as SlacklineGroup[];
};

export const slacklineDataApi = {
  getIsaMembersList,
  getSlacklineGroupsGeoJson,
  getSlacklineGroups,
};
