import { notificationEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';

export interface NotificationItem {
  _id: string;
  recipient_id: string;
  sender_id?: string;
  title: string;
  content: string;
  type: string;
  is_read?: boolean;
  isRead?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
}

export const notificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyNotifications: builder.query<{ data: NotificationItem[]; total?: number; page?: number; limit?: number }, GetNotificationsParams | void>({
      query: (params) => ({
        url: notificationEndpoints.LIST,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => ({
        url: notificationEndpoints.UNREAD_COUNT,
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<{ modifiedCount: number }, void>({
      query: () => ({
        url: notificationEndpoints.READ_ALL,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<any, string>({
      query: (id) => ({
        url: notificationEndpoints.READ(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    clearAllNotifications: builder.mutation<{ deletedCount: number }, void>({
      query: () => ({
        url: notificationEndpoints.CLEAR_ALL,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: notificationEndpoints.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useLazyGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useClearAllNotificationsMutation,
  useDeleteNotificationMutation,
} = notificationApi;
