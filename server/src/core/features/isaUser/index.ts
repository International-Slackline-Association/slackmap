import { db } from 'core/db';
import { SimpleCache } from 'core/utils/cache';
import { AsyncReturnType } from 'type-fest';

type UserDetailType = AsyncReturnType<typeof db.isaUsersDb.getUserDetails>;

const usersCache = new SimpleCache<UserDetailType>(10);

export const getUserDetails = async (userId: string, opts: { includeEmail?: boolean } = {}) => {
  const cache = usersCache.get(userId);
  if (cache) return cache;

  const user = await db.isaUsersDb.getUserDetails(userId);
  if (!opts.includeEmail) {
    delete user?.email;
  }
  usersCache.set(userId, user);
  return user;
};

export const checkUserExists = async (userId: string) => {
  const user = await getUserDetails(userId);
  if (user) return true;
  throw new Error(`NotFound: User ${userId} not found`);
};

export const getMultipleUserDetails = async (userIds: string[]) => {
  const users = await Promise.all(userIds.map((u) => getUserDetails(u)));

  const userDict = users.reduce(
    (acc, user) => {
      if (!user) return acc;
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, UserDetailType>,
  );
  return userDict;
};
