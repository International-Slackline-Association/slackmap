import { spotDetailsDBUtils } from 'core/db/spot/details';
import * as db from 'core/db';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { refreshLineGeoJsonFiles, refreshSpotGeoJsonFiles } from 'core/features/geojson';
import isEqual from 'lodash.isequal';
import { getAuthToken } from 'core/utils/auth';
import * as accountApi from 'core/externalApi/account-api';
import { deleteAllMapFeatureEditors } from 'core/db';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import { refreshOrganizationMemberEditorsOfFeature } from 'core/features/mapFeature';

export const processSpotDetailsOperation = async (
  newItem: DocumentClient.AttributeMap | undefined,
  oldItem: DocumentClient.AttributeMap | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newSpot = spotDetailsDBUtils.attrsToItem(newItem);
    await refreshSpotGeoJsonFiles({ spotIdToUpdate: newSpot.spotId });
    const isaUser = await accountApi.getBasicUserDetails(newSpot.creatorUserId);
    if (isaUser) {
      await db.putMapFeatureEditor({
        featureId: newSpot.spotId,
        editorUserId: newSpot.creatorUserId,
        createdDateTime: new Date().toISOString(),
        grantedThrough: 'explicit',
        userIdentityType: isaUser.identityType,
        editorName: isaUser.name,
        editorSurname: isaUser.surname,
      });
    }
    await refreshOrganizationMemberEditorsOfFeature(newSpot.spotId, JSON.parse(newSpot.geoJson));
  }

  if (eventName === 'MODIFY' && newItem && oldItem) {
    const oldSpot = spotDetailsDBUtils.attrsToItem(oldItem);
    const updatedSpot = spotDetailsDBUtils.attrsToItem(newItem);
    if (!isEqual(oldSpot.geoJson, updatedSpot.geoJson)) {
      await refreshSpotGeoJsonFiles({ spotIdToUpdate: updatedSpot.spotId });
    }
  }

  if (eventName === 'REMOVE' && oldItem) {
    const oldSpot = spotDetailsDBUtils.attrsToItem(oldItem);
    await refreshSpotGeoJsonFiles({ spotIdToUpdate: oldSpot.spotId });
    await deleteAllMapFeatureEditors(oldSpot.spotId);
    await deleteAllFeatureImages(oldSpot.spotId);
  }
};
