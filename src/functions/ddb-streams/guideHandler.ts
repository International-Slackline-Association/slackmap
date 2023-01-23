import * as db from 'core/db';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import isEqual from 'lodash.isequal';
import * as accountApi from 'core/externalApi/account-api';
import { deleteAllMapFeatureEditors, guideDetailsDBUtils } from 'core/db';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import { refreshGuideGeoJsonFiles } from 'core/features/geojson';
import { refreshOrganizationMemberEditorsOfFeature } from 'core/features/mapFeature';

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
    await refreshOrganizationMemberEditorsOfFeature(newGuide.guideId, JSON.parse(newGuide.geoJson));
  }

  if (eventName === 'MODIFY' && newItem && oldItem) {
    const oldGuide = guideDetailsDBUtils.attrsToItem(oldItem);
    const updatedGuide = guideDetailsDBUtils.attrsToItem(newItem);
    if (!isEqual(oldGuide.geoJson, updatedGuide.geoJson)) {
      await refreshGuideGeoJsonFiles({ guideIdToUpdate: updatedGuide.guideId });
    }
  }

  if (eventName === 'REMOVE' && oldItem) {
    const oldGuide = guideDetailsDBUtils.attrsToItem(oldItem);
    await refreshGuideGeoJsonFiles({ guideIdToUpdate: oldGuide.guideId });
    await deleteAllMapFeatureEditors(oldGuide.guideId);
    await deleteAllFeatureImages(oldGuide.guideId);
  }
};
