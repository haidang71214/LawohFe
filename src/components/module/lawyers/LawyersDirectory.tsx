'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Star,
  ShieldCheck,
  ArrowRight,
  RotateCw,
  X,
  Filter,
  MapPin,
  Briefcase,
  Scale,
} from 'lucide-react';
import { useFilterLawyersQuery } from '@/store/queries/lawyer';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useProvinces } from '@/lib/useProvinces';
import { useLanguage } from '@/i18n/LanguageContext';
import { animate, stagger, remove } from 'animejs';

export default function LawyersDirectory() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCat = searchParams.get('category') || searchParams.get('type') || '';
  const initialProv = searchParams.get('province') || '';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedProvince, setSelectedProvince] = useState(initialProv);
  const { provinces } = useProvinces();

  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Sync state if URL query params change (e.g. navigation from Home)
  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('type') || '';
    const prov = searchParams.get('province') || '';
    setSelectedCategory(cat);
    setSelectedProvince(prov);
  }, [searchParams]);

  const { data: rawResponse, isLoading, isFetching, refetch } = useFilterLawyersQuery({
    type: selectedCategory || undefined,
    province: selectedProvince || undefined,
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

  const filteredLawyers = useMemo(() => {
    return lawyers.filter((l: any) => {
      const matchSearch =
        !search ||
        (l.name && l.name.toLowerCase().includes(search.toLowerCase())) ||
        (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
        (l.province && l.province.toLowerCase().includes(search.toLowerCase())) ||
        (l.description && l.description.toLowerCase().includes(search.toLowerCase()));

      return matchSearch;
    });
  }, [lawyers, search]);

  // Anime.js stagger animations on lawyers grid cards
  useEffect(() => {
    if (!gridContainerRef.current) return;
    const items = gridContainerRef.current.querySelectorAll('.retro-lawyer-card');
    if (items.length > 0) {
      remove(items);
      animate(items, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 450,
        delay: stagger(40, { start: 40 }),
        ease: 'outQuart',
      });
    }
  }, [filteredLawyers, selectedCategory, selectedProvince]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
      params.delete('type');
    }
    router.replace(`/lawyers?${params.toString()}`);
  };

  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    const params = new URLSearchParams(searchParams.toString());
    if (prov) {
      params.set('province', prov);
    } else {
      params.delete('province');
    }
    router.replace(`/lawyers?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedProvince('');
    router.replace('/lawyers');
  };

  const activeCategoryLabel = selectedCategory
    ? t(`categories.${selectedCategory}`, (LawyerCategoriesVietnamese as any)[selectedCategory] || selectedCategory)
    : null;

  return (
    <div className="min-h-screen bg-[#f7f8f4] dark:bg-[#0f1511] text-stone-900 dark:text-[#ecf3ee] flex flex-col font-sans transition-colors selection:bg-[#1e4f35] selection:text-white">
      {/* Header Banner (Hunter Green Broadsheet Top) */}
      <section className="py-12 border-b-2 border-stone-800 dark:border-[#2f4236] bg-[#edf2eb] dark:bg-[#131d16] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white dark:bg-[#1b2b20] border border-stone-800 dark:border-[#385945] text-[10px] font-mono font-bold uppercase tracking-wider text-[#1e4f35] dark:text-[#52a677]">
            <Scale className="w-3.5 h-3.5" />
            <span>[BAR ASSOCIATION DIRECTORY]</span>
            <span>•</span>
            <span>{isEn ? 'OFFICIAL ROLL OF COUNSEL' : 'NIÊN GIÁM ĐOÀN LUẬT SƯ TOÀN QUỐC'}</span>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-[#fbf8f2]">
              {t('lawyer.directoryTitle', 'Danh Bạ Luật Sư Toàn Quốc')}
            </h1>

            <div className="flex items-center gap-2 text-xs font-mono">
              {activeCategoryLabel && (
                <span className="px-2.5 py-1 bg-[#1e4f35] text-white font-bold border border-stone-900">
                  {activeCategoryLabel}
                </span>
              )}
              <span className="px-2.5 py-1 bg-white dark:bg-[#1b2b20] border border-stone-800 dark:border-stone-600 font-bold text-stone-700 dark:text-stone-300">
                [TỔNG SỐ: {filteredLawyers.length} LUẬT SƯ]
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-3xl leading-relaxed">
            {t(
              'lawyer.directorySubtitle',
              'Danh bạ chính quy đã xác minh thẻ hành nghề thuộc các Đoàn Luật sư Việt Nam. Tư vấn pháp luật trực tuyến, thẩm định hồ sơ và đại diện tranh tụng tại Tòa án.'
            )}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Search & Filters Docket Bar */}
        <div className="p-4 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0a100c] flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 font-mono">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('lawyer.searchPlaceholder', 'TRA CỨU TÊN LUẬT SƯ, CHUYÊN MÔN, TỈNH THÀNH...')}
              className="w-full pl-10 pr-4 py-2 bg-[#f7f8f4] dark:bg-[#0f1511] border-2 border-stone-800 dark:border-[#385945] text-xs font-mono text-stone-900 dark:text-[#ecf3ee] placeholder:text-stone-500 focus:outline-none focus:border-[#1e4f35]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`px-3 py-2 border-2 text-xs font-mono font-bold focus:outline-none focus:border-[#1e4f35] w-full md:w-56 transition-colors ${
              selectedCategory
                ? 'bg-[#1e4f35] text-white border-stone-900'
                : 'bg-[#f7f8f4] dark:bg-[#0f1511] border-stone-800 dark:border-[#385945] text-stone-800 dark:text-stone-200'
            }`}
          >
            <option value="">{t('lawyer.allSpecialties', '[TẤT CẢ LĨNH VỰC]')}</option>
            {Object.entries(LawyerCategoriesVietnamese).map(([key, label]) => (
              <option key={key} value={key} className="bg-white text-stone-900 dark:bg-[#0f1511] dark:text-white">
                {t(`categories.${key}`, label)}
              </option>
            ))}
          </select>

          {/* Province Filter */}
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className={`px-3 py-2 border-2 text-xs font-mono font-bold focus:outline-none focus:border-[#1e4f35] w-full md:w-44 transition-colors ${
              selectedProvince
                ? 'bg-[#1e4f35] text-white border-stone-900'
                : 'bg-[#f7f8f4] dark:bg-[#0f1511] border-stone-800 dark:border-[#385945] text-stone-800 dark:text-stone-200'
            }`}
          >
            <option value="">{t('lawyer.allProvinces', '[TOÀN QUỐC]')}</option>
            {provinces.map((prov) => (
              <option key={prov} value={prov} className="bg-white text-stone-900 dark:bg-[#0f1511] dark:text-white">
                {prov}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(selectedCategory || selectedProvince || search) && (
            <button
              onClick={clearAllFilters}
              className="h-9 px-3 bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0"
              title={isEn ? 'Clear all active filters' : 'Xóa bộ lọc'}
            >
              <X className="w-3.5 h-3.5" />
              <span>{isEn ? 'RESET' : 'ĐẶT LẠI'}</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 bg-[#f7f8f4] dark:bg-[#0f1511] hover:bg-[#1e4f35] hover:text-white border-2 border-stone-800 dark:border-[#385945] text-stone-800 dark:text-stone-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            title={t('common.refresh', 'Làm mới danh sách')}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#1e4f35]' : ''}`} />
            <span className="hidden sm:inline">{isEn ? 'REFRESH' : 'LÀM MỚI'}</span>
          </button>
        </div>

        {/* LAWYERS GRID VIEW (RETRO CARDS) */}
        {isLoading ? (
          <div className="p-16 text-center text-xs font-mono text-stone-500 space-y-3 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236]">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#1e4f35]" />
            <p>[ĐANG TẢI NIÊN GIÁM LUẬT SƯ...]</p>
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="p-16 text-center text-xs space-y-3 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236]">
            <Filter className="w-10 h-10 mx-auto opacity-40 text-stone-500" />
            <div className="space-y-1 font-mono">
              <p className="font-bold text-sm text-stone-900 dark:text-[#f7f8f8] uppercase">
                [KHÔNG TÌM THẤY HỒ SƠ LUẬT SƯ PHÙ HỢP]
              </p>
              <p className="text-xs text-stone-500 font-sans">
                {isEn
                  ? 'Try selecting a different specialty or province filter.'
                  : 'Hãy thử chọn lĩnh vực khác hoặc xóa bộ lọc để xem toàn bộ danh bạ.'}
              </p>
            </div>
            {(selectedCategory || selectedProvince || search) && (
              <button
                onClick={clearAllFilters}
                className="mt-3 px-4 py-2 bg-[#1e4f35] text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-stone-900 shadow-[2px_2px_0px_#0e2a1b] cursor-pointer"
              >
                <span>{isEn ? 'Show All Lawyers' : 'Xem toàn bộ danh bạ'}</span>
              </button>
            )}
          </div>
        ) : (
          <div
            ref={gridContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredLawyers.map((lawyer: any, idx: number) => {
              const avatar =
                lawyer.avartar_url ||
                lawyer.avatar_url ||
                lawyer.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lawyer.name || 'LS')}&backgroundColor=1e4f35&textColor=ffffff`;

              const specialties: string[] = Array.isArray(lawyer.type_lawyer)
                ? lawyer.type_lawyer
                : (Array.isArray(lawyer.typeLawyer?.type)
                  ? lawyer.typeLawyer.type
                  : (lawyer.type_lawyer ? [lawyer.type_lawyer] : []));

              return (
                <div
                  key={lawyer._id || idx}
                  className="retro-lawyer-card opacity-0 bg-white dark:bg-[#141d17] border-2 border-stone-800 dark:border-[#2f4236] shadow-[4px_4px_0px_#1e4f35] dark:shadow-[4px_4px_0px_#0e2a1b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1e4f35] transition-all flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Top Bar Registration Number */}
                  <div className="flex items-center justify-between border-b-2 border-stone-800 dark:border-[#2f4236] px-4 py-2 bg-[#edf2eb] dark:bg-[#1a2820] text-[10px] font-mono">
                    <span className="font-bold text-[#1e4f35] dark:text-[#52a677]">
                      [DOCKET NO. {lawyer._id?.slice(-4).toUpperCase() || 'LS-01'}]
                    </span>

                    <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1e4f35] dark:text-emerald-400" />
                      <span>XÁC THỰC THẺ</span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={avatar}
                          alt={lawyer.name}
                          className="w-16 h-16 rounded-none object-cover border-2 border-stone-800 dark:border-[#385945] shadow-[2px_2px_0px_#1e4f35]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=LS&backgroundColor=1e4f35&textColor=ffffff`;
                          }}
                        />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2] group-hover:text-[#1e4f35] dark:group-hover:text-[#52a677] transition-colors truncate">
                          {lawyer.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600 dark:text-stone-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-500" />
                            {lawyer.province || 'Hà Nội'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-bold text-stone-800 dark:text-stone-300">
                            <Briefcase className="w-3 h-3 text-[#1e4f35] dark:text-[#52a677]" />
                            {lawyer.experienceYear || 0} năm KN
                          </span>
                        </div>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-1.5 text-xs font-mono pt-0.5">
                          {lawyer.star || lawyer.stars ? (
                            <>
                              <div className="flex items-center text-amber-600 dark:text-amber-400 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="ml-1">{Number(lawyer.star || lawyer.stars).toFixed(1)}</span>
                              </div>
                              <span className="text-stone-400 text-[10px]">
                                ({lawyer.ratingCount || 0} {isEn ? 'reviews' : 'đánh giá'})
                              </span>
                            </>
                          ) : (
                            <span className="text-stone-400 text-[10px]">
                              {isEn ? 'No reviews yet' : 'Chưa có đánh giá'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-sans line-clamp-2 leading-relaxed italic border-l-2 border-stone-300 dark:border-stone-700 pl-3 py-0.5">
                      &quot;{lawyer.description || (isEn ? 'Specialized in civil litigation, commercial contracts and land disputes.' : 'Chuyên sâu tư vấn tố tụng dân sự, hợp đồng thương mại và đất đai.')}&quot;
                    </p>

                    {/* Practice Area Badges */}
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {specialties.slice(0, 3).map((specKey) => (
                          <span
                            key={specKey}
                            className="px-2 py-0.5 text-[10px] font-mono font-medium bg-[#edf2eb] dark:bg-[#1b2b20] border border-stone-300 dark:border-[#385945] text-[#1e4f35] dark:text-[#52a677]"
                          >
                            {LawyerCategoriesVietnamese[specKey as keyof typeof LawyerCategoriesVietnamese] || specKey}
                          </span>
                        ))}
                        {specialties.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#edf2eb] dark:bg-[#1b2b20] text-stone-500">
                            +{specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Action */}
                  <div className="p-4 bg-[#edf2eb]/80 dark:bg-[#18261e] border-t-2 border-stone-800 dark:border-[#2f4236] flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-[#1e4f35] dark:text-emerald-400 font-bold">
                      ● ĐANG NHẬN LỊCH
                    </span>

                    <Link
                      href={`/lawyerDetail/${lawyer._id}`}
                      className="px-3.5 py-1.5 bg-[#1e4f35] hover:bg-[#286b48] text-white font-mono text-[11px] uppercase tracking-wider font-bold border border-stone-900 shadow-[2px_2px_0px_#0e2a1b] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('common.viewDetails', 'XEM HỒ SƠ')}</span>
                      <ArrowRight className="w-3 h-3" />
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