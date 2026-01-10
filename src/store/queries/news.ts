import { newsEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  NewsResponse,
  NewsListResponse,
} from '@/types';

export const newsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPublicNews: builder.query<NewsListResponse, void>({
      query: () => ({
        url: newsEndpoints.PUBLIC,
        method: 'GET',
      }),
      providesTags: ['News'],
    }),
    getAllNews: builder.query<NewsListResponse, void>({
      query: () => ({
        url: newsEndpoints.LIST_ALL,
        method: 'GET',
      }),
      providesTags: ['News'],
    }),
    getNewsById: builder.query<NewsResponse, string>({
      query: (id) => ({
        url: newsEndpoints.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['News'],
    }),
    createNews: builder.mutation<NewsResponse, FormData>({
      query: (formData) => ({
        url: newsEndpoints.CREATE,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['News'],
    }),
    approveNews: builder.mutation<NewsResponse, string>({
      query: (id) => ({
        url: newsEndpoints.APPROVE(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['News'],
    }),
    rejectNews: builder.mutation<NewsResponse, string | { id: string; reason?: string }>({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        const reason = typeof arg === 'object' ? arg.reason : undefined;
        return {
          url: newsEndpoints.REJECT(id),
          method: 'PATCH',
          body: reason ? { reason } : undefined,
        };
      },
      invalidatesTags: ['News'],
    }),
    deleteNews: builder.mutation<NewsResponse, string>({
      query: (id) => ({
        url: newsEndpoints.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['News'],
    }),
    getMyNews: builder.query<NewsListResponse, void>({
      query: () => ({
        url: newsEndpoints.MY_NEWS,
        method: 'GET',
      }),
      providesTags: ['News'],
    }),
    getAdminNews: builder.query<NewsListResponse, { status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: newsEndpoints.ADMIN_LIST,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['News'],
    }),
  }),
});

export const {
  useGetPublicNewsQuery,
  useLazyGetPublicNewsQuery,
  useGetAllNewsQuery,
  useGetMyNewsQuery,
  useGetAdminNewsQuery,
  useLazyGetAdminNewsQuery,
  useGetNewsByIdQuery,
  useCreateNewsMutation,
  useApproveNewsMutation,
  useRejectNewsMutation,
  useDeleteNewsMutation,
} = newsApi;

