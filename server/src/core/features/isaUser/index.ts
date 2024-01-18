import { isaUsersDb } from 'core/db';
import { SimpleCache } from 'core/utils/cache';
import { AsyncReturnType } from 'type-fest';

const organizationMembersCache = new SimpleCache<string[]>(10);
const usersCache = new SimpleCache<AsyncReturnType<typeof isaUsersDb.getBasicUserDetails>>(10);
const organizationsCache = new SimpleCache<
  AsyncReturnType<typeof isaUsersDb.getOrganizationDetailsFromEmail>
>(10);

export const getUserDetails = async (userId: string) => {
  const cache = usersCache.get(userId);
  if (cache) return cache;

  const user = await isaUsersDb.getBasicUserDetails(userId);
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

export const getOrganizationDetailsFromEmail = async (email: string) => {
  const cache = organizationsCache.get(email);
  if (cache) return cache;

  const organizations = await isaUsersDb.getOrganizationDetailsFromEmail(email);
  organizationsCache.set(email, organizations);
  return organizations;
};
