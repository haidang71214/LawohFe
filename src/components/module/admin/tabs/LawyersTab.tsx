'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  Eye,
  X,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ZoomIn,
} from 'lucide-react';
import io from 'socket.io-client';
import { URL_SOCKET } from '@/fetchApi';
import { useFilterLawyersQuery } from '@/store/queries/lawyer';
import {
  useGetLawyerRequestsQuery,
  useAcceptLawyerRequestMutation,
  useRejectLawyerRequestMutation,
} from '@/store/queries/user';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

export const LawyersTab: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  // Sub-tabs: 'requests' (Pending Applications) | 'active' (Verified Lawyers)
  const [subTab, setSubTab] = useState<'requests' | 'active'>('requests');

  // Queries
  const {
    data: requestsResponse,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
    refetch: refetchRequests,
  } = useGetLawyerRequestsQuery();

  const {
    data: lawyersResponse,
    isLoading: isLoadingActive,
    isFetching: isFetchingActive,
    refetch: refetchActive,
  } = useFilterLawyersQuery();

  // Mutations
  const [acceptLawyerRequest, { isLoading: isAccepting }] = useAcceptLawyerRequestMutation();
  const [rejectLawyerRequest, { isLoading: isRejecting }] = useRejectLawyerRequestMutation();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [previewCertUrl, setPreviewCertUrl] = useState<string | null>(null);

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Extract pending requests list
  const pendingRequests: any[] = useMemo(() => {
    const rawData = (requestsResponse?.data as any) || [];
    const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
    return Array.isArray(list) ? list : [];
  }, [requestsResponse]);

  // Extract active lawyers list
  const activeLawyers: any[] = useMemo(() => {
    const rawLawyers = (lawyersResponse?.data as any) || [];
    const list = Array.isArray(rawLawyers) ? rawLawyers : (Array.isArray(rawLawyers?.data) ? rawLawyers.data : []);
    return Array.isArray(list) ? list : [];
  }, [lawyersResponse]);

  // Filtered pending requests
  const filteredRequests = useMemo(() => {
    return pendingRequests.filter((item) => {
      const matchSearch =
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.province && item.province.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSpecialty =
        selectedSpecialty === 'ALL' ||
        (Array.isArray(item.pending_type_lawyer) && item.pending_type_lawyer.includes(selectedSpecialty)) ||
        (Array.isArray(item.type_lawyer) && item.type_lawyer.includes(selectedSpecialty));

      return matchSearch && matchSpecialty;
    });
  }, [pendingRequests, searchTerm, selectedSpecialty]);

  // Filtered active lawyers
  const filteredActiveLawyers = useMemo(() => {
    return activeLawyers.filter((l) => {
      const matchSearch =
        (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.province && l.province.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSpecialty =
        selectedSpecialty === 'ALL' ||
        (Array.isArray(l.type_lawyer) && l.type_lawyer.includes(selectedSpecialty));

      return matchSearch && matchSpecialty;
    });
  }, [activeLawyers, searchTerm, selectedSpecialty]);

  const handleAccept = async (id: string, name: string) => {
    try {
      await acceptLawyerRequest(id).unwrap();

      // Emit real-time notification via Socket
      try {
        const targetUrl = URL_SOCKET || 'http://localhost:3300';
        const socket = io(targetUrl, { transports: ['polling'] });
        socket.emit('notify-lawyer-request-status', {
          userId: id,
          status: 'approved',
          userName: name,
        });
        setTimeout(() => socket.disconnect(), 1500);
      } catch (sockErr) {
        console.error('Socket emit error:', sockErr);
      }

      toast.success(
        isEn
          ? `Approved lawyer application for ${name}! Role upgraded.`
          : `Đã phê duyệt cấp quyền Luật sư cho "${name}" thành công!`
      );
      refetchRequests();
      refetchActive();
      if (selectedApplicant?._id === id) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi phê duyệt.');
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối hồ sơ');
      return;
    }

    try {
      await rejectLawyerRequest({ id: rejectingId, reason: rejectReason.trim() }).unwrap();

      // Emit real-time notification via Socket
      try {
        const targetUrl = URL_SOCKET || 'http://localhost:3300';
        const socket = io(targetUrl, { transports: ['polling'] });
        socket.emit('notify-lawyer-request-status', {
          userId: rejectingId,
          status: 'rejected',
          reason: rejectReason.trim(),
        });
        setTimeout(() => socket.disconnect(), 1500);
      } catch (sockErr) {
        console.error('Socket emit error:', sockErr);
      }

      toast.success(isEn ? 'Application rejected with reason.' : 'Đã từ chối đơn yêu cầu cấp quyền.');
      setIsRejectModalOpen(false);
      setRejectingId(null);
      refetchRequests();
      if (selectedApplicant?._id === idRejectingMatched(rejectingId)) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi từ chối.');
    }
  };

  const idRejectingMatched = (id: string) => {
    return selectedApplicant?._id === id ? id : null;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-stone-800 dark:border-stone-700 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('requests')}
            className={`px-4 py-2 border-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'requests'
                ? 'border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 shadow-[3px_3px_0px_#000]'
                : 'border-stone-800 dark:border-stone-600 bg-white dark:bg-[#141b16] text-stone-800 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-[2px_2px_0px_#000]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isEn ? 'Pending Dossiers' : 'Hồ sơ xin cấp quyền chờ duyệt'}</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-stone-950 font-mono font-bold border border-stone-900 animate-bounce">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('active')}
            className={`px-4 py-2 border-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'active'
                ? 'border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 shadow-[3px_3px_0px_#000]'
                : 'border-stone-800 dark:border-stone-600 bg-white dark:bg-[#141b16] text-stone-800 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-[2px_2px_0px_#000]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isEn ? 'Verified Bar Counsel' : 'Danh sách Luật sư chính thức'}</span>
            <span className="px-1.5 py-0.2 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-200 border border-stone-700 font-mono">
              {activeLawyers.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            if (subTab === 'requests') refetchRequests();
            else refetchActive();
          }}
          disabled={isFetchingRequests || isFetchingActive}
          className="p-2 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-[#141b16] text-stone-800 dark:text-stone-200 shadow-[2px_2px_0px_#000] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          title="Làm mới dữ liệu"
        >
          <RotateCw className={`w-4 h-4 ${isFetchingRequests || isFetchingActive ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-4 shadow-[4px_4px_0px_#1a5336]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search applicant by name, email, city...' : 'Tìm hồ sơ theo tên, email, tỉnh thành...'}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80] cursor-pointer"
          >
            <option value="ALL">{t('categories.ALL', 'MỌI LĨNH VỰC CHUYÊN MÔN')}</option>
            {Object.entries(LawyerCategoriesVietnamese).map(([key, label]) => (
              <option key={key} value={key}>
                {label.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tab 1: Pending Applications List */}
      {subTab === 'requests' && (
        <div className="space-y-4">
          {isLoadingRequests ? (
            <div className="p-12 text-center text-xs font-mono text-stone-500 flex items-center justify-center gap-2 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700">
              <RotateCw className="w-4 h-4 animate-spin text-[#1a5336] dark:text-[#4ade80]" />
              <span>[ĐANG TẢI HỒ SƠ XIN CẤP QUYỀN LUẬT SƯ...]</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center space-y-2 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 shadow-[4px_4px_0px_#1a5336]">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-serif font-bold text-base text-stone-900 dark:text-stone-50">
                {isEn ? 'No pending lawyer applications' : 'Không có hồ sơ xin cấp quyền nào đang chờ'}
              </p>
              <p className="text-xs font-mono text-stone-500">
                {isEn ? 'All submitted applications have been processed.' : 'Toàn bộ đơn đăng ký thẻ luật sư đã được thẩm định xong.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((applicant: any) => {
                const avatar =
                  applicant.avartar_url ||
                  applicant.avatar_url ||
                  applicant.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(applicant.name || 'User')}&backgroundColor=1a5336&textColor=ffffff`;

                const specialties = applicant.pending_type_lawyer || applicant.type_lawyer || [];
                const certificates = applicant.certificate || [];

                return (
                  <div
                    key={applicant._id}
                    className="p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[4px_4px_0px_#1a5336] flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    {/* Left: Applicant Information */}
                    <div className="flex items-start gap-4 min-w-0">
                      <img
                        src={avatar}
                        alt={applicant.name}
                        className="w-14 h-14 object-cover border-2 border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 shrink-0 shadow-[2px_2px_0px_#000]"
                      />
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif font-black text-base text-stone-900 dark:text-stone-50">
                            {applicant.name}
                          </h3>
                          <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-600">
                            [CHỜ THẨM ĐỊNH]
                          </span>
                          <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
                            ĐOÀN {applicant.province || 'Hà Nội'} • <strong className="text-stone-900 dark:text-stone-100">{applicant.experienceYear || 0}</strong> NĂM KINH NGHIỆM
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-stone-600 dark:text-stone-400">
                          <span>EMAIL: <strong className="text-stone-900 dark:text-stone-200">{applicant.email}</strong></span>
                          {applicant.phone && <span>• SĐT: {applicant.phone}</span>}
                        </div>

                        {/* Description */}
                        {applicant.description && (
                          <p className="text-xs font-mono text-stone-700 dark:text-stone-300 line-clamp-2 max-w-2xl leading-relaxed bg-stone-50 dark:bg-[#0d1410] p-2 border border-stone-300 dark:border-stone-800">
                            &quot;{applicant.description}&quot;
                          </p>
                        )}

                        {/* Specialties Tags */}
                        {specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {specialties.map((specKey: string) => (
                              <span
                                key={specKey}
                                className="px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase bg-[#1a5336]/10 border border-[#1a5336] text-[#1a5336] dark:text-[#4ade80]"
                              >
                                {LawyerCategoriesVietnamese[specKey as keyof typeof LawyerCategoriesVietnamese] || specKey}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Certificates preview thumbnails */}
                        {certificates.length > 0 && (
                          <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                            <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1 font-bold">
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              CHỨNG CHỈ ({certificates.length}):
                            </span>
                            <div className="flex items-center gap-2">
                              {certificates.map((certUrl: string, idx: number) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setPreviewCertUrl(certUrl)}
                                  className="w-9 h-9 border-2 border-stone-800 dark:border-stone-600 hover:border-[#1a5336] overflow-hidden shadow-[1px_1px_0px_#000] cursor-pointer"
                                  title="Phóng to xem chứng chỉ"
                                >
                                  <img src={certUrl} alt="cert" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Retro Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0 font-mono">
                      {/* Xem chi tiết */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          setIsDetailModalOpen(true);
                        }}
                        className="px-3.5 py-2 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-bold uppercase text-stone-900 dark:text-stone-100 flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                        <span>Xem Hồ Sơ</span>
                      </button>

                      {/* Từ chối */}
                      <button
                        type="button"
                        disabled={isRejecting}
                        onClick={() => handleOpenRejectModal(applicant._id)}
                        className="px-3.5 py-2 border-2 border-rose-800 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Từ Chối</span>
                      </button>

                      {/* Phê duyệt */}
                      <button
                        type="button"
                        disabled={isAccepting}
                        onClick={() => handleAccept(applicant._id, applicant.name)}
                        className="px-4 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] text-white dark:text-stone-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      >
                        {isAccepting ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Phê Duyệt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Active Verified Lawyers */}
      {subTab === 'active' && (
        <div className="space-y-4">
          {isLoadingActive ? (
            <div className="p-12 text-center text-xs font-mono text-stone-500 flex items-center justify-center gap-2 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700">
              <RotateCw className="w-4 h-4 animate-spin text-[#1a5336]" />
              <span>[ĐANG TẢI DANH SÁCH LUẬT SƯ CHÍNH NGẠCH...]</span>
            </div>
          ) : filteredActiveLawyers.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-stone-500 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700">
              [KHÔNG TÌM THẤY LUẬT SƯ PHÙ HỢP TIÊU CHÍ]
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredActiveLawyers.map((lawyer: any) => {
                const avatar =
                  lawyer.avartar_url ||
                  lawyer.avatar_url ||
                  lawyer.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lawyer.name || 'LS')}&backgroundColor=1a5336&textColor=ffffff`;

                return (
                  <div
                    key={lawyer._id}
                    className="p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[4px_4px_0px_#1a5336] flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={avatar}
                        alt={lawyer.name}
                        className="w-12 h-12 object-cover border-2 border-stone-800 dark:border-stone-600 shrink-0 shadow-[2px_2px_0px_#000]"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-50 truncate">
                            {lawyer.name}
                          </h4>
                          <ShieldCheck className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80] shrink-0" />
                        </div>
                        <p className="text-[11px] font-mono text-stone-600 dark:text-stone-400 truncate">
                          {lawyer.email}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                          <span>{lawyer.province || 'Hà Nội'}</span>
                          <span>•</span>
                          <span className="text-amber-600 font-bold">★ {lawyer.star || lawyer.stars || '5.0'}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-mono text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed bg-stone-50 dark:bg-[#0d1410] p-2 border border-stone-200 dark:border-stone-800">
                      {lawyer.description || 'Chưa cập nhật mô tả chuyên môn.'}
                    </p>

                    <div className="pt-3 border-t-2 border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-between font-mono text-xs">
                      <span className="text-[10px] font-bold text-[#1a5336] dark:text-[#4ade80] bg-[#1a5336]/10 px-2 py-0.5 border border-[#1a5336]">
                        [ĐANG HÀNH NGHỀ]
                      </span>
                      <span className="text-stone-700 dark:text-stone-300 font-bold text-[11px]">
                        {lawyer.experienceYear || 0} NĂM KN
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULL APPLICANT DETAIL MODAL */}
      {isDetailModalOpen && selectedApplicant && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-sans animate-fade-in"
        >
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#141b16] text-stone-900 dark:text-stone-100 border-2 border-stone-800 dark:border-stone-700 shadow-[8px_8px_0px_#1a5336] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#18261e] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-stone-800 bg-[#1a5336] text-white flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-stone-900 dark:text-stone-50">
                    Hồ Sơ Thẩm Định Cấp Thẻ Luật Sư
                  </h3>
                  <p className="text-[11px] font-mono text-stone-500">
                    MÃ ỨNG VIÊN: <span className="font-bold text-stone-800 dark:text-stone-200">{selectedApplicant._id}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 border-2 border-stone-800 bg-white dark:bg-stone-800 hover:bg-rose-700 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Applicant Profile Card */}
              <div className="p-4 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] shadow-[3px_3px_0px_#000] flex items-start gap-4">
                <img
                  src={
                    selectedApplicant.avartar_url ||
                    selectedApplicant.avatar_url ||
                    selectedApplicant.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedApplicant.name || 'User')}&backgroundColor=1a5336&textColor=ffffff`
                  }
                  alt={selectedApplicant.name}
                  className="w-16 h-16 object-cover border-2 border-stone-800 shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50">
                      {selectedApplicant.name}
                    </h4>
                    <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-600">
                      [CHỜ XÉT DUYỆT]
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-stone-600 dark:text-stone-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                      <span>{selectedApplicant.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                      <span>{selectedApplicant.phone || 'Chưa cập nhật SĐT'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                      <span>ĐOÀN {selectedApplicant.province || 'Hà Nội'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                      <span><strong>{selectedApplicant.experienceYear || 0}</strong> NĂM KINH NGHIỆM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations & Sub-Specialties */}
              <div className="space-y-2">
                <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80]" />
                  <span>Lĩnh Vực Chuyên Môn Hành Nghề</span>
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedApplicant.pending_type_lawyer || selectedApplicant.type_lawyer || []).map((spec: string) => (
                    <span
                      key={spec}
                      className="px-3 py-1 font-mono text-xs font-bold uppercase bg-[#1a5336]/10 border-2 border-[#1a5336] text-[#1a5336] dark:text-[#4ade80]"
                    >
                      {LawyerCategoriesVietnamese[spec as keyof typeof LawyerCategoriesVietnamese] || spec}
                    </span>
                  ))}
                </div>

                {selectedApplicant.pending_sub_type_lawyers && selectedApplicant.pending_sub_type_lawyers.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-mono text-stone-500 mb-1.5">CHUYÊN MÔN SÂU / VỤ VIỆC THẾ MẠNH:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApplicant.pending_sub_type_lawyers.map((sub: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 font-mono text-[11px] bg-stone-100 dark:bg-[#0d1410] border border-stone-400 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Biography */}
              <div className="space-y-2">
                <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Tóm Tắt Quá Trình Đào Tạo & Hành Nghề
                </h5>
                <div className="p-4 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                  {selectedApplicant.description || 'Không có mô tả.'}
                </div>
              </div>

              {/* Certificate & Degree Photos */}
              <div className="space-y-2">
                <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Ảnh Thẻ Luật Sư & Chứng Chỉ Chuyên Môn ({selectedApplicant.certificate?.length || 0})</span>
                </h5>
                {selectedApplicant.certificate && selectedApplicant.certificate.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedApplicant.certificate.map((certUrl: string, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewCertUrl(certUrl)}
                        className="group relative h-28 border-2 border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-[#0d1410] cursor-pointer shadow-[2px_2px_0px_#000] overflow-hidden"
                      >
                        <img src={certUrl} alt={`Cert ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-stone-900/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-mono text-xs font-bold gap-1 transition-opacity">
                          <ZoomIn className="w-4 h-4" />
                          <span>[PHÓNG TO]</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-stone-500 italic">[Ứng viên chưa đính kèm ảnh chứng chỉ]</p>
                )}
              </div>
            </div>

            {/* Modal Sticky Footer Actions */}
            <div className="px-6 py-4 border-t-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#18261e] flex items-center justify-between gap-3 shrink-0 font-mono">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border-2 border-stone-800 bg-white dark:bg-stone-800 text-xs font-bold uppercase text-stone-800 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-[2px_2px_0px_#000]"
              >
                ĐÓNG
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={isRejecting}
                  onClick={() => handleOpenRejectModal(selectedApplicant._id)}
                  className="px-4 py-2 border-2 border-rose-800 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>TỪ CHỐI HỒ SƠ</span>
                </button>

                <button
                  type="button"
                  disabled={isAccepting}
                  onClick={() => handleAccept(selectedApplicant._id, selectedApplicant.name)}
                  className="px-5 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] text-white dark:text-stone-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  {isAccepting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>CẤP QUYỀN LUẬT SƯ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#141b16] text-stone-900 dark:text-stone-100 border-2 border-stone-800 dark:border-stone-700 p-6 shadow-[6px_6px_0px_#1a5336] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-serif font-black text-sm text-stone-900 dark:text-stone-50">
                  {isEn ? 'Reject Lawyer Application' : 'Từ Chối Đơn Xin Cấp Quyền'}
                </h3>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 border border-stone-800 text-stone-600 hover:bg-rose-700 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-stone-800 dark:text-stone-200">
                  {isEn ? 'Reason for Rejection *' : 'Lý do từ chối hồ sơ (thông báo cho ứng viên) *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={
                    isEn
                      ? 'E.g.: Certificate photos are blurred, please re-upload clear legal bar license...'
                      : 'VD: Ảnh chụp thẻ luật sư chưa rõ số hiệu thẻ, vui lòng bổ sung chứng chỉ đào tạo nghề luật sư...'
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 border-2 border-stone-800 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-300 font-bold uppercase shadow-[2px_2px_0px_#000]"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-5 py-2 border-2 border-stone-900 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  {isRejecting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>XÁC NHẬN TỪ CHỐI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Lightbox Viewer Modal */}
      {previewCertUrl && (
        <div
          onClick={() => setPreviewCertUrl(null)}
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white dark:bg-[#141b16] border-2 border-stone-800 p-2 shadow-[8px_8px_0px_#1a5336]">
            <button
              onClick={() => setPreviewCertUrl(null)}
              className="absolute top-4 right-4 p-2 bg-stone-900 text-white border-2 border-stone-100 hover:bg-rose-700 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewCertUrl} alt="Certificate" className="w-full h-full object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyersTab;
