import { baseApi } from 'store/rtk-query';

import type {
  GetCommunityCountryDetailsAPIResponse,
  GetSlacklineGroupDetailsAPIResponse,
} from './types';

export const communityApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['communityCountryDetails', 'communityGroupDetails'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getCommunityCountryDetails: builder.query<GetCommunityCountryDetailsAPIResponse, string>({
        query: (code) => ({
          url: `communities/country/${code}`,
        }),
        providesTags: ['communityCountryDetails'],
      }),
      getSlacklineGroupDetails: builder.query<GetSlacklineGroupDetailsAPIResponse, string>({
        query: (code) => ({
          url: `communities/group/${code}`,
        }),
        providesTags: ['communityGroupDetails'],
      }),
    }),
  });
