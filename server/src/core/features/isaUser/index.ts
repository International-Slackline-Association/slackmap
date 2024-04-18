import { db } from 'core/db';
import { SimpleCache } from 'core/utils/cache';
import { AsyncReturnType } from 'type-fest';

const usersCache = new SimpleCache<AsyncReturnType<typeof db.isaUsersDb.getBasicUserDetails>>(10);

export const getUserDetails = async (userId: string) => {
  const cache = usersCache.get(userId);
  if (cache) return cache;

  const user = await db.isaUsersDb.getBasicUserDetails(userId);
  usersCache.set(userId, user);
  return user;
};

export const checkUserExists = async (userId: string) => {
  const user = await getUserDetails(userId);
  if (user) return true;
  throw new Error(`NotFound: User ${userId} not found`);
};
