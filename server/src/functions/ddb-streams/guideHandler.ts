import { db } from 'core/db';
import { guideDetailsDB } from 'core/db/entities/guide/details';
import { DDBGuideDetailTypes } from 'core/db/entities/guide/details/types';
import { DDBAttributeItem } from 'core/db/utils/types';
import { refreshGuideGeoJsonFiles } from 'core/features/geojson';
import { checkUserExists } from 'core/features/isaUser';
import { deleteAllFeatureImages } from 'core/features/mapFeature/image';
import isEqual from 'lodash.isequal';

export const processGuideDetailsOperation = async (
  newItem: DDBAttributeItem | undefined,
  oldItem: DDBAttributeItem | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  const newGuide =
    newItem && guideDetailsDB.converter.itemToEntity(newItem as DDBGuideDetailTypes['Item']);
  const oldGuide =
    oldItem && guideDetailsDB.converter.itemToEntity(oldItem as DDBGuideDetailTypes['Item']);

  if (eventName === 'INSERT' && newGuide) {
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
  }

  if (eventName === 'MODIFY' && newGuide && oldGuide) {
    if (!isEqual(oldGuide.geoJson, newGuide.geoJson)) {
      await refreshGuideGeoJsonFiles({ guideIdToUpdate: newGuide.guideId });
    }
  }

  if (eventName === 'REMOVE' && oldGuide) {
    await db.deleteAllFeatureEditors(oldGuide.guideId, 'guide');
    await db.deleteAllFeatureChangelogs(oldGuide.guideId, 'guide');
    await deleteAllFeatureImages(oldGuide.guideId);
    await refreshGuideGeoJsonFiles({ guideIdToUpdate: oldGuide.guideId });
  }
};
