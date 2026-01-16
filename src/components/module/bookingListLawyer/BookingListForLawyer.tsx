'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Search,
  Video,
  FileText,
  RotateCw,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { USER_PROFILE } from '@/constants/enum';
import {
  useGetLawyerBookingsQuery,
  useAcceptBookingMutation,
  useRejectBookingMutation,
} from '@/store/queries/booking';
import { useLazyGetUserByIdQuery } from '@/store/queries/user';
import { useChat } from '@/components/common/chatContext';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { formatVND } from '@/lib/formatCurrency';
import { useLanguage } from '@/i18n/LanguageContext';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from '@/lib/toast';

interface Booking {
  _id: string;
  client_id: any;
  date: string;
  hours: string;
  description: string;
  category: string;
  typeBooking: string;
  booking_start?: string;
  booking_end?: string;
  note?: string;
  income?: number;
  status: 'pending' | 'accept' | 'accepted' | 'reject' | 'rejected' | 'done' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function BookingListForLawyer() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const { openChat } = useChat();

  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [clientNames, setClientNames] = useState<Record<string, { name: string; email?: string; phone?: string; avatar?: string }>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: rawResponse, isLoading, refetch } = useGetLawyerBookingsQuery(undefined, {
    skip: !lawyerId,
  });
  const [acceptBookingMutation] = useAcceptBookingMutation();
  const [rejectBookingMutation] = useRejectBookingMutation();
  const [getUserById] = useLazyGetUserByIdQuery();

  const bookings: Booking[] = useMemo(() => {
    const rawData = rawResponse?.data as any;
    const list = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawResponse)
      ? rawResponse
      : [];
    return Array.isArray(list) ? list : [];
  }, [rawResponse]);

  // Load lawyer ID from profile
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_PROFILE);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLawyerId(parsedUser._id || parsedUser.id || null);
      } catch (err) {
        console.error('Error parsing stored user:', err);
      }
    }
  }, []);

  // Fetch client profiles for any that are not already populated
  useEffect(() => {
    const clientIdsToFetch = bookings
      .map((b) => {
        if (typeof b.client_id === 'string') return b.client_id;
        if (b.client_id && typeof b.client_id === 'object') return b.client_id._id;
        return null;
      })
      .filter((id): id is string => !!id && !clientNames[id]);

    if (clientIdsToFetch.length === 0) return;

    const fetchClientNames = async () => {
      try {
        const promises = clientIdsToFetch.map(async (id) => {
          try {
            const res = (await getUserById(id).unwrap()) as any;
            const u = res?.data?.user || res?.data || res;
            return {
              id,
              name: u?.name || u?.userName || (isEn ? 'Client' : 'Khách hàng'),
              email: u?.email || '',
              phone: u?.phone || '',
              avatar: u?.avartar_url || u?.avatar_url || u?.avatar || '',
            };
          } catch {
            return { id, name: isEn ? 'Client' : 'Khách hàng' };
          }
        });

        const results = await Promise.all(promises);
        setClientNames((prev) => {
          const newMap = { ...prev };
          results.forEach(({ id, ...info }) => {
            newMap[id] = info as any;
          });
          return newMap;
        });
      } catch (err) {
        console.error('Error fetching client names:', err);
      }
    };

    fetchClientNames();
  }, [bookings, clientNames, getUserById, isEn]);

  // Handle Accept
  const handleAcceptBooking = async (booking: Booking) => {
    try {
      setUpdatingId(booking._id);
      await acceptBookingMutation(booking._id).unwrap();
      toast.success(
        isEn ? 'Consultation Accepted' : 'Tiếp nhận lịch hẹn thành công',
        isEn ? 'The client has been notified in real-time and email sent.' : 'Đã chấp nhận cuộc hẹn. Khách hàng đã nhận được thông báo & email.'
      );
      refetch();
    } catch (err: any) {
      toast.error(
        isEn ? 'Acceptance Failed' : 'Tiếp nhận thất bại',
        err?.data?.message || (isEn ? 'Failed to accept consultation' : 'Không thể tiếp nhận cuộc hẹn')
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Reject
  const handleRejectBooking = async () => {
    if (!rejectingBooking) return;

    try {
      setUpdatingId(rejectingBooking._id);
      await rejectBookingMutation(rejectingBooking._id).unwrap();
      toast.warning(
        isEn ? 'Consultation Declined' : 'Đã từ chối cuộc hẹn',
        isEn ? 'The consultation request has been marked as declined and client notified.' : 'Yêu cầu tư vấn đã chuyển sang trạng thái từ chối. Khách hàng đã được thông báo.'
      );
      setRejectingBooking(null);
      refetch();
    } catch (err: any) {
      toast.error(
        isEn ? 'Action Failed' : 'Từ chối thất bại',
        err?.data?.message || (isEn ? 'Failed to decline consultation' : 'Không thể từ chối cuộc hẹn')
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getSpecialtyLabel = (typeBooking: string) => {
    if (!typeBooking) return isEn ? 'General Consultation' : 'Tư vấn chung';
    const key = typeBooking as keyof typeof LawyerCategoriesVietnamese;
    return t(`categories.${typeBooking}`, LawyerCategoriesVietnamese[key] || typeBooking);
  };

  // Helper status checks
  const checkStatus = (b: Booking) => {
    const isPending = b.status === 'pending' || (b.status as any) === 'none' || !b.status;
    const isAccepted = b.status === 'accept' || b.status === 'accepted';
    const isRejected = b.status === 'reject' || b.status === 'rejected';
    const isCompleted = b.status === 'done' || b.status === 'completed';
    const isCancelled = b.status === 'cancelled';
    return { isPending, isAccepted, isRejected, isCompleted, isCancelled };
  };

  // Filtered dataset
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const { isPending, isAccepted, isRejected, isCompleted } = checkStatus(b);

      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'PENDING' && isPending) ||
        (activeTab === 'ACCEPTED' && isAccepted) ||
        (activeTab === 'REJECTED' && isRejected) ||
        (activeTab === 'COMPLETED' && isCompleted);

      const populatedClient = typeof b.client_id === 'object' && b.client_id !== null ? b.client_id : null;
      const cId = populatedClient?._id || (typeof b.client_id === 'string' ? b.client_id : '');
      const clientInfo = populatedClient || clientNames[cId];

      const clientNameStr = clientInfo?.name || '';
      const clientEmailStr = clientInfo?.email || '';
      const specialtyStr = getSpecialtyLabel(b.typeBooking);

      const matchesSearch =
        !searchQuery ||
        clientNameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientEmailStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specialtyStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.note && b.note.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchQuery, clientNames]);

  // Metrics
  const metrics = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => checkStatus(b).isPending).length;
    const accepted = bookings.filter((b) => checkStatus(b).isAccepted).length;
    const totalIncome = bookings
      .filter((b) => checkStatus(b).isAccepted || checkStatus(b).isCompleted)
      .reduce((sum, b) => sum + (Number(b.income) || 0) * 0.9, 0);

    return { total, pending, accepted, totalIncome };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] py-8 px-4 sm:px-6 lg:px-8 font-sans space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="rounded-2xl bg-[#0d0e11] border border-[#222326] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl linear-glow">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 flex items-center justify-center text-[#5e6ad2]">
              <Calendar className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8]">
              {isEn ? 'Client Consultations & Bookings' : 'Lịch hẹn & Yêu cầu Tư vấn'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#16171b] border border-[#26282e] text-[#8a8f98]">
              {bookings.length} {isEn ? 'requests' : 'yêu cầu'}
            </span>
          </div>
          <p className="text-xs text-[#8a8f98] max-w-xl">
            {isEn
              ? 'Review intake requests, accept 1-on-1 consultations, and launch encrypted video sessions with verified clients.'
              : 'Quản lý lịch hẹn tư vấn pháp lý 1-1, tiếp nhận hoặc từ chối hồ sơ yêu cầu và kết nối trực tuyến với khách hàng.'}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-center px-3.5 py-1.5 rounded-lg bg-[#121316] hover:bg-[#1a1b20] border border-[#222326] hover:border-[#33353a] text-xs font-medium text-[#f7f8f8] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#62666d]" />
          <span>{isEn ? 'Refresh Ledger' : 'Làm mới danh sách'}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-4 rounded-xl bg-[#0d0e11] border border-[#222326] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono text-[#8a8f98] uppercase">{isEn ? 'Total Requests' : 'Tổng số phiên hẹn'}</p>
            <p className="text-xl font-bold font-mono text-[#f7f8f8]">{metrics.total}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#16171b] border border-[#26282e] flex items-center justify-center text-[#8a8f98]">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-xl bg-[#0d0e11] border border-[#222326] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono text-[#8a8f98] uppercase">{isEn ? 'Pending Approval' : 'Chờ phê duyệt'}</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold font-mono text-amber-400">{metrics.pending}</p>
              {metrics.pending > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        {/* Confirmed */}
        <div className="p-4 rounded-xl bg-[#0d0e11] border border-[#222326] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono text-[#8a8f98] uppercase">{isEn ? 'Confirmed Sessions' : 'Đã tiếp nhận'}</p>
            <p className="text-xl font-bold font-mono text-emerald-400">{metrics.accepted}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Est Income */}
        <div className="p-4 rounded-xl bg-[#0d0e11] border border-[#222326] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono text-[#8a8f98] uppercase">{isEn ? 'Est. Net Payout (90%)' : 'Thực nhận ước tính (90%)'}</p>
            <p className="text-lg font-bold font-mono text-[#f7f8f8]">{formatVND(metrics.totalIncome)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="p-3 rounded-xl bg-[#0d0e11] border border-[#222326] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: 'ALL', label: isEn ? 'All Sessions' : 'Tất cả', count: metrics.total },
            { key: 'PENDING', label: isEn ? 'Pending' : 'Chờ duyệt', count: metrics.pending },
            { key: 'ACCEPTED', label: isEn ? 'Confirmed' : 'Đã nhận', count: metrics.accepted },
            { key: 'REJECTED', label: isEn ? 'Declined' : 'Từ chối' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#1e2025] text-[#f7f8f8] border border-[#2e3036] shadow-xs'
                  : 'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#121316]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    tab.key === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-400 font-bold'
                      : 'bg-[#26282e] text-[#8a8f98]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#62666d] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search client name, specialty, notes...' : 'Tìm theo tên khách, lĩnh vực, ghi chú...'}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121316] border border-[#222326] text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#5e6ad2]"
          />
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="rounded-xl border border-[#222326] bg-[#0d0e11] overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="py-20 text-center text-[#62666d] space-y-2">
            <RotateCw className="w-5 h-5 animate-spin mx-auto text-[#5e6ad2]" />
            <p className="text-xs">{t('common.loading', 'Đang tải danh sách lịch hẹn...')}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-20 text-center text-[#62666d] p-6 space-y-2">
            <Calendar className="w-8 h-8 mx-auto opacity-40 text-[#8a8f98]" />
            <h3 className="text-sm font-semibold text-[#f7f8f8]">
              {isEn ? 'No consultation records found' : 'Chưa có lịch hẹn nào'}
            </h3>
            <p className="text-xs text-[#62666d] max-w-sm mx-auto">
              {isEn
                ? 'When clients book consultations through your profile, intake requests will appear here in real-time.'
                : 'Khi khách hàng đặt lịch tư vấn với bạn, yêu cầu sẽ tự động hiển thị ở đây.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1f2024] bg-[#121316]/60 text-[11px] font-mono text-[#62666d] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{isEn ? 'Client Identity' : 'Khách hàng'}</th>
                  <th className="py-3 px-4">{isEn ? 'Legal Specialty' : 'Lĩnh vực vụ việc'}</th>
                  <th className="py-3 px-4">{isEn ? 'Schedule / Time' : 'Thời gian hẹn'}</th>
                  <th className="py-3 px-4">{isEn ? 'Case Summary / Notes' : 'Ghi chú & Tóm tắt'}</th>
                  <th className="py-3 px-4 text-right">{isEn ? 'Net Fee' : 'Thực nhận'}</th>
                  <th className="py-3 px-4 text-center">{isEn ? 'Status' : 'Trạng thái'}</th>
                  <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Thao tác'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#191a1d]">
                {filteredBookings.map((b: Booking, index: number) => {
                  const { isPending, isAccepted, isRejected } = checkStatus(b);

                  const populatedClient = typeof b.client_id === 'object' && b.client_id !== null ? b.client_id : null;
                  const cId = populatedClient?._id || (typeof b.client_id === 'string' ? b.client_id : '');
                  const client = populatedClient || clientNames[cId];

                  const clientAvatar =
                    client?.avartar_url ||
                    client?.avatar_url ||
                    client?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client?.name || 'Client')}&backgroundColor=5e6ad2&textColor=ffffff`;

                  const isUpdating = updatingId === b._id;
                  const netFee = Number(b.income) ? Number(b.income) * 0.9 : 0;

                  return (
                    <tr
                      key={b._id}
                      className="hover:bg-[#141519] transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center font-mono text-[#62666d]">
                        {index + 1}
                      </td>

                      {/* Client info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={clientAvatar}
                            alt={client?.name || 'Client'}
                            className="w-8 h-8 rounded-full object-cover border border-[#26282e] shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=5e6ad2&textColor=ffffff`;
                            }}
                          />
                          <div className="overflow-hidden">
                            <p className="font-semibold text-[#f7f8f8] truncate max-w-[140px]">
                              {client?.name || (isEn ? 'Client' : 'Khách hàng')}
                            </p>
                            <p className="text-[10px] text-[#62666d] truncate max-w-[140px]">
                              {client?.email || client?.phone || ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16171b] border border-[#26282e] text-[11px] font-medium text-[#f7f8f8]">
                          {getSpecialtyLabel(b.typeBooking)}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 font-mono text-[11px] space-y-0.5">
                        <div className="flex items-center gap-1 text-[#f7f8f8]">
                          <Calendar className="w-3 h-3 text-[#5e6ad2]" />
                          <span>
                            {b.booking_start
                              ? new Date(b.booking_start).toLocaleDateString(isEn ? 'en-US' : 'vi-VN')
                              : b.date || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[#8a8f98]">
                          <Clock className="w-3 h-3 text-[#62666d]" />
                          <span>
                            {b.booking_start
                              ? `${new Date(b.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${b.booking_end ? new Date(b.booking_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`
                              : b.hours || ''}
                          </span>
                        </div>
                      </td>

                      {/* Notes / Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[11px] text-[#8a8f98] line-clamp-2 leading-relaxed">
                          {b.note || b.description || (isEn ? 'Standard 1-on-1 legal consultation request.' : 'Yêu cầu tư vấn hồ sơ vụ việc.')}
                        </p>
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#f7f8f8]">
                        {netFee > 0 ? (
                          <span className="text-emerald-400">{formatVND(netFee)}</span>
                        ) : (
                          <span className="text-[#62666d]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            isPending
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : isAccepted
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isRejected
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-[#1c1d22] text-[#8a8f98] border border-[#2a2b32]'
                          }`}
                        >
                          {isPending ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              <span>{isEn ? 'PENDING' : 'CHỜ DUYỆT'}</span>
                            </>
                          ) : isAccepted ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{isEn ? 'CONFIRMED' : 'ĐÃ NHẬN'}</span>
                            </>
                          ) : isRejected ? (
                            <>
                              <X className="w-3 h-3 text-rose-400" />
                              <span>{isEn ? 'DECLINED' : 'TỪ CHỐI'}</span>
                            </>
                          ) : (
                            <span>{String(b.status).toUpperCase()}</span>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleAcceptBooking(b)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                              title={isEn ? 'Accept Consultation' : 'Tiếp nhận'}
                            >
                              <Check className="w-3 h-3" />
                              <span>{isUpdating ? '...' : (isEn ? 'Accept' : 'Tiếp nhận')}</span>
                            </button>
                            <button
                              onClick={() => setRejectingBooking(b)}
                              disabled={isUpdating}
                              className="p-1 rounded-md hover:bg-rose-950/30 text-[#8a8f98] hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
                              title={isEn ? 'Decline' : 'Từ chối'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : isAccepted ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Open Chat with Client */}
                            {cId && (
                              <button
                                type="button"
                                onClick={() => openChat(null, cId)}
                                className="p-1.5 rounded-md bg-[#16171b] hover:bg-[#202127] border border-[#26282e] text-[#5e6ad2] hover:text-white text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Nhắn tin với khách hàng"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <Link
                              href="/videoCall"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#5e6ad2] hover:bg-[#6875e8] text-white text-[11px] font-medium transition-colors shadow-xs"
                            >
                              <Video className="w-3 h-3" />
                              <span>{isEn ? 'Join Video' : 'Vào phòng'}</span>
                            </Link>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#62666d] italic font-mono">
                            {isEn ? 'Archived' : 'Đã lưu trữ'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!rejectingBooking}
        onClose={() => setRejectingBooking(null)}
        onConfirm={handleRejectBooking}
        title={isEn ? 'Decline Consultation Request?' : 'Từ chối yêu cầu tư vấn?'}
        description={
          isEn
            ? 'Are you sure you want to decline this consultation request? The client will be notified immediately.'
            : 'Bạn có chắc chắn muốn từ chối yêu cầu tư vấn này? Hệ thống sẽ gửi thông báo đến khách hàng.'
        }
        confirmText={isEn ? 'Decline Request' : 'Xác nhận từ chối'}
        cancelText={isEn ? 'Cancel' : 'Hủy'}
        variant="warning"
      />
    </div>
  );
}