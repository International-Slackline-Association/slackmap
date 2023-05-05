import { isaUsersDb } from 'core/db';
import { SimpleCache } from 'core/utils/cache';

const organizationMembersCache = new SimpleCache<string[]>(10);
const usersCache = new SimpleCache<ReturnType<typeof isaUsersDb.getBasicUserDetails>>(10);

export const getUserDetails = async (userId: string) => {
  const cache = usersCache.get(userId);
  if (cache) return cache;

  const user = isaUsersDb.getBasicUserDetails(userId);
  usersCache.set(userId, user);
  return user;
};

export const getUsersOfOrganization = async (organizationId: string) => {
  const cache = organizationMembersCache.get(organizationId);
  if (cache) return cache;

  const users = await isaUsersDb.getUsersOfOrganization(organizationId);
  organizationMembersCache.set(organizationId, users);
  return users;
};
