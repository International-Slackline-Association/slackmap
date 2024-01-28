import * as db from 'core/db';
import { DDBCountryItem } from 'core/db/country/types';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { MapFeatureType } from 'core/types';
import { diff } from 'deep-diff';

import { genericFeatureFromItem } from '.';
import { getUserDetails } from '../isaUser';
import { GenericMapFeatureItemType, MapFeatureChangelog } from './types';

type AllFieldNames = keyof (DDBLineDetailItem & DDBSpotDetailItem & DDBGuideDetailItem);

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

  const userNames = (await Promise.all(items.map((c) => getUserDetails(c.userId)))).map(
    (f) => f?.fullname,
  );

  const changelogs = items
    .map((c, index) => {
      const item: MapFeatureChangelog = {
        featureId: c.featureId,
        featureType: c.featureType,
        userName: userNames[index] || 'Unknown user',
        date: c.date,
        htmlText: '',
        actionType: c.action,
      };
      const userName = userNames[index] || 'Unknown user';
      const paths = c.updatedPaths
        ?.map((p) => pathNamesMapping[p as AllFieldNames])
        .filter((p) => p);
      const pathsString =
        paths &&
        paths.slice(0, -1).join(', ') + (paths.length > 1 ? ', and ' : '') + paths.slice(-1);

      switch (c.action) {
        case 'created':
          item.htmlText = `<b>${userName}</b> has created the ${c.featureType}.`;
          break;
        case 'updatedDetails':
          item.htmlText = `<b>${userName}</b> updated the <b>${
            pathsString || 'details'
          }</b> of the ${c.featureType}.`;
          break;
        case 'grantedTemporaryEditor':
          item.htmlText = `<b>${userName}</b> has been granted temporary editor rights for the ${c.featureType}.`;
          break;
        case 'updatedOwners':
          item.htmlText = `<b>${userName}</b> changed the owner of the ${c.featureType}.`;
          break;
        default:
          break;
      }
      return item;
    })
    .filter((c) => c.htmlText !== '');

  return { changelogs: changelogs, lastEvaluatedKey };
};

export const getChangelogsOfCountry = async (
  code: string,
  opts: {
    startKey?: any;
    limit?: number;
  } = {},
) => {
  const { items, lastEvaluatedKey } = await db.getCountryChangelogs(code, opts);

  const isChangelog = (c: any): c is Required<DDBCountryItem> => {
    return c.changelogDate && c.featureType;
  };

  const countryChangelogs = items.filter(isChangelog).map((c) => ({
    featureId: c.featureId,
    featureType: c.featureType,
    date: c.changelogDate,
  }));

  const featureChangelogs = await db.getMultipleFeatureChangelog(countryChangelogs);

  const userNames = (
    await Promise.all(featureChangelogs.map((c) => getUserDetails(c.userId)))
  ).reduce(
    (acc, f) => {
      if (f) {
        acc[f.id] = f?.fullname;
      }
      return acc;
    },
    {} as { [userId: string]: string },
  );

  const changelogs = featureChangelogs
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .map((c) => {
      const item: MapFeatureChangelog = {
        featureId: c.featureId,
        featureType: c.featureType,
        userName: userNames[c.userId] || 'Unknown user',
        date: c.date,
        htmlText: '',
        actionType: c.action,
      };
      const paths = c.updatedPaths
        ?.map((p) => pathNamesMapping[p as AllFieldNames])
        .filter((p) => p);
      const pathsString =
        paths &&
        paths.slice(0, -1).join(', ') + (paths.length > 1 ? ', and ' : '') + paths.slice(-1);

      switch (c.action) {
        case 'created':
          item.htmlText = `<b>${item.userName}</b> has created the ${c.featureType}.`;
          break;
        case 'updatedDetails':
          item.htmlText = `<b>${item.userName}</b> updated the <b>${
            pathsString || 'details'
          }</b> of the ${c.featureType}.`;
          break;
        case 'grantedTemporaryEditor':
          item.htmlText = `<b>${item.userName}</b> has been granted temporary editor rights for the ${c.featureType}.`;
          break;
        case 'updatedOwners':
          item.htmlText = `<b>${item.userName}</b> changed the owner of the ${c.featureType}.`;
          break;
        default:
          break;
      }
      return item;
    })
    .filter((c) => c.htmlText !== '');

  return { changelogs: changelogs, lastEvaluatedKey };
};
