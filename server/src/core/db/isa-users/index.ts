import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
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

const findOrganizationsFromEmail = async (email: string) => {
  return ddb
    .send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI',
        KeyConditionExpression: 'SK_GSI = :SK_GSI and GSI_SK = :GSI_SK',
        ExpressionAttributeValues: {
          ':SK_GSI': `orgDetails`,
          ':GSI_SK': `email:${email}`,
        },
      }),
    )
    .then((data) => {
      const items = data.Items || [];
      return items.map((i) => ({
        id: i.PK.split(':')[1] as string,
      }));
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

export const getOrganizationDetailsFromEmail = async (email: string) => {
  const organizations = await findOrganizationsFromEmail(email);
  if (organizations.length === 0) {
    return null;
  }
  const details = await getOrganizationDetails(organizations[0].id);
  return details;
};

export const getUsersOfOrganization = async (organizationId: string) => {
  return ddb
    .send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI',
        KeyConditionExpression: '#SK_GSI = :SK_GSI',
        ExpressionAttributeNames: {
          '#SK_GSI': 'SK_GSI',
        },
        ExpressionAttributeValues: {
          ':SK_GSI': `org:${organizationId}`,
        },
      }),
    )
    .then((data) => {
      const items = data.Items || [];
      return items
        .filter((i) => i.PK.startsWith('user:') && !i.isPendingApproval)
        .map((i) => i.PK.split(':')[1] as string);
    });
};
