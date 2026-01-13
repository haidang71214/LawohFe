'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, MapPin, Briefcase, Award, ArrowRight } from 'lucide-react';
import { useFilterLawyersQuery } from '@/store/queries/lawyer';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';
import AnimeText from '@/components/common/AnimeText';
import { animate, stagger, remove } from 'animejs';

const LawyerRanking: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const sectionRef = useRef<HTMLElement>(null);
  const docketRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  const { data: rawResponse, isLoading } = useFilterLawyersQuery({});

  const lawyers = React.useMemo(() => {
    const rawData = (rawResponse?.data as any) || {};
    const list =
      rawData?.lawyers ||
      rawData?.items ||
      (Array.isArray(rawResponse?.data) ? rawResponse.data : []);
    return Array.isArray(list) ? list.slice(0, 6) : [];
  }, [rawResponse]);

  useEffect(() => {
    hasAnimatedRef.current = false;
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            if (docketRef.current) {
              const items = docketRef.current.querySelectorAll('.retro-ranking-card');
              if (items.length > 0) {
                remove(items);
                animate(items, {
                  opacity: [0, 1],
                  translateY: [16, 0],
                  duration: 500,
                  delay: stagger(60, { start: 100 }),
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
  }, [lawyers, language]);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          label: isEn ? 'RANK I' : 'HẠNG I',
          bg: 'bg-amber-600 text-white border-stone-900',
        };
      case 1:
        return {
          label: isEn ? 'RANK II' : 'HẠNG II',
          bg: 'bg-stone-600 text-white border-stone-900',
        };
      case 2:
        return {
          label: isEn ? 'RANK III' : 'HẠNG III',
          bg: 'bg-[#d95327] text-white border-stone-900',
        };
      default:
        return {
          label: `#0${index + 1}`,
          bg: 'bg-stone-200 dark:bg-[#25211e] text-stone-700 dark:text-stone-300 border-stone-800 dark:border-[#38332c]',
        };
    }
  };

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
              <Award className="w-3.5 h-3.5" />
              <span>[SECTION III]</span>
              <span>•</span>
              <span>{isEn ? 'LEGAL HONOR ROLL' : 'BẢNG VINH DANH ĐOÀN LUẬT SƯ'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-[#fbf8f2]">
              <AnimeText
                key={`ranking-title-${language}`}
                text={isEn ? 'Distinguished Counsel & Advocates' : 'Luật Sư Tiêu Biểu & Đánh Giá Cao'}
                type="letters"
                delay={50}
                staggerMs={20}
              />
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-xl">
              {isEn
                ? 'Accredited advocates with exemplary jurisprudence records, verified credentials, and highest client acclaim.'
                : 'Đội ngũ luật sư có thâm niên tranh tụng xuất sắc, được xác thực chứng chỉ hành nghề và đánh giá 5 sao từ thân chủ.'}
            </p>
          </div>

          <Link
            href="/lawyers"
            className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 hover:text-[#d95327] dark:hover:text-[#e26d46] flex items-center gap-1.5 shrink-0 transition-colors uppercase tracking-wider border-b border-stone-400 dark:border-stone-600 pb-0.5 group"
          >
            <span>{isEn ? 'Complete Advocates Roll' : 'Toàn bộ danh bạ'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d95327] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Lawyer Cards Grid */}
        <div ref={docketRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full p-12 text-center text-xs font-mono text-stone-500">
              {isEn ? '[LOADING ADVOCATE ROSTER...]' : '[ĐANG TẢI NIÊN GIÁM LUẬT SƯ...]'}
            </div>
          ) : lawyers.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs font-mono text-stone-500">
              {isEn ? '[NO ADVOCATE DOSSIERS FOUND]' : '[CHƯA CÓ DỮ LIỆU LUẬT SƯ]'}
            </div>
          ) : (
            lawyers.map((lawyer: any, idx: number) => {
              const avatar =
                lawyer.avartar_url ||
                lawyer.avatar_url ||
                lawyer.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lawyer.name || 'LS')}&backgroundColor=181614&textColor=faf7f2`;

              const specialties: string[] = Array.isArray(lawyer.type_lawyer)
                ? lawyer.type_lawyer
                : (Array.isArray(lawyer.typeLawyer?.type)
                  ? lawyer.typeLawyer.type
                  : (lawyer.type_lawyer ? [lawyer.type_lawyer] : []));

              const badge = getRankBadge(idx);

              return (
                <div
                  key={lawyer._id || idx}
                  className="retro-ranking-card opacity-0 bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#181614] dark:hover:shadow-[2px_2px_0px_#e5decf] transition-all flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Top Rank Badge & Verified Stamp */}
                  <div className="flex items-center justify-between border-b-2 border-stone-800 dark:border-[#38332c] px-4 py-2 bg-stone-200 dark:bg-[#201d19]">
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider border ${badge.bg}`}>
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-stone-600 dark:text-stone-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2d6a4f] dark:text-emerald-400" />
                      <span>{isEn ? 'BAR CERTIFIED' : 'ĐOÀN LUẬT SƯ'}</span>
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
                          className="w-16 h-16 rounded-none object-cover border-2 border-stone-800 dark:border-[#443d34] shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=LS&backgroundColor=181614&textColor=faf7f2`;
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#fbf8f2] group-hover:text-[#d95327] dark:group-hover:text-[#e26d46] transition-colors truncate">
                          {lawyer.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600 dark:text-stone-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-500" />
                            {lawyer.province || 'Hà Nội'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-bold text-stone-800 dark:text-stone-300">
                            <Briefcase className="w-3 h-3 text-[#d95327]" />
                            {lawyer.experienceYear || 0} năm KN
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 text-xs font-mono pt-1">
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

                    {/* Specialties */}
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {specialties.slice(0, 3).map((specKey) => (
                          <span
                            key={specKey}
                            className="px-2 py-0.5 text-[10px] font-mono font-medium bg-stone-200 dark:bg-[#25211e] border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                          >
                            {LawyerCategoriesVietnamese[specKey as keyof typeof LawyerCategoriesVietnamese] || specKey}
                          </span>
                        ))}
                        {specialties.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-200 dark:bg-[#25211e] text-stone-500">
                            +{specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Action */}
                  <div className="p-4 bg-stone-200/60 dark:bg-[#1f1c19] border-t-2 border-stone-800 dark:border-[#38332c] flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-[#2d6a4f] dark:text-emerald-400 font-bold">
                      ● SẴN SÀNG TIẾP NHẬN
                    </span>

                    <Link
                      href={`/lawyerDetail/${lawyer._id}`}
                      className="px-3.5 py-1.5 bg-[#181614] hover:bg-[#d95327] dark:bg-[#e8dfd1] dark:hover:bg-[#d95327] text-white dark:text-[#181614] dark:hover:text-white font-mono text-[11px] uppercase tracking-wider font-bold border border-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isEn ? 'EXAMINE DOSSIER' : 'XEM HỒ SƠ'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default LawyerRanking;