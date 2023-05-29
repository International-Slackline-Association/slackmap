import { ddb } from 'core/aws/clients';
import { UserIdentityType } from 'core/types';
import { chunkArray } from '../utils';

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
    .get({ TableName: TABLE_NAME, Key: { PK: `user:${userId}`, SK_GSI: `userDetails` } })
    .promise()
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
    .get({ TableName: TABLE_NAME, Key: { PK: `org:${orgId}`, SK_GSI: `orgDetails` } })
    .promise()
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

export const getBasicUserDetails = async (userId: string) => {
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

export const getAllOrganizations = async (filter: { country?: string } = {}) => {
  return ddb
    .query({
      TableName: TABLE_NAME,
      IndexName: 'GSI',
      KeyConditionExpression: '#SK_GSI = :SK_GSI',
      ExpressionAttributeNames: {
        '#SK_GSI': 'SK_GSI',
      },
      ExpressionAttributeValues: {
        ':SK_GSI': `orgDetails`,
      },
    })
    .promise()
    .then((data) => {
      const items = data.Items || [];
      return items
        .map((i) => {
          return {
            id: i.PK.split(':')[1],
            fullname: i.name,
            profilePictureUrl: i.profilePictureUrl,
            country: i.country,
            email: i.GSI_SK?.split(':')[1],
          };
        })
        .filter((i) => {
          if (filter.country) {
            return i.country?.toUpperCase() === filter.country.toUpperCase();
          }
          return true;
        });
    });
};

export const getUsersOfOrganization = async (organizationId: string) => {
  return ddb
    .query({
      TableName: TABLE_NAME,
      IndexName: 'GSI',
      KeyConditionExpression: '#SK_GSI = :SK_GSI',
      ExpressionAttributeNames: {
        '#SK_GSI': 'SK_GSI',
      },
      ExpressionAttributeValues: {
        ':SK_GSI': `org:${organizationId}`,
      },
    })
    .promise()
    .then((data) => {
      const items = data.Items || [];
      return items
        .filter((i) => i.PK.startsWith('user:') && !i.isPendingApproval)
        .map((i) => i.PK.split(':')[1] as string);
    });
};
