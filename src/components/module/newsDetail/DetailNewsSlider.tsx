'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Newspaper,
  Calendar,
  ArrowRight,
  User,
  Star,
  MessageSquare,
  ShieldCheck,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useGetPublicNewsQuery } from '@/store/queries/news';
import { LawyerCategoriesVietnamese } from '@/types/enum';

interface DetailNewsSliderProps {
  type?: string;
  authorInfo?: any;
  currentArticleId?: string;
}

export default function DetailNewsSlider({ type, authorInfo, currentArticleId }: DetailNewsSliderProps) {
  const router = useRouter();
  const { data: rawNewsResponse, isLoading } = useGetPublicNewsQuery();

  const authorName = authorInfo?.name || 'Luật sư LawOh';
  const authorAvatar = authorInfo?.avartar_url || authorInfo?.avatar;
  const authorProvince = authorInfo?.province || 'Toàn quốc';
  const authorExp = authorInfo?.experienceYear || 2;
  const authorDesc = authorInfo?.description || 'Chuyên gia tư vấn và tranh tụng các vụ án dân sự, đất đai và hợp đồng thương mại.';
  const authorStar = authorInfo?.star || 5;

  const authorId =
    typeof authorInfo === 'string'
      ? authorInfo
      : authorInfo?._id || authorInfo?.id || authorInfo?.userId;

  const relatedArticles = React.useMemo(() => {
    const rawData = (rawNewsResponse?.data as any) || rawNewsResponse || {};
    const list: any[] =
      Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.items)
        ? rawData.items
        : Array.isArray(rawData?.news)
        ? rawData.news
        : [];

    return list
      .filter(
        (item: any) =>
          (item._id !== currentArticleId && item.id !== currentArticleId) &&
          (item.status === 'accept' || item.isAccept === true || item.status === 'approved') &&
          (!type || item.type === type || list.length <= 4)
      )
      .slice(0, 4);
  }, [rawNewsResponse, type, currentArticleId]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Mới phát hành';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const getArticleCover = (item: any) => {
    if (Array.isArray(item.image_urls) && item.image_urls.length > 0) return item.image_urls[0];
    if (Array.isArray(item.image_url) && item.image_url.length > 0) return item.image_url[0];
    if (Array.isArray(item.imgs) && item.imgs.length > 0) return item.imgs[0];
    if (typeof item.image_url === 'string' && item.image_url.trim()) return item.image_url;
    return null;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Author Profile Card */}
      <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1c1814] shadow-[5px_5px_0px_#6d4123] dark:shadow-[5px_5px_0px_#df9b63] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
          <span className="font-mono text-[11px] font-bold uppercase text-[#6d4123] dark:text-[#df9b63] flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            TÁC GIẢ BÀI VIẾT
          </span>
          <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{authorStar}.0</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {authorId ? (
            <Link
              href={`/lawyerDetail/${authorId}`}
              className="w-14 h-14 border-2 border-stone-800 dark:border-stone-700 rounded-full overflow-hidden shrink-0 bg-stone-100 shadow-[2px_2px_0px_#000] hover:opacity-90 transition-opacity"
            >
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-600 bg-stone-200 font-bold font-serif text-lg">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <div className="w-14 h-14 border-2 border-stone-800 dark:border-stone-700 rounded-full overflow-hidden shrink-0 bg-stone-100 shadow-[2px_2px_0px_#000]">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-600 bg-stone-200 font-bold font-serif text-lg">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          <div className="space-y-0.5 min-w-0">
            {authorId ? (
              <Link
                href={`/lawyerDetail/${authorId}`}
                className="font-serif font-black text-base text-stone-900 dark:text-stone-50 hover:text-[#6d4123] dark:hover:text-[#df9b63] transition-colors truncate block"
              >
                {authorName}
              </Link>
            ) : (
              <h4 className="font-serif font-black text-base text-stone-900 dark:text-stone-50 truncate">
                {authorName}
              </h4>
            )}
            <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Luật sư thành viên
            </p>
            <p className="text-[11px] font-mono text-stone-500">
              {authorProvince} • {authorExp} năm kinh nghiệm
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 font-sans leading-relaxed line-clamp-3">
          {authorDesc}
        </p>

        {authorId ? (
          <Link
            href={`/lawyerDetail/${authorId}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-[#6d4123] hover:text-white dark:hover:bg-[#df9b63] dark:hover:text-stone-950 text-xs font-mono font-bold uppercase transition-all shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Xem hồ sơ & Tư vấn</span>
          </Link>
        ) : (
          <Link
            href="/lawyers"
            className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-[#6d4123] hover:text-white dark:hover:bg-[#df9b63] dark:hover:text-stone-950 text-xs font-mono font-bold uppercase transition-all shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Xem danh bạ luật sư</span>
          </Link>
        )}
      </div>

      {/* 2. Related Articles & Precedents */}
      <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1c1814] shadow-[5px_5px_0px_#6d4123] dark:shadow-[5px_5px_0px_#df9b63] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
          <span className="font-mono text-[11px] font-bold uppercase text-[#6d4123] dark:text-[#df9b63] flex items-center gap-1">
            <Newspaper className="w-3.5 h-3.5" />
            BÀI PHÂN TÍCH CÙNG CHUYÊN MỤC
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 text-center font-mono text-xs text-stone-500">
            Đang tải bài viết liên quan...
          </div>
        ) : relatedArticles.length === 0 ? (
          <div className="p-4 text-center font-mono text-xs text-stone-500 space-y-1">
            <p>Chưa có thêm bài viết cùng chuyên mục.</p>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-dashed divide-stone-200 dark:divide-stone-800">
            {relatedArticles.map((item: any) => {
              const cover = getArticleCover(item);
              const catLabel =
                (item.type &&
                  LawyerCategoriesVietnamese[item.type as keyof typeof LawyerCategoriesVietnamese]) ||
                item.category ||
                'PHÁP LUẬT';

              return (
                <div key={item._id || item.id} className="pt-3 first:pt-0 group">
                  <Link
                    href={`/newsDetail/${item._id || item.id}`}
                    className="flex gap-3 items-start"
                  >
                    {cover ? (
                      <div className="w-20 h-16 border border-stone-800 dark:border-stone-700 overflow-hidden shrink-0 bg-stone-100 shadow-[1px_1px_0px_#000]">
                        <img
                          src={cover}
                          alt={item.mainTitle || item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-16 border border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#141210] flex items-center justify-center text-[#6d4123] dark:text-[#df9b63] shrink-0">
                        <Scale className="w-5 h-5 opacity-70" />
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="inline-block px-1.5 py-0.2 bg-[#6d4123]/10 dark:bg-[#df9b63]/10 text-[#6d4123] dark:text-[#df9b63] font-mono text-[9px] font-bold border border-[#6d4123]/30 uppercase">
                        [{catLabel}]
                      </span>
                      <h5 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-[#6d4123] dark:group-hover:text-[#df9b63] transition-colors leading-snug line-clamp-2">
                        {item.mainTitle || item.title}
                      </h5>
                      <span className="block font-mono text-[10px] text-stone-400">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/newsPage"
          className="w-full flex items-center justify-center gap-1 py-2 text-xs font-mono font-bold text-[#6d4123] dark:text-[#df9b63] hover:underline"
        >
          <span>Xem tất cả công báo pháp lý</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 3. Fast Consultation Callout */}
      <div className="p-5 border-2 border-stone-800 dark:border-stone-700 bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 shadow-[5px_5px_0px_#000] space-y-3 font-sans">
        <div className="flex items-center gap-2 font-mono text-xs font-black uppercase">
          <Sparkles className="w-4 h-4 text-amber-300 dark:text-stone-900" />
          <span>TƯ VẤN PHÁP LÝ NHANH</span>
        </div>
        <p className="text-xs leading-relaxed opacity-95">
          Gặp vướng mắc tương tự vụ việc trong bài viết? Kết nối ngay với mạng lưới luật sư chuyên trách LawOh để được hỗ trợ bảo vệ quyền lợi hợp pháp.
        </p>
        <Link
          href="/booking"
          className="inline-block w-full py-2 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs font-bold uppercase text-center border-2 border-stone-900 shadow-[2px_2px_0px_#000] hover:bg-stone-100 cursor-pointer transition-all"
        >
          Đặt Lịch Tư Vấn Ngay
        </Link>
      </div>
    </div>
  );
}
