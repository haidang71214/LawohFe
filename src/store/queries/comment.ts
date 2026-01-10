import { commentEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  CommentResponse,
  CreateCommentRequestDto,
} from '@/types';

export const commentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createComment: builder.mutation<CommentResponse, CreateCommentRequestDto | { videoId: string; content: string; star?: number }>({
      query: ({ videoId, ...body }) => ({
        url: commentEndpoints.CREATE_FOR_VIDEO(videoId || ''),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Video', 'Comment'],
    }),
    deleteComment: builder.mutation<CommentResponse, string>({
      query: (id) => ({
        url: commentEndpoints.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Video', 'Comment'],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
