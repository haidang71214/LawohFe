import { priceRangeEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  PriceRangeResponse,
  PriceRangeListResponse,
  CreateCustomPriceRequestDto,
  UpdatePriceRangeRequestDto,
} from '@/types';

export const priceRangeApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPriceRanges: builder.query<PriceRangeListResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: priceRangeEndpoints.LIST,
        method: 'GET',
        params: params || { limit: 50 },
      }),
      providesTags: (result) =>
        result
          ? ['PriceRange', { type: 'PriceRange', id: 'LIST' }]
          : ['PriceRange'],
    }),
    createCustomPrice: builder.mutation<PriceRangeResponse, CreateCustomPriceRequestDto | { type?: string; Type?: string; price: number; description?: string }>({
      query: (body) => ({
        url: priceRangeEndpoints.CUSTOM_PRICE,
        method: 'POST',
        body: {
          Type: (body as any).Type || (body as any).type,
          price: Number(body.price),
          description: body.description || 'Tư vấn pháp lý chuyên sâu',
        },
      }),
      invalidatesTags: ['PriceRange', 'Lawyer'],
    }),
    updateCustomPrice: builder.mutation<PriceRangeResponse, CreateCustomPriceRequestDto | { type?: string; Type?: string; price: number; description?: string }>({
      query: (body) => ({
        url: priceRangeEndpoints.CUSTOM_PRICE,
        method: 'PATCH',
        body: {
          Type: (body as any).Type || (body as any).type,
          price: Number(body.price),
          description: body.description || 'Tư vấn pháp lý chuyên sâu',
        },
      }),
      invalidatesTags: ['PriceRange', 'Lawyer'],
    }),
    updatePriceRange: builder.mutation<PriceRangeResponse, { type: string; data: UpdatePriceRangeRequestDto | Record<string, any> }>({
      query: ({ type, data }) => ({
        url: priceRangeEndpoints.UPDATE_PRICE(type),
        method: 'PATCH',
        body: {
          minPrice: Number(data.minPrice),
          maxPrice: Number(data.maxPrice),
          description: typeof data.description === 'string' ? data.description : '',
        },
      }),
      invalidatesTags: ['PriceRange', { type: 'PriceRange', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPriceRangesQuery,
  useLazyGetPriceRangesQuery,
  useCreateCustomPriceMutation,
  useUpdateCustomPriceMutation,
  useUpdatePriceRangeMutation,
} = priceRangeApi;
