'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale,
  FileCheck,
  Building2,
  Users,
  Briefcase,
  Home,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import AnimeText from '@/components/common/AnimeText';
import { animate, stagger, remove } from 'animejs';

const Services: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  const capabilities = [
    {
      title: isEn ? 'Corporate & Investment' : 'Doanh nghiệp & Đầu tư',
      desc: isEn
        ? 'Incorporation, corporate restructuring, international commercial contract review, and sub-licenses.'
        : 'Thành lập, tái cấu trúc công ty, thẩm định rủi ro pháp lý hợp đồng thương mại quốc tế và giấy phép con.',
      icon: Building2,
      tag: '01',
      href: '/lawyers?category=BUSINESS',
      category: 'BUSINESS',
      stat: isEn ? 'CORPORATE LAW' : 'DOANH NGHIỆP',
    },
    {
      title: isEn ? 'Real Estate & Land' : 'Đất đai & Bất động sản',
      desc: isEn
        ? 'Boundary disputes, land use rights certification, property transfer, and zoning compliance.'
        : 'Giải quyết tranh chấp ranh giới, thủ tục cấp giấy chứng nhận quyền sử dụng đất, chuyển nhượng và quy hoạch.',
      icon: Home,
      tag: '02',
      href: '/lawyers?category=LAND',
      category: 'LAND',
      stat: isEn ? 'LAND & PROPERTY' : 'ĐẤT ĐAI & NHÀ Ở',
    },
    {
      title: isEn ? 'Marriage & Inheritance' : 'Hôn nhân & Thừa kế',
      desc: isEn
        ? 'Estate distribution according to will, divorce proceedings, and child custody arrangements.'
        : 'Tư vấn phân chia di sản theo di chúc, thủ tục ly hôn thuận tình/đơn phương và quyền trực tiếp nuôi con.',
      icon: Users,
      tag: '03',
      href: '/lawyers?category=FAMILY',
      category: 'FAMILY',
      stat: isEn ? 'FAMILY LAW' : 'HÔN NHÂN & GIA ĐÌNH',
    },
    {
      title: isEn ? 'Civil Litigation' : 'Tranh chấp Dân sự',
      desc: isEn
        ? 'Negotiation representation, mediation, and courtroom defense across all court levels.'
        : 'Đại diện đàm phán, hòa giải tranh chấp và tham gia bảo vệ quyền, lợi ích hợp pháp tại Tòa án các cấp.',
      icon: Scale,
      tag: '04',
      href: '/lawyers?category=CIVIL',
      category: 'CIVIL',
      stat: isEn ? 'CIVIL LITIGATION' : 'DÂN SỰ & HỢP ĐỒNG',
    },
    {
      title: isEn ? 'Labor & Employment' : 'Lao động & Bảo hiểm',
      desc: isEn
        ? 'Unlawful termination claims, severance settlements, labor contracts, and internal regulations.'
        : 'Xử lý tranh chấp sa thải trái luật, trợ cấp thôi việc, hợp đồng lao động và quy chế kỷ luật nội bộ.',
      icon: Briefcase,
      tag: '05',
      href: '/lawyers?category=LABOR',
      category: 'LABOR',
      stat: isEn ? 'LABOR CODE' : 'LAO ĐỘNG & BẢO HIỂM',
    },
    {
      title: isEn ? 'Official Legal Forms' : 'Kho Biểu mẫu Chuẩn',
      desc: isEn
        ? 'Standard legal templates with comprehensive step-by-step guidance.'
        : 'Hệ thống văn bản, hợp đồng mẫu chuẩn theo quy định pháp luật có hướng dẫn điền chi tiết.',
      icon: FileCheck,
      tag: '06',
      href: '/document/DN',
      category: 'DOCUMENT',
      stat: isEn ? 'LEGAL FORMS' : 'BIỂU MẪU ĐIỆN TỬ',
    },
  ];

  // Scroll-triggered animation
  useEffect(() => {
    hasAnimatedRef.current = false;
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            if (gridRef.current) {
              const cards = gridRef.current.querySelectorAll('.retro-service-card');
              if (cards.length > 0) {
                remove(cards);
                animate(cards, {
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
  }, [language]);

  return (
    <section
      ref={sectionRef}
      className="py-20 border-t-2 border-stone-300 dark:border-[#2f2b26] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-stone-800 dark:border-[#38332c]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-stone-200 dark:bg-[#201d19] border border-stone-400 dark:border-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider text-[#d95327] dark:text-[#e26d46]">
              <span>[SECTION II]</span>
              <span>•</span>
              <span>{isEn ? 'PRACTICE DOSSIER' : 'DANH MỤC LĨNH VỰC'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-[#fbf8f2]">
              <AnimeText
                key={`services-title-${language}`}
                text={isEn ? 'Practice Areas & Dossiers' : 'Chuyên Khoa & Lĩnh vực Tranh tụng'}
                type="letters"
                delay={50}
                staggerMs={20}
              />
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-xl">
              {isEn
                ? 'Standardized legal procedures handled by specialized Bar counsel across all jurisdictions.'
                : 'Quy trình giải quyết chuẩn xác, được phụ trách bởi các luật sư chuyên sâu từng ngành luật.'}
            </p>
          </div>

          <Link
            href="/services"
            className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 hover:text-[#d95327] dark:hover:text-[#e26d46] flex items-center gap-1.5 shrink-0 transition-colors uppercase tracking-wider border-b border-stone-400 dark:border-stone-600 pb-0.5 group"
          >
            <span>{isEn ? 'All 12+ Practice Divisions' : 'Xem toàn bộ 12+ lĩnh vực'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d95327] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Vintage Dossier Index Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.tag}
                onClick={() => router.push(cap.href)}
                className="retro-service-card opacity-0 bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] p-6 shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#181614] dark:hover:shadow-[2px_2px_0px_#e5decf] transition-all flex flex-col justify-between gap-6 cursor-pointer group relative overflow-hidden"
              >
                {/* Dossier Corner Stamp */}
                <div className="absolute top-0 right-0 bg-stone-200 dark:bg-[#25211e] border-b-2 border-l-2 border-stone-800 dark:border-[#38332c] px-3 py-1 font-mono text-[11px] font-bold text-stone-700 dark:text-stone-300">
                  NO. {cap.tag}
                </div>

                <div className="space-y-4 pt-2">
                  {/* Icon Box */}
                  <div className="w-12 h-12 bg-white dark:bg-[#201d19] border-2 border-stone-800 dark:border-[#38332c] flex items-center justify-center text-[#d95327] dark:text-[#e26d46] shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] group-hover:bg-[#d95327] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-[#fbf8f2] group-hover:text-[#d95327] dark:group-hover:text-[#e26d46] transition-colors flex items-center justify-between">
                      <span>{cap.title}</span>
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-400 font-sans leading-relaxed line-clamp-3">
                      {cap.desc}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="pt-4 border-t-2 border-dashed border-stone-300 dark:border-stone-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-500 dark:text-stone-400 text-[11px] font-bold">
                    [{cap.stat}]
                  </span>

                  <span className="font-bold text-[#d95327] dark:text-[#e26d46] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{isEn ? 'OPEN DOSSIER' : 'TRA CỨU'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;