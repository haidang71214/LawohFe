'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Edit2,
  X,
  RotateCw,
  Sliders,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  useGetPriceRangesQuery,
  useUpdatePriceRangeMutation,
} from '@/store/queries/priceRange';
import { LawyerCategoriesVietnamese } from '@/types/enum';
import { formatVND } from '@/lib/formatCurrency';
import { MoneyInput } from '@/components/common/MoneyInput';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

export const PriceRangeTab: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const { data: priceResponse, isLoading, isFetching, refetch, error: queryError } = useGetPriceRangesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [updatePriceRangeMutation, { isLoading: isUpdating }] = useUpdatePriceRangeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('INSURANCE');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Local optimistic state
  const [localPriceList, setLocalPriceList] = useState<any[]>([]);

  // Log API query data for real-time diagnostics
  useEffect(() => {
    console.log('[PriceRangeTab] GET /api/v1/price-range response:', priceResponse);
    if (queryError) {
      console.error('[PriceRangeTab] GET /api/v1/price-range error:', queryError);
    }
  }, [priceResponse, queryError]);

  // Helper to normalize keys across different enum styles (e.g. CORPORATE <-> BUSINESS)
  const normalizeKey = (rawKey: string): string => {
    const k = (rawKey || '').toUpperCase();
    if (k === 'CORPORATE') return 'BUSINESS';
    if (k === 'INTELLECTUAL_PROPERTY') return 'INTELLECTUALPROPERTY';
    return k;
  };

  // Synchronize server data whenever priceResponse updates
  useEffect(() => {
    if (priceResponse) {
      const rootData = (priceResponse as any)?.data !== undefined ? (priceResponse as any).data : priceResponse;
      let items: any[] = [];
      if (Array.isArray(rootData)) {
        items = rootData;
      } else if (Array.isArray(rootData?.data)) {
        items = rootData.data;
      } else if (Array.isArray(rootData?.items)) {
        items = rootData.items;
      } else if (Array.isArray(rootData?.priceRanges)) {
        items = rootData.priceRanges;
      } else if (Array.isArray((priceResponse as any)?.items)) {
        items = (priceResponse as any).items;
      }
      setLocalPriceList((prev) => {
        // Merge server items with local items using normalized keys
        const mergedMap = new Map<string, any>();
        prev.forEach((item) => {
          const key = normalizeKey(item.type || item.Type || '');
          if (key) mergedMap.set(key, item);
        });
        items.forEach((item) => {
          const key = normalizeKey(item.type || item.Type || '');
          if (key) mergedMap.set(key, item);
        });
        return Array.from(mergedMap.values());
      });
    }
  }, [priceResponse]);

  // Map all known categories to their configured or unconfigured status
  const allCategoriesGrid = useMemo(() => {
    const configuredMap = new Map<string, any>();
    localPriceList.forEach((p) => {
      const key = normalizeKey(p.type || p.Type || '');
      if (key) configuredMap.set(key, p);
    });

    return Object.entries(LawyerCategoriesVietnamese).map(([key, label]) => {
      const normalizedCatKey = normalizeKey(key);
      const configuredItem = configuredMap.get(normalizedCatKey);
      return {
        key,
        label,
        isConfigured: !!configuredItem && Number(configuredItem.maxPrice) > 0,
        item: configuredItem || null,
        minPrice: configuredItem ? Number(configuredItem.minPrice) : 0,
        maxPrice: configuredItem ? Number(configuredItem.maxPrice) : 0,
        description: configuredItem?.description || '',
      };
    });
  }, [localPriceList]);

  const configuredCount = allCategoriesGrid.filter((c) => c.isConfigured).length;

  const handleOpenCreateOrEdit = (catKey: string, existingItem?: any) => {
    setSelectedType(catKey);
    if (existingItem) {
      const min = Number(existingItem.minPrice) || 0;
      const max = Number(existingItem.maxPrice) || 0;
      setMinPrice(min > 0 ? String(min) : '');
      setMaxPrice(max > 0 ? String(max) : '');
      setDescription(existingItem.description || '');
    } else {
      setMinPrice('100000');
      setMaxPrice('2000000');
      setDescription(`Khung giá thị trường lĩnh vực ${(LawyerCategoriesVietnamese as any)[catKey] || catKey}`);
    }
    setIsModalOpen(true);
  };

  const handleSavePriceRange = async (e: React.FormEvent) => {
    e.preventDefault();

    const min = Number(String(minPrice).replace(/\D/g, ''));
    const max = Number(String(maxPrice).replace(/\D/g, ''));

    if (min <= 0 || max <= 0) {
      toast.warning(isEn ? 'Please enter min and max prices greater than 0 ₫' : 'Vui lòng nhập giá sàn và giá trần lớn hơn 0 ₫');
      return;
    }

    if (min >= max) {
      toast.warning(isEn ? 'Minimum price must be less than maximum price' : 'Giá tối thiểu (sàn) phải nhỏ hơn giá tối đa (trần)');
      return;
    }

    const payload = {
      minPrice: min,
      maxPrice: max,
      description: description || `Khung giá thị trường lĩnh vực ${(LawyerCategoriesVietnamese as any)[selectedType] || selectedType}`,
    };

    console.log('[PriceRangeTab] Saving payload for:', selectedType, payload);

    // Save previous state for rollback if mutation fails
    const previousPriceList = [...localPriceList];

    try {
      // 1. Optimistically update local state immediately so UI refreshes without delay
      setLocalPriceList((prev) => {
        const existingIdx = prev.findIndex(
          (p) => normalizeKey(p.type || p.Type || '') === normalizeKey(selectedType)
        );
        const newItem = {
          type: selectedType,
          Type: selectedType,
          minPrice: min,
          maxPrice: max,
          description: payload.description,
          updatedAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...newItem };
          return updated;
        }
        return [newItem, ...prev];
      });

      // 2. Call API mutation
      const res = await updatePriceRangeMutation({
        type: selectedType,
        data: payload,
      }).unwrap();

      console.log('[PriceRangeTab] PATCH /api/v1/price-range/' + selectedType + ' success:', res);

      toast.success(
        isEn ? 'Price range configured' : 'Lưu thành công',
        isEn
          ? `Configured price range ${formatVND(min)} - ${formatVND(max)} for ${selectedType}`
          : `Đã thiết lập khung giá ${formatVND(min)} - ${formatVND(max)} cho lĩnh vực ${(LawyerCategoriesVietnamese as any)[selectedType] || selectedType}`
      );

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error('[PriceRangeTab] PATCH /api/v1/price-range/' + selectedType + ' error:', err);
      setLocalPriceList(previousPriceList);
      toast.error(
        isEn ? 'Update error' : 'Lỗi cập nhật',
        err?.data?.message || (isEn ? 'Failed to update price range' : 'Không thể cập nhật bảng giá thị trường')
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-4 sm:p-5 shadow-[4px_4px_0px_#1a5336] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-black px-2 py-0.5 bg-[#1a5336] text-white dark:bg-[#4ade80] dark:text-stone-950 border border-stone-800 dark:border-stone-700">
              {isEn ? '[PRICE TARIFF DOCKET]' : '[QUY CHẾ KHUNG GIÁ]'}
            </span>
            <h1 className="text-base sm:text-lg font-serif font-black tracking-tight text-stone-900 dark:text-[#f7f8f4]">
              {isEn ? 'Market Price Tariff Configuration' : 'Cấu hình Biểu Giá Thị Trường Luật Sư'}
            </h1>
            <span className="px-2 py-0.5 font-mono text-[11px] font-bold bg-stone-100 dark:bg-[#0d1410] text-[#1a5336] dark:text-[#4ade80] border border-stone-300 dark:border-stone-800">
              {isEn ? `${configuredCount}/${allCategoriesGrid.length} Set` : `Đã thiết lập: ${configuredCount}/${allCategoriesGrid.length}`}
            </span>
            {isFetching && (
              <RotateCw className="w-4 h-4 animate-spin text-[#1a5336] dark:text-[#4ade80]" />
            )}
          </div>
          <p className="text-xs font-serif text-stone-600 dark:text-stone-400">
            {isEn
              ? 'Standard Vietnamese Dong (VND) ceiling and floor consulting fees enforced across jurisdictions.'
              : 'Quy chuẩn mức phí sàn và trần (VNĐ) khi tư vấn trực tuyến để đảm bảo tính minh bạch và bảo vệ quyền lợi đôi bên.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => refetch()}
            className="p-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-[#0d1410] hover:bg-[#1a5336] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-stone-950 text-stone-700 dark:text-stone-300 transition-colors shadow-[2px_2px_0px_#1a5336]"
            title="Làm mới"
          >
            <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of All Legal Categories */}
      {isLoading && localPriceList.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-[#141b16]">
          <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1a5336] dark:text-[#4ade80]" />
          <span className="text-xs font-mono text-stone-600 dark:text-stone-400">{t('common.loading', 'Đang tải dữ liệu khung giá từ máy chủ...')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCategoriesGrid.map((cat) => {
            return (
              <div
                key={cat.key}
                className={`border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-4 flex flex-col justify-between transition-all shadow-[4px_4px_0px_#1a5336] space-y-3 ${
                  cat.isConfigured
                    ? ''
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80] shrink-0" />
                      <span className="font-serif font-black text-sm text-stone-900 dark:text-[#f7f8f4]">
                        {t(`categories.${cat.key}`, cat.label)}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] uppercase font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-[#0d1410] px-1.5 py-0.5 border border-stone-300 dark:border-stone-800 shrink-0">
                      {cat.key}
                    </span>
                  </div>

                  {cat.isConfigured ? (
                    <div className="p-3 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] space-y-2 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500 dark:text-stone-400 font-bold">{isEn ? 'Floor (Min):' : 'Giá sàn (Tối thiểu):'}</span>
                        <span className="font-black text-[#1a5336] dark:text-[#4ade80]">
                          {formatVND(cat.minPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-stone-300 dark:border-stone-800">
                        <span className="text-stone-500 dark:text-stone-400 font-bold">{isEn ? 'Ceiling (Max):' : 'Giá trần (Tối đa):'}</span>
                        <span className="font-black text-stone-900 dark:text-[#f7f8f4]">
                          {formatVND(cat.maxPrice)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 border-2 border-dashed border-stone-300 dark:border-stone-800 bg-stone-50/50 dark:bg-[#0d1410]/50 text-center space-y-1">
                      <p className="text-xs font-serif font-bold text-stone-600 dark:text-stone-400">
                        {isEn ? 'Tariff range not configured' : 'Chưa áp dụng khung giá'}
                      </p>
                      <p className="text-[10px] font-mono text-stone-500">
                        {isEn ? 'Click configure to establish rates' : 'Bấm thiết lập để quy định mức sàn & trần'}
                      </p>
                    </div>
                  )}

                  {cat.description && (
                    <p className="text-xs font-serif italic text-stone-600 dark:text-stone-400 line-clamp-2">
                      &ldquo;{cat.description}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold flex items-center gap-1">
                    {cat.isConfigured ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1a5336] dark:text-[#4ade80]" />
                        <span className="text-[#1a5336] dark:text-[#4ade80] uppercase">[ĐÃ ÁP DỤNG]</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-amber-600 dark:text-amber-400 uppercase">[MẶC ĐỊNH]</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleOpenCreateOrEdit(cat.key, cat.item)}
                    className="px-3 py-1 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#0d1410] hover:bg-[#1a5336] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-stone-950 font-mono font-bold text-xs uppercase transition-colors shadow-[2px_2px_0px_#1a5336] flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{cat.isConfigured ? (isEn ? 'Adjust' : 'Điều chỉnh') : (isEn ? 'Configure' : 'Thiết lập')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-stone-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-6 shadow-[8px_8px_0px_#1a5336] space-y-4 text-xs animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#1a5336] dark:text-[#4ade80]" />
                <h3 className="font-serif font-black text-base text-stone-900 dark:text-[#f7f8f4]">
                  {isEn ? 'Configure Price Tariff' : 'Quy định Khung Giá Thị Trường'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 border border-stone-800 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePriceRange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {isEn ? 'Legal Specialty Jurisdiction *' : 'Lĩnh vực pháp luật *'}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono text-xs text-stone-900 dark:text-[#f7f8f4] focus:outline-none"
                >
                  {Object.entries(LawyerCategoriesVietnamese).map(([key, label]) => (
                    <option key={key} value={key}>
                      {t(`categories.${key}`, label)} ({key})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Min Price input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                    {isEn ? 'Floor Fee (Min) *' : 'Giá sàn (Tối thiểu) *'}
                  </label>
                  <MoneyInput
                    required
                    value={minPrice}
                    onValueChange={(formatted) => setMinPrice(formatted)}
                    placeholder="100.000"
                    className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono text-xs text-stone-900 dark:text-[#f7f8f4] focus:outline-none"
                  />
                </div>

                {/* Max Price input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                    {isEn ? 'Ceiling Fee (Max) *' : 'Giá trần (Tối đa) *'}
                  </label>
                  <MoneyInput
                    required
                    value={maxPrice}
                    onValueChange={(formatted) => setMaxPrice(formatted)}
                    placeholder="2.000.000"
                    className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-mono text-xs text-stone-900 dark:text-[#f7f8f4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {isEn ? 'Application Note / Description' : 'Ghi chú văn bản áp dụng'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isEn ? 'Standard online consultation fee range...' : 'Khung giá tiêu chuẩn tư vấn trực tuyến...'}
                  className="w-full p-2.5 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] font-serif text-xs text-stone-900 dark:text-[#f7f8f4] placeholder:text-stone-400 focus:outline-none"
                />
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
                  disabled={isUpdating}
                  className="px-5 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_#000] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdating ? (isEn ? 'Saving...' : 'Đang lưu...') : (isEn ? 'Enforce Tariff' : 'Lưu & Áp Dụng')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
