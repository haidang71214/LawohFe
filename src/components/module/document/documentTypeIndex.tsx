'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Search,
  X,
  FolderArchive,
  ArrowDownToLine,
} from 'lucide-react';
import toast from '@/lib/toast';

interface DocumentTypeProps {
  typeDocument: string;
}

const documentCategoryMap: Record<string, { code: string; label: string; desc: string }> = {
  DN: { code: 'DOC-DN', label: 'Doanh nghiệp & Thương mại', desc: 'Mẫu hợp đồng kinh tế, điều lệ công ty, biên bản họp Hội đồng quản trị.' },
  DS: { code: 'DOC-DS', label: 'Dân sự & Đất đai', desc: 'Hợp đồng chuyển nhượng quyền sử dụng đất, đơn tranh chấp ranh giới, giấy ủy quyền.' },
  HS: { code: 'DOC-HS', label: 'Hình sự & Tố tụng', desc: 'Đơn tố giác tội phạm, đơn xin bảo lãnh tại ngoại, bản tự khai, đơn giảm nhẹ hình phạt.' },
  HN: { code: 'DOC-HN', label: 'Hôn nhân & Gia đình', desc: 'Đơn thuận tình ly hôn, đơn ly hôn đơn phương, văn bản thỏa thuận phân chia tài sản.' },
  LD: { code: 'DOC-LD', label: 'Lao động & Việc làm', desc: 'Hợp đồng lao động chuẩn, quyết định chấm dứt HĐLĐ, nội quy lao động doanh nghiệp.' },
};

