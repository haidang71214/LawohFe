'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, RotateCw, } from 'lucide-react';
import { useCreateVideoMutation } from '@/store/queries/video';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

export enum VideoLawCategory {
  INSURANCE = 'INSURANCE',
  CIVIL = 'CIVIL',
  LAND = 'LAND',
  CORPORATE = 'CORPORATE',
  TRANSPORTATION = 'TRANSPORTATION',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  CRIMINAL = 'CRIMINAL',
  FAMILY = 'FAMILY',
  LABOR = 'LABOR',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  INHERITANCE = 'INHERITANCE',
  TAX = 'TAX',
}

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (video: any) => void;
}

const CreateVideoModal: React.FC<CreateVideoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [categories, setCategories] = useState<string>('CIVIL');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [createVideoMutation, { isLoading: isUploading }] = useCreateVideoMutation();

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleThumbnailChange = (file: File | null) => {
    setThumbnail(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.warning(isEn ? 'Please select a video file (MP4/WebM)' : 'Vui lòng chọn tệp băng hình (MP4/WebM)');
      return;
    }

    if (!description.trim()) {
      toast.warning(isEn ? 'Please enter a video description or topic' : 'Vui lòng nhập mô tả chủ đề băng hình');
      return;
    }

    const formData = new FormData();
    formData.append('description', description.trim());
    formData.append('title', description.trim());
    formData.append('name', description.trim());
    formData.append('categories', categories);
    if (thumbnail) {
      formData.append('thubnail', thumbnail);
      formData.append('thumbnail', thumbnail);
    }
    formData.append('video', videoFile);

    try {
      const response = await createVideoMutation(formData).unwrap();
      toast.success(
        isEn ? 'Tape Uploaded' : 'Đã nộp băng hình thành công',
        isEn ? 'Your video has been submitted for moderation.' : 'Tư liệu đã được gửi tới hội đồng kiểm duyệt nội dung.'
      );

      if (onSubmit) {
        onSubmit(response?.data || response);
      }

      onClose();
    } catch (err: any) {
      toast.error(
        isEn ? 'Upload Failed' : 'Tải lên thất bại',
        err?.data?.message || (isEn ? 'Failed to upload video' : 'Không thể tải lên băng hình. Vui lòng thử lại.')
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
        onClick={onClose}
      ></div>

      {/* Retro Modal Dialog */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg border-2 border-stone-800 dark:border-[#f59e0b] bg-[#faf6ee] dark:bg-[#1d1813] p-6 sm:p-7 shadow-[8px_8px_0px_#b45309] space-y-4 text-xs max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700">
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] text-[#b45309] dark:text-[#f59e0b] font-bold uppercase">
              [FORM: TAPE-SUBMISSION-2026]
            </span>
            <h3 className="font-serif font-black text-lg text-stone-900 dark:text-stone-50">
              {isEn ? 'Register Legal Video Tape Publication' : 'Đăng Ký Phát Hành Băng Hình Pháp Luật'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-stone-800 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
              {isEn ? 'Specialized Legal Domain *' : 'Lĩnh vực chuyên môn *'}
            </label>
            <select
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#14100c] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b45309] dark:focus:border-[#f59e0b]"
            >
              {Object.entries(LawyerCategoriesVietnamese).map(([key, label]) => (
                <option key={key} value={key}>
                  {t(`categories.${key}`, label)} ({key})
                </option>
              ))}
            </select>
          </div>

          {/* Video File Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
              {isEn ? 'Video Tape File (MP4, WebM, MOV) *' : 'Tệp Băng Hình (MP4, WebM, MOV) *'}
            </label>
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
            <div
              onClick={() => videoInputRef.current?.click()}
              className={`p-5 border-2 border-dashed transition-all cursor-pointer text-center space-y-1.5 ${
                videoFile
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'border-stone-800 dark:border-stone-700 hover:border-[#b45309] bg-white dark:bg-[#14100c]'
              }`}
            >
              <div className="w-8 h-8 border border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-[#b45309]">
                <Upload className="w-4 h-4" />
              </div>
              {videoFile ? (
                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-xs mx-auto">
                    {videoFile.name}
                  </p>
                  <p className="text-[10px] font-mono text-stone-500">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • {isEn ? 'Click to replace file' : 'Bấm để đổi tệp khác'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 uppercase">
                    {isEn ? 'Click to upload video tape from device' : 'Bấm để nạp tệp băng hình từ máy'}
                  </p>
                  <p className="text-[10px] font-mono text-stone-500">
                    {isEn ? 'MP4, WebM up to 200MB' : 'MP4, WebM tối đa 200MB'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Image Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
              {isEn ? 'Cover Thumbnail Image (Optional)' : 'Ảnh Bìa Đại Diện (Tùy chọn)'}
            </label>
            <input
              type="file"
              ref={thumbInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleThumbnailChange(e.target.files?.[0] || null)}
            />
            <div
              onClick={() => thumbInputRef.current?.click()}
              className="p-3 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#14100c] flex items-center gap-3 cursor-pointer"
            >
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-16 h-10 object-cover border border-stone-800 shrink-0"
                />
              ) : (
                <div className="w-16 h-10 border border-stone-400 bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-500 shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 truncate">
                  {thumbnail ? thumbnail.name : (isEn ? 'Select cover thumbnail' : 'Chọn ảnh bìa đại diện')}
                </p>
                <p className="text-[10px] font-mono text-stone-500">
                  {isEn ? 'PNG, JPG ratio 16:9' : 'PNG, JPG tỉ lệ 16:9'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
              {isEn ? 'Topic & Synopsis *' : 'Chủ đề & Nội dung tóm tắt *'}
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isEn
                  ? "E.g.: Guide on land dispute conciliation procedures at commune-level People's Committees..."
                  : 'Ví dụ: Hướng dẫn thủ tục hòa giải tranh chấp đất đai tại UBND cấp xã...'
              }
              className="w-full p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#14100c] text-stone-900 dark:text-stone-100 font-sans placeholder:text-stone-400 focus:outline-none focus:border-[#b45309] dark:focus:border-[#f59e0b]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-stone-800 dark:border-stone-700">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border-2 border-stone-800 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono font-bold uppercase hover:bg-stone-200"
          >
            {isEn ? 'Cancel' : 'Hủy bỏ'}
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-4 py-1.5 border-2 border-stone-800 dark:border-[#f59e0b] bg-[#b45309] dark:bg-[#f59e0b] hover:bg-[#d97706] text-white dark:text-stone-950 font-mono font-bold uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_#78350f]"
          >
            {isUploading ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isEn ? 'Submitting...' : 'Đang xử lý nộp...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>{isEn ? 'Submit Tape for Review' : 'Nộp Băng Hình Duyệt'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVideoModal;