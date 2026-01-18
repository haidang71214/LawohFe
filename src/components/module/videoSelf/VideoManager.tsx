'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Video,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Film,
  Clapperboard,
  Tv,
} from 'lucide-react';
import VideoCard from './VideoCard';
import CreateVideoModal from './CreateVideoModal';
import VideoPreviewModal from './VideoPreviewModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useGetMyVideosQuery, useDeleteVideoMutation } from '@/store/queries/video';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

interface Video {
  _id: string;
  categories: string;
  user_id: string;
  video_url: string;
  thumnail_url?: string;
  thubnail_url?: string;
  star: number;
  description: string;
  accept: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

const VideoManager = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { data: rawResponse, isLoading: loading, refetch, isFetching } = useGetMyVideosQuery();
  const [deleteVideoMutation] = useDeleteVideoMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; id: string } | null>(null);

  const videos: Video[] = useMemo(() => {
    const rawData = (rawResponse?.data || rawResponse) as any;
    const raw = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData?.items)
      ? rawData.items
      : [];
    return Array.isArray(raw) ? raw : [];
  }, [rawResponse]);

  // Metrics
  const metrics = useMemo(() => {
    const total = videos.length;
    const approved = videos.filter((v) => v.accept || v.status === 'approved').length;
    const pending = videos.filter((v) => !v.accept && v.status !== 'approved').length;
    return { total, approved, pending };
  }, [videos]);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const isApproved = video.accept || video.status === 'approved';
      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'APPROVED' && isApproved) ||
        (activeTab === 'PENDING' && !isApproved);

      const matchesSearch =
        !searchTerm ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.categories?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [searchTerm, activeTab, videos]);

  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const handleDeleteVideo = async () => {
    if (!deletingVideoId) return;

    try {
      await deleteVideoMutation(deletingVideoId).unwrap();
      toast.success(
        isEn ? 'Tape Record Removed' : 'Đã xóa bản ghi video',
        isEn ? 'The record has been permanently deleted.' : 'Bản ghi đã được gỡ khỏi hệ thống lưu trữ.'
      );
      setDeletingVideoId(null);
      refetch();
    } catch {
      toast.error(
        isEn ? 'Action Failed' : 'Xóa thất bại',
        isEn ? 'Could not delete video record.' : 'Không thể xóa bản ghi. Vui lòng thử lại.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] dark:bg-[#16130e] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Retro Masthead Header */}
      <section className="pt-10 pb-8 border-b-2 border-stone-800 dark:border-[#d97706] bg-stone-100/90 dark:bg-[#201b13]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700/60 pb-2 text-[11px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-bold text-[#b45309] dark:text-[#f59e0b]">
              <Clapperboard className="w-3.5 h-3.5" />
              {isEn ? 'LEGAL BROADCAST PRODUCTION STUDIO & KNOWLEDGE BASE' : 'XƯỞNG SẢN XUẤT BĂNG HÌNH & TRI THỨC PHÁP LUẬT'}
            </span>
            <span className="hidden sm:inline">STUDIO ARCHIVE • VOL. 2026</span>
            <span className="font-bold">BROADCAST REGISTRY</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
                {isEn ? 'My Video Tape Archive & Lectures' : 'Kho Băng Hình & Bài Giảng Của Tôi'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans">
                {isEn
                  ? 'Manage lecture archives, practical case precedents, and regulatory legal consultation video tapes.'
                  : 'Quản lý kho tư liệu bài giảng, án lệ thực tiễn và bản ghi video tư vấn pháp luật chuẩn quy định.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => refetch()}
                className="p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors shadow-[2px_2px_0px_#000]"
                title={isEn ? 'Refresh Catalog' : 'Làm mới danh mục'}
              >
                <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-[#b45309]' : ''}`} />
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 border-2 border-stone-800 dark:border-[#f59e0b] bg-[#b45309] dark:bg-[#f59e0b] hover:bg-[#d97706] dark:hover:bg-[#fbbf24] text-white dark:text-stone-950 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_#78350f] transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isEn ? 'Upload Tape' : 'Tải Lên Băng Hình'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Retro KPI Dossier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1d1813] shadow-[4px_4px_0px_#b45309] dark:shadow-[4px_4px_0px_#f59e0b] flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400">
                {isEn ? '[TOTAL TAPES]' : '[TỔNG BĂNG HÌNH]'}
              </span>
              <p className="text-2xl font-mono font-black text-stone-900 dark:text-stone-100">{metrics.total}</p>
            </div>
            <Film className="w-7 h-7 text-stone-400" />
          </div>

          <div className="p-4 sm:p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1d1813] shadow-[4px_4px_0px_#b45309] dark:shadow-[4px_4px_0px_#f59e0b] flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                {isEn ? '[APPROVED BROADCAST]' : '[ĐÃ DUYỆT PHÁT SÓNG]'}
              </span>
              <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">{metrics.approved}</p>
            </div>
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>

          <div className="p-4 sm:p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1d1813] shadow-[4px_4px_0px_#b45309] dark:shadow-[4px_4px_0px_#f59e0b] flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                {isEn ? '[COUNCIL REVIEW PENDING]' : '[CHỜ DUYỆT HỘI ĐỒNG]'}
              </span>
              <p className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">{metrics.pending}</p>
            </div>
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1d1813] shadow-[4px_4px_0px_#b45309] dark:shadow-[4px_4px_0px_#f59e0b] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { key: 'ALL', label: isEn ? 'All Tapes' : 'Tất cả tư liệu', count: metrics.total },
              { key: 'APPROVED', label: isEn ? 'Published' : 'Đã xuất bản', count: metrics.approved },
              { key: 'PENDING', label: isEn ? 'Pending Review' : 'Chờ duyệt', count: metrics.pending },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 border-2 text-xs font-mono font-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'border-[#b45309] dark:border-[#f59e0b] bg-[#b45309] dark:bg-[#f59e0b] text-white dark:text-stone-950 shadow-[2px_2px_0px_#78350f]'
                    : 'border-stone-400 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 bg-black/20 text-[10px] rounded">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search lectures, topics...' : 'Tra cứu tên bài giảng, chủ đề...'}
              className="w-full pl-9 pr-3 py-1.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#14100c] text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#b45309] dark:focus:border-[#f59e0b]"
            />
          </div>
        </div>

        {/* Video Gallery */}
        <div>
          {loading ? (
            <div className="p-12 text-center font-mono text-xs text-stone-500">
              {isEn ? 'Retrieving personal video tape archive...' : 'Đang truy xuất kho lưu trữ băng hình cá nhân...'}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-stone-400 dark:border-stone-700 bg-white/50 dark:bg-[#1a1510]/50 p-8 space-y-3">
              <Tv className="w-10 h-10 mx-auto text-stone-400" />
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {isEn ? 'No matching video tape records found' : 'Chưa có bản ghi băng hình nào phù hợp'}
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                {isEn
                  ? 'Start uploading your first video to share legal procedural knowledge with the public.'
                  : 'Bắt đầu tải lên video đầu tiên để chia sẻ kiến thức tố tụng đến công chúng.'}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 border-2 border-stone-800 dark:border-[#f59e0b] bg-[#b45309] dark:bg-[#f59e0b] text-white dark:text-stone-950 font-mono font-bold text-xs uppercase"
              >
                {isEn ? '+ Upload Video Now' : '+ Tải Lên Video Ngay'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onDelete={() => setDeletingVideoId(video._id)}
                  onPreview={() => setSelectedVideo({ url: video.video_url, id: video._id })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateVideoModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />

      <VideoPreviewModal
        videoUrl={selectedVideo?.url || null}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoId={selectedVideo?.id || ''}
      />

      <ConfirmModal
        isOpen={!!deletingVideoId}
        onClose={() => setDeletingVideoId(null)}
        onConfirm={handleDeleteVideo}
        title={isEn ? 'Delete Tape Record?' : 'Hủy bỏ bản ghi băng hình?'}
        description={
          isEn
            ? 'Are you sure you want to permanently delete this tape record from the chambers archive?'
            : 'Bạn có chắc chắn muốn xóa vĩnh viễn tư liệu băng hình này khỏi hồ sơ lưu trữ?'
        }
        confirmText={isEn ? 'Delete Record' : 'Xác nhận xóa'}
        cancelText={isEn ? 'Keep Tape' : 'Giữ lại'}
        variant="danger"
      />
    </div>
  );
};

export default VideoManager;