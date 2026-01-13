'use client';

import React from 'react';
import {
  X,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Search,
  Radio,
} from 'lucide-react';
import { useGetUserConversationsQuery } from '@/store/queries/chat';
import { useGetMeQuery } from '@/store/queries/auth';
import { useLanguage } from '@/i18n/LanguageContext';
import webStorageClient from '@/utils/webStorageClient';

interface SliderChatUserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string, lawyerId: string) => void;
  isUserOnline?: (userId?: string | null) => boolean;
  getConvUnreadCount?: (convId?: string | null) => number;
}

export default function SliderChatUser({
  isOpen,
  onClose,
  onSelectConversation,
  isUserOnline,
  getConvUnreadCount,
}: SliderChatUserProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: meResponse } = useGetMeQuery();
  const currentUser: any = meResponse?.data || null;

  const getUserId = () => {
    if (currentUser?._id || currentUser?.id) return currentUser._id || currentUser.id;
    try {
      const u = webStorageClient.getUser();
      if (u?._id || u?.id) return u._id || u.id;
      const raw = localStorage.getItem('USER_PROFILE');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?._id || parsed?.id || '';
      }
    } catch {}
    return '';
  };

  const currentUserId = getUserId();

  const {
    data: conversationsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetUserConversationsQuery(currentUserId, {
    skip: !currentUserId || !isOpen,
  });

  const handleRefresh = () => {
    if (currentUserId && !isLoading && !isFetching) {
      try {
        refetch();
      } catch (err) {
        console.warn('Refetch error:', err);
      }
    }
  };

  const rawList = Array.isArray(conversationsResponse?.data)
    ? conversationsResponse.data
    : [];

  // Filter conversations
  const conversations = React.useMemo(() => {
    return rawList.filter((conv: any) => {
      const otherParticipant = conv.participants?.find(
        (p: any) => (p._id || p.id || p) !== currentUserId
      );
      const name = otherParticipant?.name || otherParticipant?.email || 'Người dùng';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [rawList, currentUserId, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99990] bg-stone-900/60 backdrop-blur-xs flex justify-end font-sans animate-fade-in"
    >
      <div className="w-full max-w-sm h-full bg-[#f3f6f3] dark:bg-[#0c120f] text-stone-900 dark:text-[#ecf3ee] border-l-2 border-[#1a5336] dark:border-[#2a6d48] shadow-[0_0_24px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-slide-left font-sans">
        {/* Drawer Header (Teletype Signal Olive Header) */}
        <div className="px-5 py-4 border-b-2 border-[#1a5336] dark:border-[#2a6d48] bg-[#e4ede5] dark:bg-[#131e18] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-none bg-[#1a5336] dark:bg-[#22774a] text-white flex items-center justify-center border border-stone-900 shadow-[2px_2px_0px_#0e2a1b]">
              <Radio className="w-4 h-4 animate-pulse text-[#e8dfd1]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm text-stone-900 dark:text-[#fbf8f2]">
                  {isEn ? 'DISPATCH TELEGRAPH' : 'HỘI THOẠI TRỰC TUYẾN'}
                </span>
                <span className="px-1.5 py-0.2 bg-[#1a5336] text-white text-[9px] font-mono font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#1a5336] dark:text-[#52a677] font-semibold">
                {isEn ? `[${rawList.length} ACTIVE DISPATCH CHANNELS]` : `[ĐANG MỞ ${rawList.length} DÒNG LIÊN LẠC]`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 bg-white dark:bg-[#1a2820] border border-stone-800 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-[#1a5336] hover:text-white transition-colors cursor-pointer"
              title={isEn ? 'Refresh channel dispatch' : 'Làm mới đường truyền'}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-white dark:bg-[#1a2820] border border-stone-800 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-rose-700 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b-2 border-stone-300 dark:border-[#1d2d24] bg-[#edf3ee] dark:bg-[#0f1713] shrink-0 font-mono">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'SEARCH BY RECIPIENT NAME...' : 'TRA CỨU THEO TÊN ĐỐI THOẠI...'}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#15211b] border-2 border-stone-800 dark:border-[#2a6d48] text-xs font-mono text-stone-900 dark:text-[#ecf3ee] placeholder:text-stone-500 focus:outline-none focus:border-[#1a5336] shadow-[2px_2px_0px_#1a5336]"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {isLoading ? (
            <div className="py-16 text-center text-stone-500 font-mono flex items-center justify-center gap-2 text-xs">
              <RotateCw className="w-4 h-4 animate-spin text-[#1a5336]" />
              <span>{isEn ? '[LOADING TELEGRAPH DATA...]' : '[ĐANG TẢI DỮ LIỆU ĐIỆN BÁO...]'}</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-16 text-center text-stone-500 space-y-2 font-mono">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-[#1a5336]" />
              <p className="text-xs font-bold text-stone-800 dark:text-stone-300 uppercase">
                {isEn ? '[NO CONVERSATION CHANNELS]' : '[CHƯA CÓ KÊNH HỘI THOẠI]'}
              </p>
              <p className="text-[10px] text-stone-500 max-w-[200px] mx-auto font-sans">
                {isEn
                  ? 'When you start consultations with lawyers, your chat records will appear here.'
                  : 'Khi bạn gửi hoặc nhận tin nhắn tư vấn từ luật sư, hồ sơ hội thoại sẽ lưu lại tại đây.'}
              </p>
            </div>
          ) : (
            conversations.map((conv: any) => {
              const other = conv.participants?.find(
                (p: any) => (p._id || p.id || p) !== currentUserId
              );
              const otherName = other?.name || other?.email || (isEn ? 'User' : 'Người dùng');
              const otherRole = other?.role || 'user';
              const otherId = other?._id || other?.id || (typeof other === 'string' ? other : '');
              const otherAvatar =
                other?.avartar_url ||
                other?.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(otherName)}&backgroundColor=1a5336&textColor=ffffff`;

              const isOnline = isUserOnline ? isUserOnline(otherId) : false;
              const unreadCount = getConvUnreadCount ? getConvUnreadCount(conv._id) : 0;
              const isUnread = unreadCount > 0;

              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    onSelectConversation(conv._id, otherId);
                    onClose();
                  }}
                  className={`p-3 border-2 transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                    isUnread
                      ? 'bg-[#e2ede4] dark:bg-[#18291f] border-[#1a5336] dark:border-[#38915e] shadow-[3px_3px_0px_#1a5336]'
                      : 'bg-white dark:bg-[#121c16] hover:bg-[#ebf2ec] dark:hover:bg-[#19271f] border-stone-800 dark:border-[#23352a] shadow-[2px_2px_0px_#1a5336] dark:shadow-[2px_2px_0px_#0e2a1b]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={otherAvatar}
                        alt={otherName}
                        className={`w-10 h-10 rounded-none object-cover border-2 ${
                          isUnread
                            ? 'border-[#1a5336] dark:border-[#38915e]'
                            : 'border-stone-800 dark:border-stone-600'
                        }`}
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 border border-stone-900 ${
                          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                        }`}
                        title={isOnline ? (isEn ? 'Online' : 'Trực tuyến') : (isEn ? 'Offline' : 'Ngoại tuyến')}
                      />
                      {otherRole === 'lawyer' && (
                        <div className="absolute -top-1.5 -right-1.5 p-0.5 bg-[#1a5336] text-white border border-stone-900">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4
                          className={`text-xs truncate font-serif transition-colors ${
                            isUnread
                              ? 'font-bold text-[#1a5336] dark:text-[#52a677]'
                              : 'font-bold text-stone-900 dark:text-[#ecf3ee] group-hover:text-[#1a5336] dark:group-hover:text-[#52a677]'
                          }`}
                        >
                          {otherName}
                        </h4>
                        {isUnread && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#1a5336] shrink-0 animate-pulse"
                            title={isEn ? 'New unread telegram' : 'Điện báo mới chưa đọc'}
                          />
                        )}
                        {otherRole === 'lawyer' && (
                          <span className="text-[9px] px-1 py-0.2 font-mono font-bold bg-[#1a5336] text-white">
                            {isEn ? 'LAWYER' : 'LUẬT SƯ'}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] font-mono truncate ${
                          isUnread
                            ? 'font-bold text-stone-900 dark:text-stone-100'
                            : 'text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {conv.lastMessage?.content || (isEn ? '[Click to open channel]' : '[Bấm để kết nối truyền tin]')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isUnread && (
                      <span className="min-w-[20px] h-[20px] px-1.5 bg-[#1a5336] text-white text-[10px] font-bold font-mono flex items-center justify-center border border-stone-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-all text-[#1a5336] dark:text-[#52a677] group-hover:translate-x-1`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}