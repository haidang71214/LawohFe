'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  FolderArchive,
  ArrowDownToLine,
  Eye,
  RotateCw,
  FileText,
  ShieldCheck,
  Building2,
  Scale,
  Users,
  Briefcase,
  Layers,
  MapPin,
} from 'lucide-react';
import { useGetFormsQuery } from '@/store/queries/form';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

interface DocumentTypeProps {
  typeDocument: string;
}

interface CategoryInfo {
  code: string;
  label: string;
  desc: string;
  aliases: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const DOCUMENT_CATEGORIES: Record<string, CategoryInfo> = {
  ALL: {
    code: 'DOC-ALL',
    label: 'Tất cả biểu mẫu',
    desc: 'Toàn bộ kho biểu mẫu pháp lý, văn bản mẫu hợp đồng và đơn thư tố tụng được tải lên hệ thống.',
    aliases: ['ALL'],
    icon: Layers,
  },
  DN: {
    code: 'DOC-DN',
    label: 'Doanh nghiệp & Thương mại',
    desc: 'Mẫu hợp đồng kinh tế, điều lệ công ty, biên bản họp Hội đồng quản trị, thủ tục thành lập và giải thể.',
    aliases: ['DN', 'BUSINESS', 'CORPORATE', 'DOANH NGHIEP'],
    icon: Building2,
  },
  DS: {
    code: 'DOC-DS',
    label: 'Dân sự & Thừa kế',
    desc: 'Đơn khởi kiện dân sự, hợp đồng vay mượn, giấy ủy quyền, văn bản phân chia di sản thừa kế và di chúc.',
    aliases: ['DS', 'CIVIL', 'DAN SU', 'INHERITANCE'],
    icon: Scale,
  },
  DAT: {
    code: 'DOC-DAT',
    label: 'Đất đai & Bất động sản',
    desc: 'Hợp đồng chuyển nhượng quyền sử dụng đất, đơn tranh chấp ranh giới, thủ tục cấp giấy chứng nhận (Sổ đỏ).',
    aliases: ['DAT', 'LAND', 'DAT DAI', 'BAT DONG SAN'],
    icon: MapPin,
  },
  HS: {
    code: 'DOC-HS',
    label: 'Hình sự & Tố tụng',
    desc: 'Đơn tố giác tội phạm, đơn xin bảo lãnh tại ngoại, bản tự khai, đơn xin giảm nhẹ trách nhiệm hình sự.',
    aliases: ['HS', 'CRIMINAL', 'HINH SU'],
    icon: ShieldCheck,
  },
  HN: {
    code: 'DOC-HN',
    label: 'Hôn nhân & Gia đình',
    desc: 'Đơn thuận tình ly hôn, đơn ly hôn đơn phương, thỏa thuận phân chia tài sản chung và quyền trực tiếp nuôi con.',
    aliases: ['HN', 'FAMILY', 'HON NHAN'],
    icon: Users,
  },
  LD: {
    code: 'DOC-LD',
    label: 'Lao động & Việc làm',
    desc: 'Hợp đồng lao động chuẩn, quyết định chấm dứt HĐLĐ, nội quy lao động doanh nghiệp, đơn khiếu nại thôi việc.',
    aliases: ['LD', 'LABOR', 'LAO DONG'],
    icon: Briefcase,
  },
};

export default function DocumentTypeIndex({ typeDocument }: DocumentTypeProps) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const normalizedCategoryKey = useMemo(() => {
    const raw = (typeDocument || 'ALL').toUpperCase();
    if (DOCUMENT_CATEGORIES[raw]) return raw;
    for (const [key, val] of Object.entries(DOCUMENT_CATEGORIES)) {
      if (val.aliases.includes(raw)) return key;
    }
    return 'ALL';
  }, [typeDocument]);

