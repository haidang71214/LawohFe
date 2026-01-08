import { userEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  UserResponse,
  UserListResponse,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  BookingListResponse,
} from '@/types';

export const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUsers: builder.query<UserListResponse, Record<string, any> | void>({
      query: (params) => ({
        url: userEndpoints.LIST_ALL,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['User'],
    }),
    getUserById: builder.query<UserResponse, string>({
      query: (id) => ({
        url: userEndpoints.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<UserResponse, CreateUserRequestDto>({
      query: (body) => ({
        url: userEndpoints.LIST_ALL,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Lawyer'],
    }),
    updateMe: builder.mutation<UserResponse, UpdateUserRequestDto | FormData>({
      query: (body) => ({
        url: userEndpoints.UPDATE_ME,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User', 'Lawyer'],
    }),
    updateUserByAdmin: builder.mutation<UserResponse, { id: string; data: UpdateUserRequestDto | Record<string, any> }>({
      query: ({ id, data }) => ({
        url: userEndpoints.UPDATE_USER(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User', 'Lawyer'],
    }),
    getUserBookings: builder.query<BookingListResponse, string>({
      query: (userId) => ({
        url: userEndpoints.USER_BOOKINGS(userId),
        method: 'GET',
      }),
      providesTags: ['Booking'],
    }),

    // 1. User gởi yêu cầu xin cấp quyền làm Luật sư (kèm chứng chỉ, kinh nghiệm)
    requestLawyerRole: builder.mutation<UserResponse, FormData>({
      query: (formData) => ({
        url: userEndpoints.REQUEST_LAWYER,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User', 'Lawyer'],
    }),

    // 2. Admin lấy danh sách các yêu cầu xin cấp quyền đang chờ duyệt
    getLawyerRequests: builder.query<UserListResponse, Record<string, any> | void>({
      query: (params) => ({
        url: userEndpoints.LAWYER_REQUESTS,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['User', 'Lawyer'],
    }),

    // 3. Admin chấp thuận yêu cầu nâng quyền lên Luật sư
    acceptLawyerRequest: builder.mutation<UserResponse, string>({
      query: (id) => ({
        url: userEndpoints.ACCEPT_LAWYER_REQUEST(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['User', 'Lawyer'],
    }),

    // 4. Admin từ chối yêu cầu kèm lý do
    rejectLawyerRequest: builder.mutation<UserResponse, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: userEndpoints.REJECT_LAWYER_REQUEST(id),
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['User', 'Lawyer'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateMeMutation,
  useUpdateUserByAdminMutation,
  useGetUserBookingsQuery,
  useLazyGetUserBookingsQuery,
  useRequestLawyerRoleMutation,
  useGetLawyerRequestsQuery,
  useAcceptLawyerRequestMutation,
  useRejectLawyerRequestMutation,
} = userApi;
