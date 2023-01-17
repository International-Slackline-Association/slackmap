import * as db from 'core/db';

export const validateMapFeatureEditor = async (featureId: string, userId?: string, shouldThrow?: boolean) => {
  if (!userId) {
    if (shouldThrow) {
      throw new Error('Forbidden: User is not logged in');
    }
    return false;
  }
  const featureEditor = await db.getMapFeatureEditor(featureId, userId);
  if (!featureEditor && shouldThrow) {
    throw new Error('Forbidden: User is not an editor of this feature');
  }
  return Boolean(featureEditor);
};
