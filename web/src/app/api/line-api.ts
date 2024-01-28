import { getLineDetails } from '@server/functions/api/endpoints/line/api';
import {
  CreateLinePostBody,
  UpdateLinePostBody,
} from '@server/functions/api/endpoints/line/schema';
import { baseApi } from 'store/rtk-query';
import { AsyncReturnType } from 'type-fest';
import { showInfoNotification, showSuccessNotification } from 'utils';

export type GetLineDetailsAPIResponse = AsyncReturnType<typeof getLineDetails>;

export const lineApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['lineDetails', 'featureEditors'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getLineDetails: builder.query<GetLineDetailsAPIResponse, string>({
        query: (id) => ({ url: `line/${id}/details` }),
        providesTags: ['lineDetails', 'featureEditors'],
      }),
      createLine: builder.mutation<GetLineDetailsAPIResponse, CreateLinePostBody>({
        query: (body) => ({
          url: `line`,
          method: 'POST',
          body: body,
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showInfoNotification('Refresh the page after few seconds', 5000));
          });
        },
      }),
      updateLine: builder.mutation<
        GetLineDetailsAPIResponse,
        { id: string; payload: UpdateLinePostBody }
      >({
        query: ({ id, payload }) => ({
          url: `line/${id}`,
          method: 'PUT',
          body: payload,
        }),
        invalidatesTags: ['lineDetails'],
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showSuccessNotification('Changes Saved'));
          });
        },
      }),
    }),
  });
