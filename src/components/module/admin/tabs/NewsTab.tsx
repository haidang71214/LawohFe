'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  RotateCw,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  useGetAdminNewsQuery,
  useApproveNewsMutation,
  useRejectNewsMutation,
  useDeleteNewsMutation,
} from '@/store/queries/news';
import { useLanguage } from '@/i18n/LanguageContext';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from '@/lib/toast';

export const NewsTab: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { data: newsResponse, isLoading, isFetching, refetch } = useGetAdminNewsQuery();
  const [approveNewsMutation, { isLoading: isApproving }] = useApproveNewsMutation();
  const [rejectNewsMutation, { isLoading: isRejecting }] = useRejectNewsMutation();
  const [deleteNewsMutation, { isLoading: isDeleting }] = useDeleteNewsMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Preview Modal
  const [previewNews, setPreviewNews] = useState<any | null>(null);

  // Moderate Modal
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'approve' | 'reject'; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Delete Confirmation
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);

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

  const newsList: any[] = useMemo(() => {
    if (!newsResponse) return [];
    const rawData = (newsResponse as any)?.data || newsResponse;
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray(rawData?.data)) return rawData.data;
    if (Array.isArray(rawData?.news)) return rawData.news;
    if (Array.isArray(rawData?.items)) return rawData.items;
    if (Array.isArray(rawData?.result)) return rawData.result;
    if (Array.isArray(rawData?.results)) return rawData.results;
    if (Array.isArray(rawData?.docs)) return rawData.docs;
    if (Array.isArray(rawData?.list)) return rawData.list;
    if (Array.isArray((newsResponse as any)?.data)) return (newsResponse as any).data;
    return [];
  }, [newsResponse]);

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        (item.mainTitle && item.mainTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase()));

      const { isApproved, isRejected, isPending } = checkArticleStatus(item);

      let matchStatus = true;
      if (statusFilter === 'PENDING') {
        matchStatus = isPending;
      } else if (statusFilter === 'APPROVED') {
        matchStatus = isApproved;
      } else if (statusFilter === 'REJECTED') {
        matchStatus = isRejected;
      }

      return matchSearch && matchStatus;
    });
  }, [newsList, searchTerm, statusFilter]);

  const handleOpenAction = (id: string, action: 'approve' | 'reject', title: string) => {
    setActionTarget({ id, action, title });
    setRejectReason(action === 'reject' ? 'Nội dung chưa đáp ứng tiêu chuẩn chất lượng pháp lý' : '');
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    try {
      if (actionTarget.action === 'approve') {
        await approveNewsMutation(actionTarget.id).unwrap();
        toast.success(
          isEn ? 'Article approved' : 'Đã duyệt bài viết',
          `"${actionTarget.title}"`
        );
      } else {
        await rejectNewsMutation({ id: actionTarget.id, reason: rejectReason }).unwrap();
        toast.success(
          isEn ? 'Article rejected' : 'Đã từ chối bài viết',
          `"${actionTarget.title}"`
        );
      }
      setActionTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(
        isEn ? 'Moderation failed' : 'Lỗi xử lý duyệt bài',
        err?.data?.message || 'Có lỗi xảy ra khi thực hiện thao tác'
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingNewsId) return;
    try {
      await deleteNewsMutation(deletingNewsId).unwrap();
      toast.success(
        isEn ? 'Article deleted' : 'Đã xóa bài viết',
        isEn ? 'Article has been removed' : 'Bài viết đã được gỡ bỏ khỏi hệ thống'
      );
      setDeletingNewsId(null);
      refetch();
    } catch (err: any) {
      toast.error(
        isEn ? 'Delete failed' : 'Lỗi xóa bài viết',
        err?.data?.message || 'Không thể xóa bài viết này'
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
              placeholder={isEn ? 'Search articles by title, category...' : 'Tìm bài viết theo tiêu đề, danh mục...'}
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
              type="button"
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

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold uppercase transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading || isFetching ? 'animate-spin text-[#1a5336]' : ''}`} />
            <span>{isEn ? 'Reload' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* News List */}
      {isLoading ? (
        <div className="py-16 text-center font-mono text-xs text-stone-500 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700">
          <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a5336]" />
          <span>[ĐANG TẢI DANH SÁCH BÀI VIẾT KIỂM DUYỆT...]</span>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-16 text-center font-mono text-xs text-stone-500 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700">
          <FileText className="w-8 h-8 mx-auto mb-2 text-stone-400" />
          <span>[KHÔNG CÓ BÀI VIẾT NÀO TRONG MỤC NÀY]</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.map((item) => {
            const { isApproved, isRejected, isPending } = checkArticleStatus(item);
            const imageUrl = getArticleImage(item);

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail & Badge */}
                  <div className="relative h-40 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 mb-3 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.mainTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-stone-400">
                        <FileText className="w-10 h-10" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-stone-900/90 text-white rounded">
                      {item.type || 'CHUNG'}
                    </span>
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        isApproved
                          ? 'bg-emerald-600 text-white'
                          : isRejected
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isApproved ? 'ĐÃ DUYỆT' : isRejected ? 'TỪ CHỐI' : 'CHỜ DUYỆT'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-2 mb-1">
                    {item.mainTitle}
                  </h4>

                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-3">
                    {item.content?.replace(/###|>|\[.*?\]/g, '') || ''}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewNews(item)}
                    className="inline-flex items-center gap-1 text-xs font-mono text-stone-700 dark:text-stone-300 hover:text-emerald-600 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(item._id, 'approve', item.mainTitle)}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm cursor-pointer"
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(item._id, 'reject', item.mainTitle)}
                          className="px-2.5 py-1 text-xs font-bold bg-stone-200 hover:bg-red-100 text-stone-800 hover:text-red-700 rounded transition cursor-pointer"
                        >
                          Từ chối
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeletingNewsId(item._id)}
                      className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Xóa bài viết"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Moderate Confirm Modal */}
      {actionTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActionTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              {actionTarget.action === 'approve' ? 'Phê duyệt bài viết' : 'Từ chối bài viết'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {actionTarget.action === 'approve'
                ? `Bạn có chắc muốn phê duyệt bài viết "${actionTarget.title}" để xuất bản công khai?`
                : `Xác nhận từ chối bài viết "${actionTarget.title}".`}
            </p>

            {actionTarget.action === 'reject' && (
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Lý do từ chối:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                className="px-4 py-2 text-xs font-bold border-2 border-stone-800 rounded-lg text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isApproving || isRejecting}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition cursor-pointer ${
                  actionTarget.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isApproving || isRejecting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewNews(null)}
        >
          <div
            className="bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                {previewNews.type}
              </span>
              <button
                type="button"
                onClick={() => setPreviewNews(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {previewNews.mainTitle}
            </h2>

            {getArticleImage(previewNews) && (
              <img
                src={getArticleImage(previewNews)}
                alt={previewNews.mainTitle}
                className="max-h-60 w-full object-cover rounded-xl"
              />
            )}

            <div className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
              {previewNews.content}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingNewsId && (
        <ConfirmModal
          isOpen={true}
          title={isEn ? 'Delete Article' : 'Xóa bài viết'}
          description={
            isEn
              ? 'Are you sure you want to delete this article? This action cannot be undone.'
              : 'Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.'
          }
          confirmText={isDeleting ? (isEn ? 'Deleting...' : 'Đang xóa...') : (isEn ? 'Delete' : 'Xác nhận xóa')}
          cancelText={isEn ? 'Cancel' : 'Hủy bỏ'}
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setDeletingNewsId(null)}
        />
      )}
    </div>
  );
};
