import {
  deleteFeature,
  deleteFeatureRequest,
  getFeatureChangelogs,
  requestTemporaryEditorship,
} from '@server/functions/api/endpoints/feature/api';
import { DeleteFeatureRequestPostBody } from '@server/functions/api/endpoints/feature/schema';
import { baseApi } from 'store/rtk-query';
import { AsyncReturnType } from 'type-fest';
import { showSuccessNotification } from 'utils';

type GetFeatureChangelogsResponse = AsyncReturnType<typeof getFeatureChangelogs>;
type RequestTemporaryEditorshipResponse = AsyncReturnType<typeof requestTemporaryEditorship>;
type DeleteFeatureAPIResponse = AsyncReturnType<typeof deleteFeature>;
type DeleteFeatureRequestAPIResponse = AsyncReturnType<typeof deleteFeatureRequest>;

export const featureApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['featureChangelogs', 'featureEditors'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getChangelogs: builder.query<
        GetFeatureChangelogsResponse,
        {
          id: string;
          type: SlacklineMapFeatureType;
          cursor?: string;
        }
      >({
        query: (params) => ({
          url: `feature/${params.id}/${params.type}/changelogs?cursor=${params.cursor}`,
        }),
        providesTags: ['featureChangelogs'],
        serializeQueryArgs: ({ queryArgs, endpointName }) => {
          return endpointName + queryArgs.id;
        },
        merge: (currentCache, newResponse) => {
          const items = currentCache.items.concat(newResponse.items);
          const uniqueItems = items.reduce(
            (acc, item) => {
              if (!acc.find((i) => i.date === item.date)) {
                acc.push(item);
              }
              return acc;
            },
            [] as typeof items,
          );

          currentCache.items = uniqueItems;
          currentCache.pagination = newResponse.pagination;
        },
        forceRefetch({ currentArg, previousArg }) {
          return currentArg?.cursor !== previousArg?.cursor || currentArg?.id !== previousArg?.id;
        },
      }),
      requestTemporaryEditorship: builder.mutation<
        RequestTemporaryEditorshipResponse,
        { id: string; type: SlacklineMapFeatureType }
      >({
        query: (params) => ({
          url: `feature/${params.id}/${params.type}/requestTemporaryEditorship`,
          method: 'PUT',
        }),
        invalidatesTags: ['featureEditors'],
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showSuccessNotification('Editorship Granted'));
          });
        },
      }),
      deleteFeature: builder.mutation<
        DeleteFeatureAPIResponse,
        { id: string; type: SlacklineMapFeatureType }
      >({
        query: (params) => ({
          url: `feature/${params.id}/${params.type}`,
          method: 'DELETE',
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showSuccessNotification('Feature Deleted'));
          });
        },
      }),
      deleteFeatureRequest: builder.mutation<
        DeleteFeatureRequestAPIResponse,
        { id: string; type: SlacklineMapFeatureType; payload: DeleteFeatureRequestPostBody }
      >({
        query: (params) => ({
          url: `feature/${params.id}/${params.type}/deleteRequest`,
          method: 'POST',
          body: params.payload,
        }),
        invalidatesTags: [],
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await queryFulfilled.then(() => {
            dispatch(showSuccessNotification('Delete Request Sent'));
          });
        },
      }),
    }),
  });
