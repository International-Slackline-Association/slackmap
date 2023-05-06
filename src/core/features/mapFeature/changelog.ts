import { DDBLineDetailItem } from 'core/db/line/details/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { MapFeatureChangelogAction } from 'core/db/mapFeature/changelog/types';
import * as db from 'core/db';
import { genericFeatureFromItem } from '.';
import { diff } from 'deep-diff';
import { MapFeatureType } from 'core/types';

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

const getKeysInOriginalOrder = <T extends object>(obj: T): (keyof T)[] => {
  return Object.getOwnPropertyNames(obj) as (keyof T)[];
};
