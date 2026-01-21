'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Video,
  Newspaper,
  CreditCard,
  FileText,
  DollarSign,
  Menu,
  X,
  Home,
  ShieldAlert,
  Package,
  Server,
  Terminal,
} from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { UsersTab } from './tabs/UsersTab';
import { LawyersTab } from './tabs/LawyersTab';
import { VideosTab } from './tabs/VideosTab';
import { NewsTab } from './tabs/NewsTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { FormsTab } from './tabs/FormsTab';
import { PriceRangeTab } from './tabs/PriceRangeTab';
import { PackagesTab } from './tabs/PackagesTab';
import { useGetAdminVideosQuery } from '@/store/queries/video';
import { useGetAdminNewsQuery } from '@/store/queries/news';
import { useGetLawyerRequestsQuery } from '@/store/queries/user';
import { useLanguage } from '@/i18n/LanguageContext';

export const AdminPortal: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const tabFromUrl = searchParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Live badges
  const { data: videosData } = useGetAdminVideosQuery();
  const { data: newsData } = useGetAdminNewsQuery();
  const { data: lawyerRequestsData } = useGetLawyerRequestsQuery();

  const rawVideos = (videosData?.data as any) || [];
  const videoList = Array.isArray(rawVideos) ? rawVideos : (Array.isArray(rawVideos?.data) ? rawVideos.data : []);
  const pendingVideosCount = videoList.filter((v: any) => !v.accept && v.status !== 'rejected').length;

  const rawNews = (newsData?.data as any) || newsData || [];
  const newsList = Array.isArray(rawNews)
    ? rawNews
    : Array.isArray(rawNews?.data)
    ? rawNews.data
    : Array.isArray(rawNews?.news)
    ? rawNews.news
    : Array.isArray(rawNews?.items)
    ? rawNews.items
    : [];
  const pendingNewsCount = newsList.filter((n: any) => !n.isAccept && n.status !== 'rejected').length;

  const rawLawyerRequests = (lawyerRequestsData?.data as any) || [];
  const lawyerRequestsList = Array.isArray(rawLawyerRequests) ? rawLawyerRequests : (Array.isArray(rawLawyerRequests?.data) ? rawLawyerRequests.data : []);
  const pendingLawyerRequestsCount = lawyerRequestsList.length;

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('USER_PROFILE') || localStorage.getItem('LOGIN_USER');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Synchronize state when URL query parameter changes
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'overview';
    setActiveTab(currentTab);
  }, [searchParams]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsMobileMenuOpen(false);
    // Instant URL update without scroll or delay
    router.push(`/admin?tab=${tabKey}`, { scroll: false });
  };

  const navItems = [
    { key: 'overview', label: t('admin.overview', 'Tổng quan hệ thống'), icon: LayoutDashboard },
    { key: 'users', label: t('admin.users', 'Người dùng & Phân quyền'), icon: Users },
    {
      key: 'lawyers',
      label: t('admin.lawyers', 'Duyệt Luật sư'),
      icon: ShieldCheck,
      badge: pendingLawyerRequestsCount > 0 ? pendingLawyerRequestsCount : undefined,
    },
    {
      key: 'videos',
      label: t('admin.videos', 'Kiểm duyệt Video'),
      icon: Video,
      badge: pendingVideosCount > 0 ? pendingVideosCount : undefined,
    },
    {
      key: 'news',
      label: t('admin.news', 'Tin tức & Bài viết'),
      icon: Newspaper,
      badge: pendingNewsCount > 0 ? pendingNewsCount : undefined,
    },
    { key: 'payments', label: t('admin.payments', 'Giao dịch & Doanh thu'), icon: CreditCard },
    { key: 'packages', label: t('admin.packages', 'Gói học & Thuê bao'), icon: Package },
    { key: 'forms', label: t('admin.forms', 'Mẫu đơn & Tài liệu'), icon: FileText },
    { key: 'price-range', label: t('admin.priceRange', 'Bảng giá thị trường'), icon: DollarSign },
  ];

  if (!isMounted) return null;

  // Access check
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f7f8f4] dark:bg-[#0f1511] text-stone-900 dark:text-stone-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-8 text-center space-y-5 shadow-[6px_6px_0px_#1a5336]">
          <div className="w-14 h-14 border-2 border-rose-700 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-[2px_2px_0px_#000]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
              [TRUY CẬP BỊ HẠN CHẾ // RESTRICTED ACCESS]
            </span>
            <h2 className="text-xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
              Quyền Truy Cập Bị Từ Chối
            </h2>
          </div>
          <p className="text-xs font-mono text-stone-600 dark:text-stone-400 leading-relaxed">
            Khu vực này được mã hóa bảo mật cấp cao và chỉ dành riêng cho Quản trị viên (Admin) của nền tảng LawOh.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] hover:bg-[#22774a] text-white dark:text-stone-950 font-mono text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4" /> {t('common.back', 'Quay về Trang chủ')}
          </Link>
        </div>
      </div>
    );
  }

  const activeItem = navItems.find((item) => item.key === activeTab) || navItems[0];

  return (
    <div className="min-h-screen bg-[#f7f8f4] dark:bg-[#0f1511] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Mobile Toolbar (only on small screens to toggle menu) */}
      <div className="lg:hidden bg-white dark:bg-[#141b16] border-b-2 border-stone-800 dark:border-stone-700 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-stone-800 dark:text-stone-200 px-2.5 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 shadow-[2px_2px_0px_#000]"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{activeItem.label}</span>
        </button>
        <span className="px-2 py-0.5 border-2 border-[#1a5336] dark:border-[#4ade80] bg-[#1a5336]/10 text-[10px] font-mono font-bold text-[#1a5336] dark:text-[#4ade80] uppercase">
          ADMIN CONSOLE
        </span>
      </div>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-72 flex-col border-r-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] p-4 shrink-0 select-none space-y-4">
          {/* Sidebar Docket Brand Tag */}
          <div className="border-b-2 border-dashed border-stone-300 dark:border-stone-700 pb-3 space-y-1 font-mono">
            <div className="flex items-center justify-between text-[10px] uppercase text-stone-500">
              <span className="flex items-center gap-1.5 font-bold text-[#1a5336] dark:text-[#4ade80]">
                <Terminal className="w-3.5 h-3.5" />
                ADMIN OS 2026
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600 text-[9px] font-bold">
                ONLINE
              </span>
            </div>
            <p className="text-[11px] font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              {isEn ? 'Management Registry' : 'Danh mục nghiệp vụ quản trị'}
            </p>
          </div>

          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleTabChange(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono uppercase tracking-wider transition-all text-left outline-none cursor-pointer ${
                    isActive
                      ? 'border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 font-bold shadow-[3px_3px_0px_#000] translate-x-1'
                      : 'border-2 border-transparent text-stone-700 dark:text-stone-300 hover:border-stone-800 dark:hover:border-stone-600 hover:bg-stone-100 dark:hover:bg-[#1a251d] font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white dark:text-stone-950' : 'text-[#1a5336] dark:text-[#4ade80]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-mono font-bold border ${
                        isActive
                          ? 'bg-white text-stone-950 border-stone-900 dark:bg-stone-950 dark:text-amber-400 dark:border-amber-400'
                          : 'bg-amber-500 text-stone-950 border-stone-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Server Status Stamp */}
          <div className="pt-3 border-t-2 border-dashed border-stone-300 dark:border-stone-700 space-y-2">
            <div className="p-3 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410] shadow-[2px_2px_0px_#000] space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-stone-800 dark:text-stone-200">
                <span className="flex items-center gap-1">
                  <Server className="w-3 h-3 text-[#1a5336] dark:text-[#4ade80]" />
                  {language === 'en' ? 'Gateway Status' : 'Máy chủ nghiệp vụ'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] font-mono text-stone-600 dark:text-stone-400 leading-normal">
                {language === 'en'
                  ? 'NestJS 3300 & MongoDB cluster synchronized.'
                  : 'NestJS Gateway 3300 & MongoDB đồng bộ ổn định.'}
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#141b16] border-r-2 border-stone-800 dark:border-stone-700 p-4 flex flex-col z-10 select-none shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 dark:border-stone-700">
                <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  {language === 'en' ? 'Admin Navigation' : 'Danh mục Quản trị'}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 border border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-rose-700 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5 mt-4 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleTabChange(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider transition-all text-left outline-none ${
                        isActive
                          ? 'border-2 border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 font-bold shadow-[2px_2px_0px_#000]'
                          : 'border-2 border-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1a251d]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-stone-950' : 'text-[#1a5336] dark:text-[#4ade80]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500 text-stone-950 border border-stone-900">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Tab Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f7f8f4] dark:bg-[#0f1511]">
          <div key={activeTab} className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'overview' && <OverviewTab onNavigateTab={handleTabChange} />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'lawyers' && <LawyersTab />}
            {activeTab === 'videos' && <VideosTab />}
            {activeTab === 'news' && <NewsTab />}
            {activeTab === 'payments' && <PaymentsTab />}
            {activeTab === 'packages' && <PackagesTab />}
            {activeTab === 'forms' && <FormsTab />}
            {activeTab === 'price-range' && <PriceRangeTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
