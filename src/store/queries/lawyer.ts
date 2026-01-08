import { lawyerEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  LawyerResponse,
  LawyerListResponse,
  FilterLawyerRequestDto,
  UpdateLawyerRequestDto,
} from '@/types';

export const lawyerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLawyerById: builder.query<LawyerResponse, string>({
      query: (id) => ({
        url: lawyerEndpoints.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Lawyer'],
    }),
    filterLawyers: builder.query<LawyerListResponse, FilterLawyerRequestDto | { type?: string; typeLawyer?: string; province?: string; experienceYear?: number } | void>({
      query: (params: any) => {
        if (!params) return { url: lawyerEndpoints.FILTER, method: 'GET' };
        const queryParams: any = { ...params };
        if (queryParams.type && !queryParams.typeLawyer) {
          queryParams.typeLawyer = queryParams.type;
        }
        return {
          url: lawyerEndpoints.FILTER,
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Lawyer'],
    }),
    updateLawyerMe: builder.mutation<LawyerResponse, UpdateLawyerRequestDto | FormData>({
      query: (body) => ({
        url: lawyerEndpoints.UPDATE_ME,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Lawyer'],
    }),
    updateLawyerByAdmin: builder.mutation<LawyerResponse, { id: string; data: UpdateLawyerRequestDto | Record<string, any> }>({
      query: ({ id, data }) => ({
        url: lawyerEndpoints.ADMIN_UPDATE_LAWYER(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Lawyer'],
    }),
  }),
});

export const {
  useGetLawyerByIdQuery,
  useLazyGetLawyerByIdQuery,
  useFilterLawyersQuery,
  useLazyFilterLawyersQuery,
  useUpdateLawyerMeMutation,
  useUpdateLawyerByAdminMutation,
} = lawyerApi;
