'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  BookOpen,
  Image as ImageIcon,
  Heading,
  Quote,
  AlignLeft,
  X,
  UploadCloud,
  Sparkles,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Send,
  Calendar,
  Layers,
  HelpCircle,
  Newspaper,
  RotateCw,
  ArrowRight,
} from 'lucide-react';
import {
  useGetMyNewsQuery,
  useCreateNewsMutation,
  useDeleteNewsMutation,
} from '@/store/queries/news';
import { useGetMeQuery } from '@/store/queries/auth';
import { useLanguage } from '@/i18n/LanguageContext';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from '@/lib/toast';

export interface ArticleBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'image';
  text: string;
  file?: File;
  previewUrl?: string;
  caption?: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  INSURANCE: 'Bảo hiểm',
  CIVIL: 'Dân sự',
  LAND: 'Đất đai & Bất động sản',
  BUSINESS: 'Kinh doanh & Doanh nghiệp',
  TRANSPORTATION: 'Giao thông',
  ADMINISTRATIVE: 'Hành chính',
  CRIMINAL: 'Hình sự',
  FAMILY: 'Hôn nhân & Gia đình',
  LABOR: 'Lao động & Bảo hiểm',
  INTELLECTUAL_PROPERTY: 'Sở hữu trí tuệ',
  INHERITANCE: 'Thừa kế',
  TAX: 'Thuế & Tài chính',
};

export const TEMPLATES = [
  {
    id: 'case_analysis',
    title: 'Phân tích bản án / Án lệ thực tiễn',
    desc: 'Cấu trúc chuẩn phân tích một vụ án thực tế, nhận định của Tòa án và bài học pháp lý rút ra.',
    blocks: [
      { id: '1', type: 'heading' as const, text: '1. Tóm tắt tình huống pháp lý' },
      {
        id: '2',
        type: 'paragraph' as const,
        text: 'Nêu ngắn gọn nội dung vụ tranh chấp hoặc tình huống dẫn đến xét xử (Thời gian, các bên tham gia, nguồn cơn mâu thuẫn)...',
      },
      { id: '3', type: 'heading' as const, text: '2. Quyết định & Lập luận của Tòa án' },
      {
        id: '4',
        type: 'quote' as const,
        text: 'Trích dẫn nhận định quan trọng nhất của Hội đồng xét xử hoặc điều luật áp dụng then chốt trong vụ án...',
      },
      { id: '5', type: 'heading' as const, text: '3. Góc nhìn chuyên gia & Bài học rút ra' },
      {
        id: '6',
        type: 'paragraph' as const,
        text: 'Phân tích điểm mấu chốt giúp đương sự bảo vệ quyền lợi hoặc rủi ro doanh nghiệp cần phòng ngừa...',
      },
    ],
  },
  {
    id: 'legal_guide',
    title: 'Hướng dẫn quy trình & Thủ tục tố tụng',
    desc: 'Quy trình các bước từng bước rõ ràng để người dân hoặc doanh nghiệp dễ dàng áp dụng.',
    blocks: [
      { id: '1', type: 'heading' as const, text: '1. Điều kiện áp dụng' },
      {
        id: '2',
        type: 'paragraph' as const,
        text: 'Ai là đối tượng đủ điều kiện? Những giấy tờ cần chuẩn bị trước khi nộp hồ sơ...',
      },
      { id: '3', type: 'heading' as const, text: '2. Trình tự các bước thực hiện' },
      {
        id: '4',
        type: 'paragraph' as const,
        text: 'Bước 1: Nộp hồ sơ tại cơ quan có thẩm quyền.\nBước 2: Thời hạn xử lý và nhận thông báo thụ lý.\nBước 3: Nhận kết quả hoặc bổ sung hồ sơ...',
      },
      { id: '5', type: 'heading' as const, text: '3. Những lưu ý quan trọng' },
      {
        id: '6',
        type: 'quote' as const,
        text: 'Lưu ý các mốc thời gian khiếu nại, lệ phí bắt buộc và mẹo tránh bị trả lại hồ sơ...',
      },
    ],
  },
  {
    id: 'law_update',
    title: 'Phân tích quy định pháp luật mới ban hành',
    desc: 'Điểm mới nổi bật của Luật, Nghị định hoặc Thông tư mới có hiệu lực.',
    blocks: [
      { id: '1', type: 'heading' as const, text: '1. Bối cảnh & Căn cứ ban hành' },
      {
        id: '2',
        type: 'paragraph' as const,
        text: 'Nghị định/Luật có hiệu lực từ ngày nào? Thay thế cho văn bản pháp luật nào trước đó?...',
      },
      { id: '3', type: 'heading' as const, text: '2. Các điểm mới nổi bật' },
      {
        id: '4',
        type: 'paragraph' as const,
        text: 'Những thay đổi trực tiếp ảnh hưởng đến người lao động, doanh nghiệp hoặc giao dịch dân sự...',
      },
      { id: '5', type: 'heading' as const, text: '3. Khuyến nghị tuân thủ' },
      {
        id: '6',
        type: 'quote' as const,
        text: 'Hành động cụ thể cần rà soát lại hợp đồng, quy chế nội bộ hoặc quy trình làm việc...',
      },
    ],
  },
];

