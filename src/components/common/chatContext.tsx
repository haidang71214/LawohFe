'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  X,
  Minus,
  Maximize2,
  Send,
  MessageSquare,
  RotateCw,
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import { useGetUserByIdQuery } from '@/store/queries/user';
import {
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
  useCreateConversationMutation,
  useLazyCheckConversationQuery,
  useGetUnreadMessageCountQuery,
  useMarkConversationAsReadMutation,
} from '@/store/queries/chat';
import { useGetMeQuery } from '@/store/queries/auth';
import { URL_SOCKET } from '@/fetchApi';
import SliderChatUser from './SliderChatUser';
import toast from '@/lib/toast';

interface Message {
  _id?: string;
  content: string;
  senderId: string;
  createdAt: string | Date;
}

interface ChatContextType {
  openChat: (conversationId: string | null, lawyerId: string) => void;
  closeChat: () => void;
  isChatOpen: boolean;
  currentConversationId: string | null;
  currentLawyerId: string | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  unreadChatCount: number;
  clearUnreadChat: () => void;
  onlineUsers: Set<string>;
  isUserOnline: (userId?: string | null) => boolean;
  unreadConvMap: Map<string, number>;
  getConvUnreadCount: (convId?: string | null) => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentLawyerId, setCurrentLawyerId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [unreadConvMap, setUnreadConvMap] = useState<Map<string, number>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lazy loading pagination states
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const isPrependingRef = useRef<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Queries & Mutations
  const { data: meResponse } = useGetMeQuery();
  const [createConversation, { isLoading: isCreatingConv }] = useCreateConversationMutation();
  const [triggerCheckConv] = useLazyCheckConversationQuery();
  const [sendMessageMutation] = useSendMessageMutation();
  const [triggerGetMessages] = useLazyGetMessagesQuery();
  const [markAsReadMutation] = useMarkConversationAsReadMutation();

  const currentUser: any = meResponse?.data || null;
  const currentUserId = currentUser?._id || currentUser?.id || '';

  // Fetch Lawyer Info
  const { data: lawyerUserResponse } = useGetUserByIdQuery(currentLawyerId || '', {
    skip: !currentLawyerId,
  });
  const lawyerUser: any =
    (lawyerUserResponse?.data as any)?.user || lawyerUserResponse?.data || null;
  
  // Fetch initial unread message count from Backend DB
  const { data: unreadCountResponse, refetch: refetchUnreadCount } = useGetUnreadMessageCountQuery(
    undefined,
    {
      skip: !currentUserId,
    }
  );

  useEffect(() => {
    if (unreadCountResponse?.data) {
      const rawCount = unreadCountResponse.data;
      const count =
        typeof rawCount.totalUnread === 'number'
          ? rawCount.totalUnread
          : Number((rawCount as any)?.count || 0);
      setUnreadChatCount(count);

      if (Array.isArray(rawCount.unreadList)) {
        const map = new Map<string, number>();
        rawCount.unreadList.forEach((item: any) => {
          const convId = (item.conversation_id?._id || item.conversation_id || '').toString();
          if (convId) {
            map.set(convId, item.unread_count || 1);
          }
        });
        setUnreadConvMap(map);
      }
    }
  }, [unreadCountResponse]);

