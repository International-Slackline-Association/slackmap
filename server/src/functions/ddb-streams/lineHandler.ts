import * as db from 'core/db';
import { deleteAllFeatureChangelogs, deleteAllFeatureEditors } from 'core/db';
import { lineDetailsDBUtils } from 'core/db/line/details';
import { DDBAttributeItem } from 'core/db/types';
import { refreshLineGeoJsonFiles } from 'core/features/geojson';
import { checkUserExists } from 'core/features/isaUser';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import isEqual from 'lodash.isequal';

export const processLineDetailsOperation = async (
  newItem: DDBAttributeItem | undefined,
  oldItem: DDBAttributeItem | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newLine = lineDetailsDBUtils.attrsToItem(newItem);
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

  if (eventName === 'MODIFY' && newItem && oldItem) {
    const oldLine = lineDetailsDBUtils.attrsToItem(oldItem);
    const updatedLine = lineDetailsDBUtils.attrsToItem(newItem);
    if (!isEqual(oldLine.geoJson, updatedLine.geoJson)) {
      await refreshLineGeoJsonFiles({ lineIdToUpdate: updatedLine.lineId });
    }
  }

  if (eventName === 'REMOVE' && oldItem) {
    const oldLine = lineDetailsDBUtils.attrsToItem(oldItem);
    await deleteAllFeatureEditors(oldLine.lineId, 'line');
    await deleteAllFeatureChangelogs(oldLine.lineId, 'line');
    await deleteAllFeatureImages(oldLine.lineId);
    await refreshLineGeoJsonFiles({ lineIdToUpdate: oldLine.lineId });
  }
};
