import {
  getGlobalActivityChangelogs,
  getGlobalContributors,
} from '@server/functions/api/endpoints/activity/api';
import { baseApi } from 'store/rtk-query';
import { AsyncReturnType } from 'type-fest';

type GetActivityChangelogsAPIResponse = AsyncReturnType<typeof getGlobalActivityChangelogs>;
type getGlobalContributorsAPIResponse = AsyncReturnType<typeof getGlobalContributors>;

export const activityApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['activityContributors', 'activityChangelogs'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getGlobalContributors: builder.query<getGlobalContributorsAPIResponse, void>({
        query: () => ({
          url: `activity/contributors`,
        }),
        providesTags: ['activityContributors'],
      }),
      getActivityChangelogs: builder.query<GetActivityChangelogsAPIResponse, { cursor?: string }>({
        query: (params) => ({
          url: `activity/changelogs?cursor=${params.cursor}`,
        }),
        providesTags: ['activityChangelogs'],
        serializeQueryArgs: ({ endpointName }) => {
          return endpointName;
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
          return currentArg?.cursor !== previousArg?.cursor;
        },
      }),
    }),
  });
