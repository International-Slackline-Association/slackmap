import axios, { AxiosError, RawAxiosRequestHeaders } from 'axios';
import { getAuthToken } from 'core/utils/auth';
import { OrganizationMembersResponse } from './type';

export const accountApi = axios.create({
  baseURL: `https://qvjz6zmwx1.execute-api.eu-central-1.amazonaws.com/prod/scoped`,
});

const generateHeaders = async (isaId: string) => {
  const headers: RawAxiosRequestHeaders = {};

  const authToken = await getAuthToken();
  headers['Authorization'] = `${authToken.tokenType} ${authToken.accessToken}`;
  headers['x-isa-id'] = isaId;
  return headers;
};

const cache = {
  organizationMembers: {} as { [key: string]: OrganizationMembersResponse[] },
};

export const getBasicUserDetails = async (isaId: string) => {
  const response = await accountApi.get(`/basic/userDetails`, { headers: await generateHeaders(isaId) });
  return response.data;
};

export const getOrganizationMembers = async (isaId: string) => {
  if (cache.organizationMembers[isaId]) {
    return cache.organizationMembers[isaId];
  }
  const response = await accountApi.get(`/organization/users`, { headers: await generateHeaders(isaId) });
  const members = response.data.items as OrganizationMembersResponse[];
  cache.organizationMembers[isaId] = members;
  return members;
};
