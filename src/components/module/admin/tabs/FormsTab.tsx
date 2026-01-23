'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Search,
  X,
  RotateCw,
  FolderOpen,
  Eye,
} from 'lucide-react';
import {
  useGetFormsQuery,
  useCreateFormMutation,
  useDeleteFormMutation,
} from '@/store/queries/form';
import { LawyerCategoriesVietnamese, ETypeLawyer } from '@/types/enum';
import { useLanguage } from '@/i18n/LanguageContext';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from '@/lib/toast';

export const FormsTab: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const { data: formsResponse, isLoading, isFetching, refetch } = useGetFormsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createFormMutation, { isLoading: isCreating }] = useCreateFormMutation();
  const [deleteFormMutation] = useDeleteFormMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<string>(ETypeLawyer.CIVIL);
  const [mainContent, setMainContent] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Local optimistic state
  const [localForms, setLocalForms] = useState<any[]>([]);

  // Synchronize server data whenever formsResponse updates
  useEffect(() => {
    if (formsResponse) {
      const rootData = (formsResponse as any)?.data !== undefined ? (formsResponse as any).data : formsResponse;
      let items: any[] = [];
      if (Array.isArray(rootData)) {
        items = rootData;
      } else if (Array.isArray(rootData?.data)) {
        items = rootData.data;
      } else if (Array.isArray(rootData?.items)) {
        items = rootData.items;
      } else if (Array.isArray(rootData?.forms)) {
        items = rootData.forms;
      } else if (Array.isArray((formsResponse as any)?.items)) {
        items = (formsResponse as any).items;
      }
      setLocalForms(items);
    }
  }, [formsResponse]);

  // Clean and humanize document titles (strip raw timestamps, hashes, underscores)
  const formatHumanTitle = (rawStr: string): string => {
    if (!rawStr) return isEn ? 'Legal Document Template' : 'Mẫu văn bản pháp lý';
    let clean = decodeURIComponent(rawStr);
    if (clean.includes('/')) {
      clean = clean.split('/').pop() || clean;
    }
    clean = clean.replace(/^\d+-/, '').replace(/-\d+$/, '').replace(/_\d+$/, '').replace(/\d{8,}$/, '');
    clean = clean.replace(/[_-]+/g, ' ').trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const helperExtractDetails = (form: any) => {
    const rawUri = form.uri_secure || form.uri || '';
    
    let rawTitle = form.mainContent || form.title || form.name || '';
    if (!rawTitle && rawUri) {
      rawTitle = formatHumanTitle(rawUri);
    }
    const cleanTitle = formatHumanTitle(rawTitle);

    let inferredType = form.type;
    if (!inferredType) {
      const lower = cleanTitle.toLowerCase();
      if (lower.includes('đất') || lower.includes('dat') || lower.includes('sổ đỏ')) inferredType = 'LAND';
      else if (lower.includes('doanh nghiệp') || lower.includes('công ty') || lower.includes('kinh doanh')) inferredType = 'CORPORATE';
      else if (lower.includes('ly hôn') || lower.includes('hôn nhân') || lower.includes('nuôi con')) inferredType = 'FAMILY';
      else if (lower.includes('lao động') || lower.includes('việc làm') || lower.includes('thôi việc')) inferredType = 'LABOR';
      else if (lower.includes('hình sự') || lower.includes('tố giác') || lower.includes('tội phạm')) inferredType = 'CRIMINAL';
      else inferredType = 'CIVIL';
    }

    const isPdf = rawUri.toLowerCase().includes('.pdf');
    const isDoc = rawUri.toLowerCase().includes('.doc') || rawUri.toLowerCase().includes('.docx') || !isPdf;

    return {
      title: cleanTitle,
      type: inferredType,
      description: form.description || '',
      uri: rawUri,
      isPdf,
      isDoc,
    };
  };

  const filteredForms = useMemo(() => {
    return localForms.filter((f) => {
      const details = helperExtractDetails(f);
      const matchSearch =
        !searchTerm.trim() ||
        details.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        details.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        categoryFilter === 'ALL' ||
        details.type === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [localForms, searchTerm, categoryFilter]);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainContent.trim()) {
      toast.warning(isEn ? 'Please enter document form title' : 'Vui lòng nhập tên biểu mẫu');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('mainContent', mainContent.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      if (selectedFile) formData.append('formFile', selectedFile);

      // Optimistically add to local state immediately
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = {
        _id: tempId,
        id: tempId,
        type,
        mainContent: mainContent.trim(),
        description: description.trim(),
        uri_secure: selectedFile ? URL.createObjectURL(selectedFile) : '',
        createdAt: new Date().toISOString(),
      };
      setLocalForms((prev) => [optimisticItem, ...prev]);

      await createFormMutation(formData).unwrap();

      toast.success(
        isEn ? 'Form uploaded successfully' : 'Tải lên biểu mẫu thành công',
        isEn ? `Added template "${mainContent}"` : `Đã thêm mẫu đơn "${mainContent}"`
      );

      setMainContent('');
      setDescription('');
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error('[FormsTab] POST /api/v1/form error:', err);
      toast.error(
        isEn ? 'Upload error' : 'Lỗi tải lên',
        err?.data?.message || (isEn ? 'Failed to upload form' : 'Không thể tải lên biểu mẫu')
      );
    }
  };

  const handleDeleteForm = async () => {
    if (!deletingFormId) return;
    try {
      setLocalForms((prev) => prev.filter((f) => f._id !== deletingFormId && f.id !== deletingFormId));
      await deleteFormMutation(deletingFormId).unwrap();
      toast.success(isEn ? 'Form deleted' : 'Đã xóa biểu mẫu');
      setDeletingFormId(null);
      refetch();
    } catch (err: any) {
      toast.error(
        isEn ? 'Delete error' : 'Lỗi xóa',
        err?.data?.message || (isEn ? 'Failed to delete form' : 'Không thể xóa')
      );
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-4 shadow-[4px_4px_0px_#1a5336]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search by template name, category...' : 'Tìm kiếm biểu mẫu, mẫu đơn...'}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#1a5336] cursor-pointer"
          >
            <option value="ALL">{t('categories.ALL', 'MỌI LĨNH VỰC')}</option>
            {Object.entries(LawyerCategoriesVietnamese).map(([key, label]) => (
              <option key={key} value={key}>
                {label.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            onClick={() => refetch()}
            className="p-2 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-[2px_2px_0px_#000] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] text-white dark:text-stone-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEn ? 'Add Template' : 'Thêm Biểu Mẫu'}</span>
          </button>
        </div>
      </div>

      {/* Forms Table */}
      <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[6px_6px_0px_#1a5336] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100 dark:bg-[#18261e] border-b-2 border-stone-800 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[220px] border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Template Name' : 'Tên Biểu Mẫu Chuẩn'}</th>
                <th className="px-4 py-3 min-w-[130px] border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Specialty' : 'Lĩnh Vực'}</th>
                <th className="px-4 py-3 min-w-[240px] border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Description' : 'Ghi Chú / Căn Cứ Áp Dụng'}</th>
                <th className="px-4 py-3 min-w-[120px] border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Document Access' : 'Tài Liệu Đính Kèm'}</th>
                <th className="px-4 py-3 text-right min-w-[90px]">{t('common.actions', 'Thao Tác')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-stone-200 dark:divide-stone-800">
              {isLoading && localForms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500 font-bold">
                    <RotateCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#1a5336]" />
                    <span>[ĐANG TẢI KHO BIỂU MẪU PHÁP LÝ...]</span>
                  </td>
                </tr>
              ) : filteredForms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500 font-bold">
                    <FolderOpen className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    [CHƯA CÓ VĂN BẢN NÀO TRONG KHO BIỂU MẪU]
                  </td>
                </tr>
              ) : (
                filteredForms.map((form) => {
                  const details = helperExtractDetails(form);

                  return (
                    <tr key={form._id || form.id} className="hover:bg-stone-50 dark:hover:bg-[#0d1410] transition-colors group">
                      {/* Name */}
                      <td className="px-4 py-3 max-w-[240px] border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                        <div
                          onClick={() => setPreviewDoc({ ...form, ...details })}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <div className="w-8 h-8 border-2 border-stone-800 bg-[#1a5336] text-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span
                            title={details.title}
                            className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-[#1a5336] dark:group-hover:text-[#4ade80] transition-colors truncate block max-w-full"
                          >
                            {details.title}
                          </span>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="px-4 py-3 border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                        <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase bg-[#1a5336]/10 border border-[#1a5336] text-[#1a5336] dark:text-[#4ade80]">
                          {(LawyerCategoriesVietnamese as any)[details.type] || details.type}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-400 text-[11px] font-mono max-w-[260px] border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                        {details.description ? (
                          <span title={details.description} className="truncate block max-w-full">
                            {details.description}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">Văn bản pháp quy ban hành</span>
                        )}
                      </td>

                      {/* Attachment View / Download */}
                      <td className="px-4 py-3 border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                        {details.uri ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <button
                              onClick={() => setPreviewDoc({ ...form, ...details })}
                              className="px-2 py-1 border border-stone-800 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-[11px] font-bold uppercase text-[#1a5336] dark:text-[#4ade80] flex items-center gap-1 cursor-pointer"
                              title={isEn ? 'Preview online' : 'Xem trực tuyến'}
                            >
                              <Eye className="w-3 h-3" />
                              <span>{isEn ? 'View' : 'Xem'}</span>
                            </button>
                            <a
                              href={details.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 border border-stone-800 bg-white dark:bg-stone-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200"
                              title={isEn ? 'Direct download' : 'Tải về máy'}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeletingFormId(form._id || form.id)}
                          className="p-1.5 border-2 border-stone-800 text-stone-600 hover:bg-rose-700 hover:text-white transition-colors cursor-pointer shadow-[1px_1px_0px_#000]"
                          title={isEn ? 'Delete template' : 'Xóa biểu mẫu'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern, Human-Designed Document Viewer Modal */}
      {previewDoc && (
        <DocumentViewerModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
            onClick={() => setIsUploadModalOpen(false)}
          ></div>
          <form
            onSubmit={handleCreateForm}
            className="relative w-full max-w-md bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-6 shadow-[8px_8px_0px_#1a5336] space-y-4 text-xs animate-modal-pop"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80]" />
                <h3 className="font-serif font-black text-sm text-stone-900 dark:text-stone-50">
                  {isEn ? 'Upload Standard Template' : 'Tải Lên Biểu Mẫu Chuẩn'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 border border-stone-800 text-stone-700 hover:bg-rose-700 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-stone-800 dark:text-stone-200">
                  {isEn ? 'Template Name *' : 'Tên biểu mẫu chuẩn *'}
                </label>
                <input
                  type="text"
                  required
                  value={mainContent}
                  onChange={(e) => setMainContent(e.target.value)}
                  placeholder={isEn ? 'E.g. Commercial Contract Form...' : 'Ví dụ: Mẫu hợp đồng mua bán thương mại...'}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-stone-800 dark:text-stone-200">
                  {isEn ? 'Legal Category *' : 'Chuyên mục pháp lý *'}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#1a5336] cursor-pointer"
                >
                  {Object.values(ETypeLawyer).map((t) => (
                    <option key={t} value={t}>
                      {((LawyerCategoriesVietnamese as Record<string, string>)[t] || t).toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-stone-800 dark:text-stone-200">
                  {isEn ? 'Short Description' : 'Mô tả căn cứ áp dụng'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isEn ? 'Usage instructions or legal references...' : 'Hướng dẫn áp dụng hoặc căn cứ pháp luật...'}
                  className="w-full p-2.5 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-stone-800 dark:text-stone-200">
                  {isEn ? 'Attachment File (DOCX, PDF)' : 'Tệp văn bản đính kèm (DOCX, PDF)'}
                </label>
                <input
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-stone-800 font-mono">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border-2 border-stone-800 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-300 font-bold uppercase shadow-[2px_2px_0px_#000]"
              >
                {t('common.cancel', 'HỦY')}
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 border-2 border-stone-900 bg-[#1a5336] hover:bg-[#22774a] text-white font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] cursor-pointer disabled:opacity-50"
              >
                {isCreating ? (isEn ? 'Uploading...' : 'ĐANG TẢI...') : (isEn ? 'Save Template' : 'LƯU BIỂU MẪU')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingFormId}
        onClose={() => setDeletingFormId(null)}
        onConfirm={handleDeleteForm}
        title={isEn ? 'Delete Document Template?' : 'Xóa Biểu Mẫu Pháp Lý?'}
        description={
          isEn
            ? 'Are you sure you want to permanently delete this document template?'
            : 'Bạn có chắc chắn muốn xóa vĩnh viễn biểu mẫu này khỏi kho dữ liệu pháp lý?'
        }
        confirmText={isEn ? 'Delete Template' : 'Xác nhận xóa'}
        cancelText={isEn ? 'Cancel' : 'Hủy bỏ'}
        variant="danger"
      />
    </div>
  );
};
