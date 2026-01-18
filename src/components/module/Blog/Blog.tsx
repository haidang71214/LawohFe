'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Newspaper, Clock, ArrowRight } from 'lucide-react';
import { useGetPublicNewsQuery } from '@/store/queries/news';
import { useLanguage } from '@/i18n/LanguageContext';
import AnimeText from '@/components/common/AnimeText';
import { animate, stagger, remove } from 'animejs';

const Blog: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const sectionRef = useRef<HTMLElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  const { data: rawNews, isLoading } = useGetPublicNewsQuery();

  const articles = React.useMemo(() => {
    const rawData = (rawNews?.data as any) || rawNews || {};
    const list =
      Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.news)
        ? rawData.news
        : Array.isArray(rawData?.items)
        ? rawData.items
        : Array.isArray(rawNews?.data)
        ? rawNews.data
        : [];
    return Array.isArray(list) ? list.slice(0, 3) : [];
  }, [rawNews]);

  useEffect(() => {
    hasAnimatedRef.current = false;
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            if (blogRef.current) {
              const items = blogRef.current.querySelectorAll('.retro-news-card');
              if (items.length > 0) {
                remove(items);
                animate(items, {
                  opacity: [0, 1],
                  translateY: [16, 0],
                  duration: 500,
                  delay: stagger(70, { start: 100 }),
                  ease: 'outQuart',
                });
              }
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [articles, language]);

  return (
    <section
      ref={sectionRef}
      className="py-20 border-t-2 border-stone-300 dark:border-[#2f2b26] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-stone-800 dark:border-[#38332c]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-stone-200 dark:bg-[#201d19] border border-stone-400 dark:border-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider text-[#d95327] dark:text-[#e26d46]">
              <Newspaper className="w-3.5 h-3.5" />
              <span>[SECTION IV]</span>
              <span>•</span>
              <span>{isEn ? 'LEGAL GAZETTE & PRECEDENTS' : 'BẢN TIN PHÁP LÝ & ÁN LỆ'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-[#fbf8f2]">
              <AnimeText
                key={`blog-title-${language}`}
                text={isEn ? 'Legal Insights & Precedents' : 'Kiến Thức Pháp Lý & Án Lệ Thực Tiễn'}
                type="letters"
                delay={50}
                staggerMs={20}
              />
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-xl">
              {isEn
                ? 'Official legal analyses, newly gazetted decrees, and procedural guides authored by senior counsel.'
                : 'Phân tích chuyên sâu về án lệ thực tế, điểm mới của luật ban hành và cẩm nang thủ tục tố tụng từ luật sư đầu ngành.'}
            </p>
          </div>

          <Link
            href="/newsPage"
            className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 hover:text-[#d95327] dark:hover:text-[#e26d46] flex items-center gap-1.5 shrink-0 transition-colors uppercase tracking-wider border-b border-stone-400 dark:border-stone-600 pb-0.5 group"
          >
            <span>{isEn ? 'Browse Gazette Archive' : 'Xem toàn bộ bài viết'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d95327] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* News Cards Grid */}
        <div ref={blogRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full p-12 text-center text-xs font-mono text-stone-500">
              {isEn ? '[LOADING GAZETTE ARTICLES...]' : '[ĐANG TẢI BẢN TIN PHÁP LÝ...]'}
            </div>
          ) : articles.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs font-mono text-stone-500">
              {isEn ? '[NO GAZETTE ARTICLES PUBLISHED]' : '[CHƯA CÓ BÀI VIẾT NÀO]'}
            </div>
          ) : (
            articles.map((article: any, idx: number) => {
              const dateStr = article.createdAt
                ? new Date(article.createdAt).toLocaleDateString('vi-VN')
                : '09/2026';

              return (
                <Link
                  key={article._id || idx}
                  href={`/newsDetail/${article._id}`}
                  className="retro-news-card opacity-0 bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#181614] dark:hover:shadow-[2px_2px_0px_#e5decf] transition-all p-6 flex flex-col justify-between gap-6 group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Top Tag & Dispatch Date */}
                    <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 dark:border-[#38332c] text-xs font-mono">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#d95327] text-white">
                        {article.type || (isEn ? 'LEGAL DISPATCH' : 'ÁN LỆ')}
                      </span>

                      <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                        [{dateStr}]
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-[#fbf8f2] group-hover:text-[#d95327] dark:group-hover:text-[#e26d46] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-sans line-clamp-3 leading-relaxed">
                      {article.content ||
                        article.description ||
                        'Phân tích chi tiết các điểm mới trong quy định pháp luật hiện hành và hướng dẫn áp dụng thực tế.'}
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-4 border-t-2 border-dashed border-stone-300 dark:border-stone-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500 dark:text-stone-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#d95327]" />
                      <span>{isEn ? '5 min read' : '5 phút đọc'}</span>
                    </span>

                    <span className="font-bold text-stone-900 dark:text-[#f4efe6] group-hover:text-[#d95327] dark:group-hover:text-[#e26d46] flex items-center gap-1 transition-colors uppercase tracking-wider text-[11px]">
                      <span>{isEn ? 'READ DISPATCH' : 'ĐỌC BẢN TIN'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Blog;

