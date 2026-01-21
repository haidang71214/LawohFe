'use client';

import React from 'react';
import {
  Users,
  ShieldCheck,
  Video,
  Newspaper,
  CreditCard,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useGetUsersQuery } from '@/store/queries/user';
import { useFilterLawyersQuery } from '@/store/queries/lawyer';
import { useGetAdminVideosQuery } from '@/store/queries/video';
import { useGetAllNewsQuery } from '@/store/queries/news';
import { useGetAdminPaymentsQuery } from '@/store/queries/payment';
import { useGetFormsQuery } from '@/store/queries/form';
import { formatVND } from '@/lib/formatCurrency';
import { useLanguage } from '@/i18n/LanguageContext';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery();
  const { data: lawyersData, isLoading: loadingLawyers } = useFilterLawyersQuery();
  const { data: videosData, isLoading: loadingVideos } = useGetAdminVideosQuery();
  const { data: newsData, isLoading: loadingNews } = useGetAllNewsQuery();
  const { data: paymentsData, isLoading: loadingPayments } = useGetAdminPaymentsQuery();
  const { data: formsData, isLoading: loadingForms } = useGetFormsQuery();

  const rawUsers = (usersData?.data as any) || [];
  const userList = Array.isArray(rawUsers) ? rawUsers : (Array.isArray(rawUsers?.data) ? rawUsers.data : []);

  const rawLawyers = (lawyersData?.data as any) || [];
  const lawyerList = Array.isArray(rawLawyers) ? rawLawyers : (Array.isArray(rawLawyers?.data) ? rawLawyers.data : []);

  const rawVideos = (videosData?.data as any) || [];
  const videoList = Array.isArray(rawVideos) ? rawVideos : (Array.isArray(rawVideos?.data) ? rawVideos.data : []);
  const pendingVideos = videoList.filter((v: any) => !v.accept && v.status !== 'rejected');

  const rawNews = (newsData?.data as any) || [];
  const newsList = Array.isArray(rawNews) ? rawNews : (Array.isArray(rawNews?.data) ? rawNews.data : []);
  const pendingNews = newsList.filter((n: any) => !n.isAccept);

  const rawPayments = (paymentsData?.data as any) || [];
  const paymentList = Array.isArray(rawPayments) ? rawPayments : (Array.isArray(rawPayments?.data) ? rawPayments.data : []);
  const totalRevenue = paymentList
    .filter((p: any) => p.status === 'success')
    .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

  const rawForms = (formsData?.data as any) || [];
  const formList = Array.isArray(rawForms) ? rawForms : (Array.isArray(rawForms?.data) ? rawForms.data : []);

  const kpis = [
    {
      title: t('admin.userCount', 'Tổng Người Dùng'),
      code: 'REG-USERS',
      value: userList.length,
      icon: Users,
      tab: 'users',
      loading: loadingUsers,
    },
    {
      title: t('admin.lawyerCount', 'Luật Sư Chính Ngạch'),
      code: 'BAR-COUNSEL',
      value: lawyerList.length,
      icon: ShieldCheck,
      tab: 'lawyers',
      loading: loadingLawyers,
    },
    {
      title: t('admin.revenue', 'Tổng Doanh Thu'),
      code: 'LEDGER-VND',
      value: formatVND(totalRevenue),
      icon: CreditCard,
      tab: 'payments',
      loading: loadingPayments,
    },
    {
      title: isEn ? 'Videos Pending Moderation' : 'Video Chờ Kiểm Duyệt',
      code: 'AUDIT-VIDEO',
      value: pendingVideos.length,
      badge:
        pendingVideos.length > 0
          ? isEn
            ? `[${pendingVideos.length} PENDING]`
            : `[${pendingVideos.length} CẦN DUYỆT]`
          : isEn
          ? '[CLEARED]'
          : '[ĐÃ DUYỆT HẾT]',
      badgeStatus: pendingVideos.length > 0 ? 'warning' : 'success',
      icon: Video,
      tab: 'videos',
      loading: loadingVideos,
    },
    {
      title: t('admin.news', 'Tin Tức & Án Lệ'),
      code: 'DOCKET-NEWS',
      value: newsList.length,
      badge:
        pendingNews.length > 0
          ? isEn
            ? `[${pendingNews.length} PENDING]`
            : `[${pendingNews.length} CHỜ DUYỆT]`
          : undefined,
      badgeStatus: 'warning',
      icon: Newspaper,
      tab: 'news',
      loading: loadingNews,
    },
    {
      title: t('admin.forms', 'Biểu Mẫu & Hồ Sơ Mẫu'),
      code: 'LEGAL-FORMS',
      value: formList.length,
      icon: FileText,
      tab: 'forms',
      loading: loadingForms,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Docket */}
      <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-6 shadow-[6px_6px_0px_#1a5336] dark:shadow-[6px_6px_0px_#2d6a4f] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-dashed border-stone-300 dark:border-stone-700 pb-3 font-mono text-[10px] uppercase text-stone-500">
          <span>[DOCKET: CENTRAL-CONSOLE-2026]</span>
          <span className="text-[#1a5336] dark:text-[#4ade80] font-bold">LAWOH EXECUTIVE OVERSIGHT</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
              {isEn ? 'Admin OS Central Console' : 'Bảng Điều Khiển Trung Tâm Quản Trị'}
            </h1>
            <p className="text-xs font-mono text-stone-600 dark:text-stone-400">
              {isEn
                ? 'Operational ledger, registry statistics, and critical moderation queues.'
                : 'Sổ cái nghiệp vụ, thống kê danh bạ và các hàng đợi xử lý thẩm định tư pháp.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {pendingVideos.length > 0 && (
              <button
                onClick={() => onNavigateTab('videos')}
                className="px-3 py-2 border-2 border-amber-600 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{isEn ? `Moderate ${pendingVideos.length} Videos` : `Duyệt ${pendingVideos.length} Video`}</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('news')}
              className="px-3.5 py-2 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] text-white dark:text-stone-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>{isEn ? 'Articles & Precedents' : 'Quản Lý Án Lệ & Tin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              className="group cursor-pointer border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-5 shadow-[4px_4px_0px_#1a5336] hover:shadow-[2px_2px_0px_#1a5336] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between border-b-2 border-dashed border-stone-200 dark:border-stone-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 group-hover:bg-[#1a5336] group-hover:text-white dark:group-hover:bg-[#4ade80] dark:group-hover:text-stone-950 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-stone-500 uppercase block leading-none">
                      [{kpi.code}]
                    </span>
                    <span className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
                      {kpi.title}
                    </span>
                  </div>
                </div>

                {kpi.badge && (
                  <span
                    className={`px-1.5 py-0.5 font-mono text-[10px] font-bold border ${
                      kpi.badgeStatus === 'warning'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-600'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-600'
                    }`}
                  >
                    {kpi.badge}
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between pt-1">
                <div className="text-2xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
                  {kpi.loading ? '...' : kpi.value}
                </div>
                <div className="text-[11px] font-mono font-bold uppercase text-[#1a5336] dark:text-[#4ade80] flex items-center gap-1 group-hover:underline">
                  <span>{t('common.viewDetails', 'Mở sổ ghi')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Matrix & Pending Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Videos Queue */}
        <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-6 shadow-[4px_4px_0px_#1a5336] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80]" />
              <h2 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                {isEn
                  ? `Videos Pending Approval (${pendingVideos.length})`
                  : `Hàng Đợi Kiểm Duyệt Video (${pendingVideos.length})`}
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('videos')}
              className="text-xs font-mono font-bold uppercase text-[#1a5336] dark:text-[#4ade80] hover:underline cursor-pointer"
            >
              {isEn ? '[View All]' : '[Xem tất cả]'}
            </button>
          </div>

          {pendingVideos.length === 0 ? (
            <div className="py-10 text-center font-mono text-xs text-stone-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-bold text-stone-800 dark:text-stone-200">
                [HÀNG ĐỢI KIỂM DUYỆT VIDEO ĐANG TRỐNG]
              </p>
              <p className="text-[10px]">Tất cả video của luật sư đều đã được phê duyệt xuất bản.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingVideos.slice(0, 3).map((vid: any) => (
                <div
                  key={vid._id}
                  className="flex items-center justify-between p-3 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] shadow-[2px_2px_0px_#000]"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-14 h-10 border-2 border-stone-800 bg-stone-200 dark:bg-stone-800 shrink-0 overflow-hidden">
                      {vid.thubnail_url || vid.thumnail_url ? (
                        <img
                          src={vid.thubnail_url || vid.thumnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500">
                          <Video className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                        {vid.description || (isEn ? 'Untitled Video' : 'Video không tiêu đề')}
                      </p>
                      <p className="text-[10px] font-mono text-stone-600 dark:text-stone-400">
                        {Array.isArray(vid.categories) ? vid.categories.join(', ') : vid.categories || '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('videos')}
                    className="px-3 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-mono text-[11px] font-bold uppercase shrink-0 shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    {isEn ? 'Moderate' : 'Kiểm Duyệt'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending News Queue */}
        <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-6 shadow-[4px_4px_0px_#1a5336] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#1a5336] dark:text-[#4ade80]" />
              <h2 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                {isEn
                  ? `News Pending Review (${pendingNews.length})`
                  : `Tin Tức & Án Lệ Chờ Duyệt (${pendingNews.length})`}
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('news')}
              className="text-xs font-mono font-bold uppercase text-[#1a5336] dark:text-[#4ade80] hover:underline cursor-pointer"
            >
              {isEn ? '[View All]' : '[Xem tất cả]'}
            </button>
          </div>

          {pendingNews.length === 0 ? (
            <div className="py-10 text-center font-mono text-xs text-stone-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-bold text-stone-800 dark:text-stone-200">
                [HỒ SƠ BÀI VIẾT ĐÃ KIỂM DUYỆT ĐẦY ĐỦ]
              </p>
              <p className="text-[10px]">Tất cả án lệ và tin tức pháp luật đã được công khai trên hệ thống.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingNews.slice(0, 3).map((item: any) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] shadow-[2px_2px_0px_#000]"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {item.mainTitle}
                    </p>
                    <p className="text-[10px] font-mono text-stone-600 dark:text-stone-400 uppercase">
                      CHUYÊN MỤC: {item.type || 'TIN TỨC'}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('news')}
                    className="px-3 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-mono text-[11px] font-bold uppercase shrink-0 shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    {isEn ? 'Review' : 'Thẩm Định'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
