'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Film,
  Play,
  Star,
  Calendar,
  ChevronRight,
  Tv,
  Eye,
  PlusCircle,
  RotateCw,
} from 'lucide-react';
import { useGetPublicVideosQuery } from '@/store/queries/video';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';
import VideoPreviewModal from '@/components/module/videoSelf/VideoPreviewModal';

const HomeVideoSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeVideo, setActiveVideo] = useState<{ url: string; id: string } | null>(null);

  const { data: rawResponse, isLoading } = useGetPublicVideosQuery({ limit: 12 });

  const videos = useMemo(() => {
    const rawData = (rawResponse?.data as any) || rawResponse;
    const list = Array.isArray(rawData) ? rawData : rawData?.items || rawData?.data || [];
    return Array.isArray(list) ? list : [];
  }, [rawResponse]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'ALL') return videos;
    return videos.filter((v: any) => {
      const cat = String(v.categories || '').toUpperCase();
      return cat === selectedCategory || cat.includes(selectedCategory);
    });
  }, [videos, selectedCategory]);

  const categoryFilters = [
    { key: 'ALL', label: isEn ? 'All Tapes' : 'Tất Cả Tư Liệu' },
    { key: 'CIVIL', label: isEn ? 'Civil Law' : 'Dân Sự' },
    { key: 'LAND', label: isEn ? 'Land & Real Estate' : 'Đất Đai' },
    { key: 'CORPORATE', label: isEn ? 'Corporate' : 'Doanh Nghiệp' },
    { key: 'CRIMINAL', label: isEn ? 'Criminal' : 'Hình Sự' },
    { key: 'FAMILY', label: isEn ? 'Family & Marriage' : 'Hôn Nhân' },
    { key: 'LABOR', label: isEn ? 'Labor' : 'Lao Động' },
  ];

  return (
    <section className="py-16 sm:py-20 border-b-2 border-stone-800 dark:border-[#38332c] bg-[#f4efe6] dark:bg-[#141210] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-stone-800 dark:border-stone-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black uppercase px-2.5 py-0.5 bg-[#d95327] text-white border border-stone-900 shadow-[2px_2px_0px_#000]">
                {isEn ? '[LEGAL TAPE ARCHIVE]' : '[KHO TƯ LIỆU BĂNG HÌNH TƯ PHÁP]'}
              </span>
              <div className="flex items-center gap-1 text-stone-500 font-mono text-xs">
                <Tv className="w-3.5 h-3.5" />
                <span>REC • LIVE FEED</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-stone-900 dark:text-[#fbf8f2] tracking-tight">
              {isEn ? 'Legal Education & Practical Video Archive' : 'Băng Hình Phổ Biến & Tư Vấn Pháp Luật Thực Tiễn'}
            </h2>
            <p className="text-xs sm:text-sm font-serif text-stone-600 dark:text-stone-400 max-w-2xl">
              {isEn
                ? 'Watch insightful case analyses, court simulations, and legal consultations presented directly by certified lawyers.'
                : 'Theo dõi các bài giảng chuyên đề, phân tích án lệ thực tế và hướng dẫn tố tụng trực tiếp từ đội ngũ Luật sư có chứng chỉ hành nghề.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/videoSelf"
              className="px-3.5 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1d1813] hover:bg-stone-200 dark:hover:bg-stone-800 font-mono font-bold text-xs uppercase text-stone-800 dark:text-stone-200 shadow-[3px_3px_0px_#181614] dark:shadow-[3px_3px_0px_#e5decf] flex items-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#d95327]" />
              <span>{isEn ? 'Upload Tape' : 'Đăng Băng Hình'}</span>
            </Link>

            <Link
              href="/videos"
              className="px-4 py-2 border-2 border-stone-800 dark:border-[#e26d46] bg-[#d95327] dark:bg-[#e26d46] hover:bg-[#b83e18] text-white font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_#000] flex items-center gap-1 transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>{isEn ? 'View All Tapes' : 'Xem Toàn Bộ Kho'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
          {categoryFilters.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 border-2 font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.key
                  ? 'border-stone-900 dark:border-white bg-[#181614] dark:bg-white text-white dark:text-[#181614] shadow-[2px_2px_0px_#d95327]'
                  : 'border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1d1813] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Video Reel Grid */}
        {isLoading ? (
          <div className="py-20 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-[#181614] space-y-2">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#d95327]" />
            <span className="text-xs font-mono text-stone-500">[ĐANG TẢI KHO TƯ LIỆU BĂNG HÌNH...]</span>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-[#181614] space-y-3">
            <Film className="w-8 h-8 mx-auto text-stone-400 opacity-60" />
            <p className="font-serif font-bold text-sm text-stone-700 dark:text-stone-300">
              {isEn ? 'No approved video tapes found in this category yet.' : 'Chưa có bản ghi băng hình nào trong danh mục này.'}
            </p>
            <Link
              href="/videoSelf"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-stone-800 bg-[#d95327] text-white font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_#000]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isEn ? 'Be the first to upload' : 'Đăng tải bản ghi đầu tiên'}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.slice(0, 6).map((video: any) => {
              const thumbnail = video.thumnail_url || video.thubnail_url || '';
              const categoryLabel =
                t(`categories.${video.categories}`, (LawyerCategoriesVietnamese as any)[video.categories] || video.categories) ||
                (isEn ? 'Legal Insight' : 'Pháp luật');

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
                        {video.description || 'Bài giảng và hướng dẫn giải quyết tranh chấp pháp lý'}
                      </h3>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200 dark:border-stone-800 font-mono text-[11px] text-stone-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {video.createdAt
                              ? new Date(video.createdAt).toLocaleDateString('vi-VN')
                              : '—'}
                          </span>
                        </div>
                        <span className="font-bold text-[#d95327] uppercase flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          <span>Xem chi tiết</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="px-4 py-2 border-t-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#151311] flex items-center justify-between text-[10px] font-mono text-stone-600 dark:text-stone-400">
                    <span>[TAPE: {video._id ? `#${video._id.slice(-6).toUpperCase()}` : '—'}]</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200 uppercase">[BĂNG HÌNH CHUẨN]</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#181614] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-stone-800 bg-[#d95327] text-white flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-black text-sm text-stone-900 dark:text-[#fbf8f2]">
                {isEn ? 'Looking for in-depth consultation on a case?' : 'Bạn cần tư vấn trực tiếp từ Luật sư thực hiện video?'}
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                {isEn ? 'Book an appointment with specialist lawyers across Vietnam.' : 'Đặt lịch hẹn tư vấn trực tuyến hoặc tại văn phòng với khung giá niêm yết minh bạch.'}
              </p>
            </div>
          </div>

          <Link
            href="/lawyers"
            className="px-4 py-2 border-2 border-stone-800 bg-[#181614] dark:bg-white text-white dark:text-[#181614] font-bold uppercase shadow-[2px_2px_0px_#d95327] text-center shrink-0"
          >
            {isEn ? 'Find Lawyer' : 'Tra Cứu Luật Sư'}
          </Link>
        </div>
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPreviewModal
          videoUrl={activeVideo.url}
          videoId={activeVideo.id}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </section>
  );
};

export default HomeVideoSection;
