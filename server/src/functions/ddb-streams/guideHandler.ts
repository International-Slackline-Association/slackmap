import * as db from 'core/db';
import { FeatureCollection } from '@turf/turf';
import { deleteAllFeatureChangelogs, deleteAllFeatureEditors, guideDetailsDBUtils } from 'core/db';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { DDBAttributeItem } from 'core/db/types';
import { refreshGuideGeoJsonFiles } from 'core/features/geojson';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import { getUserDetails } from 'core/features/isaUser';
import {
  addAdminAsEditorToMapFeature,
  refreshRepresentativeEditorsOfMapFeature,
} from 'core/features/mapFeature/editors';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import isEqual from 'lodash.isequal';

export const processGuideDetailsOperation = async (
  newItem: DDBAttributeItem | undefined,
  oldItem: DDBAttributeItem | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newGuide = guideDetailsDBUtils.attrsToItem(newItem);
    await refreshGuideGeoJsonFiles({ guideIdToUpdate: newGuide.guideId });

    const isaUser = await getUserDetails(newGuide.creatorUserId);
    if (isaUser) {
      await db.putFeatureEditor({
        featureId: newGuide.guideId,
        featureType: 'guide',
        userId: newGuide.creatorUserId,
        createdDateTime: new Date().toISOString(),
        reason: 'explicit',
        userIdentityType: isaUser.identityType,
        type: 'owner',
      });
    }
    await addAdminAsEditorToMapFeature(newGuide.guideId, 'guide');
    await refreshCountryAndEditors(newGuide);
  }

  if (eventName === 'MODIFY' && newItem && oldItem) {
    const oldGuide = guideDetailsDBUtils.attrsToItem(oldItem);
    const updatedGuide = guideDetailsDBUtils.attrsToItem(newItem);
    if (!isEqual(oldGuide.geoJson, updatedGuide.geoJson)) {
      await refreshGuideGeoJsonFiles({ guideIdToUpdate: updatedGuide.guideId });
      await refreshCountryAndEditors(updatedGuide);
    }
  }

  if (eventName === 'REMOVE' && oldItem) {
    const oldGuide = guideDetailsDBUtils.attrsToItem(oldItem);
    await deleteAllFeatureEditors(oldGuide.guideId, 'guide');
    await deleteAllFeatureChangelogs(oldGuide.guideId, 'guide');
    await deleteAllFeatureImages(oldGuide.guideId);
    await refreshGuideGeoJsonFiles({ guideIdToUpdate: oldGuide.guideId });
  }
};

const refreshCountryAndEditors = async (guide: DDBGuideDetailItem) => {
  const countryCode = await getCountryCodeOfGeoJson(
    JSON.parse(guide.geoJson) as FeatureCollection,
    {
      dontThrowError: true,
    },
  );
  if (countryCode && countryCode !== guide.country) {
    await db.updateGuideCountry(guide.guideId, countryCode);
  }
  await refreshRepresentativeEditorsOfMapFeature(guide.guideId, 'guide', {
    countryCode: countryCode || guide.country,
  });
};
