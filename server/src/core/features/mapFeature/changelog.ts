import { db } from 'core/db';
import { DDBGuideDetailTypes } from 'core/db/entities/guide/details/types';
import { DDBLineDetailTypes } from 'core/db/entities/line/details/types';
import { DDBMapFeatureChangelogTypes } from 'core/db/entities/mapFeature/changelog/types';
import { DDBSpotDetailTypes } from 'core/db/entities/spot/details/types';
import { MapFeatureType } from 'core/types';
import countriesJson from 'data/countryInfoDict.json';
import { diff } from 'deep-diff';

import { genericFeatureFromItem } from '.';
import { getMultipleUserDetails } from '../isaUser';
import { GenericMapFeatureItemType } from './types';

type AllFieldNames = keyof (DDBLineDetailTypes['Entity'] &
  DDBSpotDetailTypes['Entity'] &
  DDBGuideDetailTypes['Entity']);

const pathNamesMapping: { [p in AllFieldNames]: string | null } = {
  name: 'name',
  type: 'type',
  geoJson: 'coordinates',
  description: 'description',
  length: 'length',
  height: 'height',
  anchorsInfo: 'anchor',
  gearInfo: 'gear',
  accessInfo: 'access',
  contactInfo: 'contact',
  restrictionLevel: 'restriction level',
  restrictionInfo: 'restriction info',
  extraInfo: 'additional details',
  anchorImages: 'anchor images',
  images: 'images',
  country: 'country',
  createdDateTime: null,
  creatorUserId: null,
  lastModifiedDateTime: null,
  spotId: null,
  lineId: null,
  guideId: null,
  isMeasured: null,
};

const validPathNames = Object.entries(pathNamesMapping)
  .filter(([, v]) => v !== null)
  .map(([k]) => k);

export const addCreatedChangelogToFeature = async (
  item: GenericMapFeatureItemType,
  userId: string,
  date: Date,
) => {
  const feature = genericFeatureFromItem(item);
  await db.putFeatureChangelog({
    featureId: feature.id,
    featureType: feature.type,
    userId: userId,
    action: 'created',
    date: date.toISOString(),
    country: feature.country,
  });
};

export const addUpdatedDetailsChangelog = async (
  item: GenericMapFeatureItemType,
  oldItem: GenericMapFeatureItemType,
  userId: string,
  date: Date,
) => {
  const feature = genericFeatureFromItem(item);

  const updatedPaths = diff(oldItem, item)
    ?.filter((d) => d.path && d.path.length === 1 && validPathNames.includes(d.path[0]))
    .map((d) => d.path?.[0] as string);

  if (!updatedPaths || updatedPaths.length === 0) {
    return;
  }
  const distinctUpdatedPaths = [...new Set(updatedPaths)];

  // Filter out paths that were added with default values
  const filteredPathsWithDefaultValues = distinctUpdatedPaths.filter((p) => {
    const newValue = (item as any)[p];
    if (newValue instanceof Array) {
      if ((oldItem as any)[p] === undefined && newValue.length === 0) {
        return false; // recently added array with default value of []
      }
    }
    return true;
  });

  await db.putFeatureChangelog({
    featureId: feature.id,
    featureType: feature.type,
    userId: userId,
    action: 'updatedDetails',
    date: date.toISOString(),
    country: feature.country,
    updatedPaths: filteredPathsWithDefaultValues,
  });
};

export const addTemporaryEditorChangelogToFeature = async (
  featureId: string,
  featureType: MapFeatureType,
  userId: string,
  date: Date,
  country: string,
) => {
  await db.putFeatureChangelog({
    featureId: featureId,
    featureType: featureType,
    userId: userId,
    action: 'grantedTemporaryEditor',
    date: date.toISOString(),
    country: country,
  });
};

export const getChangelogsOfFeature = async (
  featureId: string,
  featureType: MapFeatureType,
  opts: {
    startKey?: any;
    limit?: number;
  } = {},
) => {
  const { items, lastEvaluatedKey } = await db.getFeatureChangelogs(featureId, featureType, opts);
  const featureChangelogs = await db.getMultipleFeatureChangelog(items);
  const userDetailsDict = await getMultipleUserDetails(featureChangelogs.map((c) => c.userId));
  const changelogs = featureChangelogs.map((c) => {
    return { ...prettifyChangelog(c), user: userDetailsDict[c.userId] };
  });
  return { changelogs, lastEvaluatedKey };
};

export const getChangelogsOfCountry = async (
  code: string,
  opts: {
    startKey?: any;
    limit?: number;
  } = {},
) => {
  const {
    items: { mapFeatureChangelogs },
    lastEvaluatedKey,
  } = await db.getCountryChangelogs(code, opts);
  const featureChangelogs = await db.getMultipleFeatureChangelog(mapFeatureChangelogs);
  const userDetailsDict = await getMultipleUserDetails(featureChangelogs.map((c) => c.userId));
  const changelogs = featureChangelogs.map((c) => {
    return { ...prettifyChangelog(c), user: userDetailsDict[c.userId] };
  });

  return { changelogs, lastEvaluatedKey };
};

export const getChangelogsOfGlobal = async (
  opts: {
    startKey?: any;
    limit?: number;
  } = {},
) => {
  const {
    items: { mapFeatureChangelogs },
    lastEvaluatedKey,
  } = await db.getGlobalChangelogs(opts);
  const featureChangelogs = await db.getMultipleFeatureChangelog(mapFeatureChangelogs);
  const userDetailsDict = await getMultipleUserDetails(featureChangelogs.map((c) => c.userId));
  const changelogs = featureChangelogs.map((c) => {
    return { ...prettifyChangelog(c), user: userDetailsDict[c.userId] };
  });
  return { changelogs, lastEvaluatedKey };
};

const prettifyChangelog = (changelog: DDBMapFeatureChangelogTypes['Entity']) => {
  const paths = changelog.updatedPaths
    ?.map((p) => pathNamesMapping[p as AllFieldNames])
    .filter((p) => p);
  const pathsString =
    paths && paths.slice(0, -1).join(', ') + (paths.length > 1 ? ', and ' : '') + paths.slice(-1);

  return {
    featureId: changelog.featureId,
    featureType: changelog.featureType,
    date: changelog.date,
    countryName:
      countriesJson[changelog.country as keyof typeof countriesJson]?.name || changelog.country,
    actionType: changelog.action,
    updatedPathsString: pathsString,
  };
};
