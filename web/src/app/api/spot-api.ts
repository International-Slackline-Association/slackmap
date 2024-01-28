import { getSpotDetails } from '@server/functions/api/endpoints/spot/api';
import {
  CreateSpotPostBody,
  UpdateSpotPostBody,
} from '@server/functions/api/endpoints/spot/schema';
import { baseApi } from 'store/rtk-query';
import { AsyncReturnType } from 'type-fest';
import { showInfoNotification } from 'utils';

export type GetSpotDetailsAPIResponse = AsyncReturnType<typeof getSpotDetails>;

export const spotApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['spotDetails'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getSpotDetails: builder.query<GetSpotDetailsAPIResponse, string>({
        query: (id) => ({ url: `spot/${id}/details` }),
        providesTags: ['spotDetails'],
      }),
      createSpot: builder.mutation<GetSpotDetailsAPIResponse, CreateSpotPostBody>({
        query: (body) => ({
          url: `spot`,
          method: 'POST',
          body: body,
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showInfoNotification('Refresh the page after few seconds', 5000));
          });
        },
      }),
      updateSpot: builder.mutation<
        GetSpotDetailsAPIResponse,
        { id: string; payload: UpdateSpotPostBody }
      >({
        query: ({ id, payload }) => ({
          url: `spot/${id}`,
          method: 'PUT',
          body: payload,
        }),
        invalidatesTags: ['spotDetails'],
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showInfoNotification('Refresh the page after few seconds', 5000));
          });
        },
      }),
    }),
  });
