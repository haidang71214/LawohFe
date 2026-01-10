import { reviewEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  ReviewResponse,
  ReviewListResponse,
  CreateReviewRequestDto,
} from '@/types';

export const reviewApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getReviewsByLawyer: builder.query<ReviewListResponse, string>({
      query: (lawyerId) => ({
        url: reviewEndpoints.BY_LAWYER(lawyerId),
        method: 'GET',
      }),
      providesTags: ['Review'],
    }),
    createReview: builder.mutation<ReviewResponse, CreateReviewRequestDto>({
      query: ({ lawyerId, star, rating, comment }) => ({
        url: reviewEndpoints.CREATE(lawyerId || ''),
        method: 'POST',
        body: {
          rating: rating ?? star ?? 5,
          comment,
        },
      }),
      invalidatesTags: ['Review', 'Lawyer'],
    }),
  }),
});

export const {
  useGetReviewsByLawyerQuery,
  useLazyGetReviewsByLawyerQuery,
  useCreateReviewMutation,
} = reviewApi;
