import * as db from 'core/db';
import { deleteAllFeatureChangelogs, deleteAllFeatureEditors } from 'core/db';
import { spotDetailsDBUtils } from 'core/db/spot/details';
import { DDBAttributeItem } from 'core/db/types';
import { refreshSpotGeoJsonFiles } from 'core/features/geojson';
import { checkUserExists } from 'core/features/isaUser';
import { addAdminAsEditorToMapFeature } from 'core/features/mapFeature/editors';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import isEqual from 'lodash.isequal';

export const processSpotDetailsOperation = async (
  newItem: DDBAttributeItem | undefined,
  oldItem: DDBAttributeItem | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newSpot = spotDetailsDBUtils.attrsToItem(newItem);
    await refreshSpotGeoJsonFiles({ spotIdToUpdate: newSpot.spotId });

    await checkUserExists(newSpot.creatorUserId);
    await db.putFeatureEditor({
      featureId: newSpot.spotId,
      featureType: 'spot',
      userId: newSpot.creatorUserId,
      createdDateTime: new Date().toISOString(),
      reason: 'explicit',
      type: 'owner',
    });

    await addAdminAsEditorToMapFeature(newSpot.spotId, 'spot');
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
    await deleteAllFeatureEditors(oldSpot.spotId, 'spot');
    await deleteAllFeatureChangelogs(oldSpot.spotId, 'spot');
    await deleteAllFeatureImages(oldSpot.spotId);
    await refreshSpotGeoJsonFiles({ spotIdToUpdate: oldSpot.spotId });
  }
};