export default function DocumentTypeIndex({ typeDocument }: DocumentTypeProps) {
  const currentCategory = documentCategoryMap[typeDocument] || {
    code: 'DOC-ALL',
    label: 'Văn bản Pháp luật',
    desc: 'Hệ thống biểu mẫu pháp lý chuẩn quy định.',
  };

  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const sampleDocuments = [
    {
      _id: 'doc_1',
      code: 'DS-23/TAND',
      title: 'Đơn khởi kiện vụ án dân sự (Mẫu số 23-DS)',
      desc: 'Áp dụng theo Nghị quyết 01/2017/NQ-HĐTP của Hội đồng Thẩm phán TAND Tối cao ban hành chuẩn toàn quốc.',
      type: 'DS',
      fileSize: '45 KB',
      format: 'DOCX',
      officialAuthority: 'Hội đồng Thẩm phán TAND Tối cao',
    },
    {
      _id: 'doc_2',
      code: 'DS-48/BDS',
      title: 'Hợp đồng chuyển nhượng quyền sử dụng đất và tài sản gắn liền với đất',
      desc: 'Mẫu hợp đồng công chứng mới nhất tuân thủ Luật Đất đai và Luật Kinh doanh Bất động sản hiện hành.',
      type: 'DS',
      fileSize: '68 KB',
      format: 'DOCX',
      officialAuthority: 'Bộ Tư pháp & Cục Bổ trợ Tư pháp',
    },
    {
      _id: 'doc_3',
      code: 'HN-01/LH',
      title: 'Đơn yêu cầu công nhận thuận tình ly hôn và thỏa thuận nuôi con',
      desc: 'Chuẩn quy định tại TAND cấp huyện kèm bản kê tài sản chung và hướng dẫn nộp án phí tố tụng.',
      type: 'HN',
      fileSize: '38 KB',
      format: 'DOCX',
      officialAuthority: 'TAND Cấp Huyện / Tỉnh',
    },
    {
      _id: 'doc_4',
      code: 'LD-12/HDLD',
      title: 'Hợp đồng lao động không xác định thời hạn (Chuẩn Bộ luật Lao động)',
      desc: 'Quy định đầy đủ về tiền lương, phụ cấp, bảo hiểm bắt buộc và các điều khoản giải quyết tranh chấp.',
      type: 'LD',
      fileSize: '52 KB',
      format: 'DOCX',
      officialAuthority: 'Bộ Lao động - Thương binh & Xã hội',
    },
    {
      _id: 'doc_5',
      code: 'DN-08/DLCT',
      title: 'Điều lệ Công ty Trách nhiệm hữu hạn Hai thành viên trở lên',
      desc: 'Soạn thảo theo Luật Doanh nghiệp mới nhất, chuẩn quyền biểu quyết và cơ chế chuyển nhượng phần vốn góp.',
      type: 'DN',
      fileSize: '110 KB',
      format: 'DOCX',
      officialAuthority: 'Bộ Kế hoạch & Đầu tư',
    },
    {
      _id: 'doc_6',
      code: 'HS-05/TGTP',
      title: 'Đơn tố giác hành vi vi phạm pháp luật / lừa đảo chiếm đoạt tài sản',
      desc: 'Mẫu đơn gửi Cơ quan Cảnh sát điều tra Công an cấp huyện/tỉnh kèm bảng kê tài liệu và chứng cứ thu thập.',
      type: 'HS',
      fileSize: '42 KB',
      format: 'DOCX',
      officialAuthority: 'Cơ quan Cảnh sát Điều tra',
    },
  ];

  const filteredDocs = sampleDocuments.filter((doc) => {
    const matchType = !typeDocument || doc.type === typeDocument;
    const matchQuery = !search || doc.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#fcf8f3] dark:bg-[#170e10] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Editorial Header / Masthead */}
      <section className="pt-10 pb-8 border-b-2 border-stone-800 dark:border-[#7f1d28] bg-stone-100/90 dark:bg-[#201316]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700/60 pb-2 text-[11px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-bold text-[#7f1d28] dark:text-[#e56776]">
              <FolderArchive className="w-3.5 h-3.5" />
              TỔNG CỤC LƯU TRỮ VĂN BẢN & BIỂU MẪU TỐ TỤNG
            </span>
            <span className="hidden sm:inline">ARCHIVE SERIES 2026</span>
            <span className="font-bold">STANDARD FORMS</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
              Kho Biểu Mẫu Pháp Lý & Văn Bản Mẫu
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-2xl">
              {currentCategory.desc} Định dạng văn bản DOCX chuẩn hoá theo biểu mẫu của Tòa án nhân dân Tối cao và Bộ Tư pháp.
            </p>
          </div>

          {/* Category Tabs / Docket Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {Object.entries(documentCategoryMap).map(([key, cat]) => (
              <Link
                key={key}
                href={`/document/${key}`}
                className={`px-3 py-1.5 border-2 text-xs font-mono font-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  typeDocument === key
                    ? 'border-[#7f1d28] dark:border-[#e56776] bg-[#7f1d28] dark:bg-[#e56776] text-white dark:text-stone-950 shadow-[3px_3px_0px_#4a0d14]'
                    : 'border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1a1114] text-stone-800 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-[2px_2px_0px_#7f1d28]/30'
                }`}
              >
                [{cat.code}] {cat.label.split('&')[0]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tra cứu tên biểu mẫu, loại hợp đồng, đơn thư..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1f1417] text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#7f1d28] dark:focus:border-[#e56776] shadow-[3px_3px_0px_#7f1d28]/20"
          />
        </div>

        {/* Document Docket List */}
        <div className="border-2 border-stone-800 dark:border-[#7f1d28] bg-white dark:bg-[#1c1215] shadow-[6px_6px_0px_#7f1d28] dark:shadow-[6px_6px_0px_#e56776] divide-y-2 divide-stone-800 dark:divide-stone-800">
          {filteredDocs.map((doc) => (
            <div
              key={doc._id}
              className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-[#25181c] transition-colors group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 border border-[#7f1d28] dark:border-[#e56776] text-[#7f1d28] dark:text-[#e56776] bg-[#7f1d28]/10">
                    [{doc.code}]
                  </span>
                  <span className="font-mono text-[10px] text-stone-600 dark:text-stone-400">
                    {doc.officialAuthority}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 border border-stone-400 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {doc.format} • {doc.fileSize}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-50 group-hover:text-[#7f1d28] dark:group-hover:text-[#e56776] transition-colors leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-3xl">
                  {doc.desc}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3 py-2 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 shadow-[2px_2px_0px_#7f1d28]/30 transition-transform active:translate-x-0.5 active:translate-y-0.5"
                >
                  Xem mẫu
                </button>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info(`Bắt đầu tải xuống biểu mẫu: ${doc.title}`);
                  }}
                  className="px-4 py-2 border-2 border-stone-800 dark:border-[#e56776] bg-[#7f1d28] dark:bg-[#e56776] hover:bg-[#a12836] dark:hover:bg-[#f08592] text-white dark:text-stone-950 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#4a0d14] transition-transform active:translate-x-0.5 active:translate-y-0.5"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  Tải DOCX
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal Styled as Official Legal Parchment */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fcf8f3] dark:bg-[#1d1215] border-2 border-stone-900 dark:border-[#e56776] max-w-xl w-full p-6 space-y-4 shadow-[8px_8px_0px_#7f1d28] text-xs">
            <div className="flex items-start justify-between gap-4 pb-3 border-b-2 border-stone-800 dark:border-stone-700">
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] text-[#7f1d28] dark:text-[#e56776] font-bold">
                  [XEM TRƯỚC HỒ SƠ: {selectedDoc.code}]
                </span>
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-50 text-sm sm:text-base leading-tight">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 border border-stone-800 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#130b0e] text-stone-800 dark:text-stone-300 font-mono space-y-2.5 max-h-64 overflow-y-auto leading-relaxed text-[11px]">
              <p className="text-center font-bold text-stone-900 dark:text-stone-100 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-center text-[10px]">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-16 h-0.5 bg-stone-400 mx-auto my-1"></div>
              <p className="text-center pt-2 font-bold text-stone-900 dark:text-stone-100 uppercase font-serif text-xs">{selectedDoc.title}</p>
              <p className="pt-2">Kính gửi: Tòa án nhân dân có thẩm quyền...</p>
              <p>{selectedDoc.desc}</p>
              <p className="text-stone-500 italic">[Nội dung biểu mẫu pháp lý chuẩn hóa đầy đủ các điều khoản và thông tin đối tượng đương sự]</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300 dark:border-stone-700">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-3.5 py-1.5 border-2 border-stone-800 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono font-bold uppercase hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                Đóng
              </button>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info(`Bắt đầu tải xuống: ${selectedDoc.title}`);
                  setSelectedDoc(null);
                }}
                className="px-4 py-1.5 border-2 border-stone-800 dark:border-[#e56776] bg-[#7f1d28] dark:bg-[#e56776] hover:bg-[#a12836] dark:hover:bg-[#f08592] text-white dark:text-stone-950 font-mono font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#4a0d14]"
              >
                <Download className="w-3.5 h-3.5" />
                Tải về DOCX
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}