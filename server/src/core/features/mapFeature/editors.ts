import * as db from 'core/db';
import { MapFeatureType } from 'core/types';

import { checkUserExists } from '../isaUser';

// Add SlackMap Admin Account as an editor
export const addAdminAsEditorToMapFeature = async (
  featureId: string,
  featureType: MapFeatureType,
) => {
  await db.putFeatureEditor({
    featureId: featureId,
    featureType: featureType,
    userId: 'ISA_C87BE5F6',
    createdDateTime: new Date().toISOString(),
    reason: 'admin',
  });
};

export const addTemporaryEditorToMapFeature = async (
  featureId: string,
  featureType: MapFeatureType,
  userId: string,
) => {
  await checkUserExists(userId);
  await db.putFeatureEditor({
    featureId: featureId,
    featureType: featureType,
    userId: userId,
    reason: 'temporary',
    createdDateTime: new Date().toISOString(),
    ddb_ttl: Math.round(Date.now() / 1000) + 60 * 60 * 24, // 1 day
  });
};

export const validateMapFeatureEditor = async (
  featureId: string,
  featureType: MapFeatureType,
  userId?: string,
  opts: {
    shouldThrow?: boolean;
  } = {},
) => {
  if (!userId) {
    if (opts.shouldThrow) {
      throw new Error('Forbidden: User is not logged in');
    }
    return null;
  }
  const featureEditor = await db.getFeatureEditor(featureId, featureType, userId);

  if (!featureEditor && opts.shouldThrow) {
    throw new Error(`Forbidden: User is not an editor of this ${featureType}`);
  }
  return featureEditor;
};
