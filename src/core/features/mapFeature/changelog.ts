import { DDBLineDetailItem } from 'core/db/line/details/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { MapFeatureChangelogAction } from 'core/db/mapFeature/changelog/types';
import * as db from 'core/db';
import { genericFeatureFromItem } from '.';
import { diff } from 'deep-diff';
import { MapFeatureType } from 'core/types';
import { MapFeatureChangelog } from './types';

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
  restrictionInfo: 'restriction',
  extraInfo: 'additional details',
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
  item: DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem,
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
  item: DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem,
  oldItem: DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem,
  userId: string,
  date: Date,
) => {
  const feature = genericFeatureFromItem(item);

  const updatedPaths = diff(oldItem, item)
    ?.filter((d) => d.path && d.path.length === 1 && validPathNames.includes(d.path[0]))
    .map((d) => d.path?.[0]);

  if (!updatedPaths || updatedPaths.length === 0) {
    return;
  }
  // const paths: string[] = [];
  if (updatedPaths.length > 0) {
    // const pathsString = paths.slice(0, -1).join(', ') + (paths.length > 1 ? 'and ' : '') + paths.slice(-1);
    await db.putFeatureChangelog({
      featureId: feature.id,
      featureType: feature.type,
      userId: userId,
      action: 'updatedDetails',
      date: date.toISOString(),
      country: feature.country,
      updatedPaths: updatedPaths,
    });
  }
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

  const userNames = (await Promise.all(items.map((c) => db.isaUsersDb.getBasicUserDetails(c.userId)))).map(
    (f) => f?.fullname,
  );

  const changelogs = items
    .map((c, index) => {
      const item: MapFeatureChangelog = {
        featureId: c.featureId,
        featureType: c.featureType,
        changelogText: '',
        date: c.date,
      };
      const userName = userNames[index] || 'Unknown user';
      const paths = c.updatedPaths?.map((p) => pathNamesMapping[p as AllFieldNames]).filter((p) => p);
      const pathsString = paths && paths.slice(0, -1).join(', ') + (paths.length > 1 ? ', and ' : '') + paths.slice(-1);

      switch (c.action) {
        case 'created':
          item.changelogText = `${userName} has created the ${c.featureType}`;
          break;
        case 'updatedDetails':
          item.changelogText = `${userName} updated the ${pathsString || 'details'} of the ${c.featureType}`;
          break;
        case 'grantedTemporaryEditor':
          item.changelogText = `${userName} has been granted temporary editor rights for the ${c.featureType}`;
          break;
        case 'updatedOwners':
          item.changelogText = `${userName} changed the owner of the ${c.featureType}`;
          break;
        default:
          break;
      }
      return item;
    })
    .filter((c) => c.changelogText !== '');

  return { changelogs: changelogs, lastEvaluatedKey };
};

const getKeysInOriginalOrder = <T extends object>(obj: T): (keyof T)[] => {
  return Object.getOwnPropertyNames(obj) as (keyof T)[];
};
