'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Award,
  UploadCloud,
  FileText,
  Briefcase,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useUpdateLawyerMeMutation } from '@/store/queries/lawyer';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

interface RequestLawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onSuccess?: () => void;
}

const LAWYER_SPECIALTIES = [
  { value: 'CIVIL', label: 'Dân sự' },
  { value: 'CRIMINAL', label: 'Hình sự' },
  { value: 'LAND', label: 'Đất đai & Bất động sản' },
  { value: 'BUSINESS', label: 'Doanh nghiệp & Thương mại' },
  { value: 'FAMILY', label: 'Hôn nhân & Gia đình' },
  { value: 'LABOR', label: 'Lao động & Bảo hiểm' },
  { value: 'INTELLECTUAL_PROPERTY', label: 'Sở hữu trí tuệ' },
  { value: 'TAX', label: 'Thuế & Tài chính' },
  { value: 'ADMINISTRATIVE', label: 'Hành chính' },
];

export const RequestLawyerModal: React.FC<RequestLawyerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [updateLawyerMe, { isLoading }] = useUpdateLawyerMeMutation();

  const [specialty, setSpecialty] = useState('CIVIL');
  const [experienceYear, setExperienceYear] = useState<number>(3);
  const [lawFirm, setLawFirm] = useState('');
  const [bio, setBio] = useState('');
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArr = Array.from(files);
      setCertificateFiles((prev) => [...prev, ...fileArr]);
      const newUrls = fileArr.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newUrls]);
    }
  };

  const removeFile = (index: number) => {
    setCertificateFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lawFirm.trim()) {
      toast.error('Vui lòng nhập đơn vị / công ty luật đang công tác');
      return;
    }

    if (!bio.trim()) {
      toast.error('Vui lòng giới thiệu tóm tắt năng lực kinh nghiệm');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('typeLawyer', specialty);
      formData.append('experienceYear', experienceYear.toString());
      formData.append('company', lawFirm.trim());
      formData.append('bio', bio.trim());
      formData.append('isAccept', 'false'); // pending verification

      certificateFiles.forEach((file) => {
        formData.append('images', file);
      });

      await updateLawyerMe(formData).unwrap();
      toast.success(
        isEn ? 'Verification request sent' : 'Gửi yêu cầu xác minh thành công',
        isEn
          ? 'Our team will review your lawyer credentials within 24 hours.'
          : 'Hồ sơ của bạn đang được ban quản trị xét duyệt trong vòng 24 giờ.'
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        isEn ? 'Failed to submit request' : 'Gửi yêu cầu thất bại',
        err?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Đăng ký tài khoản Luật sư</h3>
              <p className="text-xs text-slate-500">
                Xác thực chứng chỉ hành nghề để tư vấn pháp lý và tiếp nhận khách hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Tài khoản Luật sư được cấp dấu huy hiệu xác thực, nhận yêu cầu tư vấn trực tuyến và đăng tải án lệ trên nền tảng.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Lĩnh vực chuyên môn</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {LAWYER_SPECIALTIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Số năm kinh nghiệm</label>
              <input
                type="number"
                min="1"
                max="60"
                value={experienceYear}
                onChange={(e) => setExperienceYear(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Công ty Luật / Văn phòng Luật sư công tác <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ví dụ: Công ty Luật TNHH MTV ABC - Đoàn Luật sư TP.HCM"
                value={lawFirm}
                onChange={(e) => setLawFirm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Tóm tắt hồ sơ & Năng lực hành nghề <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Giới thiệu kinh nghiệm tham gia tranh tụng, tư vấn hợp đồng, các vụ việc tiêu biểu..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Certificate Images */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Chứng chỉ hành nghề / Thẻ luật sư (Hình ảnh minh chứng)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50"
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFilesSelect}
              />
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-700">Tải lên Thẻ luật sư hoặc Bằng cử nhân luật</p>
              <p className="text-[11px] text-slate-400">Định dạng JPG, PNG, tối đa 5MB mỗi ảnh</p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden group border border-slate-200 h-20">
                    <img src={url} alt="Cert" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              {isLoading ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ xét duyệt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RequestLawyerModal;
