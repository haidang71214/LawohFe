'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

interface DocumentViewerModalProps {
  doc: {
    title?: string;
    type?: string;
    description?: string;
    uri?: string;
    uri_secure?: string;
    createdAt?: string;
  } | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ doc, onClose }) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const docContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileUrl = doc?.uri || doc?.uri_secure || '';
  const isPdf = fileUrl.toLowerCase().includes('.pdf');
  const isDoc = fileUrl.toLowerCase().includes('.doc') || fileUrl.toLowerCase().includes('.docx') || !isPdf;

  useEffect(() => {
    if (!doc || !fileUrl) return;

    let isMounted = true;
    setIsLoading(true);
    setRenderError(null);

    const loadDocx = async () => {
      try {
        if (isDoc && docContainerRef.current) {
          // Clear previous render
          docContainerRef.current.innerHTML = '';

          // Dynamically import docx-preview for SSR safety
          const docxModule = await import('docx-preview');
          const renderAsync = docxModule.renderAsync;

          const res = await fetch(fileUrl, { mode: 'cors' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();

          if (isMounted && docContainerRef.current) {
            await renderAsync(blob, docContainerRef.current, undefined, {
              className: 'docx-preview-content',
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              experimental: true,
            });
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('[DocxViewer] Native docx-preview failed or CORS restricted, falling back:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Cannot parse DOCX in memory');
          setIsLoading(false);
        }
      }
    };

    loadDocx();

    return () => {
      isMounted = false;
    };
  }, [doc, fileUrl, isDoc]);

  if (!doc) return null;

  const handleCopyLink = () => {
    if (!fileUrl) return;
    navigator.clipboard.writeText(fileUrl);
    setIsCopied(true);
    toast.success(isEn ? 'Link copied' : 'Đã sao chép liên kết tải');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formattedType = (LawyerCategoriesVietnamese as any)[doc.type || 'CIVIL'] || doc.type || 'Pháp lý';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0e1013] border border-[#26282e] shadow-2xl overflow-hidden animate-modal-pop text-xs">
        {/* Sleek Inspector Header */}
        <div className="px-5 py-3.5 border-b border-[#202227] bg-[#121418] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 flex items-center justify-center text-[#5e6ad2] shrink-0 shadow-inner">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-[#f7f8f8] truncate" title={doc.title}>
                {doc.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-[#8a8f98] pt-0.5">
                <span className="px-1.5 py-0.2 rounded bg-[#1c1e24] text-indigo-300 font-mono text-[10px] border border-[#2a2c34]">
                  {formattedType}
                </span>
                <span>•</span>
                <span>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : 'Ban hành'}</span>
                <span>•</span>
                <span className="font-mono text-[10px] text-[#62666d] uppercase">{isPdf ? 'PDF' : 'DOCX'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {fileUrl && (
              <>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-[#181a20] hover:bg-[#22242c] border border-[#2a2c34] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                  title={isEn ? 'Copy link' : 'Sao chép link tải'}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[#181a20] hover:bg-[#22242c] border border-[#2a2c34] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                  title={isEn ? 'Open in new tab' : 'Mở tab mới'}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#181a20] hover:bg-[#22242c] border border-[#2a2c34] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Document Canvas Frame */}
        <div className="flex-1 min-h-[520px] max-h-[70vh] bg-[#090a0d] relative flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090a0d]/90 z-10 text-center space-y-2">
              <RotateCw className="w-6 h-6 animate-spin text-[#5e6ad2]" />
              <span className="text-xs text-[#8a8f98] font-medium">
                {isEn ? 'Rendering document page...' : 'Đang xử lý và tải trang tài liệu...'}
              </span>
            </div>
          )}

          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-full min-h-[500px] rounded-xl border border-[#22242a] bg-white"
                title={doc.title}
                onLoad={() => setIsLoading(false)}
              />
            ) : renderError ? (
              /* Office Online / Google Viewer Fallback */
              <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-[#101115] rounded-xl border border-[#22242a] p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#16171b] border border-[#26282e] flex items-center justify-center text-[#5e6ad2]">
                  <FileCode className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h4 className="text-sm font-semibold text-[#f7f8f8]">{doc.title}</h4>
                  <p className="text-xs text-[#8a8f98]">
                    {isEn
                      ? 'Preview is ready. You can open in a new tab or download directly.'
                      : 'Tệp văn bản Word (.DOCX). Bạn có thể mở trực tiếp trong tab mới hoặc tải về máy để chỉnh sửa.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-[#5e6ad2] hover:bg-[#6875e8] text-white font-medium flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Download .DOCX File' : 'Tải tệp .DOCX về máy'}</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Native DOCX Render Canvas */
              <div
                ref={docContainerRef}
                className="w-full h-full min-h-[500px] rounded-xl border border-[#22242a] bg-white text-black p-4 sm:p-8 overflow-y-auto shadow-inner select-text"
              />
            )
          ) : (
            <div className="p-8 text-center text-[#62666d] space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-[#444]" />
              <p>{isEn ? 'No document file URL available.' : 'Chưa có liên kết tệp tài liệu.'}</p>
            </div>
          )}
        </div>

        {/* Clean Footer Bar */}
        <div className="px-5 py-3 border-t border-[#202227] bg-[#121418] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-[#62666d] truncate max-w-sm">
            {doc.description ? doc.description : 'Tài liệu biểu mẫu ban hành chính thức'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#181a20] hover:bg-[#22242c] border border-[#2a2c34] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
            >
              {t('common.cancel', 'Đóng')}
            </button>
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#5e6ad2] hover:bg-[#6875e8] text-white font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isEn ? 'Download File' : 'Tải tệp tin (.DOCX)'}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
