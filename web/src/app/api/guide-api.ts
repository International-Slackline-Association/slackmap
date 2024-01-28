import { getGuideDetails } from '@server/functions/api/endpoints/guide/api';
import {
  CreateGuidePostBody,
  UpdateGuidePostBody,
} from '@server/functions/api/endpoints/guide/schema';
import { baseApi } from 'store/rtk-query';
import { AsyncReturnType } from 'type-fest';
import { showInfoNotification, showSuccessNotification } from 'utils';

export type GetGuideDetailsAPIResponse = AsyncReturnType<typeof getGuideDetails>;

export const guideApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['guideDetails'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getGuideDetails: builder.query<GetGuideDetailsAPIResponse, string>({
        query: (id) => ({ url: `guide/${id}/details` }),
        providesTags: ['guideDetails'],
      }),
      createGuide: builder.mutation<GetGuideDetailsAPIResponse, CreateGuidePostBody>({
        query: (body) => ({
          url: `guide`,
          method: 'POST',
          body: body,
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showInfoNotification('Refresh the page after few seconds', 5000));
          });
        },
      }),
      updateGuide: builder.mutation<
        GetGuideDetailsAPIResponse,
        { id: string; payload: UpdateGuidePostBody }
      >({
        query: ({ id, payload }) => ({
          url: `guide/${id}`,
          method: 'PUT',
          body: payload,
        }),
        invalidatesTags: ['guideDetails'],
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showSuccessNotification('Changes Saved'));
          });
        },
      }),
    }),
  });
