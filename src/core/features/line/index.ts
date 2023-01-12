import * as db from 'core/db';

export const validateLineEditor = async (lineId: string, userId?: string, shouldThrow?: boolean) => {
  if (!userId) {
    if (shouldThrow) {
      throw new Error('Forbidden: User is not logged in');
    }
    return false;
  }
  const lineEditor = await db.getLineEditor(lineId, userId);
  if (!lineEditor && shouldThrow) {
    throw new Error('Forbidden: User is not an editor of this line');
  }
  return Boolean(lineEditor);
};
