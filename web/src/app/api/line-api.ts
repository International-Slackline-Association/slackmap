import { baseApi } from 'store/rtk-query';
import { showInfoNotification, showSuccessNotification } from 'utils';

import type {
  CreateLineDetailsPayload,
  GetLineDetailsAPIResponse,
  UpdateLineDetailsPayload,
} from './types';

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
      createLine: builder.mutation<GetLineDetailsAPIResponse, CreateLineDetailsPayload>({
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
        { id: string; payload: UpdateLineDetailsPayload }
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
      deleteLine: builder.mutation<void, string>({
        query: (id) => ({
          url: `line/${id}`,
          method: 'DELETE',
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showSuccessNotification('Line Deleted'));
          });
        },
      }),
    }),
  });
