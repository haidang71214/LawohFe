'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Camera,
  CheckCircle2,
  RotateCw,
  ArrowLeft,
  Mail,
  Clock,
  Check,
  CalendarCheck,
  Scale,
  Award,
  XCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Briefcase,
  Sliders,
  Copy,
  Sparkles,
  ExternalLink,
  Film,
  Newspaper,
  BookOpen,
} from 'lucide-react';
import { USER_PROFILE, LOGIN_USER } from '@/types/enum';
import { useUpdateMeMutation } from '@/store/queries/user';
import { useGetMeQuery } from '@/store/queries/auth';
import { useProvinces } from '@/lib/useProvinces';
import { useLanguage } from '@/i18n/LanguageContext';
import { RequestLawyerModal } from '@/components/module/lawyers/RequestLawyerModal';
import toast from '@/lib/toast';

export default function UpdateProfile() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { provinces } = useProvinces();

  const [rawUser, setRawUser] = useState<any>({});
  const [profile, setProfile] = useState<{
    phone: string;
    name: string;
    img: File | null;
    age: number | '';
    province: string;
  }>({
    phone: '',
    name: '',
    img: null,
    age: '',
    province: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isRequestLawyerModalOpen, setIsRequestLawyerModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const loadUserData = () => {
    const stored = localStorage.getItem(USER_PROFILE);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRawUser(parsed);
        setProfile({
          phone: parsed.phone != null ? String(parsed.phone) : '',
          name: parsed.name || parsed.username || '',
          img: null,
          age: parsed.age != null ? parsed.age : '',
          province: parsed.province || 'Hà Nội',
        });
        if (parsed.avartar_url || parsed.avatar_url || parsed.avatar) {
          setAvatarPreview(parsed.avartar_url || parsed.avatar_url || parsed.avatar);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Fetch live fresh user data from /auth/me
  const { data: meResponse, refetch: refetchMe, isFetching } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (meResponse?.data) {
      const freshUser: any = meResponse.data;
      setRawUser(freshUser);
      setProfile({
        phone: freshUser.phone != null ? String(freshUser.phone) : '',
        name: freshUser.name || freshUser.username || '',
        img: null,
        age: freshUser.age != null ? freshUser.age : '',
        province: freshUser.province || 'Hà Nội',
      });
      if (freshUser.avartar_url || freshUser.avatar_url || freshUser.avatar) {
        setAvatarPreview(freshUser.avartar_url || freshUser.avatar_url || freshUser.avatar);
      }
      try {
        localStorage.setItem(USER_PROFILE, JSON.stringify(freshUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, [meResponse]);

  // Completeness score
  const completeness = useMemo(() => {
    let score = 0;
    if (profile.name) score += 25;
    if (profile.phone) score += 25;
    if (profile.age) score += 15;
    if (profile.province) score += 15;
    if (avatarPreview || rawUser.avartar_url || rawUser.avatar_url) score += 20;
    return Math.min(100, score);
  }, [profile, avatarPreview, rawUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(
          isEn ? 'File too large' : 'Tệp quá lớn',
          isEn ? 'Avatar image must be under 5MB.' : 'Dung lượng ảnh tối đa 5MB.'
        );
        return;
      }
      setProfile({ ...profile, img: file });

      // Instant local preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyId = () => {
    const id = rawUser._id || rawUser.id;
    if (id) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      toast.success(
        isEn ? 'ID Copied' : 'Đã sao chép mã',
        isEn ? 'Profile ID copied to clipboard.' : 'Đã lưu mã định danh vào khay nhớ tạm.'
      );
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      toast.warning(isEn ? 'Name required' : 'Thiếu họ và tên', isEn ? 'Please enter your full name.' : 'Vui lòng nhập họ và tên.');
      return;
    }

    try {
      const formData = new FormData();
      if (profile.name) formData.append('name', profile.name.trim());
      if (profile.phone) formData.append('phone', profile.phone.trim());
      if (profile.age !== '' && Number(profile.age) > 0) {
        formData.append('age', String(profile.age));
      }
      if (profile.province) {
        formData.append('province', profile.province);
      }
      if (profile.img) {
        formData.append('img', profile.img);
      }

      const response: any = await updateMe(formData).unwrap();

      if (response && (response.statusCode === 200 || response.statusCode === 201)) {
        const updatedUserData = response.data || {};
        const updatedLocal = {
          ...rawUser,
          name: profile.name,
          phone: profile.phone,
          age: profile.age,
          province: profile.province,
          avartar_url: updatedUserData.avartar_url || updatedUserData.avatar_url || avatarPreview || rawUser.avartar_url,
          avatar: updatedUserData.avartar_url || updatedUserData.avatar_url || avatarPreview || rawUser.avatar,
        };

        localStorage.setItem(USER_PROFILE, JSON.stringify(updatedLocal));
        localStorage.setItem(LOGIN_USER, JSON.stringify(updatedLocal));

        toast.success(
          isEn ? 'Profile Updated' : 'Cập nhật thành công',
          `${isEn ? 'Full Name' : 'Họ và tên'}: ${profile.name}`
        );

        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        toast.error(
          t('common.error', 'Thất bại'),
          response?.message || t('profile.updateError', 'Cập nhật thất bại')
        );
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      toast.error(
        t('common.error', 'Lỗi cập nhật'),
        err?.data?.message || err?.message || t('profile.updateError', 'Đã xảy ra lỗi khi lưu thông tin.')
      );
    }
  };

  const avatarSrc =
    avatarPreview ||
    rawUser.avartar_url ||
    rawUser.avatar_url ||
    rawUser.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || rawUser.email || 'User')}&backgroundColor=1a5336&textColor=ffffff`;

  const isLawyer = rawUser.role === 'lawyer';
  const isAdmin = rawUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#faf6ee] dark:bg-[#121714] text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-stone-800 dark:border-stone-700 pb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 hover:bg-[#1a5336] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-stone-950 px-3.5 py-2 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? 'Back to Portal' : 'Quay về Trang chủ'}</span>
            </Link>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-200/80 dark:bg-stone-800/80 border border-stone-400 dark:border-stone-700 font-mono text-[10px] text-stone-600 dark:text-stone-400 uppercase">
              <span>{isEn ? 'DOSSIER' : 'HỒ SƠ'}</span>
              <span>•</span>
              <span className="font-bold text-stone-900 dark:text-stone-200">
                {rawUser._id ? `#${rawUser._id.slice(-8).toUpperCase()}` : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => refetchMe()}
              disabled={isFetching}
              className="px-3 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title={isEn ? 'Synchronize Record' : 'Đồng bộ lại thông tin'}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#1a5336] dark:text-[#4ade80]' : ''}`} />
              <span>{isEn ? 'Sync' : 'Đồng bộ'}</span>
            </button>
          </div>
        </div>

        {/* Hero Identity Banner Card */}
        <div className="border-2 border-stone-800 dark:border-[#2d6a4f] bg-white dark:bg-[#18201b] p-6 sm:p-7 shadow-[6px_6px_0px_#1a5336] dark:shadow-[6px_6px_0px_#2d6a4f] space-y-5">
          {/* Top Dossier Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-stone-200 dark:border-stone-800 pb-3 font-mono text-[10px] uppercase text-stone-500">
            <span className="flex items-center gap-1.5 font-bold text-[#1a5336] dark:text-[#4ade80]">
              <Sparkles className="w-3 h-3" />
              [DOCKET: USER-CIVIL-RECORD-2026]
            </span>
            <div className="flex items-center gap-3">
              <span>{isEn ? 'COMPLETENESS' : 'ĐỘ HOÀN THIỆN'}: <strong className="text-stone-900 dark:text-stone-100">{completeness}%</strong></span>
              <div className="w-20 sm:w-28 h-2 border border-stone-800 dark:border-stone-600 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-[#1a5336] dark:bg-[#4ade80] transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar & Main User Meta */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Avatar Frame with Camera Trigger */}
              <div className="relative group cursor-pointer w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full border-2 border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 shadow-[4px_4px_0px_#1a5336] dark:shadow-[4px_4px_0px_#0e2a1b] overflow-hidden relative"
                >
                  <img
                    src={avatarSrc}
                    alt={profile.name || 'User Avatar'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=1a5336&textColor=ffffff`;
                    }}
                  />
                  <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-mono text-[10px] uppercase font-bold gap-1">
                    <Camera className="w-5 h-5" />
                    <span>{isEn ? 'Change Photo' : 'Đổi Ảnh'}</span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Profile Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
                    {profile.name || rawUser.name || (isEn ? 'LawOh Citizen' : 'Thành Viên LawOh')}
                  </h1>
                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 border-2 shadow-[2px_2px_0px_#000] ${
                      isAdmin
                        ? 'border-amber-600 dark:border-amber-400 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                        : isLawyer
                        ? 'border-[#1a5336] dark:border-[#4ade80] bg-[#1a5336]/15 text-[#1a5336] dark:text-[#4ade80]'
                        : 'border-stone-800 dark:border-stone-500 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {isAdmin
                      ? (isEn ? '[SYSTEM ADMINISTRATOR]' : '[QUẢN TRỊ VIÊN // ADMIN]')
                      : isLawyer
                      ? (isEn ? '[CERTIFIED ATTORNEY]' : '[LUẬT SƯ CHÍNH NGẠCH]')
                      : (isEn ? '[VERIFIED CLIENT]' : '[THÀNH VIÊN TƯ VẤN]')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-xs font-mono text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                    <span className="font-semibold">{rawUser.email || '—'}</span>
                  </span>
                  {profile.province && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                      <span>{profile.province}</span>
                    </span>
                  )}
                  {profile.age && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                      <span>
                        {profile.age} {isEn ? 'years old' : 'tuổi'}
                      </span>
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                      <span>{profile.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 shrink-0">
              {isLawyer ? (
                <>
                  <Link
                    href="/updateLawyerDetails"
                    className="px-3.5 py-2 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                    <span>{isEn ? 'Credentials & Fees' : 'Hồ sơ & Biểu phí'}</span>
                  </Link>
                  <Link
                    href="/bookingListLawyer"
                    className="px-3.5 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] text-white dark:text-stone-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Client Consultations' : 'Lịch hẹn khách'}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/bookingList"
                    className="px-3.5 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] text-white dark:text-stone-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>{isEn ? 'My Bookings' : 'Lịch tư vấn đã đặt'}</span>
                  </Link>
                  <Link
                    href="/lawyers"
                    className="px-3.5 py-2 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                    <span>{isEn ? 'Find Lawyers' : 'Tra cứu Luật sư'}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main 2-Columns Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          
          {/* Left Column (5 cols): Identity Ledger & Lawyer Standing */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Account Ledger Card */}
            <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#18201b] p-5 shadow-[4px_4px_0px_#1a5336] dark:shadow-[4px_4px_0px_#0e2a1b] space-y-4">
              <div className="border-b-2 border-stone-800 dark:border-stone-700 pb-2.5 flex items-center justify-between">
                <h3 className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80]" />
                  <span>{isEn ? 'Account Ledger' : 'Sổ Định Danh Tài Khoản'}</span>
                </h3>
                <span className="font-mono text-[10px] text-stone-500 uppercase">[RECORD-DATA]</span>
              </div>

              <div className="space-y-3.5 text-xs font-mono divide-y-2 divide-dashed divide-stone-200 dark:divide-stone-800">
                {/* User ID with Copy */}
                <div className="pt-2 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-stone-500 font-bold">
                      {isEn ? 'Unique Citizen ID' : 'Mã định danh công dân (ID)'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="text-[10px] text-[#1a5336] dark:text-[#4ade80] hover:underline flex items-center gap-1 font-bold"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId ? (isEn ? 'Copied' : 'Đã sao chép') : (isEn ? 'Copy' : 'Sao chép')}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-800 dark:text-stone-200 font-bold break-all bg-stone-100 dark:bg-stone-900/80 p-2 border border-stone-300 dark:border-stone-700 select-all">
                    {rawUser._id || rawUser.id || '—'}
                  </p>
                </div>

                {/* Registered Email & Verification Badge */}
                <div className="pt-3.5 space-y-1.5">
                  <span className="text-[10px] uppercase text-stone-500 font-bold">
                    {isEn ? 'Registered Email Address' : 'Địa chỉ Email Đăng Ký'}
                  </span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 truncate">
                    {rawUser.email || '—'}
                  </p>
                  <div className="pt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 border ${
                        rawUser.isEmailVerified
                          ? 'border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'border-amber-600 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold'
                      }`}
                    >
                      {rawUser.isEmailVerified ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isEn ? 'EMAIL VERIFIED' : 'ĐÃ XÁC THỰC EMAIL'}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>{isEn ? 'UNVERIFIED EMAIL' : 'CHƯA XÁC THỰC'}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* System Role */}
                <div className="pt-3.5 space-y-1">
                  <span className="text-[10px] uppercase text-stone-500 font-bold">
                    {isEn ? 'System Authority' : 'Phân quyền hệ thống'}
                  </span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 uppercase">
                    {rawUser.role === 'admin'
                      ? (isEn ? 'System Administrator' : 'Quản trị viên cấp cao')
                      : rawUser.role === 'lawyer'
                      ? (isEn ? 'Licensed Advocate / Lawyer' : 'Luật sư chính quy')
                      : (isEn ? 'Client / Standard Citizen' : 'Khách hàng / Công dân')}
                  </p>
                </div>

                {/* Date Registered */}
                {rawUser.createdAt && (
                  <div className="pt-3.5 space-y-1">
                    <span className="text-[10px] uppercase text-stone-500 font-bold">
                      {isEn ? 'Account Registration Date' : 'Ngày khởi tạo hồ sơ'}
                    </span>
                    <p className="text-[11px] text-stone-700 dark:text-stone-300">
                      {new Date(rawUser.createdAt).toLocaleDateString(isEn ? 'en-US' : 'vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {/* Disciplinary / Warning Notice */}
                {rawUser.warn && (
                  <div className="pt-3.5 space-y-1">
                    <span className="text-[10px] uppercase text-rose-600 dark:text-rose-400 block font-bold">
                      {isEn ? 'Compliance Notice' : 'Thông báo kỷ luật / Lưu ý'}
                    </span>
                    <p className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-2.5 border border-rose-300 dark:border-rose-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{rawUser.warn}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Standing & Bar Association Card */}
            {!isAdmin && (
              <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#18201b] p-5 shadow-[4px_4px_0px_#1a5336] dark:shadow-[4px_4px_0px_#0e2a1b] space-y-4">
                <div className="border-b-2 border-stone-800 dark:border-stone-700 pb-2.5 flex items-center justify-between">
                  <h3 className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80]" />
                    <span>{isEn ? 'Legal & Bar Standing' : 'Tư Cách Luật Sư LawOh'}</span>
                  </h3>
                </div>

                {isLawyer ? (
                  <div className="p-4 border-2 border-[#1a5336] dark:border-[#2d6a4f] bg-[#1a5336]/10 text-xs font-mono space-y-3">
                    <div className="flex items-center gap-1.5 font-bold text-[#1a5336] dark:text-[#4ade80] uppercase">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isEn ? 'Verified Bar Association Counsel' : 'Luật Sư Chính Thức LawOh'}</span>
                    </div>
                    <p className="text-[11px] text-stone-700 dark:text-stone-300 font-sans leading-relaxed">
                      {isEn
                        ? 'Your credentials and license are certified. You have full access to consultation scheduling, studio video publishing, and legal articles.'
                        : 'Hồ sơ thẻ luật sư đã được kiểm định. Bạn có toàn quyền thiết lập biểu phí tư vấn, mở lịch trực tuyến và phát hành băng hình pháp lý.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/updateLawyerDetails"
                        className="py-2 px-2.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000] hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                      >
                        <Briefcase className="w-3 h-3" />
                        <span>{isEn ? 'Tariffs & Degree' : 'Biểu phí & Thẻ'}</span>
                      </Link>

                      <Link
                        href="/videoSelf"
                        className="py-2 px-2.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000] hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                      >
                        <Film className="w-3 h-3" />
                        <span>{isEn ? 'Video Studio' : 'Kho Băng Hình'}</span>
                      </Link>
                    </div>
                  </div>
                ) : rawUser.lawyer_request_status === 'pending' ? (
                  <div className="p-4 border-2 border-amber-600 bg-amber-500/10 text-xs font-mono space-y-3">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 uppercase">
                      <Clock className="w-4 h-4" />
                      <span>{isEn ? 'Application Under Council Review' : 'Hồ Sơ Đang Chờ Xét Duyệt'}</span>
                    </div>
                    <p className="text-[11px] text-stone-700 dark:text-stone-300 font-sans leading-relaxed">
                      {isEn
                        ? 'Your advocate dossier and certificates are currently being reviewed by the LawOh Administrative Council.'
                        : 'Hội đồng Ban Quản Trị LawOh đang thẩm định chứng chỉ hành nghề và hồ sơ chuyên môn của bạn.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsRequestLawyerModalOpen(true)}
                      className="w-full py-2 border-2 border-stone-800 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-[11px] font-bold uppercase shadow-[2px_2px_0px_#000] hover:bg-amber-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                    >
                      {isEn ? 'View / Supplement Application' : 'Xem & Bổ Sung Hồ Sơ'}
                    </button>
                  </div>
                ) : rawUser.lawyer_request_status === 'rejected' ? (
                  <div className="p-4 border-2 border-rose-600 bg-rose-500/10 text-xs font-mono space-y-3">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400 uppercase">
                      <XCircle className="w-4 h-4" />
                      <span>{isEn ? 'Application Rejected' : 'Hồ Sơ Chưa Được Chấp Thuận'}</span>
                    </div>
                    {rawUser.lawyer_request_reason && (
                      <div className="text-[11px] text-rose-800 dark:text-rose-300 bg-white dark:bg-stone-900 p-2.5 border border-rose-300 dark:border-rose-800 font-sans leading-relaxed">
                        <strong>{isEn ? 'Reason:' : 'Lý do từ chối:'}</strong> &quot;{rawUser.lawyer_request_reason}&quot;
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsRequestLawyerModalOpen(true)}
                      className="w-full py-2.5 border-2 border-stone-900 bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      {isEn ? 'Re-Apply for Lawyer Verification' : 'Nộp Lại Hồ Sơ Thẩm Định'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/60 text-xs space-y-3.5">
                    <div className="space-y-1">
                      <p className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        {isEn ? 'Are you a Certified Legal Practitioner?' : 'Bạn là Luật sư có Thẻ hành nghề?'}
                      </p>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
                        {isEn
                          ? 'Apply for official verification to open consultation rooms, accept client appointments, and publish legal guidance.'
                          : 'Đăng ký thẩm định thẻ luật sư để mở phòng tư vấn trực tuyến, tiếp nhận khách hàng và nhận thù lao tham vấn minh bạch.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsRequestLawyerModalOpen(true)}
                      className="w-full py-2.5 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] text-white dark:text-stone-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>{isEn ? 'Apply for Lawyer Status' : 'Đăng Ký Trở Thành Luật Sư'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Links & Knowledge Base */}
            <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#18201b] p-4 shadow-[4px_4px_0px_#1a5336] dark:shadow-[4px_4px_0px_#0e2a1b] space-y-2.5">
              <span className="font-mono text-[10px] uppercase font-bold text-stone-500 block">
                {isEn ? 'QUICK PORTAL ACCESS' : 'TRUY CẬP NHANH CỔNG PHÁP LÝ'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <Link
                  href="/newsPage"
                  className="p-2 border border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/60 hover:bg-[#1a5336] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-stone-950 flex items-center gap-1.5 transition-colors"
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Legal News' : 'Tin Pháp Luật'}</span>
                </Link>
                <Link
                  href="/services"
                  className="p-2 border border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/60 hover:bg-[#1a5336] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-stone-950 flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Tariff Plans' : 'Bảng Giá'}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Personal Record Editor Form */}
          <div className="lg:col-span-7 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#18201b] p-6 sm:p-7 shadow-[6px_6px_0px_#1a5336] dark:shadow-[6px_6px_0px_#2d6a4f] space-y-6">
            
            {/* Header */}
            <div className="border-b-2 border-stone-800 dark:border-stone-700 pb-3.5 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-serif font-black tracking-tight text-stone-900 dark:text-stone-100">
                  {isEn ? 'Modify Personal Records' : 'Chỉnh Sửa Thông Tin Cá Nhân'}
                </h2>
                <p className="text-xs font-mono text-stone-600 dark:text-stone-400 mt-0.5">
                  {isEn
                    ? 'Update your name, contact phone number, age, and residing province.'
                    : 'Cập nhật họ và tên, số điện thoại liên lạc, độ tuổi và tỉnh thành sinh sống.'}
                </p>
              </div>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-400 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold">
                [SECURE-ENTRY]
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase text-stone-800 dark:text-stone-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                    <span>{isEn ? 'Full Legal Name' : 'Họ và tên'}</span>
                    <span className="text-rose-600">*</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 font-normal">
                    {profile.name.length}/100
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder={isEn ? 'e.g. John Doe' : 'Ví dụ: Nguyễn Văn A'}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#121714] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-sans text-xs focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80] shadow-[2px_2px_0px_#1a5336] dark:shadow-[2px_2px_0px_#0e2a1b]"
                />
              </div>

              {/* Phone & Age Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold uppercase text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                    <span>{isEn ? 'Contact Phone' : 'Số điện thoại liên lạc'}</span>
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#121714] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono text-xs focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80] shadow-[2px_2px_0px_#1a5336] dark:shadow-[2px_2px_0px_#0e2a1b]"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold uppercase text-stone-800 dark:text-stone-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                      <span>{isEn ? 'Age (Years)' : 'Độ tuổi'}</span>
                    </span>
                    {profile.age && Number(profile.age) > 0 && (
                      <span className="text-[10px] font-mono text-stone-500">
                        {isEn ? 'Est. ' : 'Năm sinh ~'}
                        {new Date().getFullYear() - Number(profile.age)}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={profile.age}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        age: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    placeholder="28"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#121714] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono text-xs focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80] shadow-[2px_2px_0px_#1a5336] dark:shadow-[2px_2px_0px_#0e2a1b]"
                  />
                </div>
              </div>

              {/* Province Selection */}
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                  <span>{isEn ? 'Residing Province / Jurisdiction' : 'Tỉnh / Thành phố sinh sống'}</span>
                </label>
                <select
                  value={profile.province}
                  onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#121714] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-sans text-xs focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80] shadow-[2px_2px_0px_#1a5336] dark:shadow-[2px_2px_0px_#0e2a1b] cursor-pointer"
                >
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email (Read-only Note) */}
              <div className="p-3.5 bg-stone-100 dark:bg-stone-900/80 border-2 border-dashed border-stone-300 dark:border-stone-700 font-mono text-[11px] text-stone-600 dark:text-stone-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span>
                  {isEn ? 'AUTHENTICATION EMAIL:' : 'ĐỊA CHỈ EMAIL ĐĂNG KÝ:'}{' '}
                  <strong className="text-stone-900 dark:text-stone-200">{rawUser.email || '—'}</strong>
                </span>
                <span className="text-[10px] text-stone-500 uppercase font-bold">[LOCKED / KHÔNG THỂ ĐỔI]</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t-2 border-stone-800 dark:border-stone-700 flex flex-wrap items-center justify-end gap-3 font-mono">
                <Link
                  href="/"
                  className="px-4 py-2.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 font-bold uppercase tracking-wider text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  {isEn ? 'Cancel' : 'HỦY BỎ'}
                </Link>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] dark:hover:bg-[#3ec772] text-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs disabled:opacity-50 flex items-center gap-2 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{isEn ? 'SAVING DOSSIER...' : 'ĐANG LƯU HỒ SƠ...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEn ? 'SAVE PROFILE CHANGES' : 'LƯU THAY ĐỔI'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Apply for Lawyer Role */}
        <RequestLawyerModal
          isOpen={isRequestLawyerModalOpen}
          onClose={() => setIsRequestLawyerModalOpen(false)}
          currentUser={rawUser}
          onSuccess={() => {
            refetchMe();
            loadUserData();
          }}
        />
      </div>
    </div>
  );
}