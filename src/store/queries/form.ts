import { formEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  FormResponse,
  FormListResponse,
  ResponseDto,
} from '@/types';

export const formApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getForms: builder.query<FormListResponse, { page?: number; limit?: number; search?: string; type?: string } | void>({
      query: (params) => ({
        url: formEndpoints.LIST,
        method: 'GET',
        params: params || { limit: 50 },
      }),
      providesTags: (result) =>
        result
          ? ['Form', { type: 'Form', id: 'LIST' }]
          : ['Form'],
    }),
    getFormById: builder.query<FormResponse, string>({
      query: (id) => ({
        url: formEndpoints.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Form'],
    }),
    downloadForm: builder.query<ResponseDto<{ downloadUrl: string; filename: string }>, string>({
      query: (id) => ({
        url: formEndpoints.DOWNLOAD(id),
        method: 'GET',
      }),
    }),
    createForm: builder.mutation<FormResponse, FormData>({
      query: (formData) => ({
        url: formEndpoints.CREATE,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Form', { type: 'Form', id: 'LIST' }],
    }),
    deleteForm: builder.mutation<FormResponse, string>({
      query: (id) => ({
        url: formEndpoints.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Form', { type: 'Form', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFormsQuery,
  useLazyGetFormsQuery,
  useGetFormByIdQuery,
  useLazyDownloadFormQuery,
  useCreateFormMutation,
  useDeleteFormMutation,
} = formApi;
