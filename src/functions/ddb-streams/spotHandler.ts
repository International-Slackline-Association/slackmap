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
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import { FeatureCollection } from '@turf/turf';

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
    await refreshCountryAndEditors(newSpot);
  }

  if (eventName === 'MODIFY' && newItem && oldItem) {
    const oldSpot = spotDetailsDBUtils.attrsToItem(oldItem);
    const updatedSpot = spotDetailsDBUtils.attrsToItem(newItem);
    if (!isEqual(oldSpot.geoJson, updatedSpot.geoJson)) {
      await refreshSpotGeoJsonFiles({ spotIdToUpdate: updatedSpot.spotId });
      await refreshCountryAndEditors(updatedSpot);
    }
  }

  if (eventName === 'REMOVE' && oldItem) {
    const oldSpot = spotDetailsDBUtils.attrsToItem(oldItem);
    await refreshSpotGeoJsonFiles({ spotIdToUpdate: oldSpot.spotId });
    await deleteAllMapFeatureEditors(oldSpot.spotId);
    await deleteAllFeatureImages(oldSpot.spotId);
  }
};

const refreshCountryAndEditors = async (spot: DDBSpotDetailItem) => {
  const countryCode = await getCountryCodeOfGeoJson(JSON.parse(spot.geoJson) as FeatureCollection);
  if (countryCode && countryCode !== spot.country) {
    await db.updateSpotCountry(spot.spotId, countryCode);
  }
  await refreshOrganizationMemberEditorsOfFeature(spot.spotId, {
    countryCode,
    geoJson: JSON.parse(spot.geoJson),
  });
};
