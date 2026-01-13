'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import AnimeText from '@/components/common/AnimeText';
import { animate, stagger, remove } from 'animejs';
import { useFilterLawyersQuery } from '@/store/queries/lawyer';
import { LawyerCategoriesVietnamese } from '@/types/enum';

const Hero: React.FC = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState('ALL');

  const containerRef = useRef<HTMLDivElement>(null);
  const docketConsoleRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  // Fetch real lawyers from Backend API
  const { data: rawResponse, isLoading: isLawyersLoading } = useFilterLawyersQuery({
    type: activeTab === 'ALL' ? undefined : activeTab,
  });

  const lawyers = useMemo(() => {
    const rawData = (rawResponse?.data as any) || {};
    const list = Array.isArray(rawData)
      ? rawData
      : (Array.isArray(rawData?.data)
        ? rawData.data
        : (Array.isArray(rawData?.lawyers)
          ? rawData.lawyers
          : (Array.isArray(rawData?.items)
            ? rawData.items
            : [])));
    return list;
  }, [rawResponse]);

  // Micro-animations for Hero elements
  useEffect(() => {
    if (!containerRef.current) return;

    const badge = containerRef.current.querySelector('.retro-hero-badge');
    const ctas = containerRef.current.querySelectorAll('.retro-hero-cta');

    if (badge) {
      animate(badge, {
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [8, 0],
        duration: 450,
        ease: 'outBack(1.4)',
      });
    }

    if (ctas.length > 0) {
      animate(ctas, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 450,
        delay: stagger(60, { start: 250 }),
        ease: 'outQuart',
      });
    }
  }, [language]);

  // Animate Ledger Rows
  useEffect(() => {
    if (!rowsRef.current) return;

    const rows = rowsRef.current.querySelectorAll('.docket-row');
    if (rows.length > 0) {
      remove(rows);
      animate(rows, {
        opacity: [0, 1],
        translateX: [-12, 0],
        duration: 420,
        delay: stagger(40, { start: 30 }),
        ease: 'outQuart',
      });
    }
  }, [lawyers, activeTab, language]);

  const getCategoryName = (cat: string) => {
    return (
      t(`categories.${cat}`, (LawyerCategoriesVietnamese as any)[cat] || cat) ||
      (isEn ? 'General Legal Practice' : 'Tư vấn Pháp luật Tổng hợp')
    );
  };

  return (
    <section
      ref={containerRef}
      className="relative pt-12 pb-16 overflow-hidden"
    >
      {/* Vintage Background Grids & Watermark */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Top Broadsheet Grid */}
        <div className="space-y-6 max-w-4xl">
          {/* Retro Stamp Header Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="retro-hero-badge inline-flex items-center gap-2 px-3 py-1 bg-stone-100 dark:bg-[#1f1c19] border-2 border-stone-800 dark:border-[#443d34] shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] text-[11px] font-mono text-stone-800 dark:text-stone-300 opacity-0">
              <span className="w-2 h-2 rounded-full bg-[#d95327]"></span>
              <span className="font-bold tracking-wider">
                {isEn ? 'LAWOH LEGAL GAZETTE • EST. 2026' : 'NIÊN GIÁM PHÁP ĐÌNH • LAWOH 2026'}
              </span>
            </div>

            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 hidden sm:inline">
              [ARCHIVE PROTOCOL: 09/26]
            </span>
          </div>

          {/* Vintage Serif Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-stone-900 dark:text-[#fbf8f2] leading-[1.12]">
            <AnimeText
              key={`title-l1-${language}`}
              text={isEn ? 'Counsel & Advocacy.' : 'Tư vấn & Tranh tụng.'}
              type="letters"
              delay={40}
              staggerMs={20}
              as="span"
              className="block font-bold"
            />
            <span className="block text-[#d95327] dark:text-[#e26d46] italic font-serif">
              <AnimeText
                key={`title-l2-${language}`}
                text={isEn ? 'Certified Legal Standards.' : 'Chuẩn mực Pháp lý Đích thực.'}
                type="letters"
                delay={240}
                staggerMs={18}
                as="span"
              />
            </span>
          </h1>

          {/* Subtitle / Editorial Deck */}
          <div className="border-l-4 border-[#d95327] pl-4 py-1">
            <AnimeText
              key={`subtitle-${language}`}
              text={
                isEn
                  ? 'Official portal connecting citizens & enterprises directly with credentialed Bar Association advocates. Fixed consultation tariffs, secure docket records, and real-time video summons.'
                  : 'Cổng thông tin pháp lý kết nối trực tiếp người dân và doanh nghiệp với đội ngũ Luật sư chính ngạch thuộc Đoàn Luật sư toàn quốc. Biểu phí niêm yết minh bạch, hồ sơ lưu trữ bảo mật.'
              }
              type="words"
              delay={300}
              staggerMs={25}
              as="p"
              className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-sans max-w-3xl"
            />
          </div>

          {/* Retro Action CTAs with Hard Shadows */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/lawyers"
              className="retro-hero-cta opacity-0 px-5 py-3 rounded-none bg-[#d95327] hover:bg-[#c4441b] text-white font-mono text-xs uppercase tracking-wider font-bold border-2 border-stone-900 dark:border-stone-200 shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#181614] dark:hover:shadow-[2px_2px_0px_#e5decf] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{isEn ? 'Inspect Counsel Registry' : 'Tra cứu Danh bạ Luật sư'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/services"
              className="retro-hero-cta opacity-0 px-5 py-3 rounded-none bg-stone-100 dark:bg-[#1a1715] hover:bg-stone-200 dark:hover:bg-[#25211e] text-stone-900 dark:text-[#f4efe6] font-mono text-xs uppercase tracking-wider font-bold border-2 border-stone-800 dark:border-[#443d34] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#181614] dark:hover:shadow-[2px_2px_0px_#e5decf] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{isEn ? 'Tariff & Fee Schedule' : 'Biểu phí & Lĩnh vực'}</span>
            </Link>
          </div>
        </div>

        {/* Vintage Legal Docket Ledger (Bảng Danh Mục Thụ Lý Án Lệ Thực Tế) */}
        <div
          ref={docketConsoleRef}
          className="bg-stone-100 dark:bg-[#161412] border-2 border-stone-800 dark:border-[#38332c] shadow-[6px_6px_0px_#181614] dark:shadow-[6px_6px_0px_#e5decf] overflow-hidden"
        >
          {/* Ledger Title Bar */}
          <div className="px-5 py-3.5 bg-stone-200 dark:bg-[#201d19] border-b-2 border-stone-800 dark:border-[#38332c] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-block w-3 h-3 bg-[#d95327] border border-stone-900"></span>
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-[#f4efe6]">
                {isEn ? 'OFFICIAL INTAKE DOCKET • REAL-TIME ADVOCATE DISPATCH' : 'SỔ THỤ LÝ ĐIỆN TỬ • LUẬT SƯ TIẾP NHẬN TRỰC TUYẾN'}
              </span>
            </div>

            {/* Retro Specialty Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              {[
                { key: 'ALL', label: isEn ? '[ALL CATEGORIES]' : '[TẤT CẢ]' },
                { key: 'LAND', label: isEn ? 'LAND & TITLE' : 'ĐẤT ĐAI' },
                { key: 'CORPORATE', label: isEn ? 'CORPORATE' : 'DOANH NGHIỆP' },
                { key: 'CIVIL', label: isEn ? 'CIVIL' : 'DÂN SỰ' },
                { key: 'FAMILY', label: isEn ? 'FAMILY' : 'HÔN NHÂN' },
                { key: 'CRIMINAL', label: isEn ? 'CRIMINAL' : 'HÌNH SỰ' },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1 font-mono uppercase text-[11px] font-bold transition-all border ${
                      isActive
                        ? 'bg-[#181614] text-white dark:bg-[#e8dfd1] dark:text-[#181614] border-stone-900'
                        : 'bg-transparent text-stone-600 dark:text-stone-400 border-transparent hover:border-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ledger Table Rows */}
          <div ref={rowsRef} className="divide-y-2 divide-stone-200 dark:divide-[#24211c]">
            {isLawyersLoading ? (
              <div className="py-12 text-center font-mono text-xs text-stone-500 flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-[#d95327]" />
                <span>{isEn ? 'Loading official docket records...' : 'Đang truy xuất danh sách luật sư trực tuyến...'}</span>
              </div>
            ) : lawyers.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-stone-500 space-y-1">
                <p>{isEn ? 'No advocate records matching this specialty.' : 'Chưa có luật sư nào trong chuyên ngành này.'}</p>
                <Link href="/lawyers" className="text-[#d95327] hover:underline font-bold">
                  {isEn ? 'Browse full directory →' : 'Xem toàn bộ danh bạ →'}
                </Link>
              </div>
            ) : (
              lawyers.slice(0, 6).map((lawyer: any, idx: number) => {
                const docketId = `DOCKET-${lawyer.lawyer_code || String(idx + 101).padStart(3, '0')}`;
                const lawyerName = lawyer.name ? `Ls. ${lawyer.name}` : 'Luật sư Thành viên';
                const barAssociation = lawyer.province
                  ? `Đoàn Luật sư ${lawyer.province}`
                  : 'Đoàn Luật sư Việt Nam';
                const categoryDesc = lawyer.description || getCategoryName(lawyer.type || lawyer.categories || 'CIVIL');
                const ratingNum = lawyer.star || lawyer.stars ? Number(lawyer.star || lawyer.stars).toFixed(1) : null;
                const priceFormatted = lawyer.price
                  ? `${Number(lawyer.price).toLocaleString('vi-VN')} đ / 30m`
                  : (isEn ? 'Consult rate on request' : 'Liên hệ biểu phí');

                return (
                  <div
                    key={lawyer._id || idx}
                    onClick={() => router.push(`/lawyers/${lawyer._id}`)}
                    className="docket-row opacity-0 px-5 py-4 hover:bg-stone-200/60 dark:hover:bg-[#201d19] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                  >
                    {/* Left: Case Id & Lawyer Name */}
                    <div className="flex items-center gap-4 min-w-[260px]">
                      <span className="font-mono text-xs font-bold text-stone-500 dark:text-stone-400 bg-stone-200 dark:bg-[#221e1b] px-2 py-1 border border-stone-300 dark:border-stone-700 shrink-0">
                        {docketId}
                      </span>
                      <div className="overflow-hidden">
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-[#fbf8f2] group-hover:text-[#d95327] transition-colors truncate">
                          {lawyerName}
                        </h4>
                        <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate block">
                          {barAssociation}
                        </span>
                      </div>
                    </div>

                    {/* Specialty / Description */}
                    <div className="text-xs text-stone-700 dark:text-stone-300 font-sans max-w-sm truncate font-medium flex-1">
                      {categoryDesc}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                      {ratingNum ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          ★ {ratingNum}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">
                          {isEn ? 'New member' : 'Mới tham gia'}
                        </span>
                      )}
                    </div>

                    {/* Price Ticket */}
                    <div className="font-mono text-xs font-bold text-[#d95327] dark:text-[#e26d46] bg-stone-200/70 dark:bg-[#24211c] px-2.5 py-1 border border-dashed border-stone-400 dark:border-stone-700 shrink-0">
                      {priceFormatted}
                    </div>

                    {/* Status Badge & CTA Button */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                        <span>{isEn ? 'Available' : 'Sẵn sàng tư vấn'}</span>
                      </div>

                      <div className="w-7 h-7 rounded-none bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 flex items-center justify-center group-hover:bg-[#d95327] group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ledger Footer */}
          <div className="px-5 py-3 bg-stone-200/50 dark:bg-[#1a1715] border-t-2 border-stone-800 dark:border-[#38332c] flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2d6a4f] dark:text-emerald-400" />
              <span>{isEn ? 'Encrypted Record Registry • Bar Verified' : 'Hồ sơ thụ lý trực tiếp cùng Luật sư'}</span>
            </div>
            <Link
              href="/lawyers"
              className="hover:text-[#d95327] dark:hover:text-[#e26d46] font-bold flex items-center gap-1 transition-colors uppercase tracking-wider"
            >
              <span>{isEn ? `Inspect Full Directory (${lawyers.length}+)` : `Xem toàn bộ ${lawyers.length} hồ sơ luật sư`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;