'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Send,
  Scale,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

export default function ServicesPage() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Doanh nghiệp & Hợp đồng',
    description: '',
  });

  const pricingTiers = [
    {
      code: 'DIV-01',
      name: isEn ? 'Legal Documents & Precedents' : 'Kho Biểu mẫu & Án lệ Chuẩn',
      price: isEn ? 'Free' : 'Miễn phí',
      period: isEn ? 'Standard Public Access' : 'Truy cập Công khai',
      desc: isEn
        ? '5,000+ standard legal form repository and Supreme Court precedent digests.'
        : 'Kho lưu trữ 5.000+ biểu mẫu đơn từ và hệ thống án lệ Việt Nam chuẩn hóa theo Hội đồng Thẩm phán.',
      features: isEn
        ? [
            'Search legal templates across specialties',
            'Download standard contracts, lawsuits, petitions',
            'Latest regulations & law updates',
            'Step-by-step submission guidelines',
          ]
        : [
            'Tra cứu biểu mẫu pháp lý mọi chuyên ngành',
            'Tải mẫu hợp đồng, đơn khởi kiện, khiếu nại',
            'Cập nhật văn bản quy phạm pháp luật mới',
            'Hướng dẫn kê khai hồ sơ theo chuẩn Tòa án',
          ],
      cta: isEn ? 'Browse Documents' : 'Truy cập Biểu mẫu',
      href: '/document/DN',
      primary: false,
      stamp: isEn ? 'PUBLIC REPO' : 'CÔNG KHAI',
    },
    {
      code: 'DIV-02',
      name: isEn ? '1-on-1 Lawyer Consultation' : 'Tham vấn Trực tiếp cùng Luật sư',
      price: isEn ? 'From 200,000 ₫' : 'Từ 200.000 ₫',
      period: isEn ? 'Per 30-minute session' : 'Mỗi phiên làm việc 30 phút',
      desc: isEn
        ? 'Direct consultation via HD Video Call or at the registered law office.'
        : 'Làm việc trực tiếp qua phòng họp trực tuyến hoặc tại Trụ sở Văn phòng Luật sư chính quy.',
      features: isEn
        ? [
            'Meet verified Bar Association Lawyers directly',
            'Legal review of all existing case files',
            'Dispute resolution and mediation strategy',
            '100% confidential consultation protocol',
            'Meeting notes & summary docket',
          ]
        : [
            'Làm việc trực tiếp Luật sư Đoàn LS TP.HN / TP.HCM',
            'Rà soát tính pháp lý toàn bộ chứng cứ, hồ sơ',
            'Hoạch định phương án tranh chấp hoặc hòa giải',
            'Bảo mật tuyệt đối thông tin phiên tư vấn',
            'Hỗ trợ ghi âm & biên bản tóm tắt phiên tư vấn',
          ],
      cta: isEn ? 'Book a Lawyer' : 'Đặt lịch Luật sư Ngay',
      href: '/lawyers',
      primary: true,
      stamp: isEn ? 'RECOMMENDED' : 'PHỔ BIẾN NHẤT',
    },
    {
      code: 'DIV-03',
      name: isEn ? 'Representation & Litigation' : 'Đại diện Tố tụng & Tranh tụng',
      price: isEn ? 'By Agreement' : 'Theo thỏa thuận',
      period: isEn ? 'Full-case retainer package' : 'Trọn gói theo hợp đồng vụ việc',
      desc: isEn
        ? 'Lawyer defends lawful rights and interests at Court or Arbitration.'
        : 'Luật sư tham gia bảo vệ quyền và lợi ích hợp pháp tại Tòa án hoặc Trung tâm Trọng tài.',
      features: isEn
        ? [
            'Full drafting of petitions, statements, evidence',
            'Representation in negotiations with parties',
            'Courtroom representation across all levels',
            'Transparent legal service agreement',
          ]
        : [
            'Soạn thảo đơn thư, bản tự khai, chứng cứ tố tụng',
            'Đại diện đàm phán thương lượng với các bên',
            'Tham gia tranh tụng tại Tòa án các cấp xét xử',
            'Hợp đồng dịch vụ pháp lý minh bạch theo Luật Luật sư',
          ],
      cta: isEn ? 'Submit Case Intake' : 'Nộp Hồ sơ Yêu cầu',
      href: '#intake-form',
      primary: false,
      stamp: isEn ? 'OFFICIAL LITIGATION' : 'TỐ TỤNG CHÍNH QUY',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      isEn ? 'Request docket submitted' : 'Đã lập hồ sơ yêu cầu thành công',
      isEn
        ? 'Our legal team will contact your phone number within 2 business hours.'
        : 'Ban chuyên môn LawOh sẽ liên hệ lại qua số điện thoại của bạn trong vòng 2 giờ làm việc.'
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0e131b] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Editorial Header / Masthead */}
      <section className="pt-10 pb-8 border-b-2 border-stone-800 dark:border-[#28559a]/60 bg-stone-100/90 dark:bg-[#121924]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700/60 pb-2 text-[11px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-bold text-[#1c3a6b] dark:text-[#5e8ee0]">
              <Scale className="w-3.5 h-3.5" />
              {isEn ? 'OFFICIAL LEGAL TARIFF SCHEDULE' : 'BIỂU PHÍ & DỊCH VỤ PHÁP LÝ CHÍNH THỨC'}
            </span>
            <span className="hidden sm:inline">NO. LAW-SERV-2026</span>
            <span>{isEn ? 'TRANSPARENT & BINDING' : 'MINH BẠCH - ĐÚNG QUY ĐỊNH'}</span>
          </div>

          <div className="pt-2 text-center max-w-3xl mx-auto space-y-2">
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
              {isEn ? 'Consultation & Litigation Services' : 'Phương Thức Tham Vấn & Dịch Vụ Pháp Lý'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-xl mx-auto">
              {isEn
                ? 'No hidden fees. Every tariff rate is publicly posted in compliance with Vietnam Bar Federation standards.'
                : 'Toàn bộ biểu phí được công khai minh bạch theo quy chuẩn Liên đoàn Luật sư Việt Nam. Không phụ phí, không phát sinh.'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full space-y-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col justify-between p-6 sm:p-7 border-2 ${
                tier.primary
                  ? 'border-[#1c3a6b] dark:border-[#5e8ee0] bg-white dark:bg-[#141d2c] shadow-[6px_6px_0px_#1c3a6b] dark:shadow-[6px_6px_0px_#5e8ee0]'
                  : 'border-stone-800 dark:border-stone-700 bg-stone-50/70 dark:bg-[#111722] shadow-[4px_4px_0px_#1c3a6b]/30 dark:shadow-[4px_4px_0px_#000]'
              } transition-all duration-200`}
            >
              {/* Stamp Badge */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-stone-300 dark:border-stone-700 pb-3 mb-4">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 border border-stone-800 dark:border-stone-600 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                  [{tier.code}]
                </span>
                <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 border-2 border-[#1c3a6b] dark:border-[#5e8ee0] text-[#1c3a6b] dark:text-[#5e8ee0]">
                  {tier.stamp}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-50 leading-snug">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    {tier.desc}
                  </p>
                </div>

                <div className="py-3 border-y-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#0c121b] px-3 my-2">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-[#1c3a6b] dark:text-[#5e8ee0]">
                    {tier.price}
                  </div>
                  <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                    {tier.period}
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300 pt-1">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#1c3a6b] dark:text-[#5e8ee0] shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-300 dark:border-stone-700/60">
                <Link
                  href={tier.href}
                  className={`w-full py-2.5 px-4 border-2 font-mono font-bold text-xs uppercase tracking-wider text-center transition-transform active:translate-x-0.5 active:translate-y-0.5 block ${
                    tier.primary
                      ? 'border-[#1c3a6b] bg-[#1c3a6b] text-white hover:bg-[#28559a] shadow-[3px_3px_0px_#0e1f3a] dark:border-[#5e8ee0] dark:bg-[#5e8ee0] dark:text-stone-950 dark:hover:bg-[#7aa6ee]'
                      : 'border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-[3px_3px_0px_#1c3a6b]/40'
                  }`}
                >
                  {tier.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Case Intake Docket Form */}
        <div id="intake-form" className="border-2 border-stone-800 dark:border-[#28559a] bg-stone-50 dark:bg-[#121924] p-6 sm:p-9 shadow-[6px_6px_0px_#1c3a6b] dark:shadow-[6px_6px_0px_#5e8ee0] max-w-3xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-stone-800 dark:border-stone-700 pb-3 gap-2">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#1c3a6b] dark:text-[#5e8ee0] uppercase tracking-wider">
                [FORM: DOCKET-INTAKE]
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-stone-50">
                {isEn ? 'Submit Legal Case Docket' : 'Lập Hồ Sơ Tiếp Nhận Vụ Việc'}
              </h2>
            </div>
            <span className="font-mono text-[10px] text-stone-500 uppercase px-2 py-1 border border-stone-400 dark:border-stone-700 bg-stone-200/60 dark:bg-stone-800">
              CONFIDENTIAL INTAKE
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            {isEn
              ? 'Fill in the intake information. LawOh Legal Directorate will assess jurisdiction and assign accredited advocates.'
              : 'Điền thông tin ban đầu của vụ việc. Ban Thư ký Pháp chế LawOh sẽ phân loại thẩm quyền và cử Luật sư chuyên trách liên hệ.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {t('profile.fullName', 'Họ và tên')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nguyen Van A"
                  className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0c121b] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#1c3a6b] dark:focus:border-[#5e8ee0]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {t('profile.phone', 'Số điện thoại liên lạc')} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912 345 678"
                  className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0c121b] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#1c3a6b] dark:focus:border-[#5e8ee0]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                {isEn ? 'Legal Specialty / Jurisdiction' : 'Lĩnh vực vụ việc'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0c121b] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#1c3a6b] dark:focus:border-[#5e8ee0]"
              >
                <option value="Doanh nghiệp & Hợp đồng">{isEn ? 'Corporate & Commercial Contracts' : 'Doanh nghiệp & Hợp đồng Thương mại'}</option>
                <option value="Đất đai & Bất động sản">{isEn ? 'Real Estate & Land Tenure' : 'Đất đai & Tranh chấp Nhà đất'}</option>
                <option value="Dân sự & Thừa kế">{isEn ? 'Civil Law & Inheritance' : 'Dân sự, Hợp đồng & Thừa kế di sản'}</option>
                <option value="Hôn nhân & Gia đình">{isEn ? 'Marriage & Family' : 'Hôn nhân, Ly hôn & Tài sản chung'}</option>
                <option value="Lao động & Bảo hiểm">{isEn ? 'Labor & Employment' : 'Lao động, Trợ cấp & Bảo hiểm'}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                {isEn ? 'Case Summary & Existing Evidence *' : 'Tóm tắt nội dung vụ việc & Hồ sơ hiện có *'}
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isEn ? 'Briefly describe your case and existing documents...' : 'Mô tả ngắn gọn diễn biến tình huống, các tài liệu chứng cứ hiện có...'}
                className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0c121b] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#1c3a6b] dark:focus:border-[#5e8ee0]"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 border-2 border-stone-800 dark:border-[#5e8ee0] bg-[#1c3a6b] dark:bg-[#5e8ee0] hover:bg-[#28559a] dark:hover:bg-[#7aa6ee] text-white dark:text-stone-950 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_#0e1f3a] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isEn ? 'Submit Case Docket' : 'Gửi Hồ Sơ Tiếp Nhận'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
