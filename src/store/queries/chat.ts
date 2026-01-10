import { chatEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  MessageResponse,
  MessageListResponse,
  ConversationResponse,
  ConversationListResponse,
  CreateConversationRequestDto,
} from '@/types';

export const chatApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    checkConversation: builder.query<ConversationResponse, string>({
      query: (lawyerId) => ({
        url: chatEndpoints.CHECK(lawyerId),
        method: 'GET',
      }),
      providesTags: ['Chat'],
    }),
    getUserConversations: builder.query<ConversationListResponse, string>({
      query: (userId) => ({
        url: chatEndpoints.USER_CONVERSATIONS(userId),
        method: 'GET',
      }),
      providesTags: ['Chat'],
    }),
    getMessages: builder.query<
      MessageListResponse,
      string | { conversationId: string; page?: number; limit?: number }
    >({
      query: (arg) => {
        const conversationId = typeof arg === 'string' ? arg : arg.conversationId;
        const page = typeof arg === 'object' ? arg.page : undefined;
        const limit = typeof arg === 'object' ? arg.limit : undefined;
        const params: Record<string, any> = {};
        if (page !== undefined) params.page = page;
        if (limit !== undefined) params.limit = limit;

        return {
          url: chatEndpoints.MESSAGES(conversationId),
          method: 'GET',
          params: Object.keys(params).length > 0 ? params : undefined,
        };
      },
      providesTags: ['Chat'],
    }),
    createConversation: builder.mutation<ConversationResponse, CreateConversationRequestDto>({
      query: (body) => ({
        url: chatEndpoints.CONVERSATIONS,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
    sendMessage: builder.mutation<MessageResponse, { conversationId: string; content: string; senderId?: string }>({
      query: (body) => ({
        url: chatEndpoints.SEND_MESSAGE,
        method: 'POST',
        body,
      }),
    }),
    getUnreadMessageCount: builder.query<
      {
        data: {
          totalUnread: number;
          unreadConversationsCount?: number;
          unreadList?: Array<{
            conversation_id: any;
            unread_count?: number;
            last_message_id?: any;
            content?: string;
            is_read?: boolean;
            sender_id?: any;
          }>;
          latestUnread?: any;
        };
      },
      void
    >({
      query: () => ({
        url: chatEndpoints.UNREAD_COUNT,
        method: 'GET',
      }),
      providesTags: ['Chat'],
    }),
    markConversationAsRead: builder.mutation<any, string>({
      query: (conversationId) => ({
        url: `/mess-notification/read/${conversationId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useCheckConversationQuery,
  useLazyCheckConversationQuery,
  useGetUserConversationsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useGetUnreadMessageCountQuery,
  useLazyGetUnreadMessageCountQuery,
  useMarkConversationAsReadMutation,
} = chatApi;
