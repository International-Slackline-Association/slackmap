import { isaAccountApi } from 'store/rtk-query';

import type { GetUserBasicDetailsAPIResponse } from './types';

export const accountApi = isaAccountApi
  .enhanceEndpoints({
    addTagTypes: ['accountDetails'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getBasicDetails: builder.query<GetUserBasicDetailsAPIResponse, void>({
        query: () => ({ url: `basic/userDetails` }),
        providesTags: ['accountDetails'],
      }),
    }),
  });
