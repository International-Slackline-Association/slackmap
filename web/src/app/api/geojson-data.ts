import { featureCollection } from '@turf/turf';
import { Feature, FeatureCollection } from 'geojson';

import { geoJsonURL } from './constants';

const cache = {
  allSlacklinePoints: undefined as FeatureCollection | undefined,
  countrySlacklinePoints: undefined as FeatureCollection | undefined,
  slacklineGroups: undefined as FeatureCollection | undefined,
  countryPolygons: {} as { [key: string]: Feature },
  slacklinePointFeaturesOfCountry: {} as {
    [key: string]: {
      geoJson: FeatureCollection;
      stats: { lineCount: number; spotCount: number; guideCount: number };
    };
  },
};

const fetchCache = async <T>(url: string, cache: T): Promise<NonNullable<T>> => {
  if (cache) {
    return cache;
  }

  const response = await fetch(url).then((r) => r.json());
  cache = response;
  return response;
};

const getCountrySlacklinePointsGeoJson = async () => {
  return fetchCache(geoJsonURL.countryPoints, cache.countrySlacklinePoints);
};

const getAllSlacklinePointsGeoJson = async () => {
  return fetchCache(geoJsonURL.clustersAll, cache.allSlacklinePoints);
};

const getSlacklineGroupsGeoJson = async () => {
  return fetchCache(geoJsonURL.groups, cache.slacklineGroups);
};

const getSlacklineFeatureStats = (geoJson: FeatureCollection) => {
  let lineCount = 0;
  let spotCount = 0;
  let guideCount = 0;

  for (const feature of geoJson.features) {
    if (feature.properties?.['ft'] === 'l') {
      lineCount++;
    } else if (feature.properties?.['ft'] === 's') {
      spotCount++;
    } else if (feature.properties?.['ft'] === 'g') {
      guideCount++;
    }
  }
  return {
    lineCount,
    spotCount,
    guideCount,
  };
};

export const getSlacklinePointFeaturesOfCountry = async (code: string) => {
  if (cache.slacklinePointFeaturesOfCountry[code]?.geoJson) {
    return cache.slacklinePointFeaturesOfCountry[code];
  }

  const allPointsGeoJson = await getAllSlacklinePointsGeoJson();
  const filteredFeatures = allPointsGeoJson.features.filter(
    (feature) => feature.properties?.c === code,
  );

  cache.slacklinePointFeaturesOfCountry[code] = {
    geoJson: featureCollection(filteredFeatures),
    stats: getSlacklineFeatureStats(featureCollection(filteredFeatures)),
  };
  return cache.slacklinePointFeaturesOfCountry[code];
};

export const getSlacklineMapStats = async () => {
  const allPointsGeoJson = await getAllSlacklinePointsGeoJson();
  const featureStats = getSlacklineFeatureStats(allPointsGeoJson);
  const countryCount = await getCountrySlacklinePointsGeoJson();
  return {
    ...featureStats,
    countryCount: countryCount.features.length,
  };
};

export const getSlacklineGroupsGeoJsonOfCountry = async (code: string) => {
  const slacklineGroupGeoJson = await getSlacklineGroupsGeoJson();
  const filteredGroups = slacklineGroupGeoJson.features.filter(
    (feature) => feature.properties?.c === code,
  );

  return { geoJson: featureCollection(filteredGroups) };
};

export const getSlacklineGroupGeoJson = async (groupId: string) => {
  const slacklineGroupGeoJson = await getSlacklineGroupsGeoJson();
  const filteredGroups = slacklineGroupGeoJson.features.filter(
    (feature) => feature.properties?.id === groupId,
  );

  return { geoJson: featureCollection(filteredGroups) };
};

export const getCommunityMapStats = async () => {
  const slacklineGroupGeoJson = await getSlacklineGroupsGeoJson();

  const slacklineGroupsCount = slacklineGroupGeoJson.features.filter(
    (feature) => feature.properties?.ft === 'sg',
  ).length;

  const isaMembersCount = slacklineGroupGeoJson.features.filter(
    (feature) => feature.properties?.ft === 'isaM',
  ).length;

  const countryCount = new Set(
    slacklineGroupGeoJson.features.map((feature) => feature.properties?.c),
  ).size;

  return { slacklineGroupsCount, isaMembersCount, countryCount };
};
