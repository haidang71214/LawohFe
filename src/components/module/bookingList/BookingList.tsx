'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Video,
  RotateCw,
  CreditCard,
  Star,
  Trash2,
  X,
  MessageSquare,
} from 'lucide-react';
import { USER_PROFILE } from '@/constants/enum';
import { useCancelBookingMutation } from '@/store/queries/booking';
import { useGetMyPaymentsQuery, useCreatePaymentUrlMutation } from '@/store/queries/payment';
import { useCreateReviewMutation } from '@/store/queries/review';
import { useGetUsersQuery, useGetUserBookingsQuery } from '@/store/queries/user';
import { useChat } from '@/components/common/chatContext';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { formatVND } from '@/lib/formatCurrency';
import { useLanguage } from '@/i18n/LanguageContext';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from '@/lib/toast';

export default function BookingList() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const { openChat } = useChat();

  const [clientId, setClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLawyerId, setSelectedLawyerId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const {
    data: bookingsData,
    isLoading: isBookingsLoading,
    refetch: refetchBookings,
  } = useGetUserBookingsQuery(clientId || '', {
    skip: !clientId,
  });

  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useGetMyPaymentsQuery(undefined, {
    skip: !clientId,
  });

  const { data: usersData } = useGetUsersQuery();

  const [createPaymentUrlMutation, { isLoading: isPaying }] = useCreatePaymentUrlMutation();
  const [cancelBookingMutation, { isLoading: isCanceling }] = useCancelBookingMutation();
  const [createReviewMutation, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  const loading = isBookingsLoading || isPaymentsLoading;

  useEffect(() => {
    const storedClient = localStorage.getItem(USER_PROFILE);
    let id: string | null = null;
    try {
      const profileObj = JSON.parse(storedClient || '{}');
      id = profileObj?._id || profileObj?.id || null;
    } catch {
      id = storedClient || null;
    }
    setClientId(id);
  }, []);

  const bookings: any[] = useMemo(() => {
    const rawData = bookingsData?.data as any;
    const rawBookings = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(bookingsData)
      ? bookingsData
      : [];

    const rawPayData = paymentsData?.data as any;
    const rawPayments = Array.isArray(rawPayData)
      ? rawPayData
      : Array.isArray(rawPayData?.data)
      ? rawPayData.data
      : Array.isArray(paymentsData)
      ? paymentsData
      : [];

    if (!Array.isArray(rawBookings)) return [];

    return rawBookings.map((booking: any) => {
      const payment = Array.isArray(rawPayments)
        ? rawPayments.find((p: any) => p.booking_id === booking._id && p.status === 'success')
        : undefined;
      return {
        ...booking,
        isPaid: !!payment,
      };
    });
  }, [bookingsData, paymentsData]);

  const lawyerMap = useMemo(() => {
    const rawUsers = usersData?.data as any;
    const users = Array.isArray(rawUsers) ? rawUsers : Array.isArray(rawUsers?.data) ? rawUsers.data : [];
    const map: Record<string, any> = {};
    users.forEach((u: any) => {
      map[u._id] = u;
    });
    return map;
  }, [usersData]);

  const handleDeleteBooking = async () => {
    if (!cancelingBookingId) return;

    try {
      await cancelBookingMutation(cancelingBookingId).unwrap();
      toast.success(isEn ? 'Booking Canceled' : 'Hủy lịch thành công');
      setCancelingBookingId(null);
      refetchBookings();
    } catch (err: any) {
      toast.error(
        isEn ? 'Cancellation Failed' : 'Hủy lịch thất bại',
        err?.data?.message || err?.message || (isEn ? 'Error canceling booking' : 'Lỗi khi hủy lịch hẹn')
      );
    }
  };

  const handlePayment = async (booking: any) => {
    if (booking.isPaid) {
      toast.warning(isEn ? 'Already Paid' : 'Lịch hẹn này đã được thanh toán!');
      return;
    }

    const lId = typeof booking.lawyer_id === 'object' ? booking.lawyer_id?._id : booking.lawyer_id;

    try {
      const response = (await createPaymentUrlMutation({
        bookingId: booking._id,
        amount: Number(booking.income) || 200000,
        lawyerId: lId,
        clientId: clientId || booking.client_id || '',
        orderInfo: `Thanh toan phi tu van Luat su LawOh #${booking._id.slice(-6)}`,
      } as any).unwrap()) as any;

      const paymentUrl = response?.data?.paymentUrl || response?.paymentUrl;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank');
        toast.success(
          isEn ? 'Payment Gateway Opened' : 'Đã mở cổng VNPAY',
          isEn ? 'Please complete the transaction in the new tab.' : 'Vui lòng hoàn tất thanh toán trong tab mới mở.'
        );
      }
    } catch (err: any) {
      toast.error(isEn ? 'Payment Error' : 'Lỗi thanh toán', err?.data?.message || (isEn ? 'Failed to generate payment url' : 'Không thể tạo cổng thanh toán'));
    }
  };

  const handleOpenReview = (booking: any) => {
    const lId = typeof booking.lawyer_id === 'object' ? booking.lawyer_id?._id : booking.lawyer_id;
    setSelectedLawyerId(lId);
    setRating(5);
    setComment('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyerId || !clientId) return;

    try {
      await createReviewMutation({
        lawyer_id: selectedLawyerId,
        client_id: clientId,
        star: rating,
        comment: comment.trim(),
      } as any).unwrap();

      toast.success(isEn ? 'Review Submitted' : 'Đánh giá thành công', isEn ? 'Thank you for your feedback!' : 'Cảm ơn bạn đã gửi đánh giá cho luật sư!');
      setIsReviewModalOpen(false);
      refetchBookings();
    } catch (err: any) {
      toast.error(isEn ? 'Review Failed' : 'Gửi đánh giá thất bại', err?.data?.message || (isEn ? 'Failed to submit review' : 'Không thể gửi đánh giá'));
    }
  };

  const getSpecialtyLabel = (typeBooking: string) => {
    if (!typeBooking) return isEn ? 'Consultation' : 'Tư vấn';
    const key = typeBooking as keyof typeof LawyerCategoriesVietnamese;
    return t(`categories.${typeBooking}`, LawyerCategoriesVietnamese[key] || typeBooking);
  };

  // Helper status check
  const checkStatus = (b: any) => {
    const isPending = b.status === 'none' || b.status === 'pending' || !b.status;
    const isAccepted = b.status === 'accept' || b.status === 'accepted';
    const isRejected = b.status === 'reject' || b.status === 'rejected';
    const isCompleted = b.status === 'done' || b.status === 'completed';
    const isPaid = b.isPaid;
    return { isPending, isAccepted, isRejected, isCompleted, isPaid };
  };

  // Filtered dataset
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const { isPending, isAccepted, isRejected, isPaid } = checkStatus(b);

      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'PENDING' && isPending) ||
        (activeTab === 'ACCEPTED' && isAccepted) ||
        (activeTab === 'PAID' && isPaid) ||
        (activeTab === 'REJECTED' && isRejected);

      const lObj = typeof b.lawyer_id === 'object' && b.lawyer_id !== null ? b.lawyer_id : lawyerMap[b.lawyer_id];
      const lawyerNameStr = lObj?.name || '';
      const specialtyStr = getSpecialtyLabel(b.typeBooking);

      const matchesSearch =
        !searchQuery ||
        lawyerNameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specialtyStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.note && b.note.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchQuery, lawyerMap]);

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
              {isEn ? 'My Consultation Bookings' : 'Lịch tư vấn của tôi'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#16171b] border border-[#26282e] text-[#8a8f98]">
              {bookings.length} {isEn ? 'bookings' : 'cuộc hẹn'}
            </span>
          </div>
          <p className="text-xs text-[#8a8f98] max-w-xl">
            {isEn
              ? 'Track your scheduled lawyer consultations, complete secure payments via VNPAY, and join video conference rooms.'
              : 'Theo dõi lịch hẹn tư vấn luật sư, thanh toán trực tuyến qua VNPAY và tham gia phòng tư vấn trực tuyến.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lawyers"
            className="px-3.5 py-1.5 rounded-lg bg-[#5e6ad2] hover:bg-[#6875e8] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>{isEn ? 'Book New Lawyer' : 'Đặt lịch mới'}</span>
          </Link>
          <button
            onClick={() => {
              refetchBookings();
              refetchPayments();
            }}
            className="p-2 rounded-lg bg-[#121316] hover:bg-[#1a1b20] border border-[#222326] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors cursor-pointer"
            title={isEn ? 'Refresh list' : 'Làm mới'}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-3 rounded-xl bg-[#0d0e11] border border-[#222326] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: 'ALL', label: isEn ? 'All Bookings' : 'Tất cả' },
            { key: 'PENDING', label: isEn ? 'Pending' : 'Chờ duyệt' },
            { key: 'ACCEPTED', label: isEn ? 'Accepted' : 'Đã tiếp nhận' },
            { key: 'PAID', label: isEn ? 'Paid' : 'Đã thanh toán' },
            { key: 'REJECTED', label: isEn ? 'Declined' : 'Từ chối' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#1e2025] text-[#f7f8f8] border border-[#2e3036] shadow-xs'
                  : 'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#121316]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#62666d] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search lawyer name, specialty...' : 'Tìm theo tên luật sư, chuyên ngành...'}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121316] border border-[#222326] text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#5e6ad2]"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-[#222326] bg-[#0d0e11] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-[#62666d] space-y-2">
            <RotateCw className="w-5 h-5 animate-spin mx-auto text-[#5e6ad2]" />
            <p className="text-xs">{t('common.loading', 'Đang tải danh sách đặt lịch...')}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-20 text-center text-[#62666d] p-6 space-y-3">
            <Calendar className="w-8 h-8 mx-auto opacity-40 text-[#8a8f98]" />
            <h3 className="text-sm font-semibold text-[#f7f8f8]">
              {isEn ? 'No consultation bookings found' : 'Chưa có lịch hẹn nào'}
            </h3>
            <p className="text-xs text-[#62666d] max-w-sm mx-auto">
              {isEn
                ? 'Search certified lawyers in our directory and schedule your 1-on-1 legal consultation.'
                : 'Khám phá danh bạ luật sư uy tín và đặt lịch tư vấn pháp lý 1-1.'}
            </p>
            <Link
              href="/lawyers"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5e6ad2] hover:bg-[#6875e8] text-white text-xs font-medium transition-colors shadow-xs"
            >
              <span>{isEn ? 'Find a Lawyer Now' : 'Tìm luật sư ngay'}</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1f2024] bg-[#121316]/60 text-[11px] font-mono text-[#62666d] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{isEn ? 'Assigned Lawyer' : 'Luật sư phụ trách'}</th>
                  <th className="py-3 px-4">{isEn ? 'Specialty' : 'Lĩnh vực'}</th>
                  <th className="py-3 px-4">{isEn ? 'Consultation Time' : 'Thời gian hẹn'}</th>
                  <th className="py-3 px-4">{isEn ? 'Fee' : 'Chi phí'}</th>
                  <th className="py-3 px-4 text-center">{isEn ? 'Status & Payment' : 'Trạng thái & Thanh toán'}</th>
                  <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Thao tác'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#191a1d]">
                {filteredBookings.map((b: any, index: number) => {
                  const { isPending, isAccepted, isRejected, isPaid } = checkStatus(b);

                  const lObj = typeof b.lawyer_id === 'object' && b.lawyer_id !== null ? b.lawyer_id : lawyerMap[b.lawyer_id];
                  const lawyerIdStr = lObj?._id || (typeof b.lawyer_id === 'string' ? b.lawyer_id : '');

                  const lawyerAvatar =
                    lObj?.avartar_url ||
                    lObj?.avatar_url ||
                    lObj?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lObj?.name || 'Lawyer')}&backgroundColor=5e6ad2&textColor=ffffff`;

                  const feeNum = Number(b.income) || 0;

                  return (
                    <tr key={b._id} className="hover:bg-[#141519] transition-colors group">
                      <td className="py-3.5 px-4 text-center font-mono text-[#62666d]">
                        {index + 1}
                      </td>

                      {/* Lawyer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={lawyerAvatar}
                            alt={lObj?.name || 'Lawyer'}
                            className="w-8 h-8 rounded-full object-cover border border-[#26282e] shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=Lawyer&backgroundColor=5e6ad2&textColor=ffffff`;
                            }}
                          />
                          <div className="overflow-hidden">
                            {lawyerIdStr ? (
                              <Link
                                href={`/lawyerDetail/${lawyerIdStr}`}
                                className="font-semibold text-[#f7f8f8] hover:text-[#5e6ad2] transition-colors truncate block max-w-[150px]"
                              >
                                {lObj?.name || (isEn ? 'Lawyer Profile' : 'Luật sư phụ trách')}
                              </Link>
                            ) : (
                              <span className="font-semibold text-[#f7f8f8] truncate block max-w-[150px]">
                                {lObj?.name || (isEn ? 'Lawyer Profile' : 'Luật sư phụ trách')}
                              </span>
                            )}
                            <p className="text-[10px] text-[#62666d] truncate max-w-[150px]">
                              {lObj?.email || (isEn ? 'Verified Attorney' : 'Đã xác minh thẻ')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#16171b] border border-[#26282e] text-[11px] font-medium text-[#f7f8f8]">
                          {getSpecialtyLabel(b.typeBooking)}
                        </span>
                      </td>

                      {/* Time */}
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

                      {/* Fee */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#f7f8f8]">
                        {feeNum > 0 ? formatVND(feeNum) : '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center space-y-1">
                        <div>
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
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>{isEn ? 'ACCEPTED' : 'ĐÃ NHẬN'}</span>
                              </>
                            ) : isRejected ? (
                              <>
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>{isEn ? 'DECLINED' : 'TỪ CHỐI'}</span>
                              </>
                            ) : (
                              <span>{String(b.status).toUpperCase()}</span>
                            )}
                          </span>
                        </div>

                        {/* Payment Pill */}
                        {isAccepted && (
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono ${
                                isPaid
                                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}
                            >
                              {isPaid ? (isEn ? 'PAID' : 'ĐÃ THANH TOÁN') : (isEn ? 'UNPAID' : 'CHƯA THANH TOÁN')}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Chat with lawyer */}
                          {lawyerIdStr && (
                            <button
                              type="button"
                              onClick={() => openChat(null, lawyerIdStr)}
                              className="p-1.5 rounded-md bg-[#16171b] hover:bg-[#202127] border border-[#26282e] text-[#5e6ad2] hover:text-white text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Nhắn tin với luật sư"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Pay button */}
                          {isAccepted && !isPaid && (
                            <button
                              onClick={() => handlePayment(b)}
                              disabled={isPaying}
                              className="px-2.5 py-1 rounded-md bg-[#5e6ad2] hover:bg-[#6875e8] text-white text-[11px] font-medium flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>{isEn ? 'Pay Now' : 'Thanh toán'}</span>
                            </button>
                          )}

                          {/* Join Video button */}
                          {isAccepted && (
                            <Link
                              href="/videoCall"
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <Video className="w-3 h-3" />
                              <span>{isEn ? 'Join Video' : 'Vào phòng'}</span>
                            </Link>
                          )}

                          {/* Review Button */}
                          {isAccepted && isPaid && (
                            <button
                              onClick={() => handleOpenReview(b)}
                              className="px-2 py-1 rounded-md bg-[#16171b] hover:bg-[#202127] border border-[#26282e] text-[#8a8f98] hover:text-amber-400 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title={isEn ? 'Leave a review' : 'Đánh giá luật sư'}
                            >
                              <Star className="w-3 h-3" />
                              <span>{isEn ? 'Review' : 'Đánh giá'}</span>
                            </button>
                          )}

                          {/* Cancel / Delete */}
                          <button
                            onClick={() => setCancelingBookingId(b._id)}
                            disabled={isCanceling}
                            className="p-1 rounded-md text-[#62666d] hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title={isEn ? 'Cancel booking' : 'Hủy lịch'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Review */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setIsReviewModalOpen(false)}
          ></div>
          <form
            onSubmit={handleSubmitReview}
            className="relative w-full max-w-md rounded-2xl bg-[#0d0e11] border border-[#222326] p-6 shadow-2xl space-y-4 text-xs animate-modal-pop"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2023]">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="font-semibold text-sm text-[#f7f8f8]">
                  {isEn ? 'Review & Rating Consultation' : 'Đánh giá phiên tư vấn'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded text-[#8a8f98] hover:text-[#f7f8f8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Star selector */}
            <div className="space-y-1.5 text-center py-2">
              <label className="text-xs text-[#8a8f98]">
                {isEn ? 'How was your consultation experience?' : 'Bạn cảm nhận thế nào về chất lượng tư vấn?'}
              </label>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        starVal <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-[#33353a]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#8a8f98]">
                {isEn ? 'Your Feedback / Comment' : 'Nhận xét chi tiết'}
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isEn ? 'Lawyer provided clear, dedicated advice...' : 'Luật sư tư vấn rất rõ ràng, tận tâm và đúng trọng tâm...'}
                className="w-full p-2.5 rounded-lg bg-[#121316] border border-[#222326] text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#5e6ad2]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2023]">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#16171b] hover:bg-[#202127] border border-[#26282e] text-[#8a8f98] hover:text-[#f7f8f8]"
              >
                {t('common.cancel', 'Hủy')}
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-4 py-1.5 rounded-lg bg-[#5e6ad2] hover:bg-[#6875e8] text-white font-medium disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {isSubmittingReview ? (isEn ? 'Submitting...' : 'Đang gửi...') : (isEn ? 'Submit Review' : 'Gửi đánh giá')}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelingBookingId}
        onClose={() => setCancelingBookingId(null)}
        onConfirm={handleDeleteBooking}
        title={isEn ? 'Cancel Booking Consultation?' : 'Hủy lịch tư vấn pháp lý?'}
        description={
          isEn
            ? 'Are you sure you want to cancel this appointment? This action cannot be reversed.'
            : 'Bạn có chắc chắn muốn hủy lịch hẹn tư vấn này? Thao tác này sẽ không thể hoàn tác.'
        }
        confirmText={isEn ? 'Cancel Appointment' : 'Xác nhận hủy lịch'}
        cancelText={isEn ? 'Keep Booking' : 'Giữ lại lịch'}
        variant="danger"
      />
    </div>
  );
}