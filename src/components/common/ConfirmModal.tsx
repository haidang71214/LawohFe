'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2, Info } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const defaultTitle =
    variant === 'danger'
      ? isEn
        ? 'Confirm Deletion'
        : 'Xác nhận xóa'
      : isEn
      ? 'Confirmation Required'
      : 'Xác nhận thao tác';

  const defaultConfirmText =
    variant === 'danger'
      ? isEn
        ? 'Delete'
        : 'Xác nhận xóa'
      : isEn
      ? 'Confirm'
      : 'Đồng ý';

  const defaultCancelText = isEn ? 'Cancel' : 'Hủy bỏ';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={isLoading ? undefined : onClose}
        className="fixed inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#faf7f2] dark:bg-[#181614] border-2 border-stone-800 dark:border-stone-600 shadow-[6px_6px_0px_#1c1917] dark:shadow-[6px_6px_0px_#000000] p-6 space-y-5 animate-modal-pop z-10 text-stone-900 dark:text-stone-100 font-sans">
        
        {/* Top Bar Docket Marker */}
        <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700/80 pb-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest text-[#d95327]">
            <span className="inline-block w-2 h-2 bg-[#d95327]"></span>
            <span>[DOCKET-ACTION-VERIFICATION]</span>
          </div>

          <button
            onClick={isLoading ? undefined : onClose}
            disabled={isLoading}
            className="p-1 border border-stone-400 dark:border-stone-600 hover:bg-stone-800 hover:text-white dark:hover:bg-stone-200 dark:hover:text-stone-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 border-2 border-stone-800 dark:border-stone-600 shrink-0 shadow-[2px_2px_0px_#000] ${
              variant === 'danger'
                ? 'bg-[#b91c1c] text-white'
                : variant === 'warning'
                ? 'bg-[#b45309] text-white'
                : 'bg-[#1e3a8a] text-white'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-5 h-5" />
            ) : variant === 'warning' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="font-serif font-black text-lg tracking-tight leading-snug">
              {title || defaultTitle}
            </h3>
            {description && (
              <p className="font-mono text-xs text-stone-600 dark:text-stone-400 leading-relaxed break-words">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-300 dark:border-stone-700/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border-2 border-stone-800 dark:border-stone-600 bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs font-bold uppercase tracking-wider hover:bg-stone-300 dark:hover:bg-stone-700 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText || defaultCancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 border-2 border-stone-800 dark:border-stone-600 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-[#b91c1c] hover:bg-[#991b1b]'
                : variant === 'warning'
                ? 'bg-[#b45309] hover:bg-[#92400e]'
                : 'bg-[#1e3a8a] hover:bg-[#1e40af]'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText || defaultConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
