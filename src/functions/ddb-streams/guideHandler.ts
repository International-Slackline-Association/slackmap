import * as db from 'core/db';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import isEqual from 'lodash.isequal';
import * as accountApi from 'core/externalApi/account-api';
import { deleteAllMapFeatureEditors, guideDetailsDBUtils } from 'core/db';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import { refreshGuideGeoJsonFiles } from 'core/features/geojson';
import { refreshOrganizationMemberEditorsOfFeature } from 'core/features/mapFeature';
import { DDBGuideDetailAttrs, DDBGuideDetailItem } from 'core/db/guide/details/types';
import { FeatureCollection } from '@turf/turf';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';

export const processGuideDetailsOperation = async (
  newItem: DocumentClient.AttributeMap | undefined,
  oldItem: DocumentClient.AttributeMap | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newGuide = guideDetailsDBUtils.attrsToItem(newItem);
    await refreshGuideGeoJsonFiles({ guideIdToUpdate: newGuide.guideId });

    const isaUser = await accountApi.getBasicUserDetails(newGuide.creatorUserId);
    if (isaUser) {
      await db.putMapFeatureEditor({
        featureId: newGuide.guideId,
        editorUserId: newGuide.creatorUserId,
        createdDateTime: new Date().toISOString(),
        grantedThrough: 'explicit',
        userIdentityType: isaUser.identityType,
        editorName: isaUser.name,
        editorSurname: isaUser.surname,
      });
    }
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
    await refreshGuideGeoJsonFiles({ guideIdToUpdate: oldGuide.guideId });
    await deleteAllMapFeatureEditors(oldGuide.guideId);
    await deleteAllFeatureImages(oldGuide.guideId);
  }
};

const refreshCountryAndEditors = async (guide: DDBGuideDetailItem) => {
  const countryCode = await getCountryCodeOfGeoJson(JSON.parse(guide.geoJson) as FeatureCollection);
  if (countryCode && countryCode !== guide.country) {
    await db.updateGuideField(guide.guideId, 'country', countryCode);
  }
  await refreshOrganizationMemberEditorsOfFeature(guide.guideId, {
    countryCode,
    geoJson: JSON.parse(guide.geoJson),
  });
};
