import { baseApi } from 'store/rtk-query';
import { showSuccessNotification } from 'utils';

import type { MapFeatureChangelogResponse } from './types';

export const featureApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['featureChangelogs', 'featureEditors'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getChangelogs: builder.query<
        MapFeatureChangelogResponse,
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
        void,
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
    }),
  });
