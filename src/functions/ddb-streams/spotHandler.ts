import { spotDetailsDBUtils } from 'core/db/spot/details';
import * as db from 'core/db';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { refreshSpotGeoJsonFiles } from 'core/features/geojson';
import isEqual from 'lodash.isequal';
import { deleteAllFeatureChangelogs, deleteAllFeatureEditors } from 'core/db';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import {
  addAdminAsEditorToMapFeature,
  refreshRepresentativeEditorsOfMapFeature,
} from 'core/features/mapFeature/editors';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import { FeatureCollection } from '@turf/turf';
import { getUserDetails } from 'core/features/isaUser';

export const processSpotDetailsOperation = async (
  newItem: DocumentClient.AttributeMap | undefined,
  oldItem: DocumentClient.AttributeMap | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newSpot = spotDetailsDBUtils.attrsToItem(newItem);
    await refreshSpotGeoJsonFiles({ spotIdToUpdate: newSpot.spotId });
    const isaUser = await getUserDetails(newSpot.creatorUserId);
    if (isaUser) {
      await db.putFeatureEditor({
        featureId: newSpot.spotId,
        featureType: 'spot',
        userId: newSpot.creatorUserId,
        createdDateTime: new Date().toISOString(),
        reason: 'explicit',
        userIdentityType: isaUser.identityType,
        type: 'owner',
      });
    }
    await addAdminAsEditorToMapFeature(newSpot.spotId, 'spot');
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
    await deleteAllFeatureEditors(oldSpot.spotId, 'spot');
    await deleteAllFeatureChangelogs(oldSpot.spotId, 'spot');
    await deleteAllFeatureImages(oldSpot.spotId);
    await refreshSpotGeoJsonFiles({ spotIdToUpdate: oldSpot.spotId });
  }
};

const refreshCountryAndEditors = async (spot: DDBSpotDetailItem) => {
  const countryCode = await getCountryCodeOfGeoJson(JSON.parse(spot.geoJson) as FeatureCollection, {
    dontThrowError: true,
  });
  if (countryCode && countryCode !== spot.country) {
    await db.updateSpotCountry(spot.spotId, countryCode);
  }
  await refreshRepresentativeEditorsOfMapFeature(spot.spotId, 'spot', {
    countryCode: countryCode || spot.country,
  });
};
