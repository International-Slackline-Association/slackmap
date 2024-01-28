import { isaAccountApi } from 'store/rtk-query';

interface GetUserBasicDetailsAPIResponse {
  name: string;
  surname?: string;
  email: string;
  profilePictureUrl?: string;
  isaId: string;
}

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
