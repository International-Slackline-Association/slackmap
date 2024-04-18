import { db } from 'core/db';
import { spotDetailsDB } from 'core/db/entities/spot/details';
import { DDBSpotDetailTypes } from 'core/db/entities/spot/details/types';
import { DDBAttributeItem } from 'core/db/utils/types';
import { refreshSpotGeoJsonFiles } from 'core/features/geojson';
import { checkUserExists } from 'core/features/isaUser';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import isEqual from 'lodash.isequal';

export const processSpotDetailsOperation = async (
  newItem: DDBAttributeItem | undefined,
  oldItem: DDBAttributeItem | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  const newSpot =
    newItem && spotDetailsDB.converter.itemToEntity(newItem as DDBSpotDetailTypes['Item']);
  const oldSpot =
    oldItem && spotDetailsDB.converter.itemToEntity(oldItem as DDBSpotDetailTypes['Item']);

  if (eventName === 'INSERT' && newSpot) {
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
  }

  if (eventName === 'MODIFY' && newSpot && oldSpot) {
    if (!isEqual(oldSpot.geoJson, newSpot.geoJson)) {
      await refreshSpotGeoJsonFiles({ spotIdToUpdate: newSpot.spotId });
    }
  }

  if (eventName === 'REMOVE' && oldSpot) {
    await db.deleteAllFeatureEditors(oldSpot.spotId, 'spot');
    await db.deleteAllFeatureChangelogs(oldSpot.spotId, 'spot');
    await deleteAllFeatureImages(oldSpot.spotId);
    await refreshSpotGeoJsonFiles({ spotIdToUpdate: oldSpot.spotId });
  }
};
