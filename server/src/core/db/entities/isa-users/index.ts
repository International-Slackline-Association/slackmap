import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from 'core/aws/clients';
import { UserIdentityType } from 'core/types';

const TABLE_NAME = process.env.USERS_TABLE_NAME;

const getUserDetails = async (
  userId: string,
): Promise<{
  id: string;
  fullname: string;
  profilePictureUrl?: string;
  country?: string;
} | null> => {
  return ddb
    .send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `user:${userId}`, SK_GSI: `userDetails` },
      }),
    )
    .then((data) => {
      if (data.Item) {
        const user = {
          id: userId,
          fullname: `${data.Item.name} ${data.Item.surname}`,
          profilePictureUrl: data.Item.profilePictureUrl,
          country: data.Item.country,
        };
        return user;
      }
      return null;
    });
};
const getOrganizationDetails = async (
  orgId: string,
): Promise<{
  id: string;
  fullname: string;
  profilePictureUrl?: string;
  country?: string;
} | null> => {
  return ddb
    .send(
      new GetCommand({ TableName: TABLE_NAME, Key: { PK: `org:${orgId}`, SK_GSI: `orgDetails` } }),
    )
    .then((data) => {
      if (data.Item) {
        const user = {
          id: orgId,
          fullname: data.Item.name,
          profilePictureUrl: data.Item.profilePictureUrl,
          country: data.Item.country,
        };
        return user;
      }
      return null;
    });
};

const getBasicUserDetails = async (userId: string) => {
  let identityType: UserIdentityType = 'individual';
  let details = await getUserDetails(userId);
  if (!details) {
    details = await getOrganizationDetails(userId);
    identityType = 'organization';
  }
  if (details) {
    return { ...details, identityType };
  }
  return null;
};

export const isaUsersDb = {
  getUserDetails,
  getBasicUserDetails,
};
