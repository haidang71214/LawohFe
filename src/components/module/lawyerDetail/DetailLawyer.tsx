'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Award,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  CalendarCheck,
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  ZoomIn,
  X,
  RotateCw,
  Send,
  Briefcase,
  Tag,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { useGetLawyerByIdQuery } from '@/store/queries/lawyer';
import { useGetUserByIdQuery } from '@/store/queries/user';
import { useGetReviewsByLawyerQuery, useCreateReviewMutation } from '@/store/queries/review';
import { useCreateBookingMutation } from '@/store/queries/booking';
import { useCheckConversationQuery } from '@/store/queries/chat';
import { useGetMeQuery } from '@/store/queries/auth';
import { useChat } from '@/components/common/chatContext';
import io from 'socket.io-client';
import { URL_SOCKET } from '@/fetchApi';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatVND } from '@/lib/formatCurrency';
import toast from '@/lib/toast';

interface DetailLawyerProps {
  id: string;
}

export default function DetailLawyer({ id }: DetailLawyerProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'certificates' | 'reviews'>('overview');

  // Queries
  const {
    data: lawyerResponse,
    isLoading: isLoadingLawyer,
    refetch: refetchLawyer,
  } = useGetLawyerByIdQuery(id, { skip: !id });

  // Fallback query if lawyer endpoint returns empty
  const { data: userResponse } = useGetUserByIdQuery(id, {
    skip: !id || (!!lawyerResponse?.data),
  });

  const {
    data: reviewsResponse,
    isLoading: isLoadingReviews,
    refetch: refetchReviews,
  } = useGetReviewsByLawyerQuery(id, { skip: !id });

  const { data: meResponse } = useGetMeQuery();
  const { data: convResponse } = useCheckConversationQuery(id, { skip: !id });

  // Mutations
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();

  // Chat context
  const { openChat } = useChat();

  // Local state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [previewCertUrl, setPreviewCertUrl] = useState<string | null>(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    booking_start: '',
    booking_end: '',
    typeBooking: 'CIVIL',
    note: '',
  });

  // Extract Lawyer Data
  const lawyer: any = useMemo(() => {
    const raw = lawyerResponse?.data || userResponse?.data || null;
    return raw;
  }, [lawyerResponse, userResponse]);

  // Extract Reviews List
  const reviews: any[] = useMemo(() => {
    const raw = (reviewsResponse?.data as any) || [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw?.data) ? raw.data : []));
    return list;
  }, [reviewsResponse]);

  // Client info
  const clientUser: any = meResponse?.data || null;
  const clientId = clientUser?._id || clientUser?.id || '';

  // Handle Open Chat
  const handleOpenChat = () => {
    if (!clientId) {
      toast.error(isEn ? 'Please log in to chat with lawyer.' : 'Vui lòng đăng nhập để gửi tin nhắn tư vấn.');
      router.push('/login');
      return;
    }
    const convData: any = convResponse?.data || convResponse;
    const convId = convData?._id || convData?.id || null;
    openChat(convId, id);
  };

  // Handle Submit Booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error(isEn ? 'Please log in to book a consultation.' : 'Vui lòng đăng nhập để đặt lịch tư vấn.');
      router.push('/login');
      return;
    }

    if (!bookingForm.booking_start || !bookingForm.booking_end) {
      toast.error(isEn ? 'Please select start and end consultation time.' : 'Vui lòng chọn thời gian bắt đầu và kết thúc.');
      return;
    }

    const startDate = new Date(bookingForm.booking_start);
    const endDate = new Date(bookingForm.booking_end);

    if (startDate >= endDate) {
      toast.error(isEn ? 'End time must be after start time.' : 'Thời gian kết thúc phải sau thời gian bắt đầu.');
      return;
    }

    try {
      await createBooking({
        lawyer_id: id,
        booking_start: startDate.toISOString(),
        booking_end: endDate.toISOString(),
        typeBooking: bookingForm.typeBooking,
        note: bookingForm.note.trim() || undefined,
      }).unwrap();

      // Emit real-time notification to lawyer via Socket
      try {
        const targetUrl = URL_SOCKET || 'http://localhost:3300';
        const socket = io(targetUrl, { transports: ['polling'] });
        socket.emit('notify-new-booking', {
          lawyerId: id,
          clientId,
          clientName: clientUser?.name || 'Khách hàng',
          bookingDate: startDate.toLocaleDateString('vi-VN'),
          bookingTime: `${bookingForm.booking_start} - ${bookingForm.booking_end}`,
          typeBooking: bookingForm.typeBooking,
        });
        setTimeout(() => socket.disconnect(), 1500);
      } catch (sockErr) {
        console.error('Socket emit error for booking:', sockErr);
      }

      toast.success(
        isEn
          ? 'Consultation booking created successfully! The lawyer will review your schedule.'
          : 'Đặt lịch tư vấn thành công! Luật sư sẽ xem xét và liên hệ xác nhận.'
      );

      setIsBookingModalOpen(false);
      setBookingForm({
        booking_start: '',
        booking_end: '',
        typeBooking: 'CIVIL',
        note: '',
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    }
  };

  // Handle Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error(isEn ? 'Please log in to leave a review.' : 'Vui lòng đăng nhập để gửi đánh giá.');
      router.push('/login');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error(isEn ? 'Please write your review comment.' : 'Vui lòng nhập nội dung đánh giá.');
      return;
    }

    try {
      await createReview({
        lawyerId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      }).unwrap();

      toast.success(isEn ? 'Review posted successfully!' : 'Gửi đánh giá thành công! Cảm ơn ý kiến của bạn.');
      setReviewComment('');
      setReviewRating(5);
      refetchReviews();
      refetchLawyer();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
    }
  };

  // Loading Screen
  if (isLoadingLawyer && !lawyer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-[#f7f8f8]">
        <RotateCw className="w-7 h-7 animate-spin text-[#5e6ad2]" />
        <p className="text-xs text-slate-500 dark:text-[#8a8f98]">
          {isEn ? 'Loading verified lawyer profile...' : 'Đang tải hồ sơ luật sư chuyên môn...'}
        </p>
      </div>
    );
  }

  // Not Found State
  if (!lawyer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-[#f7f8f8]">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold">
            {isEn ? 'Lawyer Profile Not Found' : 'Không tìm thấy thông tin Luật sư'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#8a8f98] max-w-md">
            {isEn
              ? 'This lawyer profile may have been removed or the ID link is invalid.'
              : 'Hồ sơ luật sư này có thể đã thay đổi hoặc đường dẫn không còn tồn tại.'}
          </p>
        </div>
        <Link
          href="/lawyers"
          className="px-4 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e8] text-xs font-semibold text-white transition-all shadow-md"
        >
          {isEn ? 'Back to Lawyer Directory' : 'Quay lại danh bạ luật sư'}
        </Link>
      </div>
    );
  }

  // Derived properties
  const avatar =
    lawyer.avartar_url ||
    lawyer.avatar_url ||
    lawyer.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lawyer.name || 'LS')}&backgroundColor=5e6ad2&textColor=ffffff`;

  const specialties: string[] = Array.isArray(lawyer.type_lawyer)
    ? lawyer.type_lawyer
    : (Array.isArray(lawyer.typeLawyer?.type)
      ? lawyer.typeLawyer.type
      : (lawyer.type_lawyer ? [lawyer.type_lawyer] : ['CIVIL']));

  const subSpecialties: string[] = Array.isArray(lawyer.sub_type_lawyers)
    ? lawyer.sub_type_lawyers
    : (Array.isArray(lawyer.subTypes)
      ? lawyer.subTypes.map((s: any) => s.name || s.subType || s).flat().filter(Boolean)
      : []);

  const certificates: string[] = Array.isArray(lawyer.certificate) ? lawyer.certificate : [];
  const customPrices: any[] = Array.isArray(lawyer.customPrice) ? lawyer.customPrice : [];
  const starScore = Number(lawyer.star || lawyer.stars || 5.0).toFixed(1);

  // Check if active user is viewing their own lawyer profile
  const isSelf = Boolean(
    (clientId && (clientId === id || clientId === lawyer?._id)) ||
    (clientUser?.email && lawyer?.email && clientUser.email.toLowerCase() === lawyer.email.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f8f4] dark:bg-[#0f1511] text-stone-900 dark:text-[#ecf3ee] font-sans pb-16 transition-colors selection:bg-[#1e4f35] selection:text-white">
      {/* Top Breadcrumb Bar */}
      <div className="border-b-2 border-stone-800 dark:border-[#2f4236] bg-[#edf2eb] dark:bg-[#131d16] sticky top-0 z-30 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/lawyers"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-[#1e4f35] dark:text-stone-300 dark:hover:text-[#52a677] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? '← Return to Bar Registry' : '← Quay lại Danh bạ Luật sư'}</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
            <span>[DOSSIER ID:</span>
            <span className="text-[#1e4f35] dark:text-[#52a677] font-bold">{lawyer._id || id}]</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* HERO PROFILE DOSSIER CARD */}
        <div className="bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] p-6 sm:p-8 shadow-[6px_6px_0px_#1e4f35] dark:shadow-[6px_6px_0px_#0a100c] relative overflow-hidden">
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar & Bio */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt={lawyer.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-none object-cover border-2 border-stone-800 dark:border-[#385945] shadow-[3px_3px_0px_#1e4f35] transition-all"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=LS&backgroundColor=1e4f35&textColor=ffffff`;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 p-1 bg-[#1e4f35] text-white border border-stone-900" title="Xác minh chính ngạch">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900 dark:text-[#fbf8f2]">
                    {lawyer.name}
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-[#1e4f35] text-white border border-stone-900 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    ĐOÀN LUẬT SƯ VIỆT NAM
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{starScore}</span>
                    <span className="text-stone-400 font-normal">({reviews.length} đánh giá)</span>
                  </div>

                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#1e4f35] dark:text-[#52a677]" />
                    <strong className="text-stone-900 dark:text-white">{lawyer.experienceYear || 0}</strong> {isEn ? 'years exp' : 'năm KN'}
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    {lawyer.province || 'Hà Nội'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-stone-500 pt-1">
                  {lawyer.email && (
                    <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                      <Mail className="w-3.5 h-3.5 text-[#1e4f35]" />
                      {lawyer.email}
                    </span>
                  )}
                  {lawyer.phone && (
                    <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                      <Phone className="w-3.5 h-3.5 text-[#1e4f35]" />
                      {lawyer.phone}
                    </span>
                  )}
                </div>

                {/* Specialties Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
                  {specialties.map((specKey) => (
                    <span
                      key={specKey}
                      className="px-2.5 py-0.5 text-[11px] font-mono font-medium bg-[#edf2eb] dark:bg-[#1b2b20] border border-stone-300 dark:border-[#385945] text-[#1e4f35] dark:text-[#52a677]"
                    >
                      {LawyerCategoriesVietnamese[specKey as keyof typeof LawyerCategoriesVietnamese] || specKey}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Quick Action CTAs */}
            <div className="flex flex-row lg:flex-col items-center justify-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-stone-300 dark:border-[#2f4236]">
              {isSelf ? (
                <Link
                  href="/updateLawyerDetails"
                  className="flex-1 lg:w-52 px-4 py-3 bg-[#1e4f35] hover:bg-[#286b48] text-xs font-mono font-bold uppercase tracking-wider text-white border-2 border-stone-900 shadow-[3px_3px_0px_#0e2a1b] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEn ? 'Edit Profile & Rates' : 'Chỉnh Sửa Hồ Sơ & Biểu Phí'}</span>
                </Link>
              ) : (
                <>
                  {/* Chat Online */}
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    className="flex-1 lg:w-52 px-4 py-3 bg-white hover:bg-[#edf2eb] dark:bg-[#1b2b20] dark:hover:bg-[#253a2c] border-2 border-stone-800 dark:border-[#385945] shadow-[3px_3px_0px_#1e4f35] text-xs font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-[#fbf8f2] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#1e4f35]" />
                    <span>{isEn ? 'Dispatch Telegram' : 'Gửi Tin Nhắn Tư Vấn'}</span>
                  </button>

                  {/* Book Appointment CTA */}
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(true)}
                    className="flex-1 lg:w-52 px-4 py-3 bg-[#1e4f35] hover:bg-[#286b48] text-xs font-mono font-bold uppercase tracking-wider text-white border-2 border-stone-900 shadow-[3px_3px_0px_#0e2a1b] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{isEn ? 'Summon Counsel' : 'Đặt Lịch Trực Tuyến'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS (Vintage Docket Style) */}
        <div className="flex items-center gap-2 border-b-2 border-stone-800 dark:border-[#2f4236] pb-3 overflow-x-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-2 uppercase font-bold tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#1e4f35] text-white border-stone-900 shadow-[2px_2px_0px_#0e2a1b]'
                : 'bg-white dark:bg-[#141d17] text-stone-700 dark:text-stone-300 border-stone-800 dark:border-[#385945]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isEn ? 'Overview & Bio' : 'Tổng Quan & Hồ Sơ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 border-2 uppercase font-bold tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#1e4f35] text-white border-stone-900 shadow-[2px_2px_0px_#0e2a1b]'
                : 'bg-white dark:bg-[#141d17] text-stone-700 dark:text-stone-300 border-stone-800 dark:border-[#385945]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{isEn ? 'Tariff Schedule' : 'Biểu Phí Niêm Yết'}</span>
            {customPrices.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#0e2a1b] text-white text-[10px]">
                {customPrices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 border-2 uppercase font-bold tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'certificates'
                ? 'bg-[#1e4f35] text-white border-stone-900 shadow-[2px_2px_0px_#0e2a1b]'
                : 'bg-white dark:bg-[#141d17] text-stone-700 dark:text-stone-300 border-stone-800 dark:border-[#385945]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isEn ? 'Certificates & Bar License' : 'Chứng Chỉ & Thẻ Luật Sư'}</span>
            {certificates.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#0e2a1b] text-white text-[10px]">
                {certificates.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 border-2 uppercase font-bold tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#1e4f35] text-white border-stone-900 shadow-[2px_2px_0px_#0e2a1b]'
                : 'bg-white dark:bg-[#141d17] text-stone-700 dark:text-stone-300 border-stone-800 dark:border-[#385945]'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>{isEn ? 'Client Feedback Roll' : 'Bản Đánh Giá Thân Chủ'}</span>
            <span className="px-1.5 py-0.2 bg-[#0e2a1b] text-white text-[10px]">
              {reviews.length}
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & BIO */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Biography & Case Highlights */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0a100c] space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1e4f35]" />
                  <span>{isEn ? 'Professional Jurisprudence & Case History' : 'Tóm Tắt Kinh Nghiệm Tranh Tụng & Tư Vấn'}</span>
                </h3>

                <div className="text-xs text-stone-800 dark:text-stone-300 font-sans leading-relaxed whitespace-pre-wrap bg-[#edf2eb]/60 dark:bg-[#18261e] p-5 border-2 border-dashed border-stone-300 dark:border-[#2f4236]">
                  {lawyer.description || 'Chưa cập nhật phần giới thiệu kinh nghiệm chi tiết.'}
                </div>
              </div>

              {/* Sub-Specialties */}
              {subSpecialties.length > 0 && (
                <div className="p-6 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0a100c] space-y-3">
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#1e4f35] dark:text-[#52a677] flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{isEn ? 'Practice Strengths' : 'Vụ Việc Thế Mạnh & Chuyên Môn Sâu'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {subSpecialties.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#edf2eb] dark:bg-[#1b2b20] border border-stone-400 dark:border-[#385945] text-xs font-mono font-bold text-stone-900 dark:text-stone-200 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1e4f35] dark:text-emerald-400" />
                        <span>{sub}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar Details */}
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0a100c] space-y-4 text-xs font-mono">
                <h3 className="font-bold text-xs text-stone-900 dark:text-[#fbf8f2] uppercase tracking-wider border-b-2 border-stone-800 dark:border-[#2f4236] pb-2">
                  [THÔNG TIN NIÊN GIÁM]
                </h3>

                <div className="space-y-3 divide-y-2 divide-dashed divide-stone-200 dark:divide-[#24352b]">
                  <div className="pt-2 first:pt-0 space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase">{isEn ? 'Jurisdiction' : 'Đoàn Luật Sư'}</span>
                    <p className="font-bold text-stone-900 dark:text-[#fbf8f2]">{lawyer.province || 'Hà Nội'}</p>
                  </div>

                  <div className="pt-2 space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase">{isEn ? 'Experience' : 'Số năm hành nghề'}</span>
                    <p className="font-bold text-stone-900 dark:text-[#fbf8f2]">{lawyer.experienceYear || 0} năm thâm niên</p>
                  </div>

                  <div className="pt-2 space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase">{isEn ? 'Docket Status' : 'Trạng thái tiếp nhận'}</span>
                    <p className="font-bold text-[#1e4f35] dark:text-emerald-400">
                      ● ĐANG MỞ LỊCH TIẾP NHẬN
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING & CONSULTATION FEES */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="p-6 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0a100c] space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2]">
                  {isEn ? 'Official Consultation Tariff Schedule' : 'Biểu Phí Tư Vấn Pháp Luật Niêm Yết'}
                </h3>
                <p className="text-xs font-mono text-stone-500">
                  {isEn ? 'Tariffs established under Bar Association guidelines' : 'Mức phí quy chuẩn được niêm yết công khai theo từng lĩnh vực chuyên môn'}
                </p>
              </div>

              {customPrices.length === 0 ? (
                <div className="p-10 text-center text-xs font-mono text-stone-500 bg-[#edf2eb] dark:bg-[#18261e] border-2 border-stone-800 dark:border-[#2f4236]">
                  {isEn ? '[DEFAULT TARIFF: 100.000 VND / SESSION]' : '[BIỂU PHÍ CƠ BẢN: 100.000 VNĐ / PHIÊN TƯ VẤN]'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customPrices.map((cp: any, idx: number) => {
                    const typeLabel = LawyerCategoriesVietnamese[cp.type as keyof typeof LawyerCategoriesVietnamese] || cp.type;
                    return (
                      <div
                        key={idx}
                        className="p-5 bg-[#edf2eb]/50 dark:bg-[#18261e] border-2 border-stone-800 dark:border-[#2f4236] hover:shadow-[3px_3px_0px_#1e4f35] transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-[#1e4f35] dark:text-[#52a677] uppercase">[GÓI TƯ VẤN #{idx + 1}]</span>
                            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2] group-hover:text-[#1e4f35] transition-colors">
                              {typeLabel}
                            </h4>
                            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">{cp.description || 'Tư vấn pháp lý trực tiếp 1-1 qua Chat'}</p>
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <p className="text-base font-bold text-[#1e4f35] dark:text-[#52a677]">
                              {formatVND(cp.price || 100000)}
                            </p>
                            <span className="text-[10px] text-stone-500">/ phiên</span>
                          </div>
                        </div>

                        {isSelf ? (
                          <Link
                            href="/updateLawyerDetails"
                            className="w-full py-2 bg-white dark:bg-[#121c16] hover:bg-[#1e4f35] hover:text-white border-2 border-stone-800 text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Chỉnh sửa biểu phí này</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setBookingForm((prev) => ({ ...prev, typeBooking: cp.type }));
                              setIsBookingModalOpen(true);
                            }}
                            className="w-full py-2 bg-[#1e4f35] hover:bg-[#286b48] text-white border-2 border-stone-900 text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0e2a1b] transition-all cursor-pointer"
                          >
                            Đặt lịch gói này
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CERTIFICATES & DEGREE GALLERY */}
        {activeTab === 'certificates' && (
          <div className="p-6 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0a100c] space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2]">
                {isEn ? 'Bar License & Verified Legal Certificates' : 'Chứng Chỉ Hành Nghề & Thẻ Luật Sư'}
              </h3>
              <p className="text-xs font-mono text-stone-500">
                {isEn ? 'Official documents verified by LawOh management' : 'Hồ sơ bằng cấp đã qua kiểm duyệt bảo mật bởi Ban Quản Trị'}
              </p>
            </div>

            {certificates.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-stone-500 bg-[#edf2eb] dark:bg-[#18261e] border-2 border-stone-800 dark:border-[#2f4236]">
                {isEn ? '[NO CERTIFICATES ATTACHED]' : '[LUẬT SƯ CHƯA TẢI LÊN ẢNH CHỨNG CHỈ CÔNG KHAI]'}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {certificates.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewCertUrl(url)}
                    className="group relative h-44 border-2 border-stone-800 dark:border-[#385945] bg-[#edf2eb] dark:bg-[#121c16] cursor-pointer hover:shadow-[3px_3px_0px_#1e4f35] transition-all overflow-hidden"
                  >
                    <img src={url} alt={`Cert ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-stone-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-mono gap-1.5 transition-opacity">
                      <ZoomIn className="w-4 h-4" />
                      <span>PHÓNG TO</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CLIENT REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Create Review Form (Only for other clients, not self) */}
            {!isSelf && (
              <div className="p-6 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0a100c] space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2]">
                  {isEn ? 'Submit Client Jurisprudence Review' : 'Gửi Bản Đánh Giá Chất Lượng Tư Vấn'}
                </h3>

                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-mono">
                  {/* Star Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">
                      {isEn ? 'Rating score *' : 'Mức độ tín nhiệm *'}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setReviewRating(starVal)}
                          className="p-1 text-amber-600 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starVal <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-mono font-bold text-stone-900 dark:text-[#f7f8f8] ml-2">[{reviewRating} / 5 SAO]</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">
                      {isEn ? 'Review comment *' : 'Nội dung nhận xét *'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Chia sẻ nhận xét về tính chuẩn xác, tận tâm và giải pháp của Luật sư..."
                      className="w-full p-3 bg-[#f7f8f4] dark:bg-[#0f1511] border-2 border-stone-800 dark:border-[#385945] text-xs font-sans text-stone-900 dark:text-[#f7f8f8] placeholder:text-stone-500 focus:outline-none focus:border-[#1e4f35]"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-5 py-2.5 bg-[#1e4f35] hover:bg-[#286b48] disabled:opacity-50 text-xs font-mono font-bold uppercase tracking-wider text-white border-2 border-stone-900 shadow-[2px_2px_0px_#0e2a1b] flex items-center gap-2 transition-all cursor-pointer"
                    >
                      {isSubmittingReview ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isEn ? 'Post Review' : 'Gửi Đánh Giá'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="p-6 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0a100c] space-y-4">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2] flex items-center justify-between border-b-2 border-stone-800 dark:border-[#2f4236] pb-2 font-mono">
                <span>[BẢN GHI ĐÁNH GIÁ TỪ THÂN CHỦ]</span>
                <span className="text-xs font-normal text-stone-500">({reviews.length} nhận xét)</span>
              </h3>

              {isLoadingReviews ? (
                <div className="p-8 text-center text-xs font-mono text-stone-500 flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-[#1e4f35]" />
                  <span>[ĐANG TẢI ĐÁNH GIÁ...]</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-stone-500 bg-[#edf2eb] dark:bg-[#18261e] border-2 border-dashed border-stone-300 dark:border-[#2f4236]">
                  Chưa có đánh giá nào. Hãy là người đầu tiên gửi nhận xét cho Luật sư này!
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev: any) => {
                    const clientName = rev.client_id?.name || rev.clientName || 'Thân chủ';
                    const clientAvatar =
                      rev.client_id?.avartar_url ||
                      rev.client_id?.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clientName)}&backgroundColor=1e4f35&textColor=ffffff`;

                    return (
                      <div
                        key={rev._id}
                        className="p-4 bg-[#edf2eb]/40 dark:bg-[#18261e] border-2 border-stone-300 dark:border-[#2f4236] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={clientAvatar}
                              alt={clientName}
                              className="w-8 h-8 rounded-none object-cover border border-stone-800"
                            />
                            <div>
                              <p className="font-serif font-bold text-stone-900 dark:text-[#f7f8f8]">{clientName}</p>
                              <div className="flex items-center gap-1 text-amber-600 text-[10px]">
                                {[...Array(Number(rev.rating || 5))].map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] text-stone-500 font-mono">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 dark:text-stone-300 font-sans leading-relaxed pl-11 italic">
                          &quot;{rev.comment}&quot;
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* BOOKING MODAL (Hunter Green Retro Ledger Format) */}
      {isBookingModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBookingModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in"
        >
          <div className="w-full max-w-lg bg-[#f7f8f4] dark:bg-[#141d17] text-stone-900 dark:text-[#ecf3ee] border-2 border-[#1e4f35] dark:border-[#385945] shadow-[6px_6px_0px_#0e2a1b] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b-2 border-stone-800 dark:border-[#385945] bg-[#edf2eb] dark:bg-[#18261e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-none bg-[#1e4f35] text-white flex items-center justify-center border border-stone-900">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2]">Lập Lệnh Đặt Lịch Tư Vấn</h3>
                  <p className="text-[11px] font-mono text-stone-500">Luật sư: {lawyer.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1 border border-stone-800 hover:bg-rose-700 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-xs font-mono">
              {/* Specialization selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">LĨNH VỰC CẦN TƯ VẤN *</label>
                <select
                  value={bookingForm.typeBooking}
                  onChange={(e) => setBookingForm({ ...bookingForm, typeBooking: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#0f1511] border-2 border-stone-800 dark:border-[#385945] text-xs font-mono text-stone-900 dark:text-[#f7f8f8] focus:outline-none focus:border-[#1e4f35]"
                >
                  {specialties.map((specKey) => (
                    <option key={specKey} value={specKey} className="bg-white dark:bg-[#0f1511]">
                      {LawyerCategoriesVietnamese[specKey as keyof typeof LawyerCategoriesVietnamese] || specKey}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time & End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">THỜI GIAN BẮT ĐẦU *</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingForm.booking_start}
                    onChange={(e) => setBookingForm({ ...bookingForm, booking_start: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-[#0f1511] border-2 border-stone-800 dark:border-[#385945] text-xs font-mono text-stone-900 dark:text-[#f7f8f8] focus:outline-none focus:border-[#1e4f35]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">THỜI GIAN KẾT THÚC *</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingForm.booking_end}
                    onChange={(e) => setBookingForm({ ...bookingForm, booking_end: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-[#0f1511] border-2 border-stone-800 dark:border-[#385945] text-xs font-mono text-stone-900 dark:text-[#f7f8f8] focus:outline-none focus:border-[#1e4f35]"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">GHI CHÚ / TÓM TẮT VỤ VIỆC</label>
                <textarea
                  rows={3}
                  value={bookingForm.note}
                  onChange={(e) => setBookingForm({ ...bookingForm, note: e.target.value })}
                  placeholder="Mô tả sơ lược tranh chấp hoặc nội dung cần tư vấn..."
                  className="w-full p-2.5 bg-white dark:bg-[#0f1511] border-2 border-stone-800 dark:border-[#385945] text-xs font-sans text-stone-900 dark:text-[#f7f8f8] placeholder:text-stone-500 focus:outline-none focus:border-[#1e4f35]"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t-2 border-stone-800 dark:border-[#385945] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 border-2 border-stone-800 text-stone-800 dark:text-stone-200 font-bold uppercase cursor-pointer"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="px-5 py-2 bg-[#1e4f35] hover:bg-[#286b48] disabled:opacity-50 text-white font-bold uppercase border-2 border-stone-900 shadow-[2px_2px_0px_#0e2a1b] flex items-center gap-2 cursor-pointer"
                >
                  {isBooking ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>XÁC NHẬN ĐẶT LỊCH</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE LIGHTBOX MODAL */}
      {previewCertUrl && (
        <div
          onClick={() => setPreviewCertUrl(null)}
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white dark:bg-[#141d17] border-2 border-stone-800 p-2 shadow-2xl">
            <button
              onClick={() => setPreviewCertUrl(null)}
              className="absolute top-4 right-4 p-2 bg-[#1e4f35] text-white border border-stone-900 hover:bg-rose-700 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewCertUrl} alt="Certificate" className="w-full h-full object-contain max-h-[80vh] rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}