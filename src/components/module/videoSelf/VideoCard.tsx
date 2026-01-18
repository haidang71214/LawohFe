'use client';

import React from 'react';
import { Play, Star, Trash2, Calendar,  Eye, Film } from 'lucide-react';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';

interface VideoCardProps {
  video: any;
  onDelete: (videoId: string) => void;
  onPlay?: (videoUrl: string, videoId: string) => void;
  onPreview?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDelete, onPlay, onPreview }) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const handleCardClick = () => {
    if (onPreview) {
      onPreview();
    } else if (onPlay) {
      onPlay(video.video_url, video._id);
    }
  };

  const thumbnail = video.thumnail_url || video.thubnail_url || '';
  const isApproved = video.accept || video.status === 'approved';

  const categoryLabel =
    t(`categories.${video.categories}`, (LawyerCategoriesVietnamese as any)[video.categories] || video.categories) ||
    (isEn ? 'Legal Insight' : 'Pháp luật');

  return (
    <div
      onClick={handleCardClick}
      className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1d1813] shadow-[4px_4px_0px_#b45309] dark:shadow-[4px_4px_0px_#f59e0b] overflow-hidden flex flex-col justify-between cursor-pointer group transition-transform hover:-translate-y-1 select-none"
    >
      <div>
        {/* Filmstrip Frame */}
        <div className="relative aspect-video bg-stone-900 overflow-hidden flex items-center justify-center border-b-2 border-stone-800 dark:border-stone-700">
          {thumbnail && thumbnail !== 'null' ? (
            <img
              src={thumbnail}
              alt={video.description || 'Video thumbnail'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter saturate-90 group-hover:saturate-100"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-950 text-stone-600">
              <Film className="w-10 h-10 opacity-30 text-[#b45309]" />
            </div>
          )}

          {/* Retro Overlay Play */}
          <div className="absolute inset-0 bg-[#b45309]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white bg-black/80 text-white flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <Play className="w-5 h-5 ml-0.5 fill-white" />
            </div>
          </div>

          {/* Category Docket Tag */}
          <div className="absolute top-2 left-2">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-stone-800 bg-[#b45309] text-white shadow-[2px_2px_0px_#000]">
              [{categoryLabel}]
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 border border-stone-800 shadow-[2px_2px_0px_#000] ${
                isApproved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-stone-950'
              }`}
            >
              {isApproved
                ? (isEn ? 'LIVE • APPROVED' : 'LIVE • ĐÃ DUYỆT')
                : (isEn ? 'PENDING REVIEW' : 'CHỜ DUYỆT')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2">
          <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-[#b45309] dark:group-hover:text-[#f59e0b] transition-colors">
            {video.description || (isEn ? 'Legal lectures & in-depth case study sharing' : 'Bài giảng pháp luật & chia sẻ án lệ chuyên sâu')}
          </h3>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200 dark:border-stone-800 font-mono text-[11px]">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{video.star ? Number(video.star).toFixed(1) : '5.0'}</span>
            </div>

            <div className="flex items-center gap-1 text-stone-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {video.createdAt
                  ? new Date(video.createdAt).toLocaleDateString(isEn ? 'en-US' : 'vi-VN')
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2.5 border-t-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 flex items-center justify-between text-xs font-mono">
        <span className="text-stone-500 text-[10px]">
          [TAPE: {video._id ? `#${video._id.slice(-6).toUpperCase()}` : '—'}]
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="px-2.5 py-1 border border-stone-800 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span>{isEn ? 'Play' : 'Phát'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(video._id);
            }}
            className="p-1 border border-stone-800 dark:border-stone-700 hover:bg-rose-100 dark:hover:bg-rose-950 text-stone-700 hover:text-rose-600 transition-colors"
            title={isEn ? 'Delete Record' : 'Xóa bản ghi'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;