export default function NewsManager() {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { data: myNewsData, isLoading, isFetching, refetch } = useGetMyNewsQuery();
  const { data: userData } = useGetMeQuery();
  const [createNews, { isLoading: isSubmitting }] = useCreateNewsMutation();
  const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation();

  // Filters & State
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeStep, setComposeStep] = useState<'BLOCKS' | 'PREVIEW' | 'GUIDE'>('BLOCKS');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('CIVIL');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [blocks, setBlocks] = useState<ArticleBlock[]>([
    { id: '1', type: 'paragraph', text: '' },
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Preview & Delete Modal
  const [previewArticle, setPreviewArticle] = useState<any | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const blockImageRef = useRef<HTMLInputElement>(null);
  const [currentImageBlockId, setCurrentImageBlockId] = useState<string | null>(null);

  // News list processing
  const newsList = useMemo(() => {
    if (!myNewsData) return [];
    const rawData = (myNewsData as any)?.data || myNewsData;
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray(rawData?.data)) return rawData.data;
    if (Array.isArray(rawData?.news)) return rawData.news;
    if (Array.isArray(rawData?.items)) return rawData.items;
    if (Array.isArray(rawData?.result)) return rawData.result;
    if (Array.isArray(rawData?.results)) return rawData.results;
    if (Array.isArray(rawData?.docs)) return rawData.docs;
    if (Array.isArray(rawData?.list)) return rawData.list;
    if (Array.isArray((myNewsData as any)?.data)) return (myNewsData as any).data;
    return [];
  }, [myNewsData]);

  // Helper check status
  const checkArticleStatus = (item: any) => {
    const isApproved =
      item.isAccept === true ||
      item.status === 'accept' ||
      item.status === 'accepted' ||
      item.status === 'approved';
    const isRejected =
      item.isReject === true ||
      item.status === 'reject' ||
      item.status === 'rejected';
    const isPending = !isApproved && !isRejected;
    return { isApproved, isRejected, isPending };
  };

  // Helper get article image
  const getArticleImage = (item: any) => {
    if (!item) return '';
    if (Array.isArray(item.image_urls) && item.image_urls.length > 0 && typeof item.image_urls[0] === 'string') {
      return item.image_urls[0];
    }
    if (Array.isArray(item.image_url) && item.image_url.length > 0 && typeof item.image_url[0] === 'string') {
      return item.image_url[0];
    }
    if (Array.isArray(item.imgs) && item.imgs.length > 0 && typeof item.imgs[0] === 'string') {
      return item.imgs[0];
    }
    if (typeof item.image_url === 'string' && item.image_url) return item.image_url;
    if (typeof item.image_urls === 'string' && item.image_urls) return item.image_urls;
    if (typeof item.imgs === 'string' && item.imgs) return item.imgs;
    return '';
  };

  // Statistics
  const stats = useMemo(() => {
    const total = newsList.length;
    let approved = 0;
    let pending = 0;
    let rejected = 0;

    newsList.forEach((item: any) => {
      const { isApproved, isRejected } = checkArticleStatus(item);
      if (isApproved) approved++;
      else if (isRejected) rejected++;
      else pending++;
    });

    return { total, approved, pending, rejected };
  }, [newsList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return newsList.filter((item: any) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.mainTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || item.type === selectedCategory;

      const { isApproved, isRejected, isPending } = checkArticleStatus(item);

      let matchTab = true;
      if (activeTab === 'APPROVED') matchTab = isApproved;
      if (activeTab === 'PENDING') matchTab = isPending;
      if (activeTab === 'REJECTED') matchTab = isRejected;

      return matchSearch && matchCategory && matchTab;
    });
  }, [newsList, searchQuery, selectedCategory, activeTab]);

  // Cover image selection
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  // Block management
  const insertBlockAt = (index: number, type: ArticleBlock['type']) => {
    const newId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBlock: ArticleBlock = {
      id: newId,
      type,
      text: '',
    };
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(index, 0, newBlock);
      return next;
    });

    // Auto-focus and scroll to new block
    setTimeout(() => {
      const el = document.getElementById(`block-input-${newId}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const addBlock = (type: ArticleBlock['type']) => {
    insertBlockAt(blocks.length, type);
  };

  const updateBlockText = (id: string, text: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text } : b))
    );
  };

  const updateBlockCaption = (id: string, caption: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, caption } : b))
    );
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) {
      toast.error('Bài viết cần có ít nhất một khối nội dung.');
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const handleBlockImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentImageBlockId) {
      const url = URL.createObjectURL(file);
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === currentImageBlockId
            ? { ...b, file, previewUrl: url }
            : b
        )
      );
    }
    setCurrentImageBlockId(null);
  };

  // Apply template
  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplateId(template.id);
    setBlocks(
      template.blocks.map((b, idx) => ({
        ...b,
        id: `${Date.now()}_${idx}`,
      }))
    );
    setComposeStep('BLOCKS');
    toast.success(`Đã tải mẫu "${template.title}". Vui lòng chỉnh sửa nội dung trước khi nộp!`);
  };

  // Validation: Check if user left template text unmodified
  const isTemplateUnmodified = useMemo(() => {
    if (!selectedTemplateId) return false;
    const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!currentTemplate) return false;

    // Check if any block still contains exact template placeholder text
    const hasUneditedPlaceholder = blocks.some((b) =>
      currentTemplate.blocks.some(
        (tb) => tb.type === b.type && tb.text.length > 20 && b.text.trim() === tb.text.trim()
      )
    );
    return hasUneditedPlaceholder;
  }, [selectedTemplateId, blocks]);

  // Submit article
  const handleSubmitArticle = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    if (!category) {
      toast.error('Vui lòng chọn danh mục bài viết.');
      return;
    }
    if (!coverFile) {
      toast.error('Vui lòng tải lên ảnh bìa đại diện cho bài viết.');
      return;
    }

    const validBlocks = blocks.filter(
      (b) => (b.type === 'image' && b.file) || b.text.trim().length > 0
    );
    if (validBlocks.length === 0) {
      toast.error('Vui lòng nhập nội dung cho bài viết.');
      return;
    }

    if (isTemplateUnmodified) {
      toast.error(
        'Bạn đang để nguyên nội dung mẫu gợi ý. Vui lòng chỉnh sửa và hoàn thiện nội dung thực tế trước khi gửi duyệt!'
      );
      return;
    }

    try {
      const compiledContent = blocks
        .map((b) => {
          if (b.type === 'heading') return `### ${b.text.trim()}`;
          if (b.type === 'quote') return `> ${b.text.trim()}`;
          if (b.type === 'paragraph') return b.text.trim();
          if (b.type === 'image') return `[Hình ảnh: ${b.caption || 'Minh họa'}]`;
          return b.text;
        })
        .filter(Boolean)
        .join('\n\n');

      const formData = new FormData();
      formData.append('mainTitle', title.trim());
      formData.append('type', category);
      formData.append('content', compiledContent);
      formData.append('imgs', coverFile);

      blocks.forEach((b) => {
        if (b.type === 'image' && b.file) {
          formData.append('imgs', b.file);
        }
      });

      await createNews(formData).unwrap();
      toast.success('Gửi bài viết thành công! Bài viết sẽ được duyệt sớm.');

      setIsComposeOpen(false);
      setTitle('');
      setCategory('CIVIL');
      setCoverFile(null);
      setCoverPreview('');
      setBlocks([{ id: '1', type: 'paragraph', text: '' }]);
      setSelectedTemplateId(null);
      setComposeStep('BLOCKS');

      refetch();
    } catch (err: any) {
      console.error('Error creating news:', err);
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi tạo bài viết.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id).unwrap();
      toast.success('Đã xóa bài viết thành công.');
      setArticleToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể xóa bài viết này.');
    }
  };

  const authorName =
    (userData as any)?.data?.name || (userData as any)?.name || 'Luật sư';

  return (
    <div className="min-h-screen bg-[#faf6ee] dark:bg-[#131210] text-stone-900 dark:text-[#f4efe6] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#d95327] selection:text-white transition-colors duration-200">
      {/* Retro Paper Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Retro Masthead Header */}
      <section className="pt-10 pb-8 border-b-2 border-stone-800 dark:border-[#38332c] bg-stone-100/90 dark:bg-[#1c1916] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700/60 pb-2 text-[11px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-bold text-[#d95327] dark:text-[#e26d46]">
              <Newspaper className="w-3.5 h-3.5" />
              <span>[SECTION IV • GÓC LUẬT SƯ & BIÊN TẬP ÁN LỆ]</span>
            </span>
            <span className="hidden sm:inline font-mono">
              GAZETTE DESK • TÁC GIẢ: <strong className="text-stone-900 dark:text-stone-200">{authorName}</strong>
            </span>
            <span className="font-bold text-stone-700 dark:text-stone-300">LAWOH GAZETTE</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-stone-900 dark:text-[#fbf8f2]">
                {isEn ? 'Legal Gazette & Case Law Manager' : 'Quản Lý Bài Viết & Án Lệ Thực Tiễn'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans">
                {isEn
                  ? 'Compose, moderate, and publish authoritative legal dispatches and court precedent analyses.'
                  : 'Biên soạn, theo dõi quy trình kiểm duyệt và xuất bản các phân tích án lệ thực tế từ luật sư.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isLoading || isFetching}
                title={isEn ? 'Reload articles' : 'Làm mới danh sách'}
                className="p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#181614] hover:bg-stone-100 dark:hover:bg-[#201d19] text-stone-800 dark:text-stone-200 transition-all shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 ${isLoading || isFetching ? 'animate-spin text-[#d95327]' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsComposeOpen(true);
                  setComposeStep('BLOCKS');
                }}
                className="px-5 py-2.5 border-2 border-stone-800 dark:border-stone-700 bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 text-xs font-mono font-bold uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isEn ? 'Write Article' : 'Viết bài mới'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10 flex-1 w-full">
        
        {/* Metric Cards (Neo-Brutalist Broadsheet Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                [TỔNG BÀI VIẾT]
              </span>
              <FileText className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            </div>
            <p className="text-3xl font-serif font-black text-stone-900 dark:text-stone-50">{stats.total}</p>
          </div>

          <div className="bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                [ĐÃ PHÊ DUYỆT]
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-serif font-black text-emerald-700 dark:text-emerald-400">{stats.approved}</p>
          </div>

          <div className="bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#b45309] dark:text-[#f59e0b]">
                [CHỜ KIỂM DUYỆT]
              </span>
              <Clock className="w-4 h-4 text-[#b45309] dark:text-[#f59e0b]" />
            </div>
            <p className="text-3xl font-serif font-black text-[#b45309] dark:text-[#f59e0b]">{stats.pending}</p>
          </div>

          <div className="bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                [TỪ CHỐI / CẦN SỬA]
              </span>
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-3xl font-serif font-black text-red-700 dark:text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 font-mono">
            {[
              { key: 'ALL', label: isEn ? '[ALL]' : '[TẤT CẢ]' },
              { key: 'APPROVED', label: isEn ? '[APPROVED]' : '[ĐÃ DUYỆT]' },
              { key: 'PENDING', label: isEn ? '[PENDING]' : '[ĐANG CHỜ]' },
              { key: 'REJECTED', label: isEn ? '[REJECTED]' : '[TỪ CHỐI]' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 border-2 text-xs font-bold uppercase transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 shadow-[2px_2px_0px_#000]'
                    : 'border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 shadow-[2px_2px_0px_#000]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Category Selector */}
          <div className="flex flex-1 md:max-w-md items-center gap-2 font-mono">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isEn ? 'Search title, content...' : 'Tìm bài viết theo tiêu đề...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336] shadow-[2px_2px_0px_#000]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0d1410] text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#1a5336] shadow-[2px_2px_0px_#000]"
            >
              <option value="ALL">Tất cả lĩnh vực</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles List / Grid */}
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs text-stone-500 bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c]">
            <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d95327]" />
            <span>[ĐANG TẢI BẢN TIN PHÁP LÝ & ÁN LỆ...]</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#000] p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
              {isEn ? 'No Gazette Articles Found' : 'Chưa có bài viết nào'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto font-sans">
              Bạn chưa có bài viết nào trong danh mục này. Hãy bắt đầu chia sẻ góc nhìn pháp lý và án lệ của bạn!
            </p>
            <button
              type="button"
              onClick={() => {
                setIsComposeOpen(true);
                setComposeStep('BLOCKS');
              }}
              className="px-5 py-2.5 border-2 border-stone-800 dark:border-stone-700 bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 text-xs font-mono font-bold uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Soạn bài ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item: any) => {
              const categoryName = CATEGORY_LABELS[item.type] || item.type || 'Pháp luật';
              const imageUrl = getArticleImage(item);
              const { isApproved, isRejected } = checkArticleStatus(item);
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                : 'Mới đây';

              return (
                <div
                  key={item._id}
                  className="retro-news-card bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#181614] dark:hover:shadow-[2px_2px_0px_#e5decf] transition-all p-5 flex flex-col justify-between gap-4 group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Tag & Dispatch Date */}
                    <div className="flex items-center justify-between pb-2.5 border-b-2 border-stone-800 dark:border-[#38332c] text-xs font-mono">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#d95327] text-white">
                        {categoryName}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isApproved
                              ? 'bg-[#1a5336] text-white'
                              : isRejected
                              ? 'bg-[#b91c1c] text-white'
                              : 'bg-[#b45309] text-white'
                          }`}
                        >
                          {isApproved ? '[ĐÃ DUYỆT]' : isRejected ? '[TỪ CHỐI]' : '[CHỜ DUYỆT]'}
                        </span>
                      </div>
                    </div>

                    {/* Cover Image */}
                    {imageUrl && (
                      <div className="h-40 bg-stone-200 dark:bg-stone-900 border-2 border-stone-800 dark:border-[#38332c] overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={item.mainTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e: any) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3
                      onClick={() => router.push(`/newsDetail/${item._id}`)}
                      className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-[#fbf8f2] group-hover:text-[#d95327] dark:group-hover:text-[#e26d46] transition-colors line-clamp-2 leading-snug cursor-pointer"
                    >
                      {item.mainTitle}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-sans line-clamp-2 leading-relaxed">
                      {item.content?.replace(/###|>|\[.*?\]/g, '') ||
                        'Phân tích chi tiết quy định pháp luật và bài học rút ra từ thực tiễn.'}
                    </p>
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div className="pt-3 border-t-2 border-dashed border-stone-300 dark:border-stone-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500 dark:text-stone-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#d95327]" />
                      <span>{dateStr}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewArticle(item)}
                        className="px-2.5 py-1 border-2 border-stone-800 bg-white hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-[11px] font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        Xem
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push(`/newsDetail/${item._id}`)}
                        className="px-2.5 py-1 border-2 border-stone-800 bg-[#1a5336] text-white hover:bg-[#143d28] text-[11px] font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
                      >
                        Chi tiết
                      </button>

                      <button
                        type="button"
                        onClick={() => setArticleToDelete(item._id)}
                        className="p-1 border-2 border-stone-800 bg-stone-100 hover:bg-red-600 hover:text-white text-stone-500 transition shadow-[2px_2px_0px_#000] cursor-pointer"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ===================== COMPOSE MODAL (GAZETTE THEME) ===================== */}
      {isComposeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setIsComposeOpen(false)}
        >
          <div
            className="bg-[#faf6ee] dark:bg-[#16130e] border-2 border-stone-800 dark:border-stone-600 shadow-[8px_8px_0px_#000] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b-2 border-stone-800 dark:border-stone-700 flex items-center justify-between bg-stone-100 dark:bg-[#201b13]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border-2 border-stone-800 bg-[#d95327] text-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-black text-stone-900 dark:text-[#fbf8f2]">
                    Biên Soạn Bản Tin Pháp Lý & Án Lệ
                  </h2>
                  <p className="text-xs font-mono text-stone-600 dark:text-stone-400">
                    [TÁC GIẢ: {authorName.toUpperCase()}]
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setComposeStep('BLOCKS')}
                  className={`px-3 py-1.5 border-2 transition cursor-pointer ${
                    composeStep === 'BLOCKS'
                      ? 'border-stone-800 bg-[#1a5336] text-white shadow-[2px_2px_0px_#000]'
                      : 'border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  ✍️ SOẠN THẢO
                </button>
                <button
                  type="button"
                  onClick={() => setComposeStep('PREVIEW')}
                  className={`px-3 py-1.5 border-2 transition cursor-pointer ${
                    composeStep === 'PREVIEW'
                      ? 'border-stone-800 bg-[#1a5336] text-white shadow-[2px_2px_0px_#000]'
                      : 'border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  👁️ XEM TRƯỚC
                </button>
                <button
                  type="button"
                  onClick={() => setComposeStep('GUIDE')}
                  className={`px-3 py-1.5 border-2 transition cursor-pointer ${
                    composeStep === 'GUIDE'
                      ? 'border-stone-800 bg-[#d95327] text-white shadow-[2px_2px_0px_#000]'
                      : 'border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  📚 MẪU BÀI VIẾT
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 border-2 border-stone-800 bg-stone-100 hover:bg-stone-200 text-stone-700 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* STEP: GUIDE / TEMPLATES */}
              {composeStep === 'GUIDE' && (
                <div className="space-y-6">
                  <div className="bg-stone-100 dark:bg-[#1c1916] border-2 border-stone-800 p-4 text-xs font-mono text-stone-800 dark:text-stone-200 flex items-start gap-3 shadow-[3px_3px_0px_#000]">
                    <HelpCircle className="w-5 h-5 text-[#d95327] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[#d95327]">
                        [KHUNG MẪU BÀI VIẾT CHUẨN TÒA ÁN & BÁO CHÍ PHÁP LUẬT]
                      </p>
                      <p className="mt-1 text-stone-600 dark:text-stone-400">
                        Chọn một khung bài viết có sẵn để tiết kiệm thời gian. Bạn chỉ việc điền các tình tiết thực tế vào từng khối nội dung!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {TEMPLATES.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="border-2 border-stone-800 dark:border-stone-700 p-4 bg-white dark:bg-[#181614] shadow-[4px_4px_0px_#000] flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-7 h-7 border border-stone-800 bg-[#d95327] text-white flex items-center justify-center font-bold text-xs mb-3 shadow-[2px_2px_0px_#000]">
                            <Layers className="w-4 h-4" />
                          </div>
                          <h4 className="font-serif font-bold text-stone-900 dark:text-[#fbf8f2] text-sm mb-1">
                            {tmpl.title}
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400 font-sans mb-4">
                            {tmpl.desc}
                          </p>

                          <div className="space-y-1.5 mb-4 border-t border-stone-300 dark:border-stone-800 pt-2 font-mono">
                            {tmpl.blocks.slice(0, 3).map((b, i) => (
                              <div key={i} className="text-[11px] text-stone-600 dark:text-stone-400 truncate flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#d95327]" />
                                <span>{b.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => applyTemplate(tmpl)}
                          className="w-full py-2 border-2 border-stone-800 text-xs font-mono font-bold uppercase bg-stone-100 hover:bg-[#1a5336] hover:text-white text-stone-800 transition shadow-[2px_2px_0px_#000] cursor-pointer"
                        >
                          Áp dụng mẫu này
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: BLOCKS EDITOR */}
              {composeStep === 'BLOCKS' && (
                <div className="space-y-6">
                  {/* Warning if template untouched */}
                  {isTemplateUnmodified && (
                    <div className="bg-amber-100 dark:bg-amber-950/40 border-2 border-stone-800 p-3 flex items-start gap-2.5 text-stone-900 dark:text-stone-100 text-xs font-mono shadow-[3px_3px_0px_#000]">
                      <AlertCircle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
                      <div>
                        <strong>[LƯU Ý]:</strong> Bạn đang áp dụng mẫu bài viết. Vui lòng thay thế các đoạn gợi ý bằng tình tiết thực tế trước khi bấm nộp gửi duyệt.
                      </div>
                    </div>
                  )}

                  {/* Title & Category Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                        Tiêu đề bài viết <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Phân tích quy định bồi thường thu hồi đất theo Luật Đất đai 2024..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-serif font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 shadow-[2px_2px_0px_#000] focus:outline-none focus:border-[#1a5336]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                        Lĩnh vực pháp luật <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-mono text-stone-800 dark:text-stone-200 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 shadow-[2px_2px_0px_#000] focus:outline-none"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cover Image Uploader */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                      Ảnh bìa đại diện bài viết <span className="text-red-500">*</span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-800 dark:border-stone-700 p-4 text-center cursor-pointer bg-white dark:bg-[#0d1410] flex flex-col items-center justify-center min-h-[110px] hover:bg-stone-50"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverSelect}
                      />
                      {coverPreview ? (
                        <div className="relative w-full max-h-44 overflow-hidden border border-stone-800">
                          <img
                            src={coverPreview}
                            alt="Cover"
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1 font-mono">
                          <UploadCloud className="w-7 h-7 text-[#d95327] mx-auto" />
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            [TẢI LÊN ẢNH BÌA BẢN TIN]
                          </p>
                          <p className="text-[11px] text-stone-400">JPG, PNG, WebP (Dưới 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Editor Content Blocks Area */}
                  <div className="space-y-4">
                    {/* Sticky Top Toolbar for Immediate Access while scrolling */}
                    <div className="sticky top-0 z-20 bg-stone-100/95 dark:bg-[#1a1714]/95 backdrop-blur-sm border-2 border-stone-800 p-2.5 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-stone-800 dark:text-stone-200">
                        <Sparkles className="w-3.5 h-3.5 text-[#d95327]" />
                        <span className="uppercase">[THÊM NHANH KHỐI]:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 font-mono">
                        <button
                          type="button"
                          onClick={() => insertBlockAt(blocks.length, 'paragraph')}
                          className="px-2.5 py-1 border-2 border-stone-800 bg-white hover:bg-stone-200 text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] transition active:translate-y-0.5 cursor-pointer"
                        >
                          <AlignLeft className="w-3 h-3 inline mr-1" /> + Đoạn văn
                        </button>
                        <button
                          type="button"
                          onClick={() => insertBlockAt(blocks.length, 'heading')}
                          className="px-2.5 py-1 border-2 border-stone-800 bg-white hover:bg-stone-200 text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] transition active:translate-y-0.5 cursor-pointer"
                        >
                          <Heading className="w-3 h-3 inline mr-1" /> + Tiêu đề mục
                        </button>
                        <button
                          type="button"
                          onClick={() => insertBlockAt(blocks.length, 'quote')}
                          className="px-2.5 py-1 border-2 border-stone-800 bg-white hover:bg-stone-200 text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] transition active:translate-y-0.5 cursor-pointer"
                        >
                          <Quote className="w-3 h-3 inline mr-1" /> + Trích dẫn
                        </button>
                        <button
                          type="button"
                          onClick={() => insertBlockAt(blocks.length, 'image')}
                          className="px-2.5 py-1 border-2 border-stone-800 bg-white hover:bg-stone-200 text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] transition active:translate-y-0.5 cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3 inline mr-1" /> + Chèn ảnh
                        </button>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={blockImageRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleBlockImageSelect}
                    />

                    {/* Render Block List with In-Between Insert Controls */}
                    <div className="space-y-2">
                      {blocks.map((block, idx) => (
                        <React.Fragment key={block.id}>
                          <div className="p-3 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#181614] shadow-[3px_3px_0px_#000] flex items-start gap-3 group">
                            {/* Re-order & Action Column */}
                            <div className="flex flex-col items-center gap-1 pt-1 text-stone-500 font-mono">
                              <button
                                type="button"
                                onClick={() => moveBlock(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                                title="Di chuyển lên"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[10px] font-bold">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => moveBlock(idx, 'down')}
                                disabled={idx === blocks.length - 1}
                                className="p-1 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                                title="Di chuyển xuống"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Block Content Input */}
                            <div className="flex-1 space-y-2">
                              {block.type === 'heading' && (
                                <div className="space-y-1">
                                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-stone-800 text-white">
                                    [MỤC TIÊU ĐỀ]
                                  </span>
                                  <input
                                    id={`block-input-${block.id}`}
                                    type="text"
                                    placeholder="Nhập tiêu đề mục (ví dụ: 1. Thực trạng tranh chấp)..."
                                    value={block.text}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        insertBlockAt(idx + 1, 'paragraph');
                                      }
                                    }}
                                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                                    className="w-full text-sm font-serif font-bold text-stone-900 dark:text-stone-100 p-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:border-[#1a5336]"
                                  />
                                </div>
                              )}

                              {block.type === 'paragraph' && (
                                <div className="space-y-1">
                                  <textarea
                                    id={`block-input-${block.id}`}
                                    rows={3}
                                    placeholder="Nhập nội dung phân tích..."
                                    value={block.text}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        insertBlockAt(idx + 1, 'paragraph');
                                      }
                                    }}
                                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                                    className="w-full text-xs font-sans text-stone-800 dark:text-stone-200 p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:border-[#1a5336] leading-relaxed"
                                  />
                                </div>
                              )}

                              {block.type === 'quote' && (
                                <div className="border-l-4 border-[#d95327] pl-3">
                                  <textarea
                                    id={`block-input-${block.id}`}
                                    rows={2}
                                    placeholder="Trích dẫn điều luật hoặc nhận định của Tòa án..."
                                    value={block.text}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        insertBlockAt(idx + 1, 'paragraph');
                                      }
                                    }}
                                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                                    className="w-full text-xs italic font-serif text-stone-800 dark:text-stone-200 p-2 border border-stone-800 bg-amber-50/50 dark:bg-stone-900 focus:outline-none"
                                  />
                                </div>
                              )}

                              {block.type === 'image' && (
                                <div className="space-y-2">
                                  <div
                                    onClick={() => {
                                      setCurrentImageBlockId(block.id);
                                      blockImageRef.current?.click();
                                    }}
                                    className="border-2 border-dashed border-stone-800 p-3 text-center cursor-pointer bg-stone-50 dark:bg-stone-900 hover:bg-stone-100"
                                  >
                                    {block.previewUrl ? (
                                      <img
                                        src={block.previewUrl}
                                        alt="Preview"
                                        className="max-h-36 mx-auto object-contain border border-stone-800"
                                      />
                                    ) : (
                                      <div className="text-xs font-mono text-stone-600 flex items-center justify-center gap-1.5">
                                        <ImageIcon className="w-4 h-4 text-[#d95327]" /> [BẤM ĐỂ CHỌN ẢNH MINH HỌA]
                                      </div>
                                    )}
                                  </div>
                                  <input
                                    id={`block-input-${block.id}`}
                                    type="text"
                                    placeholder="Nhập chú thích ảnh..."
                                    value={block.caption || ''}
                                    onChange={(e) => updateBlockCaption(block.id, e.target.value)}
                                    className="w-full text-xs font-mono p-1.5 border border-stone-800 bg-white dark:bg-stone-900 focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Delete Block */}
                            <button
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              className="p-1 border border-stone-800 bg-stone-100 hover:bg-red-600 hover:text-white text-stone-400 transition cursor-pointer"
                              title="Xóa khối này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* In-Between Quick Insert Bar */}
                          {idx < blocks.length - 1 && (
                            <div className="relative group/insert py-1 flex items-center justify-center">
                              <div className="absolute inset-x-0 h-[1px] bg-stone-200 dark:bg-stone-800 group-hover/insert:bg-[#d95327] transition-colors" />
                              <div className="opacity-0 group-hover/insert:opacity-100 transition-all z-10 flex items-center gap-1 bg-[#faf6ee] dark:bg-[#16130e] px-2 py-0.5 border border-stone-800 shadow-[2px_2px_0px_#000] text-[10px] font-mono">
                                <span className="text-stone-500 font-bold mr-1">+ Chèn vào đây:</span>
                                <button
                                  type="button"
                                  onClick={() => insertBlockAt(idx + 1, 'paragraph')}
                                  className="px-1.5 py-0.5 bg-white hover:bg-stone-200 border border-stone-800 text-stone-800 font-bold cursor-pointer"
                                >
                                  + Đoạn văn
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertBlockAt(idx + 1, 'heading')}
                                  className="px-1.5 py-0.5 bg-white hover:bg-stone-200 border border-stone-800 text-stone-800 font-bold cursor-pointer"
                                >
                                  + Tiêu đề
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertBlockAt(idx + 1, 'quote')}
                                  className="px-1.5 py-0.5 bg-white hover:bg-stone-200 border border-stone-800 text-stone-800 font-bold cursor-pointer"
                                >
                                  + Trích dẫn
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertBlockAt(idx + 1, 'image')}
                                  className="px-1.5 py-0.5 bg-white hover:bg-stone-200 border border-stone-800 text-stone-800 font-bold cursor-pointer"
                                >
                                  + Ảnh
                                </button>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Dedicated Bottom Insert Card (1 clean single row) */}
                    <div className="mt-4 border-2 border-dashed border-stone-800 dark:border-stone-700 p-3 bg-stone-50/90 dark:bg-[#1a1714] shadow-[3px_3px_0px_#000] flex items-center justify-between gap-3 overflow-x-auto">
                      <div className="flex items-center gap-2 font-mono whitespace-nowrap shrink-0">
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                          Thêm khối tiếp theo:
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono whitespace-nowrap shrink-0">
                        <button
                          type="button"
                          onClick={() => insertBlockAt(blocks.length, 'paragraph')}
                          className="px-3 py-1.5 border-2 border-stone-800 bg-white hover:bg-[#1a5336] hover:text-white text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] transition active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                        >
                          <AlignLeft className="w-3.5 h-3.5 inline mr-1" /> + Đoạn văn <span className="text-[10px] text-stone-400 font-normal">(Ctrl+Enter)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertBlockAt(blocks.length, 'heading')}
                          className="px-3 py-1.5 border-2 border-stone-800 bg-white hover:bg-[#1a5336] hover:text-white text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] transition active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                        >
                          <Heading className="w-3.5 h-3.5 inline mr-1" /> + Tiêu đề mục
                        </button>
                        <button
                          type="button"
                          onClick={() => insertBlockAt(blocks.length, 'quote')}
                          className="px-3 py-1.5 border-2 border-stone-800 bg-white hover:bg-[#1a5336] hover:text-white text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] transition active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                        >
                          <Quote className="w-3.5 h-3.5 inline mr-1" /> + Trích dẫn
                        </button>
                        <button
                          type="button"
                          onClick={() => insertBlockAt(blocks.length, 'image')}
                          className="px-3 py-1.5 border-2 border-stone-800 bg-white hover:bg-[#1a5336] hover:text-white text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] transition active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                        >
                          <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> + Chèn ảnh
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP: PREVIEW */}
              {composeStep === 'PREVIEW' && (
                <div className="bg-white dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[6px_6px_0px_#000] p-6 max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700 text-xs font-mono">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#d95327] text-white">
                      {CATEGORY_LABELS[category] || category}
                    </span>
                    <span className="text-stone-500">[BẢN IN XEM TRƯỚC]</span>
                  </div>

                  <h1 className="text-2xl font-serif font-black text-stone-900 dark:text-[#fbf8f2] leading-snug">
                    {title || 'Chưa nhập tiêu đề bài viết'}
                  </h1>

                  {coverPreview && (
                    <div className="border-2 border-stone-800 overflow-hidden">
                      <img
                        src={coverPreview}
                        alt="Cover"
                        className="w-full h-56 object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-4 pt-2 font-sans">
                    {blocks.map((b) => (
                      <div key={b.id}>
                        {b.type === 'heading' && (
                          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-[#fbf8f2] mt-3">
                            {b.text}
                          </h3>
                        )}
                        {b.type === 'paragraph' && (
                          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                            {b.text}
                          </p>
                        )}
                        {b.type === 'quote' && (
                          <blockquote className="border-l-4 border-[#d95327] pl-4 italic font-serif text-xs sm:text-sm text-stone-800 dark:text-stone-200 bg-amber-50/60 dark:bg-stone-900 p-3 border border-stone-300 dark:border-stone-800">
                            {b.text}
                          </blockquote>
                        )}
                        {b.type === 'image' && b.previewUrl && (
                          <div className="text-center my-3">
                            <img
                              src={b.previewUrl}
                              alt={b.caption || ''}
                              className="max-h-60 mx-auto border-2 border-stone-800 object-contain shadow-[3px_3px_0px_#000]"
                            />
                            {b.caption && (
                              <p className="text-xs font-mono text-stone-500 italic mt-1.5">{b.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t-2 border-stone-800 dark:border-stone-700 flex items-center justify-between bg-stone-100 dark:bg-[#201b13]">
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="px-4 py-2 border-2 border-stone-800 bg-white hover:bg-stone-200 text-stone-800 text-xs font-mono font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center gap-2 font-mono">
                {composeStep !== 'PREVIEW' ? (
                  <button
                    type="button"
                    onClick={() => setComposeStep('PREVIEW')}
                    className="px-4 py-2 border-2 border-stone-800 bg-white hover:bg-stone-200 text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    Xem trước bài viết
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setComposeStep('BLOCKS')}
                    className="px-4 py-2 border-2 border-stone-800 bg-white hover:bg-stone-200 text-stone-800 text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    Quay lại chỉnh sửa
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmitArticle}
                  disabled={isSubmitting || isTemplateUnmodified}
                  className="px-5 py-2 border-2 border-stone-800 bg-[#1a5336] text-white hover:bg-[#143d28] text-xs font-bold uppercase shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'ĐANG NỘP...' : 'GỬI DUYỆT BÀI VIẾT'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================== QUICK PREVIEW MODAL ===================== */}
      {previewArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setPreviewArticle(null)}
        >
          <div
            className="bg-[#faf6ee] dark:bg-[#16130e] border-2 border-stone-800 dark:border-stone-600 shadow-[8px_8px_0px_#000] w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-3.5 border-b-2 border-stone-800 bg-stone-100 dark:bg-[#201b13] flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#d95327] text-white">
                  {CATEGORY_LABELS[previewArticle.type] || previewArticle.type}
                </span>
                <span className="text-xs text-stone-500">• BẢN TIN PHÁP LÝ</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="p-1 border border-stone-800 bg-white hover:bg-stone-200 text-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-sans">
              <h2 className="text-xl font-serif font-black text-stone-900 dark:text-[#fbf8f2] leading-snug">
                {previewArticle.mainTitle}
              </h2>

              {getArticleImage(previewArticle) && (
                <div className="border-2 border-stone-800 overflow-hidden max-h-72">
                  <img
                    src={getArticleImage(previewArticle)}
                    alt={previewArticle.mainTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed">
                {previewArticle.content}
              </div>
            </div>

            <div className="px-6 py-3.5 border-t-2 border-stone-800 bg-stone-100 dark:bg-[#201b13] flex items-center justify-between font-mono">
              <span className="text-xs text-stone-500">
                Ngày đăng: {previewArticle.createdAt ? new Date(previewArticle.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
              <button
                type="button"
                onClick={() => router.push(`/newsDetail/${previewArticle._id}`)}
                className="px-4 py-1.5 border-2 border-stone-800 bg-[#1a5336] text-white text-xs font-bold uppercase shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-[#143d28]"
              >
                Xem trang đầy đủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {articleToDelete && (
        <ConfirmModal
          isOpen={true}
          title={isEn ? 'Delete Article' : 'Xóa bài viết'}
          description={
            isEn
              ? 'Are you sure you want to permanently delete this article?'
              : 'Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.'
          }
          confirmText={isDeleting ? (isEn ? 'Deleting...' : 'Đang xóa...') : (isEn ? 'Delete' : 'Xác nhận xóa')}
          cancelText={isEn ? 'Cancel' : 'Hủy bỏ'}
          variant="danger"
          onConfirm={() => handleDelete(articleToDelete)}
          onClose={() => setArticleToDelete(null)}
        />
      )}
    </div>
  );
}
