import { db } from 'core/db';
import { lineDetailsDB } from 'core/db/entities/line/details';
import { DDBLineDetailTypes } from 'core/db/entities/line/details/types';
import { DDBAttributeItem } from 'core/db/utils/types';
import { refreshLineGeoJsonFiles } from 'core/features/geojson';
import { checkUserExists } from 'core/features/isaUser';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import isEqual from 'lodash.isequal';

export const processLineDetailsOperation = async (
  newItem: DDBAttributeItem | undefined,
  oldItem: DDBAttributeItem | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  const newLine =
    newItem && lineDetailsDB.converter.itemToEntity(newItem as DDBLineDetailTypes['Item']);
  const oldLine =
    oldItem && lineDetailsDB.converter.itemToEntity(oldItem as DDBLineDetailTypes['Item']);

  if (eventName === 'INSERT' && newLine) {
    await refreshLineGeoJsonFiles({ lineIdToUpdate: newLine.lineId });

    await checkUserExists(newLine.creatorUserId);
    await db.putFeatureEditor({
      featureId: newLine.lineId,
      featureType: 'line',
      userId: newLine.creatorUserId,
      createdDateTime: new Date().toISOString(),
      reason: 'explicit',
      type: 'owner',
    });
  }

  if (eventName === 'MODIFY' && newLine && oldLine) {
    if (!isEqual(oldLine.geoJson, newLine.geoJson)) {
      await refreshLineGeoJsonFiles({ lineIdToUpdate: newLine.lineId });
    }
  }

  if (eventName === 'REMOVE' && oldLine) {
    await db.deleteAllFeatureEditors(oldLine.lineId, 'line');
    await db.deleteAllFeatureChangelogs(oldLine.lineId, 'line');
    await deleteAllFeatureImages(oldLine.lineId);
    await refreshLineGeoJsonFiles({ lineIdToUpdate: oldLine.lineId });
  }
};
