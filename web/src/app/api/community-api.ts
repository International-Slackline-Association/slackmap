import {
  getCommunityCountryDetails,
  getGroupDetails,
} from '@server/functions/api/endpoints/communities/api';
import { baseApi } from 'store/rtk-query';
import { AsyncReturnType } from 'type-fest';

type GetCommunityCountryDetailsAPIResponse = AsyncReturnType<typeof getCommunityCountryDetails>;
type GetSlacklineGroupDetailsAPIResponse = AsyncReturnType<typeof getGroupDetails>;

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
