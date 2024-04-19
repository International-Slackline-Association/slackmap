import { db } from 'core/db';
import { DDBGuideDetailTypes } from 'core/db/entities/guide/details/types';
import { DDBLineDetailTypes } from 'core/db/entities/line/details/types';
import { DDBMapFeatureChangelogTypes } from 'core/db/entities/mapFeature/changelog/types';
import { DDBSpotDetailTypes } from 'core/db/entities/spot/details/types';
import { MapFeatureType } from 'core/types';
import { diff } from 'deep-diff';

import { genericFeatureFromItem } from '.';
import { getUserDetails } from '../isaUser';
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

const fillChangelogs = async (items: DDBMapFeatureChangelogTypes['Entity'][]) => {
  const userNames = (await Promise.all(items.map((c) => getUserDetails(c.userId)))).map(
    (f) => f?.fullname,
  );

  const changelogs = items.map((c, index) => {
    const userName = userNames[index] || 'Unknown user';
    const paths = c.updatedPaths?.map((p) => pathNamesMapping[p as AllFieldNames]).filter((p) => p);
    const pathsString =
      paths && paths.slice(0, -1).join(', ') + (paths.length > 1 ? ', and ' : '') + paths.slice(-1);

    const item = {
      featureId: c.featureId,
      featureType: c.featureType,
      userName: userName,
      date: c.date,
      actionType: c.action,
      updatedPathsString: pathsString,
    };
    return item;
  });

  return changelogs;
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
  const changelogs = await fillChangelogs(items);
  return { changelogs: changelogs, lastEvaluatedKey };
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
  const changelogs = await fillChangelogs(featureChangelogs);
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
  const changelogs = await fillChangelogs(featureChangelogs);
  return { changelogs, lastEvaluatedKey };
};
