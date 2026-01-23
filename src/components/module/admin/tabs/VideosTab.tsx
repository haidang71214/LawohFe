'use client';

import React, { useState, useMemo } from 'react';
import {
  Video,
  Play,
  Trash2,
  Search,
  X,
  RotateCw,
  Film,
} from 'lucide-react';
import {
  useGetAdminVideosQuery,
  useModerateVideoMutation,
  useDeleteVideoMutation,
} from '@/store/queries/video';
import { useLanguage } from '@/i18n/LanguageContext';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from '@/lib/toast';

export const VideosTab: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const { data: videosResponse, isLoading, isFetching, refetch } = useGetAdminVideosQuery();
  const [moderateVideoMutation, { isLoading: isModerating }] = useModerateVideoMutation();
  const [deleteVideoMutation] = useDeleteVideoMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Preview Modal
  const [previewVideo, setPreviewVideo] = useState<any | null>(null);

  // Moderate Modal
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'accept' | 'reject'; title: string } | null>(null);
  const [moderateReason, setModerateReason] = useState('');

  const videos: any[] = useMemo(() => {
    const rawVideos = (videosResponse?.data as any) || [];
    const list = Array.isArray(rawVideos) ? rawVideos : (Array.isArray(rawVideos?.data) ? rawVideos.data : []);
    return Array.isArray(list) ? list : [];
  }, [videosResponse]);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchSearch =
        (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.categories && v.categories.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === 'PENDING') {
        matchStatus = !v.accept && v.status !== 'rejected';
      } else if (statusFilter === 'APPROVED') {
        matchStatus = v.accept === true || v.status === 'accepted';
      } else if (statusFilter === 'REJECTED') {
        matchStatus = v.status === 'rejected';
      }

      return matchSearch && matchStatus;
    });
  }, [videos, searchTerm, statusFilter]);

  const handleOpenModerate = (id: string, action: 'accept' | 'reject', title: string) => {
    setActionTarget({ id, action, title });
    setModerateReason(
      action === 'accept'
        ? (isEn ? 'Video meets content and legal compliance standards' : 'Video đạt tiêu chuẩn nội dung và pháp lý')
        : (isEn ? 'Content does not meet legal standards' : 'Nội dung chưa phù hợp với quy chuẩn')
    );
  };

  const handleConfirmModerate = async () => {
    if (!actionTarget) return;
    try {
      await moderateVideoMutation({
        id: actionTarget.id,
        action: actionTarget.action,
        accept: actionTarget.action === 'accept',
        reason: moderateReason,
      }).unwrap();

      toast.success(
        actionTarget.action === 'accept'
          ? (isEn ? 'Video approved' : 'Đã phê duyệt video')
          : (isEn ? 'Video rejected' : 'Đã từ chối video'),
        `${isEn ? 'Action completed on' : 'Thao tác thành công trên video'} "${actionTarget.title}"`
      );
      setActionTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(
        isEn ? 'Moderation error' : 'Lỗi kiểm duyệt',
        err?.data?.message || (isEn ? 'Failed to update video status' : 'Không thể cập nhật trạng thái video')
      );
    }
  };

  // Delete Confirmation
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const handleDeleteVideo = async () => {
    if (!deletingVideoId) return;
    try {
      await deleteVideoMutation(deletingVideoId).unwrap();
      toast.success(
        isEn ? 'Video deleted' : 'Đã xóa video',
        isEn ? 'Video has been deleted from system' : 'Video đã được xóa khỏi hệ thống'
      );
      setDeletingVideoId(null);
      refetch();
    } catch (err: any) {
      toast.error(
        isEn ? 'Delete error' : 'Lỗi xóa',
        err?.data?.message || (isEn ? 'Failed to delete video' : 'Không thể xóa video')
      );
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-4 shadow-[4px_4px_0px_#1a5336]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search video description, category...' : 'Tìm video theo mô tả, thể loại...'}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80]"
            />
          </div>
        </div>

        {/* Status Filter Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {[
            { key: 'PENDING', label: isEn ? '[PENDING]' : '[CHỜ DUYỆT]' },
            { key: 'APPROVED', label: isEn ? '[APPROVED]' : '[ĐÃ DUYỆT]' },
            { key: 'REJECTED', label: isEn ? '[REJECTED]' : '[TỪ CHỐI]' },
            { key: 'ALL', label: isEn ? '[ALL]' : '[TẤT CẢ]' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 border-2 text-xs font-bold uppercase transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 shadow-[2px_2px_0px_#000]'
                  : 'border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Reload / Refresh Button */}
          <button
            onClick={() => {
              refetch();
            }}
            disabled={isLoading || isFetching}
            title={isEn ? 'Reload video list' : 'Tải lại danh sách video'}
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold uppercase transition-all cursor-pointer active:translate-y-0.5 disabled:opacity-50 shadow-[2px_2px_0px_#000]"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading || isFetching ? 'animate-spin text-[#1a5336] dark:text-[#4ade80]' : ''}`} />
            <span>{isEn ? 'Reload' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="py-16 text-center font-mono text-xs text-stone-500 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700">
          <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a5336] dark:text-[#4ade80]" />
          <span>[ĐANG TẢI DANH SÁCH VIDEO KIỂM DUYỆT...]</span>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-16 text-center font-mono text-xs text-stone-500 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 space-y-2 shadow-[4px_4px_0px_#1a5336]">
          <Film className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="font-bold uppercase text-stone-800 dark:text-stone-200">
            [KHÔNG CÓ VIDEO NÀO TRONG DANH MỤC NÀY]
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => {
            const isApproved = video.accept === true || video.status === 'accepted';
            const isRejected = video.status === 'rejected';
            const isPending = !isApproved && !isRejected;

            return (
              <div
                key={video._id}
                className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[4px_4px_0px_#1a5336] overflow-hidden flex flex-col justify-between"
              >
                {/* Thumbnail & Video Preview Trigger */}
                <div
                  className="relative aspect-video bg-stone-900 border-b-2 border-stone-800 dark:border-stone-700 cursor-pointer group overflow-hidden"
                  onClick={() => setPreviewVideo(video)}
                >
                  {video.thubnail_url || video.thumnail_url ? (
                    <img
                      src={video.thubnail_url || video.thumnail_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-600">
                      <Video className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-12 h-12 border-2 border-stone-900 bg-[#1a5336] text-white flex items-center justify-center shadow-[3px_3px_0px_#000]">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {isPending && (
                      <span className="px-2 py-0.5 font-mono text-[10px] font-bold bg-amber-500 text-stone-950 border border-stone-900 shadow-[2px_2px_0px_#000]">
                        [CHỜ DUYỆT]
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-2 py-0.5 font-mono text-[10px] font-bold bg-emerald-600 text-white border border-stone-900 shadow-[2px_2px_0px_#000]">
                        [ĐÃ DUYỆT]
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2 py-0.5 font-mono text-[10px] font-bold bg-rose-600 text-white border border-stone-900 shadow-[2px_2px_0px_#000]">
                        [TỪ CHỐI]
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-bold text-[#1a5336] dark:text-[#4ade80] uppercase">
                        CHỦ ĐỀ: {Array.isArray(video.categories) ? video.categories.join(', ') : video.categories || 'PHÁP LUẬT'}
                      </span>
                      <span className="text-stone-500">
                        {video.createdAt ? new Date(video.createdAt).toLocaleDateString(isEn ? 'en-US' : 'vi-VN') : ''}
                      </span>
                    </div>
                    <p className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                      {video.description || (isEn ? 'Untitled Video' : 'Video không có mô tả chi tiết')}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t-2 border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 font-mono">
                    <button
                      onClick={() => setPreviewVideo(video)}
                      className="px-2.5 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-[11px] font-bold uppercase text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-[2px_2px_0px_#000] cursor-pointer"
                    >
                      {isEn ? 'Preview' : 'Xem Video'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleOpenModerate(video._id, 'accept', video.description)}
                            className="px-2.5 py-1.5 border-2 border-[#1a5336] dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 text-[11px] font-bold uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
                          >
                            {t('common.approve', 'DUYỆT')}
                          </button>
                          <button
                            onClick={() => handleOpenModerate(video._id, 'reject', video.description)}
                            className="px-2.5 py-1.5 border-2 border-rose-800 bg-rose-600 text-white text-[11px] font-bold uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
                          >
                            {t('common.reject', 'TỪ CHỐI')}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setDeletingVideoId(video._id)}
                        className="p-1.5 border-2 border-stone-800 text-stone-600 hover:bg-rose-700 hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
                        title={isEn ? 'Delete permanently' : 'Xóa vĩnh viễn'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-950/85 backdrop-blur-xs"
            onClick={() => setPreviewVideo(null)}
          ></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-5 shadow-[8px_8px_0px_#1a5336] space-y-4 animate-modal-pop font-sans">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
              <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate max-w-[80%]">
                {previewVideo.description || (isEn ? 'Video Preview' : 'Trình Phát Kiểm Duyệt Video')}
              </span>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 border border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-rose-700 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-stone-800 bg-black aspect-video flex items-center justify-center overflow-hidden shadow-[3px_3px_0px_#000]">
              <video
                src={previewVideo.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Moderate Action Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
            onClick={() => setActionTarget(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-6 shadow-[6px_6px_0px_#1a5336] space-y-4 text-xs animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
              <div className="flex items-center gap-2 font-serif font-black text-sm text-stone-900 dark:text-stone-50">
                <div className={`w-3 h-3 border border-stone-900 ${actionTarget.action === 'accept' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <h3>
                  {actionTarget.action === 'accept'
                    ? (isEn ? 'Confirm Video Approval' : 'Xác nhận Phê duyệt Video')
                    : (isEn ? 'Video Rejection Reason' : 'Lý do Từ chối Video')}
                </h3>
              </div>
              <button
                onClick={() => setActionTarget(null)}
                className="p-1 border border-stone-800 text-stone-700 hover:bg-rose-700 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono">
              <label className="text-xs font-bold uppercase text-stone-800 dark:text-stone-200">
                {isEn ? 'Notes / Feedback to author:' : 'Ghi chú / Phản hồi gửi tới tác giả:'}
              </label>
              <textarea
                rows={3}
                value={moderateReason}
                onChange={(e) => setModerateReason(e.target.value)}
                placeholder={isEn ? 'Enter moderation reason...' : 'Nhập lý do kiểm duyệt...'}
                className="w-full p-2.5 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-stone-800 font-mono">
              <button
                onClick={() => setActionTarget(null)}
                className="px-4 py-2 border-2 border-stone-800 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-300 font-bold uppercase shadow-[2px_2px_0px_#000]"
              >
                {t('common.cancel', 'HỦY')}
              </button>
              <button
                onClick={handleConfirmModerate}
                disabled={isModerating}
                className={`px-5 py-2 border-2 border-stone-900 text-white font-bold uppercase shadow-[3px_3px_0px_#000] cursor-pointer disabled:opacity-50 ${
                  actionTarget.action === 'accept'
                    ? 'bg-[#1a5336] hover:bg-[#22774a]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isModerating
                  ? (isEn ? 'Processing...' : 'ĐANG XỬ LÝ...')
                  : actionTarget.action === 'accept'
                  ? (isEn ? 'Approve Now' : 'PHÊ DUYỆT NGAY')
                  : (isEn ? 'Confirm Reject' : 'XÁC NHẬN TỪ CHỐI')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal for Video Deletion */}
      <ConfirmModal
        isOpen={!!deletingVideoId}
        onClose={() => setDeletingVideoId(null)}
        onConfirm={handleDeleteVideo}
        title={isEn ? 'Delete Video Record?' : 'Xóa Vĩnh Viễn Bản Ghi Video?'}
        description={
          isEn
            ? 'Are you sure you want to permanently delete this video from the system database?'
            : 'Bạn có chắc chắn muốn xóa vĩnh viễn bản ghi video này khỏi cơ sở dữ liệu hệ thống?'
        }
        confirmText={isEn ? 'Delete Permanently' : 'Xác nhận xóa'}
        cancelText={isEn ? 'Cancel' : 'Hủy bỏ'}
        variant="danger"
      />
    </div>
  );
};
