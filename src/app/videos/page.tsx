'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Film,
  Play,
  Star,
  Calendar,
  Search,
  RotateCw,
  PlusCircle,
  Eye,
  ChevronLeft,
} from 'lucide-react';
import { useGetPublicVideosQuery } from '@/store/queries/video';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import VideoPreviewModal from '@/components/module/videoSelf/VideoPreviewModal';
import { useLanguage } from '@/i18n/LanguageContext';

export default function VideosPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeVideo, setActiveVideo] = useState<{ url: string; id: string } | null>(null);

  const { data: rawResponse, isLoading, refetch, isFetching } = useGetPublicVideosQuery();

  const CATEGORIES = useMemo(() => [
    { key: 'ALL', labelVi: 'Tất cả', labelEn: 'All' },
    { key: 'CIVIL', labelVi: 'Dân sự', labelEn: 'Civil' },
    { key: 'LAND', labelVi: 'Đất đai', labelEn: 'Land & Property' },
    { key: 'CORPORATE', labelVi: 'Doanh nghiệp', labelEn: 'Corporate' },
    { key: 'CRIMINAL', labelVi: 'Hình sự', labelEn: 'Criminal' },
    { key: 'FAMILY', labelVi: 'Hôn nhân gia đình', labelEn: 'Family' },
    { key: 'LABOR', labelVi: 'Lao động', labelEn: 'Labor' },
  ], []);

  const videos = useMemo(() => {
    const rawData = (rawResponse?.data as any) || rawResponse;
    const list = Array.isArray(rawData) ? rawData : rawData?.items || rawData?.data || [];
    return Array.isArray(list) ? list : [];
  }, [rawResponse]);

  const filteredVideos = useMemo(() => {
    return videos.filter((v: any) => {
      const matchSearch =
        !searchTerm ||
        (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.categories && v.categories.toLowerCase().includes(searchTerm.toLowerCase()));

      const cat = String(v.categories || '').toUpperCase();
      const matchCat =
        selectedCategory === 'ALL' ||
        cat === selectedCategory ||
        cat.includes(selectedCategory);

      return matchSearch && matchCat;
    });
  }, [videos, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#131210] text-stone-900 dark:text-[#fbf8f2] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between font-mono text-xs">
          <Link
            href="/"
            className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-[#d95327] uppercase font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isEn ? 'Home' : 'Trang Chủ'}</span>
          </Link>
          <span className="text-stone-500 font-bold uppercase">
            {isEn ? '[JUDICIAL VIDEO ARCHIVE]' : '[KHO TƯ LIỆU BĂNG HÌNH TƯ PHÁP]'}
          </span>
        </div>

        {/* Header Title Block */}
        <div className="border-2 border-stone-800 dark:border-[#38332c] bg-white dark:bg-[#181614] p-6 sm:p-8 shadow-[6px_6px_0px_#181614] dark:shadow-[6px_6px_0px_#e5decf] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 bg-[#d95327] text-white border border-stone-900">
                [TAPE REEL]
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
                {isEn ? 'Legal Video Library & Masterclasses' : 'Kho Băng Hình & Bài Giảng Pháp Luật'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-serif text-stone-600 dark:text-stone-400 max-w-2xl">
              {isEn
                ? 'Repository of legal advisory videos, case commentaries, and statutory dissemination carefully curated and verified.'
                : 'Kho lưu trữ video tư vấn tình huống pháp lý, bình luận án lệ và phổ biến quy định pháp luật được biên soạn và kiểm duyệt chặt chẽ.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => refetch()}
              className="p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#1f1c19] hover:bg-[#d95327] hover:text-white transition-colors shadow-[2px_2px_0px_#181614]"
              title={isEn ? 'Refresh data' : 'Làm mới dữ liệu'}
            >
              <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/videoSelf"
              className="px-4 py-2 border-2 border-stone-800 dark:border-[#e26d46] bg-[#d95327] text-white font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_#000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isEn ? 'Upload Video' : 'Đăng Tải Băng Hình'}</span>
            </Link>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="border-2 border-stone-800 dark:border-[#38332c] bg-white dark:bg-[#181614] p-4 shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search by topic, title...' : 'Tìm kiếm theo chủ đề, tiêu đề...'}
              className="w-full pl-9 pr-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#11100e] font-mono text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 font-mono text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 border-2 font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'border-stone-900 dark:border-white bg-[#181614] dark:bg-white text-white dark:text-[#181614] shadow-[2px_2px_0px_#d95327]'
                    : 'border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1d1813] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                {isEn ? cat.labelEn : cat.labelVi}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="py-24 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-[#181614] space-y-2">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#d95327]" />
            <span className="text-xs font-mono text-stone-500">{isEn ? '[LOADING VIDEO ARCHIVES...]' : '[ĐANG TẢI KHO BĂNG HÌNH TƯ PHÁP...]'}</span>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-[#181614] space-y-3">
            <Film className="w-10 h-10 mx-auto text-stone-400 opacity-60" />
            <p className="font-serif font-bold text-sm text-stone-700 dark:text-stone-300">
              {isEn ? 'No video tapes found matching your filters.' : 'Không tìm thấy băng hình nào phù hợp với bộ lọc.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video: any) => {
              const thumbnail = video.thumnail_url || video.thubnail_url || '';
              const categoryLabel =
                (LawyerCategoriesVietnamese as any)[video.categories] || video.categories || (isEn ? 'Law' : 'Pháp luật');

              return (
                <div
                  key={video._id}
                  onClick={() => setActiveVideo({ url: video.video_url, id: video._id })}
                  className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1a1714] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] overflow-hidden flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-transform select-none"
                >
                  <div>
                    {/* Tape Header & Film Preview Frame */}
                    <div className="relative aspect-video bg-stone-950 overflow-hidden flex items-center justify-center border-b-2 border-stone-800 dark:border-stone-700">
                      {thumbnail && thumbnail !== 'null' ? (
                        <img
                          src={thumbnail}
                          alt={video.description || 'Tape thumbnail'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter saturate-90 group-hover:saturate-100"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-950 text-stone-600">
                          <Film className="w-10 h-10 opacity-30 text-[#d95327]" />
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-[#d95327]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 border-2 border-white bg-black/80 text-white flex items-center justify-center shadow-[3px_3px_0px_#000]">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </div>

                      {/* Category Tag */}
                      <div className="absolute top-2 left-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-stone-900 bg-[#d95327] text-white shadow-[2px_2px_0px_#000]">
                          [{categoryLabel}]
                        </span>
                      </div>

                      {/* Star Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-stone-900 bg-stone-900 text-amber-400 flex items-center gap-1 shadow-[2px_2px_0px_#000]">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{video.star ? Number(video.star).toFixed(1) : '5.0'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      <h3 className="font-serif font-black text-sm text-stone-900 dark:text-[#fbf8f2] line-clamp-2 leading-snug group-hover:text-[#d95327] dark:group-hover:text-[#e26d46] transition-colors">
                        {video.description || (isEn ? 'Legal commentary & case law advisory' : 'Bài giảng và hướng dẫn giải quyết tranh chấp pháp lý')}
                      </h3>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200 dark:border-stone-800 font-mono text-[11px] text-stone-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {video.createdAt
                              ? new Date(video.createdAt).toLocaleDateString(isEn ? 'en-US' : 'vi-VN')
                              : '—'}
                          </span>
                        </div>
                        <span className="font-bold text-[#d95327] uppercase flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          <span>{isEn ? 'Watch Tape' : 'Xem chi tiết'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="px-4 py-2 border-t-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#151311] flex items-center justify-between text-[10px] font-mono text-stone-600 dark:text-stone-400">
                    <span>[TAPE: {video._id ? `#${video._id.slice(-6).toUpperCase()}` : '—'}]</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200 uppercase">{isEn ? '[OFFICIAL TAPE]' : '[BĂNG HÌNH CHUẨN]'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPreviewModal
          videoUrl={activeVideo.url}
          videoId={activeVideo.id}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
