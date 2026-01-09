import { learnPackageEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import { ResponseDto } from '@/types';

export interface LearnPackage {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationMonths?: number;
  features?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearnPackageListResponse {
  statusCode: number;
  message: string;
  data: {
    items: LearnPackage[];
    total: number;
    page: number;
    limit: number;
  } | LearnPackage[];
}

export const learnPackageApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLearnPackages: builder.query<LearnPackageListResponse, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => ({
        url: learnPackageEndpoints.LIST,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Package'],
    }),
    getLearnPackageById: builder.query<ResponseDto<LearnPackage>, string>({
      query: (id) => ({
        url: learnPackageEndpoints.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Package'],
    }),
    createLearnPackage: builder.mutation<ResponseDto<LearnPackage>, Partial<LearnPackage>>({
      query: (body) => ({
        url: learnPackageEndpoints.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Package'],
    }),
    updateLearnPackage: builder.mutation<ResponseDto<LearnPackage>, { id: string; data: Partial<LearnPackage> }>({
      query: ({ id, data }) => ({
        url: learnPackageEndpoints.UPDATE(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Package'],
    }),
    deleteLearnPackage: builder.mutation<ResponseDto<null>, string>({
      query: (id) => ({
        url: learnPackageEndpoints.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Package'],
    }),
    subscribeLearnPackage: builder.mutation<ResponseDto<any>, string>({
      query: (id) => ({
        url: learnPackageEndpoints.SUBSCRIBE(id),
        method: 'POST',
      }),
      invalidatesTags: ['Package', 'User'],
    }),
  }),
});

export const {
  useGetLearnPackagesQuery,
  useLazyGetLearnPackagesQuery,
  useGetLearnPackageByIdQuery,
  useCreateLearnPackageMutation,
  useUpdateLearnPackageMutation,
  useDeleteLearnPackageMutation,
  useSubscribeLearnPackageMutation,
} = learnPackageApi;
