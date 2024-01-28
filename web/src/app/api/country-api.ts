import {
  getCountryChangelogs,
  getCountryDetails,
} from '@server/functions/api/endpoints/country/api';
import { baseApi } from 'store/rtk-query';
import { AsyncReturnType } from 'type-fest';

type GetCountryDetailsAPIResponse = AsyncReturnType<typeof getCountryDetails>;
type GetCountryChangelogsAPIResponse = AsyncReturnType<typeof getCountryChangelogs>;

export const countryApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['countryDetails', 'countryChangelogs'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getCountryDetails: builder.query<GetCountryDetailsAPIResponse, string>({
        query: (code) => ({
          url: `country/${code}/details`,
        }),
        providesTags: ['countryDetails'],
      }),
      getCountryChangelogs: builder.query<
        GetCountryChangelogsAPIResponse,
        { code: string; cursor?: string }
      >({
        query: (params) => ({
          url: `country/${params.code}/changelogs?cursor=${params.cursor}`,
        }),
        providesTags: ['countryChangelogs'],
        serializeQueryArgs: ({ queryArgs, endpointName }) => {
          return endpointName + queryArgs.code;
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
          return (
            currentArg?.cursor !== previousArg?.cursor || currentArg?.code !== previousArg?.code
          );
        },
      }),
    }),
  });
