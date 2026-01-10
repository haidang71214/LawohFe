import { classificationEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  ClassificationResponse,
  ClassificationCategoriesResponse,
} from '@/types';

export const classificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    predictProblem: builder.mutation<ClassificationResponse, { text: string }>({
      query: (body) => ({
        url: classificationEndpoints.PREDICT,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Classification'],
    }),
    getCategories: builder.query<ClassificationCategoriesResponse, void>({
      query: () => ({
        url: classificationEndpoints.CATEGORIES,
        method: 'GET',
      }),
      providesTags: ['Classification'],
    }),
  }),
});

export const {
  usePredictProblemMutation,
  useGetCategoriesQuery,
} = classificationApi;
