import { BASE_URL } from '@/constants/endpoints';
import webStorageClient from '@/utils/webStorageClient';
import { notifyRateLimit } from '@/utils/rateLimitToast';
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { endpoint }) => {
    const token = webStorageClient.getToken();
    const authEndpoints = ['login', 'register', 'refreshToken'];

    if (token && typeof token === 'string' && !authEndpoints.includes(endpoint as string)) {
      const cleanToken = token.trim();
      // Ensure only valid ASCII/ISO-8859-1 chars are passed into HTTP Headers
      if (!/[^\x00-\xFF]/.test(cleanToken)) {
        try {
          headers.set('Authorization', `Bearer ${cleanToken}`);
        } catch (e) {
          console.error('Failed to set Authorization header:', e);
        }
      }
    }
    return headers;
  },
});

let isRefreshing = false;

let failedQueue: {
  resolve: (value: boolean) => void;
}[] = [];

const processQueue = (isSuccess: boolean) => {
  failedQueue.forEach((prom) => {
    prom.resolve(isSuccess);
  });
  failedQueue = [];
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Global HTTP 429 (Rate Limit / Too Many Requests) Toast Notification
  if (result.error?.status === 429 || (result.error as any)?.originalStatus === 429) {
    notifyRateLimit(result.error);
  }

  const url = typeof args === 'string' ? args : args.url;

  if (result.error?.status === 401 && !url?.includes('refresh-token') && !url?.includes('login')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = webStorageClient.getRefreshToken();

      if (!refreshToken) {
        webStorageClient.logout();
        return result;
      }

      // Call API refresh token
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
          headers: {
            Authorization: '',
          },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const resData = (refreshResult.data as any).data || refreshResult.data;
        const newAccessToken = resData.token || resData.accessToken || resData;

        if (typeof newAccessToken === 'string') {
          webStorageClient.setToken(newAccessToken);
        }

        processQueue(true);
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        processQueue(false);
        webStorageClient.logout();
      }

      isRefreshing = false;
    } else {
      const isRefreshSuccess = await new Promise<boolean>((resolve) => {
        failedQueue.push({ resolve });
      });

      if (isRefreshSuccess) {
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        return result;
      }
    }
  }

  return result;
};
