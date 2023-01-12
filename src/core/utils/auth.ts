import axios from 'axios';

const authInfoDict: {
  clientId: string;
  secret: string;
  url: string;
  existingToken?: {
    accessToken: string;
    tokenType: string;
  };
} = {
  clientId: process.env.OAUTH2_CLIENT_ID_ISA_ACCOUNT || '',
  secret: process.env.OAUTH2_CLIENT_SECRET_ISA_ACCOUNT || '',
  url: 'https://auth.slacklineinternational.org/oauth2/token' || '',
};

export const getAuthToken = async (
  opts: {
    force?: boolean;
  } = {},
) => {
  const { existingToken, clientId, secret, url } = authInfoDict;
  if (existingToken && !opts.force) {
    return existingToken;
  }

  if (!clientId || !secret) {
    throw new Error('Missing clientId or secret');
  }

  return axios
    .post(url, 'grant_type=client_credentials', {
      auth: {
        username: clientId,
        password: secret,
      },
    })
    .then((response) => {
      const tokenToSave = {
        accessToken: response.data.access_token,
        tokenType: response.data.token_type,
      };
      authInfoDict['existingToken'] = tokenToSave;
      return tokenToSave;
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
};
