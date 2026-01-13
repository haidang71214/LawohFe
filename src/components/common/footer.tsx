'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <footer className="bg-[#faf7f2] dark:bg-[#0c0a09] border-t-4 border-stone-800 dark:border-stone-400 text-stone-700 dark:text-stone-300 font-sans transition-colors duration-200">
      {/* Top Gazette Colophon Banner */}
      <div className="border-b-2 border-stone-800 dark:border-stone-700 bg-stone-200/70 dark:bg-stone-900/90 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#d95327]"></span>
            <span className="font-bold text-stone-900 dark:text-stone-200">
              {isEn ? 'OFFICIAL LEGAL GAZETTE & ARCHIVES' : 'CÔNG BÁO PHÁP LÝ & HỒ SƠ ÁN LỆ'}
            </span>
            <span className="hidden sm:inline text-stone-400">|</span>
            <span className="hidden sm:inline">LAWOH GAZETTE</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-mono">
            <span className="bg-stone-300/80 dark:bg-stone-800 px-2 py-0.5 border border-stone-400 dark:border-stone-600">
              {isEn ? 'VERIFIED ADVOCATE NETWORK' : 'MẠNG LƯỚI LUẬT SƯ CHÍNH THỐNG'}
            </span>
            <span className="hidden md:inline">EDITION: VIETNAM</span>
          </div>
        </div>
      </div>

      {/* Main Broadside Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Masthead Brand & Mission (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              {/* Retro Tactile Seal */}
              <div className="w-10 h-10 border-2 border-stone-800 dark:border-stone-400 bg-[#d95327] text-white flex items-center justify-center shadow-[3px_3px_0px_#1c1917] dark:shadow-[3px_3px_0px_#000] relative">
                <Scale className="w-5 h-5 text-white" />
                <span className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-stone-900"></span>
                <span className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-stone-900"></span>
                <span className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-stone-900"></span>
                <span className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-stone-900"></span>
              </div>
              <div>
                <span className="font-serif font-black text-2xl tracking-tight text-stone-900 dark:text-stone-50 block leading-tight">
                  LawOh
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#d95327] font-bold block">
                  {isEn ? 'Chambers & LegalTech' : 'Công Báo Pháp Lý & Luật Sư'}
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-serif max-w-md">
              {isEn
                ? 'LawOh connects certified advocates directly with citizens and enterprises. Delivering codified docket scheduling, validated case-law precedents, and consultation records.'
                : 'Nền tảng công nghệ pháp lý kết nối trực tiếp Luật sư chính ngạch với người dân và doanh nghiệp. Cung cấp hồ sơ tư vấn trực tuyến, tra cứu án lệ và biểu mẫu pháp lý chuẩn mực.'}
            </p>

            {/* Editorial Registry Stamp */}
            <div className="p-3 border border-stone-400 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-900/60 flex items-center gap-3 max-w-md shadow-[2px_2px_0px_rgba(0,0,0,0.06)]">
              <ShieldCheck className="w-5 h-5 text-[#d95327] shrink-0" />
              <div className="font-mono text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                <p className="font-bold text-stone-800 dark:text-stone-200">
                  {isEn ? 'VERIFIED ADVOCATE PROTOCOL' : 'HỆ THỐNG KẾT NỐI LUẬT SƯ TRỰC TUYẾN'}
                </p>
                <p className="text-[9px]">HỒ SƠ ĐĂNG KÝ VÀ KIỂM DUYỆT BỞI BAN QUẢN TRỊ</p>
              </div>
            </div>
          </div>

          {/* Column 2: Legal Services (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-serif font-black text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider border-b-2 border-stone-800 dark:border-stone-700 pb-1 inline-block">
              § I. {isEn ? 'Services' : 'Dịch vụ'}
            </h4>
            <ul className="space-y-2.5 font-mono text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link href="/lawyers" className="hover:text-[#d95327] dark:hover:text-[#d95327] hover:underline underline-offset-4 flex items-center gap-1.5 transition-colors">
                  <span className="text-stone-400">›</span>
                  {isEn ? 'Bar Directory' : 'Danh bạ Luật sư'}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#d95327] dark:hover:text-[#d95327] hover:underline underline-offset-4 flex items-center gap-1.5 transition-colors">
                  <span className="text-stone-400">›</span>
                  {isEn ? 'Tariff & Booking' : 'Biểu phí & Đặt hẹn'}
                </Link>
              </li>
              <li>
                <Link href="/document/DN" className="hover:text-[#d95327] dark:hover:text-[#d95327] hover:underline underline-offset-4 flex items-center gap-1.5 transition-colors">
                  <span className="text-stone-400">›</span>
                  {isEn ? 'Legal Templates' : 'Biểu mẫu pháp lý'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Gazette & Resources (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-serif font-black text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider border-b-2 border-stone-800 dark:border-stone-700 pb-1 inline-block">
              § II. {isEn ? 'Archives' : 'Tài nguyên'}
            </h4>
            <ul className="space-y-2.5 font-mono text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link href="/document/DN" className="hover:text-[#d95327] dark:hover:text-[#d95327] hover:underline underline-offset-4 flex items-center gap-1.5 transition-colors">
                  <span className="text-stone-400">›</span>
                  {isEn ? 'Corporate Forms' : 'Biểu mẫu Doanh nghiệp'}
                </Link>
              </li>
              <li>
                <Link href="/newsPage" className="hover:text-[#d95327] dark:hover:text-[#d95327] hover:underline underline-offset-4 flex items-center gap-1.5 transition-colors">
                  <span className="text-stone-400">›</span>
                  {isEn ? 'Supreme Case Law' : 'Án lệ & Nghị quyết'}
                </Link>
              </li>
              <li>
                <Link href="/newsPage" className="hover:text-[#d95327] dark:hover:text-[#d95327] hover:underline underline-offset-4 flex items-center gap-1.5 transition-colors">
                  <span className="text-stone-400">›</span>
                  {isEn ? 'Gazette News' : 'Bản tin Công Báo'}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#d95327] dark:hover:text-[#d95327] hover:underline underline-offset-4 flex items-center gap-1.5 transition-colors">
                  <span className="text-stone-400">›</span>
                  {isEn ? 'For Advocates' : 'Dành cho Luật sư'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Chambers Registry / Contact (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-serif font-black text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider border-b-2 border-stone-800 dark:border-stone-700 pb-1 inline-block">
              § III. {isEn ? 'Chambers Dispatch' : 'Liên hệ & Tổng đài'}
            </h4>
            <div className="p-3.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-[3px_3px_0px_#1c1917] dark:shadow-[3px_3px_0px_#000] space-y-3 font-mono text-xs">
              <a
                href="tel:0853012003"
                className="flex items-center gap-2 text-stone-800 dark:text-stone-200 hover:text-[#d95327] dark:hover:text-[#d95327] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#d95327] shrink-0" />
                <span className="font-bold">{isEn ? 'Hotline: 0853012003' : 'Tổng đài: 0853012003'}</span>
              </a>
              <a
                href="mailto:haidang71214@gmail.com"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 text-[11px] hover:text-[#d95327] dark:hover:text-[#d95327] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#d95327] shrink-0" />
                <span>haidang71214@gmail.com</span>
              </a>
              <div className="flex items-start gap-2 text-stone-600 dark:text-stone-400 text-[11px] pt-1 border-t border-stone-200 dark:border-stone-800">
                <MapPin className="w-3.5 h-3.5 text-[#d95327] shrink-0 mt-0.5" />
                <span>{isEn ? 'Headquarters: Da Nang, Vietnam' : 'Trụ sở: Đà Nẵng, Việt Nam'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="mt-12 pt-6 border-t-2 border-dashed border-stone-400 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} LAWOH VIETNAM LEGALTECH CORP.</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">
              {isEn ? 'ALL CONSTITUTIONAL RIGHTS RESERVED.' : 'TOÀN BỘ BẢN QUYỀN ĐƯỢC BẢO LƯU THEO LUẬT ĐỊNH.'}
            </span>
          </div>
          
          <div className="flex items-center gap-6 font-bold uppercase tracking-wider text-[10px]">
            <Link href="/services" className="hover:text-[#d95327] transition-colors underline-offset-2 hover:underline">
              {isEn ? 'TERMS OF DOCKET' : 'ĐIỀU KHOẢN SỬ DỤNG'}
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-[#d95327] transition-colors underline-offset-2 hover:underline">
              {isEn ? 'PRIVACY ARCHIVE' : 'CHÍNH SÁCH BẢO MẬT'}
            </Link>
            <span>/</span>
            <Link href="/newsPage" className="hover:text-[#d95327] transition-colors underline-offset-2 hover:underline">
              {isEn ? 'STATUTES' : 'QUY CHẾ HOẠT ĐỘNG'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;