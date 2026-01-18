'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Ban,
  User,
  MapPin,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import TextToSpeech from '@/components/common/TextToSpeech';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useApproveNewsMutation, useRejectNewsMutation } from '@/store/queries/news';
import toast from '@/lib/toast';

interface NewsDetailData {
  _id: string;
  type: string;
  mainTitle: string;
  content: string;
  isAccept?: boolean;
  status?: string;
  rejectReason?: string;
  image_url?: string[];
  image_urls?: string[];
  imgs?: string[];
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    province?: string;
    avartar_url?: string;
    avatar?: string;
    experienceYear?: number;
    description?: string;
    star?: number;
  };
  author_id?: any;
}

interface NewsDetailProps {
  news: NewsDetailData;
  currentUser?: any;
  onRefresh?: () => void;
}

export default function NewsDetail({ news, currentUser, onRefresh }: NewsDetailProps) {
  const [copied, setCopied] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  const [approveMutation, { isLoading: isApproving }] = useApproveNewsMutation();
  const [rejectMutation, { isLoading: isRejecting }] = useRejectNewsMutation();

  const userRole = (currentUser?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';

  const isApproved =
    news.status === 'accept' ||
    news.status === 'accepted' ||
    news.status === 'approved' ||
    news.isAccept === true;
  const isRejected =
    news.status === 'reject' ||
    news.status === 'rejected';

  const title = news.mainTitle || 'Bản tin & Phân tích pháp lý';
  const content = news.content || '';
  const createdAt = news.createdAt || '';
  
  const allImages: string[] = [
    ...(Array.isArray(news.image_urls) ? news.image_urls : []),
    ...(Array.isArray(news.image_url) ? news.image_url : []),
    ...(Array.isArray(news.imgs) ? news.imgs : []),
  ].filter((img) => typeof img === 'string' && img.trim().length > 0);

  // Author details
  const author = news.userId || news.author_id;
  const authorId = typeof author === 'string' ? author : author?._id || author?.id;
  const authorName = author?.name || 'Luật sư LawOh';
  const authorAvatar = author?.avartar_url || author?.avatar;
  const authorProvince = author?.province || 'Toàn quốc';
  const authorExp = author?.experienceYear;

  const categoryName =
    (news.type && LawyerCategoriesVietnamese[news.type as keyof typeof LawyerCategoriesVietnamese]) ||
    news.type ||
    'PHÁP LUẬT';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Mới phát hành';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const calculateReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes < 1 ? 1 : minutes;
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Đã sao chép liên kết bài viết vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAdminApprove = async () => {
    try {
      await approveMutation(news._id).unwrap();
      toast.success('Đã phê duyệt xuất bản bài viết công khai!');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error('Lỗi khi phê duyệt bài viết', err?.data?.message);
    }
  };

  const handleAdminReject = async () => {
    if (!rejectReasonInput.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối bài viết');
      return;
    }
    try {
      await rejectMutation({ id: news._id, reason: rejectReasonInput.trim() }).unwrap();
      toast.success('Đã chuyển bài viết sang trạng thái từ chối!');
      setRejecting(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error('Lỗi khi từ chối bài viết', err?.data?.message);
    }
  };

  // Clean raw content for text-to-speech
  const cleanSpeechText = content
    .replace(/^###\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\[image:\d+\]/g, '')
    .replace(/\*\(.*?\)\*/g, '')
    .trim();

  // Advanced Parser for Legal Gazette Markdown & Inlined Images
  const renderGazetteContent = () => {
    const usedImageIndices = new Set<number>();
    
    // Split into paragraphs / blocks
    const rawParagraphs = content.split(/\n\s*\n/);

    const elements: React.ReactNode[] = [];

    rawParagraphs.forEach((para, paraIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return;

      // 1. Heading ###
      if (trimmed.startsWith('###')) {
        const headingText = trimmed.replace(/^###\s*/, '');
        elements.push(
          <h2
            key={`h-${paraIdx}`}
            className="font-serif font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-50 pt-6 pb-2 border-b-2 border-stone-200 dark:border-stone-800 leading-snug flex items-center gap-2.5"
          >
            <span className="w-2.5 h-2.5 bg-[#6d4123] dark:bg-[#df9b63] shrink-0" />
            <span>{headingText}</span>
          </h2>
        );
        return;
      }

      // 2. Blockquote >
      if (trimmed.startsWith('>')) {
        const quoteText = trimmed.replace(/^>\s*/, '');
        elements.push(
          <blockquote
            key={`q-${paraIdx}`}
            className="p-5 my-6 border-l-4 border-[#6d4123] dark:border-[#df9b63] bg-stone-100/80 dark:bg-[#1c1814] font-serif italic text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200 shadow-xs relative"
          >
            <span className="text-3xl text-[#6d4123] dark:text-[#df9b63] font-serif absolute -top-2 left-2 opacity-30 select-none">“</span>
            <div className="relative pl-3">
              {quoteText}
            </div>
          </blockquote>
        );
        return;
      }

      // 3. Image block [image:n] with optional caption *(caption)*
      const imgMatch = trimmed.match(/\[image:(\d+)\](?:\s*\*\((.*?)\)\*)?/);
      if (imgMatch) {
        const imgIndex = parseInt(imgMatch[1], 10) - 1;
        const caption = imgMatch[2] || '';

        if (imgIndex >= 0 && imgIndex < allImages.length) {
          usedImageIndices.add(imgIndex);
          const imgSrc = allImages[imgIndex];

          elements.push(
            <figure key={`img-${paraIdx}`} className="my-8 text-center space-y-2">
              <div className="border-2 border-stone-800 dark:border-stone-700 overflow-hidden bg-stone-100 dark:bg-[#141210] shadow-[5px_5px_0px_#6d4123] dark:shadow-[5px_5px_0px_#df9b63] inline-block max-w-full">
                <img
                  src={imgSrc}
                  alt={caption || `Hình minh họa ${imgIndex + 1}`}
                  className="max-h-[500px] w-auto mx-auto object-contain"
                />
              </div>
              {caption && (
                <figcaption className="font-mono text-xs text-stone-500 dark:text-stone-400 italic">
                  📷 {caption}
                </figcaption>
              )}
            </figure>
          );
          return;
        }
      }

      // 4. Regular Paragraph with inline bolding & citations
      elements.push(
        <p
          key={`p-${paraIdx}`}
          className="text-stone-800 dark:text-stone-200 text-sm sm:text-[15px] leading-relaxed font-sans text-justify"
        >
          {trimmed}
        </p>
      );
    });

    // Append any supplemental images that weren't inlined via [image:n]
    const supplementalImages = allImages.filter((_, idx) => !usedImageIndices.has(idx));

    return { elements, supplementalImages };
  };

  const { elements, supplementalImages } = renderGazetteContent();

  return (
    <article className="space-y-8 bg-white dark:bg-[#1c1814] border-2 border-stone-800 dark:border-stone-700 shadow-[6px_6px_0px_#6d4123] dark:shadow-[6px_6px_0px_#df9b63] p-6 sm:p-10 font-sans">
      {/* Admin Moderation Alert Banner */}
      {isAdmin && (
        <div className="p-4 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#141210] space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold flex items-center gap-1.5 uppercase text-stone-800 dark:text-stone-200">
              <ShieldCheck className="w-4 h-4 text-[#6d4123] dark:text-[#df9b63]" />
              <span>BẢNG ĐIỀU KHIỂN DUYỆT BÀI (ADMIN):</span>
            </span>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 font-bold uppercase border ${
                  isApproved
                    ? 'bg-emerald-600 text-white border-stone-800'
                    : isRejected
                    ? 'bg-rose-600 text-white border-stone-800'
                    : 'bg-amber-500 text-stone-950 border-stone-800'
                }`}
              >
                {isApproved ? 'ĐÃ DUYỆT CÔNG KHAI' : isRejected ? 'BỊ TỪ CHỐI' : 'CHỜ PHÊ DUYỆT'}
              </span>
            </div>
          </div>

          {!isApproved && !rejecting && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAdminApprove}
                disabled={isApproving}
                className="px-4 py-1.5 bg-[#1a5336] hover:bg-[#22774a] text-white font-bold uppercase border border-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                {isApproving ? 'Đang duyệt...' : '✓ Phê duyệt xuất bản ngay'}
              </button>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase border border-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                ✕ Từ chối bài viết
              </button>
            </div>
          )}

          {rejecting && (
            <div className="space-y-2 p-3 border border-rose-400 bg-rose-50 dark:bg-rose-950/30">
              <label className="font-bold text-rose-800 dark:text-rose-300">
                Nhập lý do từ chối gửi đến tác giả:
              </label>
              <textarea
                rows={2}
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="Ví dụ: Cần bổ sung trích dẫn số bản án hoặc kiểm tra lại điều khoản..."
                className="w-full p-2 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 bg-white dark:bg-[#181614] focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAdminReject}
                  disabled={isRejecting}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase border border-stone-800 cursor-pointer"
                >
                  {isRejecting ? 'Đang gửi...' : 'Xác nhận từ chối'}
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="px-3 py-1 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold uppercase border border-stone-800 cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rejection Notice if article is rejected */}
      {isRejected && news.rejectReason && (
        <div className="p-4 border-2 border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <Ban className="w-4 h-4 text-rose-600 shrink-0" />
            <span>THÔNG BÁO TỪ CHỐI TỪ BAN BIÊN TẬP:</span>
          </div>
          <p className="font-sans text-rose-800 dark:text-rose-300 italic pl-6">
            &ldquo;{news.rejectReason}&rdquo;
          </p>
        </div>
      )}

      {/* Article Header & Metadata */}
      <div className="space-y-4 border-b-2 border-stone-800 dark:border-stone-700 pb-6">
        {/* Category & Date badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 font-bold uppercase bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 shadow-[2px_2px_0px_#000]">
              [{categoryName}]
            </span>
            <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {calculateReadTime(content)} phút đọc
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {news.views || 128} lượt xem
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-stone-900 dark:text-stone-50 leading-tight tracking-tight">
          {title}
        </h1>

        {/* Author Byline Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            {authorId ? (
              <Link
                href={`/lawyerDetail/${authorId}`}
                className="w-11 h-11 border-2 border-stone-800 dark:border-stone-700 rounded-full overflow-hidden shrink-0 bg-stone-100 shadow-[2px_2px_0px_#000] hover:opacity-90 transition-opacity"
              >
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600 bg-stone-200 font-bold font-serif text-sm">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <div className="w-11 h-11 border-2 border-stone-800 dark:border-stone-700 rounded-full overflow-hidden shrink-0 bg-stone-100 shadow-[2px_2px_0px_#000]">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600 bg-stone-200 font-bold font-serif text-sm">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5">
                {authorId ? (
                  <Link
                    href={`/lawyerDetail/${authorId}`}
                    className="font-bold text-stone-900 dark:text-stone-100 text-sm hover:text-[#6d4123] dark:hover:text-[#df9b63] transition-colors"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {authorName}
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold border border-emerald-500">
                  ✓ Luật sư xác thực
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 dark:text-stone-400">
                {authorExp && <span>{authorExp} năm kinh nghiệm</span>}
                {authorExp && <span>•</span>}
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  {authorProvince}
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools: Copy link & Share */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Neural Audio Reader */}
      {cleanSpeechText && (
        <div className="my-4">
          <TextToSpeech text={cleanSpeechText} title={title} />
        </div>
      )}

      {/* Gazette Content Body */}
      <div className="space-y-4 py-2 font-sans text-stone-900 dark:text-stone-100 leading-relaxed text-justify">
        {elements}
      </div>

      {/* Supplemental Image Gallery if any */}
      {supplementalImages.length > 0 && (
        <div className="pt-8 border-t-2 border-stone-800 dark:border-stone-700 space-y-4">
          <h3 className="font-serif font-black text-lg text-stone-900 dark:text-stone-50 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#6d4123] dark:text-[#df9b63]" />
            <span>Tài Liệu & Hình Ảnh Đính Kèm Khác ({supplementalImages.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supplementalImages.map((imgUrl, i) => (
              <a
                key={i}
                href={imgUrl}
                target="_blank"
                rel="noreferrer"
                className="border-2 border-stone-800 dark:border-stone-700 overflow-hidden shadow-[3px_3px_0px_#000] block group bg-stone-100 dark:bg-[#141210]"
              >
                <img
                  src={imgUrl}
                  alt={`Tài liệu đính kèm ${i + 1}`}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-2 font-mono text-[11px] text-stone-600 dark:text-stone-400 text-center border-t border-stone-200 dark:border-stone-800">
                  🔍 Bấm để xem ảnh gốc kích thước đầy đủ
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Article Bottom Sign-off / Disclaimer */}
      <div className="p-5 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#141210] space-y-2 text-xs font-sans text-stone-600 dark:text-stone-400">
        <div className="font-mono font-bold text-stone-800 dark:text-stone-200 uppercase flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>LỜI KHUYÊN PHÁP LÝ TỪ BAN BIÊN TẬP LAWOH:</span>
        </div>
        <p className="leading-relaxed">
          Bài viết trên mang tính chất tham khảo học thuật và phân tích thực tiễn án lệ tại thời điểm công bố. Do quy định pháp luật luôn được sửa đổi, bổ sung và mỗi vụ việc thực tế đều có tình tiết riêng biệt, quý độc giả nên tham vấn trực tiếp luật sư chuyên trách trước khi áp dụng vào tình huống cụ thể.
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-stone-800 dark:border-stone-700 font-mono text-xs">
        <Link
          href="/newsPage"
          className="px-4 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
        >
          ← Quay lại danh sách bản tin
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2 border-2 border-stone-900 bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 font-bold uppercase shadow-[2px_2px_0px_#000] cursor-pointer hover:opacity-90"
          >
            Chia sẻ bài viết
          </button>
        </div>
      </div>
    </article>
  );
}