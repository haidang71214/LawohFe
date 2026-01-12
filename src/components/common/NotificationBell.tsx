'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Calendar,
  CheckCheck,
  Trash2,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  CreditCard,
  RotateCw,
} from 'lucide-react';
import io from 'socket.io-client';
import { URL_SOCKET, axiosInstance } from '@/fetchApi';
import { useGetMeQuery } from '@/store/queries/auth';
import {
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useClearAllNotificationsMutation,
  useDeleteNotificationMutation,
} from '@/store/queries/notification';
import toast from '@/lib/toast';
import webStorageClient from '@/utils/webStorageClient';
import Link from 'next/link';

export interface SystemNotification {
  id: string;
  type:
    | 'BOOKING'
    | 'PAYMENT'
    | 'CHAT'
    | 'MESSAGE'
    | 'SYSTEM'
    | 'LAWYER_APPROVAL'
    | 'LAWYER_APPROVED'
    | 'LAWYER_REJECTED'
    | 'lawyer_approved'
    | 'lawyer_rejected'
    | 'new_booking'
    | 'system';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
}

const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Harmonic bell chime: G5 (783.99 Hz) -> C6 (1046.50 Hz) with warm decay
    const notes = [
      { freq: 783.99, start: 0, duration: 0.28, gain: 0.12 },
      { freq: 1046.5, start: 0.08, duration: 0.45, gain: 0.14 },
    ];

    notes.forEach(({ freq, start, duration, gain: peakGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch {}
};

const mapBackendNotification = (item: any, userRole: string): SystemNotification => {
  const notifType = String(item.type || 'SYSTEM').toUpperCase();
  let link = userRole === 'lawyer' ? '/bookingLawyer' : '/myBooking';

  if (item.metadata?.link || item.metadata?.target_url) {
    link = item.metadata.link || item.metadata.target_url;
  } else if (notifType.includes('ARTICLE') || notifType.includes('NEWS') || notifType.includes('POST')) {
    const articleId =
      item.metadata?.articleId ||
      item.metadata?.article_id ||
      item.metadata?.newsId ||
      item.metadata?.news_id ||
      item.metadata?.id ||
      item.metadata?._id;
    link = articleId ? `/newsDetail/${articleId}` : '/newsSelf';
  } else if (notifType.includes('VIDEO')) {
    link = '/videoSelf';
  } else if (notifType.includes('CHAT') || notifType.includes('MESSAGE')) {
    link = '/';
  } else if (notifType.includes('LAWYER_APPROV')) {
    link = '/lawyers';
  } else if (notifType.includes('LAWYER_REJECT')) {
    link = '/updateLawyerDetails';
  } else if (notifType.includes('PAYMENT')) {
    link = userRole === 'lawyer' ? '/bookingLawyer' : '/myBooking';
  }

  // Normalize legacy or mismatched news routes to match app router /newsDetail/[id]
  if (link) {
    if (/^\/news\/[a-zA-Z0-9_-]+$/.test(link)) {
      link = link.replace('/news/', '/newsDetail/');
    } else if (/^\/newsPage\/[a-zA-Z0-9_-]+$/.test(link)) {
      link = link.replace('/newsPage/', '/newsDetail/');
    } else if (link === '/news') {
      link = '/newsPage';
    }
  }

  let msg = item.content || item.message || '';
  const fallbackTitle =
    item.metadata?.title ||
    item.metadata?.video_title ||
    item.metadata?.description ||
    item.metadata?.name ||
    '';
  if (msg.includes('""') && fallbackTitle) {
    msg = msg.replace('""', `"${fallbackTitle}"`);
  }

  return {
    id: item._id || item.id || `notif-${Date.now()}-${Math.random()}`,
    type: (item.type || 'system') as any,
    title: item.title || 'Thông báo mới',
    message: msg,
    createdAt: item.createdAt || new Date().toISOString(),
    isRead: item.isRead ?? item.is_read ?? false,
    link,
    metadata: item.metadata,
  };
};

const PAGE_LIMIT = 5;

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [backendUnreadCount, setBackendUnreadCount] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: meResponse } = useGetMeQuery();
  const currentUser: any = meResponse?.data || null;

  const getActiveUserId = () => {
    if (currentUser?._id || currentUser?.id) return currentUser._id || currentUser.id;
    try {
      const u = webStorageClient.getUser();
      return u?._id || u?.id || '';
    } catch {}
    return '';
  };

  const currentUserId = getActiveUserId();
  const userRole = currentUser?.role || 'user';
  const isFetchingRef = useRef(false);

  // Fetch paginated notifications from backend with page & limit
  const fetchNotifications = useCallback(
    async (pageNum: number, isAppend = false) => {
      const token = webStorageClient.getToken();
      if (!token) return;
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;

      try {
        if (isAppend) {
          setIsLoadingMore(true);
        } else {
          setIsLoadingInitial(true);
        }

        const res = await axiosInstance.get('/notification', {
          params: { page: pageNum, limit: PAGE_LIMIT },
        });

        console.log('[NotificationBell] API Response:', res.data);

        const rawPayload = res.data;
        let rawList: any[] = [];

        if (Array.isArray(rawPayload)) {
          rawList = rawPayload;
        } else if (Array.isArray(rawPayload?.data?.data)) {
          rawList = rawPayload.data.data;
        } else if (Array.isArray(rawPayload?.data)) {
          rawList = rawPayload.data;
        } else if (Array.isArray(rawPayload?.data?.notifications)) {
          rawList = rawPayload.data.notifications;
        } else if (Array.isArray(rawPayload?.notifications)) {
          rawList = rawPayload.notifications;
        }

        // 👈 Lấy unreadCount từ payload Backend data trả về
        const unreadFromBackend =
          typeof rawPayload?.data?.unreadCount === 'number'
            ? rawPayload.data.unreadCount
            : typeof rawPayload?.unreadCount === 'number'
            ? rawPayload.unreadCount
            : null;

        if (unreadFromBackend !== null) {
          setBackendUnreadCount(unreadFromBackend);
        }

        const mappedList: SystemNotification[] = rawList.map((item: any) =>
          mapBackendNotification(item, userRole)
        );

        if (isAppend) {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newItems = mappedList.filter((n) => !existingIds.has(n.id));
            return [...prev, ...newItems];
          });
        } else {
          // Merge page 1 with any newly arrived real-time items
          setNotifications((prev) => {
            if (prev.length === 0) return mappedList;
            const fetchedIds = new Set(mappedList.map((n) => n.id));
            // Keep any real-time items that might not be in page 1 yet
            const realtimeOnly = prev.filter((n) => !fetchedIds.has(n.id) && n.id.startsWith('notif-'));
            return [...realtimeOnly, ...mappedList];
          });
        }

        if (mappedList.length < PAGE_LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setPage(pageNum);
      } catch (err) {
        console.error('Error fetching notifications from /notification:', err);
      } finally {
        isFetchingRef.current = false;
        setIsLoadingMore(false);
        setIsLoadingInitial(false);
      }
    },
    [userRole]
  );

  // Initial load once on mount/login
  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Handle scroll down inside dropdown to load older notifications
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 40 &&
      hasMore &&
      !isLoadingMore &&
      !isLoadingInitial &&
      !isFetchingRef.current
    ) {
      fetchNotifications(page + 1, true);
    }
  };

  // Socket notification listener for real-time alerts
  useEffect(() => {
    if (!currentUserId) return;

    const targetUrl = URL_SOCKET || 'http://localhost:3300';
    const isSecure = targetUrl.startsWith('https');

    const socket = io(targetUrl, {
      transports: ['polling'],
      secure: isSecure,
      reconnectionAttempts: 5,
      auth: {
        userId: currentUserId,
      },
      query: {
        userId: currentUserId,
      },
    });

    socket.on('connect', () => {
      socket.emit('userLogin', currentUserId);
      socket.emit('register-user', currentUserId);
    });

    socket.on('newNotification', (rawData: any) => {
      console.log('[NotificationBell] Received newNotification event:', rawData);
      const data = rawData?.data || rawData;
      if (!data) return;

      const notifItem = mapBackendNotification(data, userRole);
      playNotificationChime();
      setBackendUnreadCount((prev) => (prev !== null ? prev + 1 : 1));

      setNotifications((prev) => {
        if (prev.some((n) => n.id === notifItem.id)) return prev;
        return [notifItem, ...prev];
      });
    });

    socket.on('lawyer-request-status-changed', (data: any) => {
      if (data.userId === currentUserId) {
        const isAppr = data.status === 'approved';
        const notifItem: SystemNotification = {
          id: `notif-lawyer-${Date.now()}`,
          type: isAppr ? 'lawyer_approved' : 'lawyer_rejected',
          title: isAppr ? 'Phê duyệt hồ sơ Luật sư' : 'Từ chối cấp quyền Luật sư',
          message: isAppr
            ? 'Chúc mừng! Đơn đăng ký Luật sư của bạn đã được phê duyệt thành công.'
            : `Hồ sơ của bạn đã bị từ chối. Lý do: ${data.reason || 'Chưa đạt tiêu chuẩn kiểm duyệt.'}`,
          createdAt: new Date().toISOString(),
          isRead: false,
          link: isAppr ? '/lawyers' : '/updateLawyerDetails',
        };

        playNotificationChime();
        setBackendUnreadCount((prev) => (prev !== null ? prev + 1 : 1));

        setNotifications((prev) => {
          return [notifItem, ...prev];
        });
      }
    });

    socket.on('new-booking-notification', (data: any) => {
      if (data.lawyerId === currentUserId) {
        const notifItem: SystemNotification = {
          id: `notif-booking-${Date.now()}`,
          type: 'new_booking',
          title: 'Yêu cầu đặt lịch tư vấn mới',
          message: `Khách hàng ${data.clientName || 'người dùng'} đã gửi yêu cầu tư vấn mới cho bạn.`,
          createdAt: new Date().toISOString(),
          isRead: false,
          link: '/bookingLawyer',
        };

        playNotificationChime();
        setBackendUnreadCount((prev) => (prev !== null ? prev + 1 : 1));

        setNotifications((prev) => {
          return [notifItem, ...prev];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId, userRole]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const [markAllAsReadApi] = useMarkAllAsReadMutation();
  const [markAsReadApi] = useMarkAsReadMutation();
  const [clearAllNotificationsApi, { isLoading: isClearingAll }] = useClearAllNotificationsMutation();
  const [deleteNotificationApi] = useDeleteNotificationMutation();
  const { data: unreadData, refetch: refetchUnreadCount } = useGetUnreadCountQuery(undefined, {
    skip: !currentUserId,
  });

  const backendUnread =
    typeof backendUnreadCount === 'number'
      ? backendUnreadCount
      : typeof unreadData?.unreadCount === 'number'
      ? unreadData.unreadCount
      : null;

  const localUnread = notifications.filter((n) => !n.isRead).length;
  const unreadCount = backendUnread !== null ? backendUnread : localUnread;

  // Dynamic Browser Tab Title & Blinking on New Notifications
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const baseTitle = 'LawOh - Nền tảng Tư vấn & Dịch vụ Pháp lý';
    let blinkInterval: NodeJS.Timeout | null = null;

    const updateTitle = () => {
      if (unreadCount > 0) {
        const displayCount = unreadCount > 99 ? '99+' : unreadCount;
        document.title = `(${displayCount}) ${baseTitle}`;
      } else {
        document.title = baseTitle;
      }
    };

    updateTitle();

    // If tab is hidden in background and has unread notifications, alternate title to catch user's attention
    if (unreadCount > 0 && document.hidden) {
      let toggle = false;
      blinkInterval = setInterval(() => {
        const displayCount = unreadCount > 99 ? '99+' : unreadCount;
        document.title = toggle
          ? `🔔 (${displayCount}) Bạn có thông báo mới! | LawOh`
          : `(${displayCount}) ${baseTitle}`;
        toggle = !toggle;
      }, 1500);
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (blinkInterval) clearInterval(blinkInterval);
        updateTitle();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [unreadCount]);

  // Dynamic Browser Favicon Notification Badge
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const updateFavicon = (count: number) => {
      try {
        let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'shortcut icon';
          document.head.appendChild(favicon);
        }

        const img = new Image();
        img.src = '/favicon.ico';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Draw base favicon
          ctx.drawImage(img, 0, 0, 32, 32);

          if (count > 0) {
            // Draw red circle badge
            ctx.beginPath();
            ctx.arc(24, 8, 7, 0, 2 * Math.PI);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw count text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(count > 9 ? '9+' : String(count), 24, 8.5);
          }

          favicon.href = canvas.toDataURL('image/png');
        };

        img.onerror = () => {
          if (count > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.beginPath();
            ctx.arc(16, 16, 14, 0, 2 * Math.PI);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(count > 9 ? '9+' : String(count), 16, 16);
            favicon.href = canvas.toDataURL('image/png');
          }
        };
      } catch (e) {
        console.warn('Failed to update dynamic favicon:', e);
      }
    };

    updateFavicon(unreadCount);
  }, [unreadCount]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setBackendUnreadCount(0);
    try {
      await markAllAsReadApi().unwrap();
      refetchUnreadCount();
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (e) {
      console.warn('markAllAsRead API error:', e);
    }
  };

  const markAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setBackendUnreadCount((prev) => (prev !== null ? Math.max(0, prev - 1) : 0));

    if (id && !id.startsWith('notif-')) {
      try {
        await markAsReadApi(id).unwrap();
        refetchUnreadCount();
      } catch (e) {
        console.warn('markAsRead API error:', e);
      }
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    const previousList = [...notifications];
    const previousUnread = backendUnreadCount;

    setNotifications([]);
    setBackendUnreadCount(0);

    try {
      await clearAllNotificationsApi().unwrap();
      refetchUnreadCount();
      toast.success('Đã xóa toàn bộ thông báo');
    } catch (e: any) {
      console.error('clearAllNotifications API error:', e);
      // Rollback on failure
      setNotifications(previousList);
      setBackendUnreadCount(previousUnread);
      toast.error('Không thể xóa toàn bộ thông báo', e?.data?.message || 'Vui lòng thử lại sau.');
    }
  };

  const deleteSingleNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    // Optimistic removal
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!target.isRead) {
      setBackendUnreadCount((prev) => (prev !== null ? Math.max(0, prev - 1) : 0));
    }

    if (id && !id.startsWith('notif-')) {
      try {
        await deleteNotificationApi(id).unwrap();
        refetchUnreadCount();
      } catch (err: any) {
        console.error('deleteNotification API error:', err);
        // Rollback item if failed
        setNotifications((prev) => [target, ...prev]);
        if (!target.isRead) {
          setBackendUnreadCount((prev) => (prev !== null ? prev + 1 : 1));
        }
        toast.error('Xóa thông báo thất bại', err?.data?.message || 'Vui lòng thử lại sau.');
      }
    }
  };

  const getIcon = (type: string) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('approv')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (t.includes('reject')) {
      return <XCircle className="w-4 h-4 text-rose-600" />;
    }
    if (t.includes('book')) {
      return <Calendar className="w-4 h-4 text-[#d95327]" />;
    } 
    if (t.includes('chat') || t.includes('mess')) {
      return <MessageSquare className="w-4 h-4 text-[#1a5336]" />;
    }
    if (t.includes('pay')) {
      return <CreditCard className="w-4 h-4 text-[#1c3a6b]" />;
    }
    return <ShieldCheck className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Retro Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 bg-stone-100 dark:bg-[#1f1c19] border-2 border-stone-800 dark:border-stone-400 shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] text-stone-900 dark:text-[#fbf8f2] transition-transform active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center relative cursor-pointer"
        title="Thông báo công văn / lịch hẹn"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-[#d95327] text-white text-[9px] font-mono font-bold border border-stone-900 shadow-[1px_1px_0px_#000]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Retro Notification Dropdown Docket */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#faf7f2] dark:bg-[#181614] text-stone-900 dark:text-[#fbf8f2] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] py-2 z-[99995] overflow-hidden text-xs font-mono">
          {/* Header */}
          <div className="px-4 py-2.5 border-b-2 border-stone-800 dark:border-stone-700 flex items-center justify-between gap-2 bg-stone-200 dark:bg-[#201d19]">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-stone-900 dark:text-stone-100">
                [CÔNG VĂN & THÔNG BÁO]
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#d95327] text-white font-bold text-[9px] border border-stone-800">
                  {unreadCount} MỚI
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  fetchNotifications(1, false);
                }}
                className={`p-1 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer ${
                  isLoadingInitial ? 'animate-spin text-[#d95327]' : ''
                }`}
                title="Làm mới thông báo"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[10px] text-[#d95327] hover:underline flex items-center gap-1 font-bold uppercase cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>ĐÃ ĐỌC</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  disabled={isClearingAll}
                  onClick={clearAllNotifications}
                  className="p-1 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                  title="Xóa tất cả thông báo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List with onScroll Infinite Loading */}
          <div
            onScroll={handleScroll}
            className="max-h-80 overflow-y-auto divide-y border-stone-200 dark:divide-stone-800"
          >
            {isLoadingInitial && notifications.length === 0 ? (
              <div className="py-10 text-center text-stone-500 space-y-2">
                <RotateCw className="w-5 h-5 animate-spin mx-auto text-[#d95327]" />
                <p className="text-[11px]">Đang tải thông báo...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-stone-500 space-y-1">
                <Bell className="w-7 h-7 mx-auto opacity-30 text-[#d95327]" />
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  HỒ SƠ KHÔNG CÓ THÔNG BÁO MỚI
                </p>
                <p className="text-[10px] text-stone-500">Các cập nhật thụ lý & lịch hẹn sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3.5 hover:bg-stone-100 dark:hover:bg-[#221f1a] transition-colors flex items-start gap-3 cursor-pointer group ${
                      !n.isRead ? 'bg-[#d95327]/10 dark:bg-[#d95327]/15' : ''
                    }`}
                  >
                    <div className="p-1.5 border border-stone-800 bg-white dark:bg-stone-900 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs truncate ${
                            !n.isRead
                              ? 'font-bold text-stone-900 dark:text-white'
                              : 'font-medium text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {n.title}
                        </h4>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!n.isRead && (
                            <span className="w-2 h-2 bg-[#d95327] shrink-0" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => deleteSingleNotification(n.id, e)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-200 dark:hover:bg-stone-800 opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Xóa thông báo này"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-600 dark:text-stone-400 font-sans leading-relaxed line-clamp-2">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500 font-mono">
                        <span>
                          {new Date(n.createdAt).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>

                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => setIsOpen(false)}
                            className="text-[#d95327] dark:text-[#f59e0b] hover:underline flex items-center gap-0.5 font-bold uppercase"
                          >
                            <span>Xem chi tiết</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bottom Sentinel for Infinite Scroll */}
                <div ref={loadMoreRef} className="py-2.5 text-center font-mono text-[10px]">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-1.5 text-[#d95327]">
                      <RotateCw className="w-3 h-3 animate-spin" />
                      <span>Đang nạp thêm thông báo cũ...</span>
                    </div>
                  ) : !hasMore && notifications.length > 5 ? (
                    <span className="text-stone-400 dark:text-stone-600">
                      [ĐÃ TẢI TOÀN BỘ THÔNG BÁO]
                    </span>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
