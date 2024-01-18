import { Middleware, MiddlewareAPI, isRejectedWithValue } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthState } from 'app/slices/app/types';
import { fetchAuthSession } from 'aws-amplify/auth';
import { showErrorNotification } from 'utils';

import { RootState } from './types';

export const isaAccountApi = createApi({
  reducerPath: 'isaAccountApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://account-api.slacklineinternational.org/',
    prepareHeaders: async (headers) => {
      const token = await fetchAuthSession().then((s) => s.tokens?.idToken?.toString());
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.slackmap.com',
    prepareHeaders: async (headers, { getState }) => {
      const isSignedIn = (getState() as RootState).app?.authState === AuthState.SignedIn;
      if (isSignedIn) {
        const token = await fetchAuthSession()
          .then((s) => s.tokens?.idToken?.toString())
          .catch(() => null);
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});

export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action) => {
  // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
  if (isRejectedWithValue(action)) {
    let e = (action?.payload as any)?.data?.message || action?.error?.message;
    if (e && e === 'Rejected') {
      e = 'Unknown';
    }
    const message = `Error: ${e}`;
    api.dispatch(showErrorNotification(message));
  }

  return next(action);
};