  // Fetch initial message history (page 1, limit 20)
  const {
    data: messagesResponse,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useGetMessagesQuery(
    currentConversationId
      ? { conversationId: currentConversationId, page: 1, limit: 20 }
      : '',
    {
      skip: !currentConversationId,
    }
  );

  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const getUserId = () => {
    if (currentUserId) return currentUserId;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('USER_PROFILE');
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed?._id || parsed?.id || '';
        }
      } catch {}
    }
    return '';
  };

  const clearUnreadChat = () => setUnreadChatCount(0);

  const openDrawer = () => {
    clearUnreadChat();
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => setIsDrawerOpen(false);

  // Initialize conversation when opening chat
  const openChat = async (conversationId: string | null, lawyerId: string) => {
    const myId = getUserId();
    if (!myId) {
      toast.error('Vui lòng đăng nhập để bắt đầu trò chuyện.');
      return;
    }

    clearUnreadChat();
    setCurrentLawyerId(lawyerId);
    setIsChatOpen(true);
    setIsMinimized(false);
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);

    if (conversationId) {
      if (conversationId !== currentConversationId) {
        setLiveMessages([]); // Clear previous conversation messages immediately
      }
      setCurrentConversationId(conversationId);

      // Clear this conversation from unread map and adjust unread total
      setUnreadConvMap((prev) => {
        const count = prev.get(conversationId) || 0;
        if (count > 0) {
          setUnreadChatCount((total) => Math.max(0, total - count));
        }
        const next = new Map(prev);
        next.delete(conversationId);
        return next;
      });

      try {
        markAsReadMutation(conversationId);
      } catch {}

      if (socket) {
        socket.emit('markAsRead', { conversationId, userId: myId });
      }

      setTimeout(() => {
        try {
          refetchMessages();
        } catch {}
      }, 50);
      return;
    }

    setLiveMessages([]); // Clear messages for new conversation search

    // 1. Check if conversation already exists
    try {
      const checkResult = await triggerCheckConv(lawyerId).unwrap();
      const existingConv: any = checkResult?.data || checkResult;
      if (existingConv && (existingConv._id || existingConv.id)) {
        const foundId = existingConv._id || existingConv.id;
        setCurrentConversationId(foundId);

        setUnreadConvMap((prev) => {
          const count = prev.get(foundId) || 0;
          if (count > 0) {
            setUnreadChatCount((total) => Math.max(0, total - count));
          }
          const next = new Map(prev);
          next.delete(foundId);
          return next;
        });

        try {
          markAsReadMutation(foundId);
        } catch {}

        if (socket) {
          socket.emit('markAsRead', { conversationId: foundId, userId: myId });
        }

        setTimeout(() => {
          try {
            refetchMessages();
          } catch {}
        }, 50);
        return;
      }
    } catch (checkErr) {
      console.log('[Chat Action] No existing conversation found (404 expected):', checkErr);
    }

    // 2. Create new conversation with 2 participants [myId, lawyerId]
    try {
     const createResult = await createConversation({
        participants: [myId, lawyerId],
      }).unwrap();
      const newConv: any = createResult?.data || createResult;
      if (newConv && (newConv._id || newConv.id)) {
        const newId = newConv._id || newConv.id;
        setCurrentConversationId(newId);
      }
    } catch (createErr: any) {
      toast.error(createErr?.data?.message || 'Không thể tạo phòng chat. Vui lòng thử lại sau.');
    }
  };

  const closeChat = () => {
    console.log('[Chat Action] Closing chat');
    setIsChatOpen(false);
    setIsMinimized(false);
    setCurrentConversationId(null);
    setCurrentLawyerId(null);
    setLiveMessages([]);
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
    setIsOtherTyping(false);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  // Sync messages from RTK query
  useEffect(() => {
    if (messagesResponse?.data) {
      const raw = Array.isArray(messagesResponse.data)
        ? messagesResponse.data
        : ((messagesResponse.data as any)?.items || []);

      if (raw.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const formatted: Message[] = raw.map((m: any) => ({
        _id: m._id,
        content: m.content,
        senderId: m.sender?._id || m.senderId || m.sender || '',
        createdAt: m.createdAt,
      }));

      // Sort messages chronologically (oldest at top, newest at bottom)
      formatted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setLiveMessages((prev) => {
        // Retain any pending temp messages that aren't in backend yet
        const pendingTemps = prev.filter(
          (p) =>
            p._id?.startsWith('temp-') &&
            !formatted.some(
              (f) => f.content === p.content && f.senderId === p.senderId
            )
        );
        return [...formatted, ...pendingTemps];
      });
     } else if (!messagesResponse) {
      setLiveMessages([]);
    }
  }, [messagesResponse, currentConversationId]);

  // Global socket for real-time notifications & incoming chat pings
  useEffect(() => {
    const myId = getUserId();
    if (!myId) return;

    const targetUrl = URL_SOCKET || 'http://localhost:3300';
    const isSecure = targetUrl.startsWith('https');

    const globalSocket = io(targetUrl, {
      transports: ['polling'],
      secure: isSecure,
      reconnectionAttempts: 5,
      auth: {
        userId: myId,
      },
      query: {
        userId: myId,
      },
    });

    globalSocket.on('connect', () => {
      globalSocket.emit('userLogin', myId);
      globalSocket.emit('register-user', myId);
      globalSocket.emit('join-dashboard');
      // Request active online users list from server
      globalSocket.emit('getOnlineUsers');
    });

    globalSocket.on('connect_error', (err) => {
      console.error('[Socket Global] Connection error:', err.message, err);
    });

    globalSocket.on('disconnect', (reason) => {
      console.log('[Socket Global] Disconnected. Reason:', reason);
    });

    // Real-time Presence Tracking
    globalSocket.on('onlineUsersList', (users: string[]) => {
      console.log('[Socket Global] Received onlineUsersList:', users);
      if (Array.isArray(users)) {
        setOnlineUsers(new Set(users.map(String)));
      }
    });

    globalSocket.on('userOnline', (userId: string) => {
      console.log('[Socket Global] User came online:', userId);
      if (userId) {
        setOnlineUsers((prev) => new Set(prev).add(String(userId)));
      }
    });

    globalSocket.on('userOffline', (userId: string) => {
      console.log('[Socket Global] User went offline:', userId);
      if (userId) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(String(userId));
          return next;
        });
      }
    });

    // Real-time Chat Notification event from Backend (newMessageNotification)
    globalSocket.on('newMessageNotification', (rawData: any) => {
      console.log('[Socket Global] Received newMessageNotification event:', rawData);
      const data = rawData?.data || rawData;
      if (!data) return;

      const activeId = getUserId();
      const senderId = (data.sender_id?._id || data.sender_id || data.senderId || '').toString();

      // Don't count self messages
      if (senderId && senderId === activeId) return;

      // Don't increment unread count if user currently has this conversation open
      const notifConvId = (data.conversation_id?._id || data.conversation_id || '').toString();
      if (isChatOpen && currentConversationId && currentConversationId === notifConvId) {
        return;
      }

      setUnreadChatCount((prev) => prev + 1);
      try {
        refetchUnreadCount();
      } catch {}
    });

    return () => {
      console.log('[Socket Global] Cleaning up and disconnecting global socket');
      globalSocket.disconnect();
    };
  }, [currentUserId]);

  // Socket Connection for active chat room
  useEffect(() => {
    if (!currentConversationId || !isChatOpen) return;

    const myId = getUserId();
    const targetUrl = URL_SOCKET || 'http://localhost:3300';
    const isSecure = targetUrl.startsWith('https');

    console.log('[Socket Room] Initializing room socket for conversation:', currentConversationId, 'User:', myId, 'URL:', targetUrl);

    const newSocket = io(targetUrl, {
      transports: ['polling'],
      secure: isSecure,
      reconnectionAttempts: 5,
      auth: {
        userId: myId,
      },
      query: {
        userId: myId,
      },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket Room] Connected to chat room socket. ID:', newSocket.id);
      console.log('[Socket Room] Emitting userLogin:', myId);
      newSocket.emit('userLogin', myId);

      console.log('[Socket Room] Emitting joinRoom:', currentConversationId);
      newSocket.emit('joinRoom', currentConversationId);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket Room] Connection error:', err.message, err);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket Room] Disconnected from room socket. Reason:', reason);
    });

    newSocket.on('newMessage', (rawMsg: any) => {
      console.log('[Socket Room] Received newMessage event:', rawMsg);
      const message = rawMsg?.data || rawMsg;
      if (!message) return;

      const transformedMessage: Message = {
        _id: message._id || Date.now().toString(),
        content: message.content,
        senderId: message.sender?._id || message.senderId || message.sender || '',
        createdAt: message.createdAt || new Date().toISOString(),
      };

      setLiveMessages((prev) => {
        // If already exists by _id, do not re-add
        if (transformedMessage._id && prev.some((m) => m._id === transformedMessage._id)) {
          return prev;
        }

        // Replace pending temp message from myself in-place without jarring animation
        const tempIdx = prev.findIndex(
          (m) =>
            m._id?.startsWith('temp-') &&
            m.senderId === transformedMessage.senderId &&
            m.content === transformedMessage.content
        );

        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = transformedMessage;
          return updated;
        }

        return [...prev, transformedMessage];
      });
    });

    newSocket.on('userTyping', (typingUserId: string) => {
      console.log('[Socket Room] Received userTyping event from userId:', typingUserId);
      if (typingUserId !== myId) {
        setIsOtherTyping(true);
      }
    });

    newSocket.on('userStopTyping', (typingUserId: string) => {
      console.log('[Socket Room] Received userStopTyping event from userId:', typingUserId);
      if (typingUserId !== myId) {
        setIsOtherTyping(false);
      }
    });

    return () => {
      console.log('[Socket Room] Leaving room and disconnecting. ConvId:', currentConversationId);
      newSocket.emit('leaveRoom', currentConversationId);
      newSocket.disconnect();
    };
  }, [currentConversationId, isChatOpen]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Instant lock to bottom without upward jump
  const scrollToBottom = (instant = true) => {
    if (chatScrollRef.current) {
      if (instant) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };

  // Sync scroll position instantly whenever messages or typing change (unless prepending older messages)
  useEffect(() => {
    if (isPrependingRef.current) return;
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [liveMessages.length, isOtherTyping]);

  // Instant snap on chat open/restore
  useEffect(() => {
    if (isChatOpen && !isMinimized) {
      setTimeout(() => scrollToBottom(true), 20);
    }
  }, [isChatOpen, isMinimized, currentConversationId]);

  // Lazy loading on scroll to top
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollTop <= 25 &&
      hasMore &&
      !isLoadingMore &&
      !isLoadingMessages &&
      currentConversationId
    ) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const oldScrollHeight = target.scrollHeight;
      const oldScrollTop = target.scrollTop;
      isPrependingRef.current = true;

      console.log('[Chat LazyLoad] Triggering load for page:', nextPage, 'convId:', currentConversationId);

      try {
        const result = await triggerGetMessages({
          conversationId: currentConversationId,
          page: nextPage,
          limit: 20,
        }).unwrap();

        const raw = Array.isArray(result.data)
          ? result.data
          : ((result.data as any)?.items || []);

        if (!raw || raw.length === 0) {
          console.log('[Chat LazyLoad] No more messages found. hasMore = false');
          setHasMore(false);
        } else {
          if (raw.length < 20) {
            setHasMore(false);
          }

          const olderFormatted: Message[] = raw.map((m: any) => ({
            _id: m._id,
            content: m.content,
            senderId: m.sender?._id || m.senderId || m.sender || '',
            createdAt: m.createdAt,
          }));

          setLiveMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id));
            const newOlder = olderFormatted.filter((m) => !m._id || !existingIds.has(m._id));
            const merged = [...newOlder, ...prev];
            return merged.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });

          setPage(nextPage);

          // Restore scroll position so content doesn't jump
          requestAnimationFrame(() => {
            if (chatScrollRef.current) {
              const newScrollHeight = chatScrollRef.current.scrollHeight;
              chatScrollRef.current.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;
            }
            setTimeout(() => {
              isPrependingRef.current = false;
            }, 100);
          });
        }
      } catch (err) {
        console.error('[Chat LazyLoad] Error loading older messages:', err);
        isPrependingRef.current = false;
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Typing event emitter handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (socket && socket.connected && currentConversationId) {
      const myId = getUserId();
      const typingPayload = {
        userId: myId,
        conversationId: currentConversationId,
        conversastionId: currentConversationId, // support backend typo compatibility
      };

     socket.emit('typing', typingPayload);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        const stopTypingPayload = {
          userId: myId,
          conversationId: currentConversationId,
          conversastionId: currentConversationId,
        };
      socket.emit('stopTyping', stopTypingPayload);
      }, 1500);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !currentConversationId) return;

    const myId = getUserId();
    const content = messageInput.trim();
    setMessageInput('');
    inputRef.current?.focus({ preventScroll: true });

    if (socket && socket.connected && currentConversationId) {
      const stopTypingPayload = {
        userId: myId,
        conversationId: currentConversationId,
        conversastionId: currentConversationId,
      };
     socket.emit('stopTyping', stopTypingPayload);
    }

    // Optimistic local add
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      content,
      senderId: myId,
      createdAt: new Date().toISOString(),
    };
    setLiveMessages((prev) => [...prev, tempMessage]);

    // Force instant lock to bottom before paint
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }

    try {
      if (socket && socket.connected) {
        const sendPayload = {
          conversationId: currentConversationId,
          senderId: myId,
          content,
        };
        socket.emit('sendMessage', sendPayload);
      } else {
        console.warn('[Socket Action] Socket is not connected, skipping socket.emit(sendMessage)');
      }

      await sendMessageMutation({
        conversationId: currentConversationId,
        content,
        senderId: myId,
      }).unwrap();
    } catch (err: any) {
      console.error('[Socket/API Action] Failed to send message:', err);
      refetchMessages();
    }
  };

  const isUserOnline = (id?: string | null): boolean => {
    if (!id) return false;
    return onlineUsers.has(String(id));
  };

  const getConvUnreadCount = (convId?: string | null): number => {
    if (!convId) return 0;
    return unreadConvMap.get(String(convId)) || 0;
  };

  const lawyerName =
    lawyerUser?.name ||
    lawyerUser?.fullName ||
    lawyerUser?.username ||
    (lawyerUser?.email ? lawyerUser.email.split('@')[0] : '') ||
    'Luật sư tư vấn';

  const lawyerEmail = lawyerUser?.email || '';

  const lawyerAvatar =
    lawyerUser?.avartar_url ||
    lawyerUser?.avatar_url ||
    lawyerUser?.avatar ||
    lawyerUser?.image ||
    lawyerUser?.img ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lawyerName)}&backgroundColor=1a5336&textColor=ffffff`;

  const myUserId = getUserId();
  const isLawyerOnline = isUserOnline(currentLawyerId);

  return (
    <ChatContext.Provider
      value={{
        openChat,
        closeChat,
        isChatOpen,
        currentConversationId,
        currentLawyerId,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        unreadChatCount,
        clearUnreadChat,
        onlineUsers,
        isUserOnline,
        unreadConvMap,
        getConvUnreadCount,
      }}
    >
      {children}

      {/* CONVERSATIONS DRAWER (SLIDER BAR) */}
      {isMounted && (
        <SliderChatUser
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          onSelectConversation={(convId, otherId) => openChat(convId, otherId)}
          isUserOnline={isUserOnline}
          getConvUnreadCount={getConvUnreadCount}
        />
      )}

      {/* FLOATING REAL-TIME CHAT WINDOW (Teletype Signal Olive Aesthetic) */}
      {isMounted && isChatOpen && (
        <div
          className={`fixed bottom-5 right-5 z-[99999] w-[360px] sm:w-[420px] bg-[#f3f6f3] dark:bg-[#0c120f] text-stone-900 dark:text-[#ecf3ee] border-2 border-[#1a5336] dark:border-[#2a6d48] shadow-[6px_6px_0px_#1a5336] dark:shadow-[6px_6px_0px_#0e2a1b] flex flex-col font-sans transition-all duration-300 overflow-hidden ${
            isMinimized ? 'h-14' : 'h-[520px]'
          }`}
        >
          {/* Chat Header */}
          <div className="px-4 py-2.5 bg-[#e4ede5] dark:bg-[#131e18] border-b-2 border-[#1a5336] dark:border-[#2a6d48] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={lawyerAvatar}
                  alt={lawyerName}
                  className="w-9 h-9 rounded-none object-cover border-2 border-stone-900 dark:border-[#2a6d48] bg-stone-200 dark:bg-stone-800"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border border-stone-900 ${
                    isLawyerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                  }`}
                  title={isLawyerOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                />
              </div>

              <div className="min-w-0">
                <h4 className="font-serif font-bold text-xs truncate text-stone-900 dark:text-[#fbf8f2] leading-tight">
                  {lawyerName}
                </h4>
                {lawyerEmail && (
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 truncate font-mono leading-tight">
                    {lawyerEmail}
                  </p>
                )}
                <p
                  className={`text-[9px] flex items-center gap-1 font-mono leading-tight ${
                    isLawyerOnline
                      ? 'text-[#1a5336] dark:text-[#52a677] font-bold'
                      : 'text-stone-500'
                  }`}
                >
                  <span>{isLawyerOnline ? '● TRỰC TUYẾN' : '○ NGOẠI TUYẾN'}</span>
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0 font-mono">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 bg-white dark:bg-[#1a2820] border border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#1a5336] hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={closeChat}
                className="p-1.5 bg-white dark:bg-[#1a2820] border border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-700 hover:text-white transition-colors cursor-pointer"
                title="Đóng chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Body & Messages */}
          {!isMinimized && (
            <>
              <div
                ref={chatScrollRef}
                onScroll={handleScroll}
                className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8faf8] dark:bg-[#0a0f0c] text-xs font-sans"
              >
                {/* Intro bubble */}
                <div className="text-center py-2 space-y-1">
                  <span className="px-2.5 py-1 text-[10px] bg-[#e4ede5] dark:bg-[#142019] border border-[#1a5336] dark:border-[#2a6d48] text-[#1a5336] dark:text-[#52a677] font-mono font-bold">
                    [ĐIỆN BÁO MÃ HÓA BẢO MẬT 1-1]
                  </span>
                  <p className="text-[10px] text-stone-500 pt-1 font-mono">
                    Hồ sơ trao đổi trực tuyến được lưu trữ theo tiêu chuẩn bảo mật tư pháp.
                  </p>
                </div>

                {/* Loading Older Messages Spinner */}
                {isLoadingMore && (
                  <div className="py-2 text-center text-stone-500 flex items-center justify-center gap-1.5 text-[11px] font-mono animate-fade-in">
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-[#1a5336]" />
                    <span>[ĐANG TẢI LỊCH SỬ ĐIỆN BÁO CŨ...]</span>
                  </div>
                )}

                {/* All history loaded indicator */}
                {!hasMore && liveMessages.length >= 20 && (
                  <div className="py-1 text-center text-[10px] text-stone-400 font-mono">
                    <span>── TOÀN BỘ BẢN GHI ĐÃ TẢI ──</span>
                  </div>
                )}

                {isLoadingMessages || isCreatingConv ? (
                  <div className="py-12 text-center text-stone-500 font-mono flex items-center justify-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin text-[#1a5336]" />
                    <span>[ĐANG THIẾT LẬP KÊNH TRUYỀN...]</span>
                  </div>
                ) : liveMessages.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 font-mono space-y-1">
                    <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-[#1a5336]" />
                    <p className="font-bold text-stone-800 dark:text-stone-300">[CHƯA CÓ NỘI DUNG TRAO ĐỔI]</p>
                    <p className="text-[10px]">Gửi thông điệp để bắt đầu phiên tư vấn với luật sư.</p>
                  </div>
                ) : (
                  liveMessages.map((msg, idx) => {
                    const isMyMessage = msg.senderId === myUserId;

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[84%] px-3.5 py-2 leading-relaxed text-xs break-words border ${
                            isMyMessage
                              ? 'bg-[#1a5336] text-white border-stone-900 shadow-[2px_2px_0px_#0e2a1b]'
                              : 'bg-white dark:bg-[#142019] border-stone-800 dark:border-[#2a6d48] text-stone-900 dark:text-[#ecf3ee] shadow-[2px_2px_0px_#1a5336]'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-stone-500 font-mono mt-0.5 px-1">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* Other person typing indicator */}
                {isOtherTyping && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e4ede5] dark:bg-[#142019] border border-[#1a5336] w-fit text-[10px] font-mono text-[#1a5336] dark:text-[#52a677] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a5336] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a5336] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a5336] animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1">ĐỐI PHƯƠNG ĐANG SOẠN ĐIỆN BÁO...</span>
                  </div>
                )}

                {/* Bottom anchor for zero-bounce scroll */}
                <div ref={messagesEndRef} className="h-0 w-full shrink-0 pointer-events-none" />
              </div>

              {/* Chat Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-[#e4ede5] dark:bg-[#131e18] border-t-2 border-[#1a5336] dark:border-[#2a6d48] flex items-center gap-2 shrink-0 font-mono"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="SOẠN THÔNG ĐIỆP TƯ VẤN..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#0a0f0c] border-2 border-stone-800 dark:border-[#2a6d48] text-xs font-mono text-stone-900 dark:text-[#ecf3ee] placeholder:text-stone-500 focus:outline-none focus:border-[#1a5336]"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-3.5 py-2 bg-[#1a5336] hover:bg-[#22774a] disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-stone-900 shadow-[2px_2px_0px_#0e2a1b] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer shrink-0 flex items-center gap-1"
                  title="Truyền phát tin nhắn"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">GỬI</span>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};