import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from 'core/aws/clients';

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
          profilePictureUrl: data.Item.profilePictureS3Key
            ? `https://images.slacklineinternational.org/${data.Item.profilePictureS3Key}`
            : undefined,
          country: data.Item.country,
        };
        return user;
      }
      return null;
    });
};

export const isaUsersDb = {
  getUserDetails,
};
