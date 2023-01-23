import { lineDetailsDBUtils } from 'core/db/line/details';
import * as db from 'core/db';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { refreshLineGeoJsonFiles } from 'core/features/geojson';
import isEqual from 'lodash.isequal';
import { getAuthToken } from 'core/utils/auth';
import * as accountApi from 'core/externalApi/account-api';
import { deleteAllMapFeatureEditors } from 'core/db';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import { refreshOrganizationMemberEditorsOfFeature } from 'core/features/mapFeature';

export const processLineDetailsOperation = async (
  newItem: DocumentClient.AttributeMap | undefined,
  oldItem: DocumentClient.AttributeMap | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newLine = lineDetailsDBUtils.attrsToItem(newItem);
    await refreshLineGeoJsonFiles({ lineIdToUpdate: newLine.lineId });

    const isaUser = await accountApi.getBasicUserDetails(newLine.creatorUserId);
    if (isaUser) {
      await db.putMapFeatureEditor({
        featureId: newLine.lineId,
        editorUserId: newLine.creatorUserId,
        createdDateTime: new Date().toISOString(),
        grantedThrough: 'explicit',
        userIdentityType: isaUser.identityType,
        editorName: isaUser.name,
        editorSurname: isaUser.surname,
      });
    }
    await refreshOrganizationMemberEditorsOfFeature(newLine.lineId, JSON.parse(newLine.geoJson));
  }

  if (eventName === 'MODIFY' && newItem && oldItem) {
    const oldLine = lineDetailsDBUtils.attrsToItem(oldItem);
    const updatedLine = lineDetailsDBUtils.attrsToItem(newItem);
    if (!isEqual(oldLine.geoJson, updatedLine.geoJson)) {
      await refreshLineGeoJsonFiles({ lineIdToUpdate: updatedLine.lineId });
    }
  }

  if (eventName === 'REMOVE' && oldItem) {
    const oldLine = lineDetailsDBUtils.attrsToItem(oldItem);
    await refreshLineGeoJsonFiles({ lineIdToUpdate: oldLine.lineId });
    await deleteAllMapFeatureEditors(oldLine.lineId);
    await deleteAllFeatureImages(oldLine.lineId);
  }
};