  const currentCategory = DOCUMENT_CATEGORIES[normalizedCategoryKey] || DOCUMENT_CATEGORIES.ALL;

  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Gọi trực tiếp API Form từ backend (GET /api/v1/form)
  const {
    data: formsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetFormsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Trích xuất danh sách Form hoàn toàn từ dữ liệu API trả về
  const allDocuments = useMemo(() => {
    const rootData = (formsResponse as any)?.data !== undefined ? (formsResponse as any).data : formsResponse;
    let serverItems: any[] = [];

    if (Array.isArray(rootData)) {
      serverItems = rootData;
    } else if (Array.isArray(rootData?.data)) {
      serverItems = rootData.data;
    } else if (Array.isArray(rootData?.items)) {
      serverItems = rootData.items;
    } else if (Array.isArray(rootData?.forms)) {
      serverItems = rootData.forms;
    } else if (Array.isArray((formsResponse as any)?.items)) {
      serverItems = (formsResponse as any).items;
    }

    return serverItems.map((form: any, idx: number) => {
      const uri = form.uri_secure || form.uri || '';
      let title = form.mainContent || form.title || form.name || '';
      if (!title && uri) {
        let clean = decodeURIComponent(uri.split('/').pop() || uri);
        clean = clean.replace(/^\d+-/, '').replace(/-\d+$/, '').replace(/[_-]+/g, ' ').trim();
        title = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      if (!title) title = `Biểu mẫu số #${idx + 1}`;

      const rawType = String(form.type || '').toUpperCase();
      const isPdf = uri.toLowerCase().includes('.pdf');

      return {
        _id: form._id || form.id || `server_doc_${idx}`,
        code: `DOC-${(rawType || 'PL').slice(0, 4)}/${(idx + 1).toString().padStart(2, '0')}`,
        title,
        description: form.description || (isEn ? 'Official standard template issued under statutory guidelines.' : 'Biểu mẫu chuẩn quy định.'),
        type: rawType || 'CIVIL',
        format: isPdf ? 'PDF' : 'DOCX',
        fileSize: form.fileSize || 'Standard',
        officialAuthority: (LawyerCategoriesVietnamese as any)[rawType] || rawType || 'Cơ quan Pháp luật',
        uri_secure: uri,
        createdAt: form.createdAt,
      };
    });
  }, [formsResponse, isEn]);

  // Lọc biểu mẫu theo Category tab đang chọn và từ khóa Search
  const filteredDocs = useMemo(() => {
    return allDocuments.filter((doc) => {
      // Khớp Category
      let matchCat = true;
      if (normalizedCategoryKey !== 'ALL') {
        const catObj = DOCUMENT_CATEGORIES[normalizedCategoryKey];
        const aliases = catObj?.aliases || [normalizedCategoryKey];
        const docTypeUpper = String(doc.type || '').toUpperCase();
        matchCat = aliases.some(
          (alias) => docTypeUpper === alias || docTypeUpper.includes(alias) || alias.includes(docTypeUpper)
        );
      }

      // Khớp Search từ khóa
      let matchSearch = true;
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = doc.title?.toLowerCase().includes(q);
        const descMatch = doc.description?.toLowerCase().includes(q);
        const codeMatch = doc.code?.toLowerCase().includes(q);
        matchSearch = Boolean(titleMatch || descMatch || codeMatch);
      }

      return matchCat && matchSearch;
    });
  }, [allDocuments, normalizedCategoryKey, search]);

  const handleDownload = (doc: any) => {
    const downloadUrl = doc.uri_secure;
    if (downloadUrl) {
      toast.success(
        isEn ? 'Starting download...' : 'Đang tải xuống biểu mẫu...',
        doc.title
      );
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${doc.title}.${doc.format.toLowerCase()}`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info(
        isEn ? 'Opening document preview' : 'Đang mở xem tài liệu'
      );
      setSelectedDoc(doc);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f3] dark:bg-[#170e10] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Editorial Masthead / Header */}
      <section className="pt-10 pb-8 border-b-2 border-stone-800 dark:border-[#7f1d28] bg-stone-100/90 dark:bg-[#201316]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700/60 pb-2 text-[11px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-bold text-[#7f1d28] dark:text-[#e56776]">
              <FolderArchive className="w-3.5 h-3.5" />
              {isEn ? 'OFFICIAL LITIGATION ARCHIVE & FORMS' : 'TỔNG CỤC LƯU TRỮ VĂN BẢN & BIỂU MẪU TỐ TỤNG'}
            </span>
            <span className="hidden sm:inline">ARCHIVE SERIES 2026 • LIVE API SYNC</span>
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {isEn ? 'OFFICIAL DATABASE' : 'DỮ LIỆU HỆ THỐNG'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
                {isEn ? 'Legal Templates & Standard Forms Archive' : 'Kho Biểu Mẫu Pháp Lý & Văn Bản Mẫu'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-2xl leading-relaxed">
                {currentCategory.desc} {isEn ? 'Standardized DOCX / PDF formats loaded directly from the system backend.' : 'Định dạng văn bản DOCX / PDF được tải trực tiếp từ hệ thống dữ liệu.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="px-3.5 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#7f1d28] hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                title={isEn ? 'Synchronize repository' : 'Đồng bộ biểu mẫu mới nhất'}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#7f1d28] dark:text-[#e56776]' : ''}`} />
                <span>{isEn ? 'Sync Data' : 'Làm mới API'}</span>
              </button>
            </div>
          </div>

          {/* Category Tabs / Docket Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, cat]) => {
              const Icon = cat.icon;
              const isActive = normalizedCategoryKey === key;
              return (
                <Link
                  key={key}
                  href={`/document/${key}`}
                  className={`px-3 py-1.5 border-2 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                    isActive
                      ? 'border-[#7f1d28] dark:border-[#e56776] bg-[#7f1d28] dark:bg-[#e56776] text-white dark:text-stone-950 shadow-[3px_3px_0px_#4a0d14]'
                      : 'border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1a1114] text-stone-800 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-[2px_2px_0px_#7f1d28]/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>[{cat.code}] {cat.label.split('&')[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? 'Search templates by title, keywords...' : 'Tra cứu tên biểu mẫu, loại hợp đồng, đơn thư...'}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1f1417] text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#7f1d28] dark:focus:border-[#e56776] shadow-[3px_3px_0px_#7f1d28]/20"
            />
          </div>

          <div className="font-mono text-xs text-stone-600 dark:text-stone-400">
            {isEn ? 'Total API forms: ' : 'Số lượng từ API: '}
            <strong className="text-stone-900 dark:text-stone-100">{filteredDocs.length}</strong>
            {isEn ? ' documents' : ' biểu mẫu'}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="border-2 border-stone-800 dark:border-[#7f1d28] bg-white dark:bg-[#1c1215] shadow-[6px_6px_0px_#7f1d28] p-12 text-center text-xs font-mono text-stone-500 flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[#7f1d28] dark:text-[#e56776]" />
            <span>{isEn ? 'Fetching forms from API /api/v1/form...' : 'Đang tải dữ liệu từ API /api/v1/form...'}</span>
          </div>
        )}

        {/* Document Docket List */}
        {!isLoading && filteredDocs.length === 0 ? (
          <div className="border-2 border-stone-800 dark:border-[#7f1d28] bg-white dark:bg-[#1c1215] shadow-[6px_6px_0px_#7f1d28] p-12 text-center text-xs font-mono text-stone-500 space-y-3">
            <FolderArchive className="w-10 h-10 mx-auto text-stone-400 dark:text-stone-600 opacity-60" />
            <p className="font-bold text-stone-700 dark:text-stone-300 text-sm">
              {isEn ? 'No forms returned from API for this category.' : 'Chưa có biểu mẫu nào từ API trong danh mục này.'}
            </p>
            <p className="text-stone-500">
              {isEn
                ? 'Try selecting another category or check the Admin Form upload panel.'
                : 'Thử chuyển sang danh mục khác hoặc tải biểu mẫu lên qua trang Quản trị Admin.'}
            </p>
          </div>
        ) : (
          <div className="border-2 border-stone-800 dark:border-[#7f1d28] bg-white dark:bg-[#1c1215] shadow-[6px_6px_0px_#7f1d28] dark:shadow-[6px_6px_0px_#e56776] divide-y-2 divide-stone-800 dark:divide-stone-800">
            {filteredDocs.map((doc) => {
              const formattedType = (LawyerCategoriesVietnamese as any)[doc.type] || doc.type || 'Pháp lý';
              return (
                <div
                  key={doc._id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-[#25181c] transition-colors group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 border border-[#7f1d28] dark:border-[#e56776] text-[#7f1d28] dark:text-[#e56776] bg-[#7f1d28]/10">
                        [{doc.code}]
                      </span>
                      <span className="font-mono text-[10px] text-stone-600 dark:text-stone-400 font-semibold">
                        {formattedType}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 border border-stone-400 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {doc.format}
                      </span>
                    </div>

                    <h3
                      onClick={() => setSelectedDoc(doc)}
                      className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-50 group-hover:text-[#7f1d28] dark:group-hover:text-[#e56776] transition-colors leading-snug cursor-pointer"
                    >
                      {doc.title}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-3xl font-sans">
                      {doc.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 font-mono">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="px-3 py-2 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 shadow-[2px_2px_0px_#7f1d28]/30 transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Preview' : 'Xem mẫu'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="px-4 py-2 border-2 border-stone-800 dark:border-[#e56776] bg-[#7f1d28] dark:bg-[#e56776] hover:bg-[#a12836] dark:hover:bg-[#f08592] text-white dark:text-stone-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#4a0d14] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>{isEn ? `Download ${doc.format}` : `Tải ${doc.format}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modern High-Fidelity Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          doc={{
            title: selectedDoc.title,
            type: selectedDoc.type,
            description: selectedDoc.description,
            uri: selectedDoc.uri_secure,
            uri_secure: selectedDoc.uri_secure,
            createdAt: selectedDoc.createdAt,
          }}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}