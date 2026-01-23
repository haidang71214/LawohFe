'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  RotateCw,
  Check,
} from 'lucide-react';
import {
  useGetLearnPackagesQuery,
  useCreateLearnPackageMutation,
  useUpdateLearnPackageMutation,
  useDeleteLearnPackageMutation,
  LearnPackage,
} from '@/store/queries/learnPackage';
import { formatVND, formatNumberInput, parseNumberInput } from '@/lib/formatCurrency';
import { useLanguage } from '@/i18n/LanguageContext';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from '@/lib/toast';

export const PackagesTab: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<LearnPackage | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceFormatted: '',
    durationMonths: 1,
    features: '',
    isActive: true,
  });

  const { data: rawPackages, isLoading, refetch } = useGetLearnPackagesQuery();
  const [createPackage, { isLoading: isCreating }] = useCreateLearnPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdateLearnPackageMutation();
  const [deletePackage] = useDeleteLearnPackageMutation();

  const packageList = useMemo(() => {
    const rawData = (rawPackages?.data as any) || rawPackages || [];
    const list = Array.isArray(rawData) ? rawData : rawData?.items || [];
    return Array.isArray(list) ? list : [];
  }, [rawPackages]);

  const filteredPackages = useMemo(() => {
    return packageList.filter((p: LearnPackage) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [packageList, search]);

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      priceFormatted: '199.000',
      durationMonths: 1,
      features: isEn
        ? 'Unlimited precedent search\nDownload standard legal forms\nPriority technical support'
        : 'Tra cứu án lệ không giới hạn\nTải biểu mẫu pháp lý chuẩn\nƯu tiên hỗ trợ kỹ thuật',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: LearnPackage) => {
    setEditingPackage(pkg);
    const p = Number(pkg.price) || 0;
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      priceFormatted: p > 0 ? p.toLocaleString('vi-VN') : '',
      durationMonths: pkg.durationMonths || 1,
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      isActive: (pkg as any).is_active !== false && pkg.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseNumberInput(formData.priceFormatted);
    if (priceNum <= 0) {
      toast.warning(isEn ? 'Please enter a listed price greater than 0 ₫' : 'Vui lòng nhập giá niêm yết lớn hơn 0 ₫');
      return;
    }

    const featuresArray = formData.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      if (editingPackage) {
        await updatePackage({
          id: editingPackage._id,
          data: {
            name: formData.name,
            description: formData.description,
            price: priceNum,
            durationMonths: Number(formData.durationMonths),
            features: featuresArray,
            is_active: formData.isActive,
            isActive: formData.isActive,
          } as any,
        }).unwrap();

        toast.success(
          isEn ? 'Package updated' : 'Cập nhật thành công',
          isEn ? `Package ${formData.name} (${formatVND(priceNum)}) updated` : `Gói ${formData.name} (${formatVND(priceNum)}) đã được cập nhật`
        );
      } else {
        await createPackage({
          name: formData.name,
          description: formData.description,
          price: priceNum,
          durationMonths: Number(formData.durationMonths),
          features: featuresArray,
          is_active: formData.isActive,
          isActive: formData.isActive,
        } as any).unwrap();

        toast.success(
          isEn ? 'Package created' : 'Tạo gói thành công',
          isEn ? `Added package ${formData.name} (${formatVND(priceNum)})` : `Đã thêm gói dịch vụ ${formData.name} (${formatVND(priceNum)})`
        );
      }

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(isEn ? 'Save error' : 'Lỗi lưu gói', err?.data?.message || (isEn ? 'Failed to save package' : 'Không thể lưu gói dịch vụ'));
    }
  };

  // Delete Confirmation
  const [deletingPackage, setDeletingPackage] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!deletingPackage) return;

    try {
      await deletePackage(deletingPackage.id).unwrap();
      toast.success(
        isEn ? 'Package deleted' : 'Đã xóa gói',
        isEn ? `Package "${deletingPackage.name}" deleted` : `Gói "${deletingPackage.name}" đã được xóa`
      );
      setDeletingPackage(null);
      refetch();
    } catch (err: any) {
      toast.error(isEn ? 'Delete error' : 'Lỗi xóa gói', err?.data?.message || (isEn ? 'Failed to delete package' : 'Không thể xóa gói dịch vụ'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-4 shadow-[4px_4px_0px_#1a5336] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? 'Search packages by title or perks...' : 'Tìm kiếm gói hội viên, án lệ, biểu mẫu...'}
              className="w-full pl-9 pr-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono text-xs text-stone-900 dark:text-[#f7f8f4] placeholder:text-stone-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#0d1410] hover:bg-[#1a5336] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-stone-950 transition-colors shadow-[2px_2px_0px_#1a5336]"
            title="Làm mới"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_#000] flex items-center gap-1.5 transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isEn ? 'Create New Package' : 'Thêm Gói Mới'}</span>
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="py-20 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-[#141b16]">
          <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1a5336] dark:text-[#4ade80]" />
          <span className="text-xs font-mono text-stone-600 dark:text-stone-400">{t('common.loading', 'Đang tải danh sách gói dịch vụ...')}</span>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-[#141b16] space-y-2">
          <Package className="w-8 h-8 mx-auto text-stone-400" />
          <p className="text-sm font-serif font-bold text-stone-600 dark:text-stone-400">{isEn ? 'No packages found.' : 'Chưa có gói dịch vụ nào trong hệ thống.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg: LearnPackage) => {
            const isActive = (pkg as any).is_active !== false && pkg.isActive !== false;
            return (
              <div
                key={pkg._id}
                className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-5 shadow-[4px_4px_0px_#1a5336] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 border-2 border-stone-800 dark:border-stone-700 bg-[#1a5336]/10 dark:bg-[#4ade80]/10 flex items-center justify-center text-[#1a5336] dark:text-[#4ade80]">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-serif font-black text-sm text-stone-900 dark:text-[#f7f8f4]">{pkg.name}</h3>
                        <span className="font-mono text-[10px] font-bold text-stone-500 uppercase">
                          {pkg.durationMonths || 1} {isEn ? 'month(s)' : 'tháng'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 font-mono text-[9px] font-black uppercase border ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-800'
                          : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border-rose-800'
                      }`}
                    >
                      {isActive ? (isEn ? '[ACTIVE]' : '[ĐANG MỞ BÁN]') : (isEn ? '[INACTIVE]' : '[TẠM DỪNG]')}
                    </span>
                  </div>

                  <p className="text-xs font-serif text-stone-600 dark:text-stone-400 line-clamp-2">
                    {pkg.description || (isEn ? 'Precedent search & member subscription benefits' : 'Gói tra cứu án lệ và quyền lợi thành viên')}
                  </p>

                  <div className="p-3 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono">
                    <div className="text-[10px] uppercase font-bold text-stone-500">{isEn ? 'Tariff Rate' : 'Mức phí niêm yết'}</div>
                    <div className="text-xl font-black text-[#1a5336] dark:text-[#4ade80]">
                      {formatVND(pkg.price)}
                    </div>
                  </div>

                  {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                    <div className="p-3 border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#0d1410]/50 space-y-1.5 font-mono text-[11px]">
                      {pkg.features.slice(0, 4).map((feat: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                          <Check className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="px-3 py-1 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0d1410] hover:bg-[#1a5336] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-stone-950 font-mono font-bold text-xs uppercase transition-colors shadow-[2px_2px_0px_#1a5336] flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEn ? 'Edit' : 'Sửa'}</span>
                  </button>
                  <button
                    onClick={() => setDeletingPackage({ id: pkg._id, name: pkg.name })}
                    className="p-1.5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0d1410] hover:bg-rose-700 hover:text-white dark:hover:bg-rose-700 dark:hover:text-white text-stone-600 dark:text-stone-400 transition-colors shadow-[2px_2px_0px_#881337]"
                    title={isEn ? 'Delete package' : 'Xóa gói'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-stone-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-6 shadow-[8px_8px_0px_#1a5336] space-y-4 text-xs animate-modal-pop"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1a5336] dark:text-[#4ade80]" />
                <h3 className="font-serif font-black text-base text-stone-900 dark:text-[#f7f8f4]">
                  {editingPackage ? (isEn ? 'Update Subscription Package' : 'Cập nhật Gói Hội Viên') : (isEn ? 'Issue New Subscription Package' : 'Phát hành Gói Dịch Vụ Mới')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 border border-stone-800 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {isEn ? 'Package Title *' : 'Tên gói dịch vụ *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isEn ? 'E.g. Pro Legal Research Docket' : 'Ví dụ: Gói Tra Cứu Án Lệ Chuyên Nghiệp'}
                  className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-serif text-xs text-stone-900 dark:text-[#f7f8f4] placeholder:text-stone-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Formatted Price Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                    {isEn ? 'Tariff Price (VND) *' : 'Giá niêm yết (VNĐ) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formData.priceFormatted}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priceFormatted: formatNumberInput(e.target.value),
                        })
                      }
                      placeholder="199.000"
                      className="w-full pl-3 pr-8 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono text-xs text-stone-900 dark:text-[#f7f8f4] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-stone-500">
                      ₫
                    </span>
                  </div>
                  {formData.priceFormatted && (
                    <p className="text-[10px] font-mono font-bold text-[#1a5336] dark:text-[#4ade80]">
                      {formatVND(parseNumberInput(formData.priceFormatted))}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                    {isEn ? 'Validity (Months) *' : 'Thời hạn (Tháng) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={formData.durationMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMonths: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono text-xs text-stone-900 dark:text-[#f7f8f4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {isEn ? 'Short Summary' : 'Mô tả tóm tắt'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={isEn ? 'Target audience and primary benefits...' : 'Mô tả đối tượng sử dụng và lợi ích...'}
                  className="w-full p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-serif text-xs text-stone-900 dark:text-[#f7f8f4] placeholder:text-stone-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {isEn ? 'Features / Benefits List (1 per line)' : 'Danh sách đặc quyền (Mỗi dòng 1 quyền lợi)'}
                </label>
                <textarea
                  rows={3}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder={isEn ? 'Unlimited search\nDownload legal forms\n24/7 Support' : 'Tra cứu không giới hạn\nTải mẫu đơn chuẩn\nHỗ trợ 24/7'}
                  className="w-full p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono text-xs text-stone-900 dark:text-[#f7f8f4] placeholder:text-stone-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-dashed border-stone-300 dark:border-stone-800">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded-none accent-[#1a5336] dark:accent-[#4ade80]"
                />
                <label htmlFor="isActiveToggle" className="font-mono text-xs text-stone-800 dark:text-stone-200 cursor-pointer font-bold">
                  {isEn ? 'Publish immediately to subscription catalog' : 'Mở bán gói này ngay lập tức trên hệ thống'}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-stone-800 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#0d1410] hover:bg-stone-200 dark:hover:bg-stone-800 font-mono font-bold text-xs uppercase"
              >
                {t('common.cancel', 'Hủy')}
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-5 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_#000] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isCreating || isUpdating ? (isEn ? 'Saving...' : 'Đang lưu...') : (isEn ? 'Save Package' : 'Lưu Gói Dịch Vụ')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingPackage}
        onClose={() => setDeletingPackage(null)}
        onConfirm={handleDelete}
        title={isEn ? 'Delete Service Package?' : 'Xác nhận xóa gói dịch vụ?'}
        description={
          isEn
            ? `Are you sure you want to permanently delete package "${deletingPackage?.name}"? Users currently subscribed may be affected.`
            : `Bạn có chắc chắn muốn xóa vĩnh viễn gói "${deletingPackage?.name}" khỏi hệ thống? Người dùng đang sử dụng gói này có thể bị ảnh hưởng.`
        }
        confirmText={isEn ? 'Delete Package' : 'Xác nhận xóa'}
        cancelText={isEn ? 'Cancel' : 'Hủy'}
        variant="danger"
      />
    </div>
  );
};
