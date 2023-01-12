import axios, { AxiosError, RawAxiosRequestHeaders } from 'axios';
import { getAuthToken } from 'core/utils/auth';

export const accountApi = axios.create({
  baseURL: `https://qvjz6zmwx1.execute-api.eu-central-1.amazonaws.com/prod/scoped`,
});

const generateHeaders = async (username: string) => {
  const headers: RawAxiosRequestHeaders = {};

  const authToken = await getAuthToken();
  headers['Authorization'] = `${authToken.tokenType} ${authToken.accessToken}`;
  headers['x-cognito-username'] = username;
  return headers;
};

export const getBasicUserDetails = async (sub: string) => {
  const response = await accountApi.get(`/basic/userDetails`, { headers: await generateHeaders(sub) });
  return response.data;
};

export const getUserDetails = async (sub: string) => {
  const response = await accountApi.get(`/user/details`, { headers: await generateHeaders(sub) });
  return response.data;
};
