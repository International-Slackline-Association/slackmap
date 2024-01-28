import * as db from 'core/db';
import { deleteAllFeatureChangelogs, deleteAllFeatureEditors, guideDetailsDBUtils } from 'core/db';
import { DDBAttributeItem } from 'core/db/types';
import { refreshGuideGeoJsonFiles } from 'core/features/geojson';
import { checkUserExists } from 'core/features/isaUser';
import { addAdminAsEditorToMapFeature } from 'core/features/mapFeature/editors';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import isEqual from 'lodash.isequal';

export const processGuideDetailsOperation = async (
  newItem: DDBAttributeItem | undefined,
  oldItem: DDBAttributeItem | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    const newGuide = guideDetailsDBUtils.attrsToItem(newItem);
    await refreshGuideGeoJsonFiles({ guideIdToUpdate: newGuide.guideId });

    await checkUserExists(newGuide.creatorUserId);
    await db.putFeatureEditor({
      featureId: newGuide.guideId,
      featureType: 'guide',
      userId: newGuide.creatorUserId,
      createdDateTime: new Date().toISOString(),
      reason: 'explicit',
      type: 'owner',
    });

    await addAdminAsEditorToMapFeature(newGuide.guideId, 'guide');
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
    await deleteAllFeatureEditors(oldGuide.guideId, 'guide');
    await deleteAllFeatureChangelogs(oldGuide.guideId, 'guide');
    await deleteAllFeatureImages(oldGuide.guideId);
    await refreshGuideGeoJsonFiles({ guideIdToUpdate: oldGuide.guideId });
  }
};
