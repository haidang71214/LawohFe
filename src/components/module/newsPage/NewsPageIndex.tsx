'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Newspaper,
  Calendar,
  PenTool,
  RotateCw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  User,
  LayoutGrid,
  List as ListIcon,
  Scale,
} from 'lucide-react';
import { useGetPublicNewsQuery } from '@/store/queries/news';
import { useGetMeQuery } from '@/store/queries/auth';
import webStorageClient from '@/utils/webStorageClient';
import { LawyerCategoriesVietnamese, ETypeLawyer } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';

export default function NewsPageIndex() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCatKey, setSelectedCatKey] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // User info to show lawyer shortcut if logged in as lawyer
  const { data: meResponse } = useGetMeQuery();
  const [clientUser, setClientUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientUser(webStorageClient.getUser());
    }
  }, []);

  const currentUser: any = meResponse?.data || clientUser;
  const userRole = (currentUser?.role || '').toLowerCase();
  const isLawyer = userRole === 'lawyer' || userRole === 'admin';

  const { data: rawPublicNews, isLoading, refetch, isFetching } = useGetPublicNewsQuery();

  const publicArticles = useMemo(() => {
    const rawData = (rawPublicNews?.data as any) || rawPublicNews || {};
    const list =
      Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.news)
        ? rawData.news
        : Array.isArray(rawData?.items)
        ? rawData.items
        : Array.isArray(rawPublicNews?.data)
        ? rawPublicNews.data
        : [];
    return Array.isArray(list) ? list : [];
  }, [rawPublicNews]);

  const CATEGORY_TABS = useMemo(() => [
    { key: 'ALL', labelVi: 'Tất cả', labelEn: 'All' },
    { key: 'CIVIL', labelVi: 'Dân sự', labelEn: 'Civil' },
    { key: 'BUSINESS', labelVi: 'Doanh nghiệp', labelEn: 'Corporate' },
    { key: 'LAND', labelVi: 'Đất đai', labelEn: 'Land & Property' },
    { key: 'CRIMINAL', labelVi: 'Hình sự', labelEn: 'Criminal' },
    { key: 'FAMILY', labelVi: 'Hôn nhân gia đình', labelEn: 'Family' },
    { key: 'LABOR', labelVi: 'Lao động', labelEn: 'Labor' },
    { key: 'INSURANCE', labelVi: 'Bảo hiểm', labelEn: 'Insurance' },
  ], []);

  const getCategoryLabel = (typeKey?: string) => {
    if (!typeKey) return isEn ? 'LEGAL' : 'PHÁP LUẬT';
    const tab = CATEGORY_TABS.find((t) => t.key === typeKey || t.key === typeKey.toUpperCase());
    if (tab) return isEn ? tab.labelEn.toUpperCase() : tab.labelVi.toUpperCase();
    return (
      (LawyerCategoriesVietnamese as any)[typeKey] || typeKey
    );
  };

  const filteredArticles = useMemo(() => {
    return publicArticles.filter((a: any) => {
      const typeStr = String(a.type || a.category || '').toUpperCase();
      const matchCat =
        selectedCatKey === 'ALL' ||
        typeStr === selectedCatKey ||
        typeStr.includes(selectedCatKey);
      const matchQuery =
        !search ||
        (a.mainTitle && a.mainTitle.toLowerCase().includes(search.toLowerCase())) ||
        (a.title && a.title.toLowerCase().includes(search.toLowerCase())) ||
        (a.content && a.content.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [publicArticles, selectedCatKey, search]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return isEn ? 'Just published' : 'Mới phát hành';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const getArticleImage = (article: any): string | null => {
    if (!article) return null;
    if (Array.isArray(article.image_urls) && article.image_urls.length > 0 && typeof article.image_urls[0] === 'string') {
      return article.image_urls[0];
    }
    if (Array.isArray(article.image_url) && article.image_url.length > 0 && typeof article.image_url[0] === 'string') {
      return article.image_url[0];
    }
    if (Array.isArray(article.imgs) && article.imgs.length > 0 && typeof article.imgs[0] === 'string') {
      return article.imgs[0];
    }
    if (typeof article.image_url === 'string' && article.image_url.trim()) {
      return article.image_url;
    }
    if (typeof article.image === 'string' && article.image.trim()) {
      return article.image;
    }
    return null;
  };

  const getCleanExcerpt = (content?: string): string => {
    if (!content) {
      return isEn
        ? 'Legal regulation analysis, case law insights, and trial procedures authored by verified advocates...'
        : 'Nội dung phân tích quy định và hướng dẫn pháp lý thực tiễn từ luật sư chuyên trách...';
    }
    return content
      .replace(/^###\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .replace(/\[image:\d+\]/g, '')
      .replace(/\*\(.*?\)\*/g, '')
      .trim();
  };

  return (
    <div className="min-h-screen bg-[#f8f4ed] dark:bg-[#151311] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Editorial Header / Gazette Masthead */}
      <section className="pt-10 pb-8 border-b-2 border-stone-800 dark:border-[#96592e] bg-stone-100/90 dark:bg-[#1e1915]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700/60 pb-2 text-[11px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-bold text-[#6d4123] dark:text-[#df9b63]">
              <Newspaper className="w-3.5 h-3.5" />
              {isEn ? 'OFFICIAL LITIGATION GAZETTE & PRECEDENTS' : 'CÔNG BÁO TỐ TỤNG & ÁN LỆ ĐIỂN HÌNH'}
            </span>
            <span className="hidden sm:inline">DAILY LEGAL DISPATCH • VOL. 2026</span>
            <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isEn ? 'VERIFIED ANALYSIS' : 'PHÂN TÍCH XÁC THỰC'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
                {isEn ? 'Legal Gazette & Case Law Analysis' : 'Bản Tin & Phân Tích Pháp Lý'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-2xl">
                {isEn
                  ? 'Updated statutory legal norms, Supreme People Court guidance resolutions, and practical trial precedent commentaries authored by certified advocates.'
                  : 'Cập nhật các văn bản quy phạm pháp luật mới ban hành, nghị quyết hướng dẫn của Tòa án nhân dân Tối cao và phân tích các bản án thực tiễn bởi đội ngũ Luật sư.'}
              </p>
            </div>

            {/* If logged-in user is lawyer, provide shortcut to their news studio */}
            {isMounted && isLawyer && (
              <Link
                href="/newsSelf"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#6d4123] hover:bg-[#523018] dark:bg-[#df9b63] dark:hover:bg-[#cb8952] text-white dark:text-stone-950 border-2 border-stone-900 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 shrink-0"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{isEn ? 'My Articles & Studio' : 'Quản lý & Viết bài của tôi'}</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Category & Search Toolbar */}
        <div className="p-4 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1c1814] shadow-[4px_4px_0px_#6d4123] dark:shadow-[4px_4px_0px_#df9b63] flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCatKey(tab.key)}
                className={`px-3 py-1 border-2 text-xs font-mono font-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                  selectedCatKey === tab.key
                    ? 'border-[#6d4123] dark:border-[#df9b63] bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 shadow-[2px_2px_0px_#382213]'
                    : 'border-stone-400 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {isEn ? tab.labelEn : tab.labelVi}
              </button>
            ))}
          </div>

          {/* Search Box, Layout Switcher & Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 transition-all cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 shadow-[1px_1px_0px_#000]'
                    : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                }`}
                title={isEn ? 'Grid Cards View' : 'Hiển thị dạng Ô'}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 transition-all cursor-pointer ${
                  viewMode === 'LIST'
                    ? 'bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 shadow-[1px_1px_0px_#000]'
                    : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                }`}
                title={isEn ? 'List Rows View' : 'Hiển thị dạng Danh sách'}
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isEn ? 'Search articles, keywords...' : 'Tìm kiếm bài viết, từ khóa...'}
                className="w-full pl-9 pr-3 py-1.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#141210] text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#6d4123] dark:focus:border-[#df9b63]"
              />
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 cursor-pointer shadow-[1px_1px_0px_#000] shrink-0"
              title={isEn ? 'Refresh dispatch' : 'Cập nhật tin mới'}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#6d4123] dark:text-[#df9b63]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Public Article Content */}
        {isLoading ? (
          <div className="border-2 border-stone-800 dark:border-[#96592e] bg-white dark:bg-[#1c1814] shadow-[6px_6px_0px_#6d4123] dark:shadow-[6px_6px_0px_#df9b63] p-12 text-center text-xs font-mono text-stone-500 flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[#6d4123] dark:text-[#df9b63]" />
            <span>{isEn ? 'Loading legal dispatch archives...' : 'Đang tải bản tin công báo pháp lý...'}</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="border-2 border-stone-800 dark:border-[#96592e] bg-white dark:bg-[#1c1814] shadow-[6px_6px_0px_#6d4123] dark:shadow-[6px_6px_0px_#df9b63] p-12 text-center text-xs font-mono text-stone-500 space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-stone-400 dark:text-stone-600 opacity-60" />
            <p className="font-bold text-stone-700 dark:text-stone-300 text-sm">
              {isEn ? 'No articles or trial analysis matched your filter.' : 'Không tìm thấy bài viết hoặc phân tích nào phù hợp.'}
            </p>
            <p className="text-stone-500">
              {isEn
                ? 'Please try searching with different keywords or selecting another category.'
                : 'Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chọn chuyên mục khác.'}
            </p>
          </div>
        ) : viewMode === 'GRID' ? (
          /* 🔥 DẠNG Ô (CARD GRID LAYOUT) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article: any, idx: number) => {
              const displayCat = getCategoryLabel(article.type || article.category);

              const coverImage = getArticleImage(article);
              const authorName =
                article.userId?.name || article.author_id?.name || article.author || (isEn ? 'LawOh Advocate' : 'Luật sư LawOh');
              const authorAvatar =
                article.userId?.avartar_url || article.userId?.avatar || article.author_id?.avartar_url;

              return (
                <article
                  key={article._id || idx}
                  className="group flex flex-col justify-between border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1c1814] shadow-[4px_4px_0px_#6d4123] dark:shadow-[4px_4px_0px_#df9b63] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#6d4123] dark:hover:shadow-[7px_7px_0px_#df9b63] transition-all duration-200 overflow-hidden"
                >
                  <div>
                    {/* Top Image / Banner */}
                    <div className="relative h-48 w-full border-b-2 border-stone-800 dark:border-stone-700 overflow-hidden bg-stone-100 dark:bg-[#141210]">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={article.mainTitle || article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 dark:from-[#1c1814] dark:via-[#221c17] dark:to-[#2b221c] p-4 text-center select-none">
                          <div className="w-12 h-12 border-2 border-stone-800 dark:border-stone-600 bg-white/80 dark:bg-[#181614] flex items-center justify-center text-[#6d4123] dark:text-[#df9b63] shadow-[2px_2px_0px_#000] mb-2 group-hover:scale-110 transition-transform">
                            <Scale className="w-6 h-6 stroke-[2]" />
                          </div>
                          <span className="font-serif font-black text-xs uppercase tracking-widest text-stone-700 dark:text-stone-300 opacity-80">
                            LawOh Gazette
                          </span>
                        </div>
                      )}

                      {/* Category Tag Overlay */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 font-mono text-[10px] font-bold uppercase bg-stone-900/90 text-[#df9b63] border border-[#df9b63] backdrop-blur-xs shadow-[2px_2px_0px_#000]">
                          [{displayCat}]
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      {/* Meta: Author & Date */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400 border-b border-dashed border-stone-200 dark:border-stone-800 pb-2">
                        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                          {authorAvatar ? (
                            <img
                              src={authorAvatar}
                              alt={authorName}
                              className="w-4 h-4 rounded-full object-cover border border-stone-800 shrink-0"
                            />
                          ) : (
                            <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          )}
                          <span className="truncate font-bold text-stone-700 dark:text-stone-300">
                            {authorName}
                          </span>
                        </div>

                        <span className="flex items-center gap-1 shrink-0 text-[10px]">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {formatDate(article.createdAt)}
                        </span>
                      </div>

                      {/* Article Headline */}
                      <Link href={`/newsDetail/${article._id || article.id}`}>
                        <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-50 group-hover:text-[#6d4123] dark:group-hover:text-[#df9b63] transition-colors leading-snug line-clamp-2">
                          {article.mainTitle || article.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed font-sans">
                        {getCleanExcerpt(article.content || article.description)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="px-5 pb-5 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                    <Link
                      href={`/newsDetail/${article._id || article.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 group-hover:bg-[#6d4123] group-hover:text-white dark:group-hover:bg-[#df9b63] dark:group-hover:text-stone-950 text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 transition-all shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <span>{isEn ? 'Read Full Article' : 'Đọc toàn văn bài viết'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* DẠNG DANH SÁCH (LIST VIEW) */
          <div className="border-2 border-stone-800 dark:border-[#96592e] bg-white dark:bg-[#1c1814] shadow-[6px_6px_0px_#6d4123] dark:shadow-[6px_6px_0px_#df9b63] divide-y-2 divide-stone-800 dark:divide-stone-800">
            {filteredArticles.map((article: any, idx: number) => {
              const displayCat = getCategoryLabel(article.type || article.category);

              const coverImage = getArticleImage(article);

              return (
                <div
                  key={article._id || idx}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-stone-50 dark:hover:bg-[#25201b] transition-colors group"
                >
                  {coverImage && (
                    <div className="w-full md:w-44 h-28 border-2 border-stone-800 dark:border-stone-700 overflow-hidden shrink-0 bg-stone-100 shadow-[2px_2px_0px_#000]">
                      <img
                        src={coverImage}
                        alt={article.mainTitle || article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <Link href={`/newsDetail/${article._id || article.id}`} className="space-y-2 flex-1 block">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 border border-[#6d4123] dark:border-[#df9b63] text-[#6d4123] dark:text-[#df9b63] bg-[#6d4123]/10">
                        [{displayCat}]
                      </span>

                      <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.createdAt)}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-50 group-hover:text-[#6d4123] dark:group-hover:text-[#df9b63] transition-colors leading-snug">
                      {article.mainTitle || article.title}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 max-w-3xl leading-relaxed">
                      {getCleanExcerpt(article.content || article.description)}
                    </p>
                  </Link>

                  <div className="flex items-center gap-3 pt-2 md:pt-0 shrink-0">
                    <Link
                      href={`/newsDetail/${article._id || article.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 group-hover:bg-[#6d4123] group-hover:text-white dark:group-hover:bg-[#df9b63] dark:group-hover:text-stone-950 text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 transition-all shadow-[1px_1px_0px_#000]"
                    >
                      <span>{isEn ? 'Read Article' : 'Xem bài'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}