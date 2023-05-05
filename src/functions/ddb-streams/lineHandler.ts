import { lineDetailsDBUtils } from 'core/db/line/details';
import * as db from 'core/db';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { refreshLineGeoJsonFiles } from 'core/features/geojson';
import isEqual from 'lodash.isequal';
import { deleteAllFeatureEditors } from 'core/db';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import {
  addAdminAsEditorToMapFeature,
  refreshRepresentativeEditorsOfMapFeature,
} from 'core/features/mapFeature/editors';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import { FeatureCollection } from '@turf/turf';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { getUserDetails } from 'core/features/isaUser';

export const processLineDetailsOperation = async (
  newItem: DocumentClient.AttributeMap | undefined,
  oldItem: DocumentClient.AttributeMap | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newLine = lineDetailsDBUtils.attrsToItem(newItem);
    await refreshLineGeoJsonFiles({ lineIdToUpdate: newLine.lineId });

    const isaUser = await getUserDetails(newLine.creatorUserId);
    if (isaUser) {
      await db.putFeatureEditor({
        featureId: newLine.lineId,
        featureType: 'line',
        userId: newLine.creatorUserId,
        createdDateTime: new Date().toISOString(),
        reason: 'explicit',
        userIdentityType: isaUser.identityType,
        type: 'owner',
      });
    }
    await addAdminAsEditorToMapFeature(newLine.lineId, 'line');
    await refreshCountryAndEditors(newLine);
  }

  if (eventName === 'MODIFY' && newItem && oldItem) {
    const oldLine = lineDetailsDBUtils.attrsToItem(oldItem);
    const updatedLine = lineDetailsDBUtils.attrsToItem(newItem);
    if (!isEqual(oldLine.geoJson, updatedLine.geoJson)) {
      await refreshLineGeoJsonFiles({ lineIdToUpdate: updatedLine.lineId });
      await refreshCountryAndEditors(updatedLine);
    }
  }

  if (eventName === 'REMOVE' && oldItem) {
    const oldLine = lineDetailsDBUtils.attrsToItem(oldItem);
    await deleteAllFeatureEditors(oldLine.lineId, 'line');
    await deleteAllFeatureImages(oldLine.lineId);
    await refreshLineGeoJsonFiles({ lineIdToUpdate: oldLine.lineId });
  }
};

const refreshCountryAndEditors = async (line: DDBLineDetailItem) => {
  const countryCode = await getCountryCodeOfGeoJson(JSON.parse(line.geoJson) as FeatureCollection);
  if (countryCode && countryCode !== line.country) {
    await db.updateLineCountry(line.lineId, countryCode);
  }
  await refreshRepresentativeEditorsOfMapFeature(line.lineId, 'line', {
    countryCode,
    geoJson: JSON.parse(line.geoJson),
  });
};
