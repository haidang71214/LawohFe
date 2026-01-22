'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  RotateCw,
} from 'lucide-react';
import { useGetAdminPaymentsQuery } from '@/store/queries/payment';
import { formatVND } from '@/lib/formatCurrency';
import { useLanguage } from '@/i18n/LanguageContext';

export const PaymentsTab: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const { data: paymentsResponse, isLoading } = useGetAdminPaymentsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'success' | 'pending' | 'failed'>('ALL');

  const payments: any[] = useMemo(() => {
    const raw = (paymentsResponse?.data as any) || [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
    return Array.isArray(list) ? list : [];
  }, [paymentsResponse]);

  const stats = useMemo(() => {
    const successPayments = payments.filter((p) => p.status === 'success');
    const totalAmount = successPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingAmount = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
      totalAmount,
      pendingAmount,
      successCount: successPayments.length,
      totalCount: payments.length,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        (p.orderInfo && p.orderInfo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.txnRef && p.txnRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.transaction_no && p.transaction_no.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600">
            <CheckCircle2 className="w-2.5 h-2.5" /> [THÀNH CÔNG]
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-600">
            <Clock className="w-2.5 h-2.5" /> [CHỜ XỬ LÝ]
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-600">
            <AlertCircle className="w-2.5 h-2.5" /> [THẤT BẠI]
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[4px_4px_0px_#1a5336] space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-stone-500 border-b-2 border-dashed border-stone-200 dark:border-stone-800 pb-2">
            <span>[DOANH THU QUYẾT TOÁN]</span>
            <TrendingUp className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80]" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-900 dark:text-stone-50">
            {formatVND(stats.totalAmount)}
          </div>
          <p className="text-[10px] font-mono text-stone-600 dark:text-stone-400">
            {isEn ? `From ${stats.successCount} settled transactions` : `Từ ${stats.successCount} giao dịch đã hoàn tất`}
          </p>
        </div>

        <div className="p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[4px_4px_0px_#1a5336] space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-stone-500 border-b-2 border-dashed border-stone-200 dark:border-stone-800 pb-2">
            <span>[DÒNG TIỀN CHỜ XÁC NHẬN]</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-900 dark:text-stone-50">
            {formatVND(stats.pendingAmount)}
          </div>
          <p className="text-[10px] font-mono text-stone-600 dark:text-stone-400">
            {isEn ? 'Awaiting payment gateway signal' : 'Đang chờ điện báo từ cổng thanh toán'}
          </p>
        </div>

        <div className="p-5 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[4px_4px_0px_#1a5336] space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-stone-500 border-b-2 border-dashed border-stone-200 dark:border-stone-800 pb-2">
            <span>[TỔNG BẢN GHI GIAO DỊCH]</span>
            <CreditCard className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80]" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-900 dark:text-stone-50">
            {stats.totalCount}
          </div>
          <p className="text-[10px] font-mono text-stone-600 dark:text-stone-400">
            {isEn ? 'VNPAY & Judicial payment gateway' : 'Giao dịch qua VNPAY & cổng trực tuyến'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-4 shadow-[4px_4px_0px_#1a5336]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isEn ? 'Search by description, TxnRef, order ID...' : 'Tìm theo nội dung, mã GD, mã TxnRef...'}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono">
          {[
            { key: 'ALL', label: isEn ? '[ALL]' : '[TẤT CẢ]' },
            { key: 'success', label: isEn ? '[SUCCESS]' : '[THÀNH CÔNG]' },
            { key: 'pending', label: isEn ? '[PENDING]' : '[CHỜ XỬ LÝ]' },
            { key: 'failed', label: isEn ? '[FAILED]' : '[THẤT BẠI]' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key as any)}
              className={`px-3 py-1.5 border-2 text-xs font-bold uppercase transition-all cursor-pointer ${
                statusFilter === item.key
                  ? 'border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 shadow-[2px_2px_0px_#000]'
                  : 'border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[6px_6px_0px_#1a5336] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100 dark:bg-[#18261e] border-b-2 border-stone-800 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'TxnRef / Order ID' : 'Mã GD / TxnRef'}</th>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Description' : 'Nội Dung Thanh Toán'}</th>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Amount' : 'Số Tiền'}</th>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Method' : 'Cổng TT'}</th>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Timestamp' : 'Thời Gian'}</th>
                <th className="px-4 py-3 text-right">{t('common.status', 'Trạng Thái')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-stone-200 dark:divide-stone-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-bold">
                    <RotateCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#1a5336]" />
                    <span>[ĐANG TẢI SỔ CÁI TÀI CHÍNH...]</span>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-bold">
                    [KHÔNG TÌM THẤY BẢN GHI GIAO DỊCH NÀO]
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50 dark:hover:bg-[#0d1410] transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-stone-800 dark:text-stone-200 border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                      {p.transaction_no || p.txnRef || p._id?.slice(-8) || '—'}
                    </td>
                    <td className="px-4 py-3 border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                      <div className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 max-w-xs truncate">
                        {p.orderInfo || (isEn ? 'Legal consultation fee' : 'Thanh toán tư vấn pháp lý')}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-sm text-[#1a5336] dark:text-[#4ade80] border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                      {formatVND(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300 font-mono text-[11px] uppercase border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                      {p.payment_method || 'VNPAY'}
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400 text-[11px] font-mono border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString(isEn ? 'en-US' : 'vi-VN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">{getStatusBadge(p.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
