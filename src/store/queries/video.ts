import { videoEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  VideoResponse,
  VideoListResponse,
  ModerateVideoRequestDto,
} from '@/types';

export const videoApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPublicVideos: builder.query<VideoListResponse, { page?: number; limit?: number; type?: string } | void>({
      query: (params) => ({
        url: videoEndpoints.PUBLIC,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Video'],
    }),
    getMyVideos: builder.query<VideoListResponse, void>({
      query: () => ({
        url: videoEndpoints.MY_VIDEOS,
        method: 'GET',
      }),
      providesTags: ['Video'],
    }),
    getAdminVideos: builder.query<VideoListResponse, { status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: videoEndpoints.ADMIN_LIST,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Video'],
    }),
    getVideoById: builder.query<VideoResponse, string>({
      query: (id) => ({
        url: videoEndpoints.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Video'],
    }),
    createVideo: builder.mutation<VideoResponse, FormData>({
      query: (formData) => ({
        url: videoEndpoints.CREATE,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Video'],
    }),
    moderateVideo: builder.mutation<VideoResponse, ModerateVideoRequestDto>({
      query: ({ id, accept, action, reason }) => ({
        url: videoEndpoints.MODERATE(id),
        method: 'PATCH',
        body: {
          action: action || (accept ? 'accept' : 'reject'),
          reason: reason || (accept ? 'Phê duyệt video thành công' : 'Video không đạt yêu cầu tiêu chuẩn'),
        },
      }),
      invalidatesTags: ['Video'],
    }),
    deleteVideo: builder.mutation<VideoResponse, string>({
      query: (id) => ({
        url: videoEndpoints.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Video'],
    }),
  }),
});

export const {
  useGetPublicVideosQuery,
  useGetMyVideosQuery,
  useGetAdminVideosQuery,
  useGetVideoByIdQuery,
  useCreateVideoMutation,
  useModerateVideoMutation,
  useDeleteVideoMutation,
} = videoApi;
