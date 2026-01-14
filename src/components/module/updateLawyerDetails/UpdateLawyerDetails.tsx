'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { USER_PROFILE, LOGIN_USER } from '@/constants/enum';
import { useGetLawyerByIdQuery, useUpdateLawyerMeMutation } from '@/store/queries/lawyer';
import { useCreateCustomPriceMutation } from '@/store/queries/priceRange';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatVND } from '@/lib/formatCurrency';
import { MoneyInput } from '@/components/common/MoneyInput';
import toast from '@/lib/toast';
import {
  Edit2,
  Award,
  MapPin,
  Mail,
  Phone,
  X,
  Check,
  RotateCw,
  ArrowLeft,
  DollarSign,
  FileCheck,
  Plus,
  Briefcase,
  Star,
  Upload,
  Eye,
  Trash2,
  BookOpen,
  Receipt,
} from 'lucide-react';

interface FormDataState {
  description: string;
  type_lawyer: string[];
  sub_type_lawyers: string;
  experienceYear: number;
  existingCertificates: string[];
}

export default function UpdateLawyerDetailInformation() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const certFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userProfileStr = localStorage.getItem(USER_PROFILE) || localStorage.getItem(LOGIN_USER);
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        setCurrentUser(userProfile);
        if (userProfile?._id) setLawyerId(userProfile._id);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const { data: lawyerDataResponse, isLoading: loading, refetch: refetchLawyer } = useGetLawyerByIdQuery(
    lawyerId || '',
    { skip: !lawyerId }
  );
  const [updateLawyerMeMutation, { isLoading: isUpdating }] = useUpdateLawyerMeMutation();
  const [createCustomPriceMutation, { isLoading: isSavingPrice }] = useCreateCustomPriceMutation();

  const [lawyer, setLawyer] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [priceForm, setPriceForm] = useState({ price: 0, description: '' });

  // Form State
  const [formData, setFormData] = useState<FormDataState>({
    description: '',
    type_lawyer: [],
    sub_type_lawyers: '',
    experienceYear: 0,
    existingCertificates: [],
  });

  // New certificate image files to upload
  const [newCertFiles, setNewCertFiles] = useState<{ file: File; preview: string }[]>([]);

  useEffect(() => {
    const raw = lawyerDataResponse?.data || lawyerDataResponse;
    if (raw && (raw as any)._id) {
      const data: any = raw;
      setLawyer(data);

      const certs = Array.isArray(data.certificate)
        ? data.certificate
        : data.certificate
        ? [data.certificate]
        : [];

      setFormData({
        description: data.description || '',
        type_lawyer: data.typeLawyer?.type || (Array.isArray(data.type_lawyer) ? data.type_lawyer : []),
        sub_type_lawyers: data.subTypes?.length ? data.subTypes[0]?.subType.join(', ') : '',
        experienceYear: data.experienceYear || 0,
        existingCertificates: certs,
      });
    }
  }, [lawyerDataResponse]);

  const handleToggleSpecialty = (typeKey: string) => {
    setFormData((prev) => {
      const exists = prev.type_lawyer.includes(typeKey);
      const updated = exists
        ? prev.type_lawyer.filter((k) => k !== typeKey)
        : [...prev.type_lawyer, typeKey];
      return { ...prev, type_lawyer: updated };
    });
  };

  // Handle certificate image file selection
  const handleCertFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const newItems = filesArr.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
      }));
      setNewCertFiles((prev) => [...prev, ...newItems]);
    }
  };

  const removeNewCertFile = (idx: number) => {
    setNewCertFiles((prev) => {
      const item = prev[idx];
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingCertificate = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      existingCertificates: prev.existingCertificates.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.warning(isEn ? 'Please enter introduction bio' : 'Vui lòng nhập phần mô tả giới thiệu');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('description', formData.description.trim());
      payload.append('experienceYear', String(formData.experienceYear || 0));

      formData.type_lawyer.forEach((tKey) => {
        payload.append('type_lawyer', tKey);
      });

      formData.sub_type_lawyers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((st) => {
          payload.append('sub_type_lawyers', st);
        });

      formData.existingCertificates.forEach((certUrl) => {
        payload.append('certificate', certUrl);
      });

      newCertFiles.forEach((item) => {
        payload.append('certificate_files', item.file);
      });

      await updateLawyerMeMutation(payload).unwrap();
      toast.success(isEn ? 'Lawyer Profile Updated' : 'Cập nhật hồ sơ & bằng cấp thành công!');
      
      newCertFiles.forEach((item) => URL.revokeObjectURL(item.preview));
      setNewCertFiles([]);
      
      refetchLawyer();
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(
        isEn ? 'Update Failed' : 'Lỗi cập nhật',
        err?.data?.message || (isEn ? 'Failed to update credentials' : 'Cập nhật thất bại')
      );
    }
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || priceForm.price <= 0) {
      toast.warning(isEn ? 'Please enter a valid price' : 'Vui lòng nhập mức giá hợp lệ');
      return;
    }

    try {
      setLawyer((prev: any) => {
        if (!prev) return prev;
        const oldPrices = Array.isArray(prev.customPrice) ? prev.customPrice : [];
        const filtered = oldPrices.filter((p: any) => p.type !== selectedType);
        return {
          ...prev,
          customPrice: [
            ...filtered,
            {
              type: selectedType,
              price: priceForm.price,
              description: priceForm.description || 'Tư vấn pháp lý chuyên sâu',
            },
          ],
        };
      });

      await createCustomPriceMutation({
        type: selectedType,
        price: priceForm.price,
        description: priceForm.description || 'Tư vấn pháp lý chuyên sâu',
      }).unwrap();

      toast.success(
        isEn ? 'Fee Schedule Saved' : 'Thiết lập biểu phí thành công!',
        `${(LawyerCategoriesVietnamese as any)[selectedType] || selectedType}: ${formatVND(priceForm.price)}`
      );
      refetchLawyer();
      setIsPriceModalOpen(false);
    } catch (err: any) {
      toast.error(
        isEn ? 'Error' : 'Lỗi',
        err?.data?.message || (isEn ? 'Failed to save fee' : 'Không thể lưu biểu phí')
      );
    }
  };

  const specializations = formData.type_lawyer || [];
  const displayName = lawyer?.name || currentUser?.name || 'Luật sư Thành viên';
  const displayEmail = lawyer?.email || currentUser?.email || '—';
  const displayPhone = lawyer?.phone || currentUser?.phone || '';
  const displayProvince = lawyer?.province || currentUser?.province || 'TP. Hà Nội';

  const avatarSrc =
    lawyer?.avartar_url ||
    lawyer?.avatar_url ||
    lawyer?.avatar ||
    currentUser?.avartar_url ||
    currentUser?.avatar_url ||
    currentUser?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=1e4f35&textColor=ffffff`;

  const allCertificates = [
    ...(formData.existingCertificates || []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8f4] dark:bg-[#0f1511] flex items-center justify-center font-mono text-xs text-stone-500">
        <RotateCw className="w-5 h-5 animate-spin text-[#1e4f35]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f4] dark:bg-[#0f1511] text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 font-sans space-y-8 max-w-6xl mx-auto transition-colors duration-200">
      {/* Top Header Breadcrumb */}
      <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-800 pb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:text-[#1e4f35] dark:hover:text-[#4ade80] px-3 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? 'Back to Portal' : 'Quay về Trang chủ'}</span>
        </Link>
        <button
          onClick={() => refetchLawyer()}
          className="p-1.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-[2px_2px_0px_#000]"
          title="Tải lại dữ liệu"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hero Lawyer Profile Header */}
      <div className="border-2 border-stone-800 dark:border-[#2d6a4f] bg-white dark:bg-[#141b16] p-6 sm:p-7 shadow-[6px_6px_0px_#1e4f35] dark:shadow-[6px_6px_0px_#2d6a4f] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-dashed border-stone-300 dark:border-stone-700 pb-3 font-mono text-[10px] uppercase text-stone-500">
          <span>[DOCKET: ADVOCATE-CREDENTIALS-2026]</span>
          <span className="text-[#1e4f35] dark:text-[#4ade80] font-bold">BAR ASSOCIATION RECORD</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-20 h-20 rounded-none object-cover border-2 border-stone-800 dark:border-stone-600 shadow-[3px_3px_0px_#000] shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=LS&backgroundColor=1e4f35&textColor=ffffff`;
              }}
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
                  {displayName}
                </h1>
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 border-2 border-[#1e4f35] dark:border-[#4ade80] bg-[#1e4f35]/10 text-[#1e4f35] dark:text-[#4ade80]">
                  {isEn ? 'CERTIFIED ADVOCATE' : 'LUẬT SƯ CHÍNH NGẠCH'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-stone-600 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1e4f35] dark:text-[#4ade80]" />
                  {isEn ? `${displayProvince} Bar Association` : `Đoàn Luật sư ${displayProvince}`}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#1e4f35] dark:text-[#4ade80]" />
                  {formData.experienceYear} {isEn ? 'years experience' : 'năm kinh nghiệm'}
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {lawyer?.star ? Number(lawyer.star).toFixed(1) : '5.0'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2.5 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1e4f35] dark:bg-[#4ade80] hover:bg-[#2d6a4f] text-white dark:text-stone-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEn ? 'Edit Profile & Credentials' : 'Chỉnh Sửa Hồ Sơ & Bằng Cấp'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Bio & Pricing) & Right 1 Col (Certificates & Contacts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio & Specialties */}
          <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-6 shadow-[4px_4px_0px_#1e4f35] space-y-4">
            <div className="border-b-2 border-stone-800 dark:border-stone-700 pb-2 flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1e4f35] dark:text-[#4ade80]" />
                <span>{isEn ? 'Practice Profile & Specialties' : 'Hồ Sơ Năng Lực & Lĩnh Vực Hành Nghề'}</span>
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-stone-500">
                  {isEn ? 'Introduction & Bio' : 'Mô tả giới thiệu'}
                </span>
                <div className="mt-1.5 p-4 border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#0f1511] text-stone-800 dark:text-stone-300 font-sans leading-relaxed">
                  {formData.description ? (
                    formData.description
                  ) : (
                    <div className="flex items-center justify-between text-stone-500">
                      <span>{isEn ? 'No bio updated yet.' : 'Chưa cập nhật phần giới thiệu cá nhân.'}</span>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-[#1e4f35] dark:text-[#4ade80] font-mono font-bold uppercase underline text-[11px]"
                      >
                        {isEn ? '+ Add bio' : '+ Thêm mô tả'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-stone-500">
                  {isEn ? 'Areas of Expertise' : 'Lĩnh vực chuyên sâu'}
                </span>
                <div className="mt-1.5">
                  {specializations.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#0f1511] flex items-center justify-between text-stone-500">
                      <span>{isEn ? 'No practice areas registered yet.' : 'Chưa đăng ký lĩnh vực chuyên môn.'}</span>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-[#1e4f35] dark:text-[#4ade80] font-mono font-bold uppercase underline text-[11px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isEn ? 'Select areas' : 'Chọn lĩnh vực'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((type: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 border border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 font-mono text-[11px] font-bold uppercase text-stone-800 dark:text-stone-200"
                        >
                          [{t(`categories.${type}`, (LawyerCategoriesVietnamese as any)[type] || type)}]
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-6 shadow-[4px_4px_0px_#1e4f35] space-y-4">
            <div className="border-b-2 border-stone-800 dark:border-stone-700 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#1e4f35] dark:text-[#4ade80]" />
                  <span>{isEn ? 'Consultation Rates by Specialty' : 'Biểu Phí Tham Vấn Theo Lĩnh Vực'}</span>
                </h2>
                <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                  {isEn
                    ? 'Listed fee applicable per 30-minute consultation session'
                    : 'Mức thù lao niêm yết áp dụng cho mỗi phiên làm việc 30 phút'}
                </p>
              </div>
            </div>

            {specializations.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#0f1511] text-center space-y-2 text-xs">
                <DollarSign className="w-6 h-6 mx-auto text-stone-400" />
                <p className="font-serif font-bold text-stone-900 dark:text-stone-100">
                  {isEn ? 'No practice areas registered' : 'Chưa đăng ký lĩnh vực chuyên môn'}
                </p>
                <p className="text-stone-500 text-[11px] max-w-sm mx-auto">
                  {isEn
                    ? 'Select legal specialties to configure your consultation tariff rates.'
                    : 'Hãy chọn các lĩnh vực pháp lý chuyên sâu để bắt đầu cài đặt biểu phí tư vấn.'}
                </p>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-stone-800 bg-[#1e4f35] text-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Register Practice Areas' : 'Đăng ký lĩnh vực tư vấn'}</span>
                </button>
              </div>
            ) : (
              <div className="border-2 border-stone-800 dark:border-stone-700 divide-y-2 divide-stone-800 dark:divide-stone-700 bg-stone-50 dark:bg-[#0f1511]">
                {specializations.map((type: string, idx: number) => {
                  const priceEntry = (lawyer?.customPrice || []).find((p: any) => p.type === type);
                  return (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-100 dark:hover:bg-[#1a221d] transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                          {t(`categories.${type}`, (LawyerCategoriesVietnamese as any)[type] || type)}
                        </p>
                        <p className="text-[11px] text-stone-500 font-sans">
                          {priceEntry?.description || (isEn ? '30-minute in-depth consultation' : 'Tư vấn chuyên sâu 30 phút')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#1e4f35] dark:text-[#4ade80]">
                          {priceEntry ? formatVND(priceEntry.price) : (isEn ? 'Not configured' : 'Chưa thiết lập')}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedType(type);
                            setPriceForm({
                              price: priceEntry?.price || 0,
                              description: priceEntry?.description || '',
                            });
                            setIsPriceModalOpen(true);
                          }}
                          className="px-3 py-1.5 border border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-200 text-stone-900 dark:text-stone-100 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_#000]"
                        >
                          {priceEntry ? (isEn ? 'Change Rate' : 'Đổi giá') : (isEn ? 'Set Rate' : 'Cài đặt')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Certificates & Verification Gallery */}
        <div className="space-y-6">
          {/* Certificate Gallery Card */}
          <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-5 shadow-[4px_4px_0px_#1e4f35] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-stone-800 dark:border-stone-700">
              <h2 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{isEn ? 'Credentials & Bar Card' : 'Bằng Cấp & Thẻ Luật Sư'}</span>
              </h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[11px] font-mono font-bold uppercase text-[#1e4f35] dark:text-[#4ade80] underline"
              >
                {isEn ? '+ Add' : '+ Thêm'}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {allCertificates.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {allCertificates.map((certUrl: string, i: number) => {
                    const isImg = certUrl.startsWith('http') || certUrl.startsWith('/') || certUrl.startsWith('data:');
                    return (
                      <div
                        key={i}
                        className="group relative border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 overflow-hidden cursor-pointer"
                        onClick={() => {
                          if (isImg) setPreviewImageModal(certUrl);
                        }}
                      >
                        {isImg ? (
                          <div className="aspect-4/3 overflow-hidden bg-black/40 flex items-center justify-center">
                            <img
                              src={certUrl}
                              alt={`Certificate ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 flex items-center gap-2 text-stone-900 dark:text-stone-100 font-mono">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-[11px] font-bold line-clamp-2">{certUrl}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#0f1511] text-center text-stone-500 space-y-1.5">
                  <Award className="w-6 h-6 mx-auto opacity-40 text-stone-400" />
                  <p className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
                    {isEn ? 'No certificate images uploaded yet' : 'Chưa tải lên ảnh chứng chỉ/bằng cấp'}
                  </p>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-[#1e4f35] dark:text-[#4ade80] font-mono font-bold uppercase underline text-[11px]"
                  >
                    {isEn ? '+ Upload bar card / certificates' : '+ Tải ảnh bằng cấp / thẻ luật sư'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-5 shadow-[4px_4px_0px_#1e4f35] space-y-3 text-xs">
            <h2 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              {isEn ? 'Registered Contact Channels' : 'Kênh Liên Lạc Đã Đăng Ký'}
            </h2>
            <div className="space-y-2 text-stone-700 dark:text-stone-300 font-mono text-[11px]">
              <div className="flex items-center gap-2 p-2.5 border border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0f1511]">
                <Mail className="w-3.5 h-3.5 text-[#1e4f35] dark:text-[#4ade80] shrink-0" />
                <span className="truncate">{displayEmail}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 border border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0f1511]">
                <Phone className="w-3.5 h-3.5 text-[#1e4f35] dark:text-[#4ade80] shrink-0" />
                <span>{displayPhone ? `0${displayPhone}` : (isEn ? 'No phone number updated' : 'Chưa cập nhật SĐT')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Certificates Modal with File Upload */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-xl border-2 border-stone-800 dark:border-[#4ade80] bg-[#f7f8f4] dark:bg-[#141b16] p-6 shadow-[8px_8px_0px_#1e4f35] space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700">
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] text-[#1e4f35] dark:text-[#4ade80] font-bold uppercase">
                  [DOCKET: CREDENTIALS-UPDATE]
                </span>
                <h3 className="font-serif font-black text-lg text-stone-900 dark:text-stone-50">
                  {isEn ? 'Update Lawyer Profile & Credentials' : 'Cập Nhật Bằng Cấp & Hồ Sơ Luật Sư'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 border border-stone-800 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Practice Areas Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {isEn ? 'Select Practice Areas *' : 'Chọn lĩnh vực tư vấn chuyên sâu *'}
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0f1511]">
                  {Object.entries(LawyerCategoriesVietnamese).map(([key, label]) => {
                    const isSelected = formData.type_lawyer.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleToggleSpecialty(key)}
                        className={`p-2 text-left text-xs font-mono font-bold transition-all flex items-center justify-between border ${
                          isSelected
                            ? 'bg-[#1e4f35] text-white border-stone-900 shadow-[1px_1px_0px_#000]'
                            : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="truncate">{t(`categories.${key}`, label)}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {isEn ? 'Professional Bio & Experience *' : 'Mô tả giới thiệu kinh nghiệm *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={
                    isEn
                      ? 'Specialized in civil litigation, corporate contracts, and land property...'
                      : 'Chuyên sâu tư vấn tố tụng dân sự, hợp đồng thương mại và đất đai...'
                  }
                  className="w-full p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0f1511] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#1e4f35]"
                />
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {isEn ? 'Years of Practice Experience' : 'Số năm kinh nghiệm hành nghề'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.experienceYear}
                  onChange={(e) => setFormData({ ...formData, experienceYear: Number(e.target.value) })}
                  className="w-full p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0f1511] text-stone-900 dark:text-stone-100 font-mono focus:outline-none focus:border-[#1e4f35]"
                />
              </div>

              {/* Certificate Files Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                    {isEn ? 'Lawyer Bar Card & Degree Scans' : 'Ảnh chụp Thẻ Luật sư & Bằng cấp chuyên môn'}
                  </label>
                  <span className="text-[10px] font-mono text-stone-500">PNG, JPG, WebP</span>
                </div>

                <input
                  type="file"
                  ref={certFileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleCertFilesChange}
                  className="hidden"
                />

                <div
                  onClick={() => certFileInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-stone-800 dark:border-stone-600 bg-white dark:bg-[#0f1511] text-center cursor-pointer transition-colors space-y-1"
                >
                  <Upload className="w-5 h-5 mx-auto text-[#1e4f35] dark:text-[#4ade80]" />
                  <p className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 uppercase">
                    {isEn ? 'Click to upload credential / certificate images' : 'Bấm để tải thêm ảnh bằng cấp / chứng chỉ'}
                  </p>
                  <p className="text-[10px] font-mono text-stone-500">
                    {isEn ? 'Supports uploading multiple images at once' : 'Hỗ trợ tải nhiều ảnh cùng lúc'}
                  </p>
                </div>

                {/* Preview Selected & Existing Files */}
                {(formData.existingCertificates.length > 0 || newCertFiles.length > 0) && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {formData.existingCertificates.map((url, i) => (
                      <div key={`exist-${i}`} className="relative aspect-video border-2 border-stone-800 dark:border-stone-700 overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingCertificate(i)}
                          className="absolute top-1 right-1 p-1 bg-stone-900 text-white hover:bg-rose-600 transition-colors"
                          title={isEn ? 'Remove image' : 'Xóa ảnh'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {newCertFiles.map((item, i) => (
                      <div key={`new-${i}`} className="relative aspect-video border-2 border-emerald-600 overflow-hidden group">
                        <img src={item.preview} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1 py-0.2 font-mono text-[8px] bg-emerald-600 text-white font-bold">
                          NEW
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewCertFile(i)}
                          className="absolute top-1 right-1 p-1 bg-stone-900 text-white hover:bg-rose-600 transition-colors"
                          title={isEn ? 'Deselect' : 'Bỏ chọn'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-stone-800 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 border-2 border-stone-800 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono font-bold uppercase hover:bg-stone-200"
                >
                  {isEn ? 'Cancel' : 'Hủy bỏ'}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1e4f35] dark:bg-[#4ade80] hover:bg-[#2d6a4f] text-white dark:text-stone-950 font-mono font-bold uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_#000]"
                >
                  {isUpdating ? (isEn ? 'Uploading...' : 'Đang tải lên...') : (isEn ? 'Save Profile & Credentials' : 'Lưu Hồ Sơ & Bằng Cấp')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Price Modal */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
            onClick={() => setIsPriceModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md border-2 border-stone-800 dark:border-[#4ade80] bg-[#f7f8f4] dark:bg-[#141b16] p-6 shadow-[8px_8px_0px_#1e4f35] space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700">
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] text-[#1e4f35] dark:text-[#4ade80] font-bold uppercase">
                  [TARIFF SCHEDULE]
                </span>
                <h3 className="font-serif font-black text-base text-stone-900 dark:text-stone-50">
                  {isEn ? 'Set Consultation Tariff' : 'Cài Đặt Biểu Phí Tham Vấn'}
                </h3>
              </div>
              <button
                onClick={() => setIsPriceModalOpen(false)}
                className="p-1 border border-stone-800 dark:border-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                    {isEn ? 'Consultation Fee (VND) *' : 'Mức phí tư vấn (VNĐ) *'}
                  </label>
                  <span className="text-[10px] font-mono text-stone-500">
                    {isEn ? '[Unit: VND / 30-min session]' : '[Đơn vị: VNĐ / phiên 30 phút]'}
                  </span>
                </div>
                <MoneyInput
                  required
                  value={priceForm.price > 0 ? priceForm.price : ''}
                  onValueChange={(_, numeric) =>
                    setPriceForm((prev) => ({
                      ...prev,
                      price: numeric,
                    }))
                  }
                  placeholder="200.000"
                  suffix="VNĐ"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                    {isEn ? 'Consultation Scope / Notes' : 'Mô tả phạm vi tư vấn'}
                  </label>
                  <span className="text-[10px] font-mono text-stone-500">
                    {isEn ? '30 mins per session' : 'Mặc định: 30 phút/phiên'}
                  </span>
                </div>
                <input
                  type="text"
                  value={priceForm.description}
                  onChange={(e) => setPriceForm({ ...priceForm, description: e.target.value })}
                  placeholder={
                    isEn
                      ? 'E.g.: 30-minute in-depth consultation via HD video, document review...'
                      : 'Ví dụ: Tư vấn chuyên sâu 30 phút qua video call, xem xét hồ sơ...'
                  }
                  className="w-full p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0f1511] text-stone-900 dark:text-stone-100 font-sans placeholder:text-stone-400 focus:outline-none focus:border-[#1e4f35]"
                />
                <p className="text-[10px] text-stone-500 font-mono">
                  {isEn
                    ? '💡 Note: Each consultation session is standardized at 30 minutes. Enter a short description for clients.'
                    : '💡 Ghi chú: Mỗi phiên tư vấn được chuẩn hóa là 30 phút. Nhập mô tả ngắn gọn nội dung phiên tư vấn cho khách hàng.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-stone-800 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-3.5 py-1.5 border-2 border-stone-800 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono font-bold uppercase hover:bg-stone-200"
                >
                  {isEn ? 'Cancel' : 'Hủy bỏ'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingPrice}
                  className="px-4 py-1.5 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1e4f35] dark:bg-[#4ade80] hover:bg-[#2d6a4f] text-white dark:text-stone-950 font-mono font-bold uppercase shadow-[3px_3px_0px_#000]"
                >
                  {isSavingPrice ? (isEn ? 'Saving...' : 'Đang lưu...') : (isEn ? 'Save Rate' : 'Lưu Mức Giá')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Certificate Image Lightbox Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xs"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] border-2 border-stone-200 p-2 bg-[#12100e]" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImageModal}
              alt="Full certificate view"
              className="max-w-full max-h-[85vh] object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-3 -right-3 p-1.5 bg-stone-900 hover:bg-stone-800 border-2 border-white text-white shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}