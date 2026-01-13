'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Scale,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  FileText,
  Video,
  MessageSquare,
} from 'lucide-react';
import webStorageClient from '@/utils/webStorageClient';
import { useLanguage } from '@/i18n/LanguageContext';
import { useChat } from './chatContext';
import ThemeLanguageControls from './ThemeLanguageToggle';
import NotificationBell from './NotificationBell';
import { animate, stagger, remove } from 'animejs';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { isDrawerOpen, openDrawer, closeDrawer, unreadChatCount } = useChat();

  const navContainerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = webStorageClient.getUser();
    setUser(currentUser);
  }, [pathname]);

  const handleLogout = () => {
    webStorageClient.logout();
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { name: t('nav.home', 'Khám phá'), href: '/' },
    { name: t('nav.lawyers', 'Luật sư'), href: '/lawyers' },
    { name: t('nav.services', 'Dịch vụ & Biểu phí'), href: '/services' },
    { name: t('nav.videos', 'Băng hình'), href: '/videos' },
    { name: t('nav.documents', 'Biểu mẫu'), href: '/document/DN' },
    { name: t('nav.news', 'Án lệ & Tin tức'), href: '/newsPage' },
  ];

  const avatarSrc =
    user?.avartar_url ||
    user?.avatar_url ||
    user?.avatar ||
    user?.img ||
    user?.image ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}&backgroundColor=181614&textColor=faf7f2`;

  // Anime.js entrance stagger for Navbar items
  useEffect(() => {
    if (!navContainerRef.current) return;

    const brand = navContainerRef.current.querySelector('.nav-brand');
    const links = navContainerRef.current.querySelectorAll('.nav-link-item');
    const actions = navContainerRef.current.querySelectorAll('.nav-action-item');

    if (brand) {
      remove(brand);
      animate(brand, {
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [-10, 0],
        duration: 500,
        delay: 200,
        ease: 'outBack(1.4)',
      });
    }

    if (links.length > 0) {
      remove(links);
      animate(links, {
        opacity: [0, 1],
        translateY: [-12, 0],
        duration: 500,
        delay: stagger(50, { start: 280 }),
        ease: 'outBack(1.3)',
      });
    }

    if (actions.length > 0) {
      remove(actions);
      animate(actions, {
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [-10, 0],
        duration: 450,
        delay: stagger(60, { start: 500 }),
        ease: 'outBack(1.4)',
      });
    }
  }, [pathname, language]);

  // Anime.js slide-in stagger for Mobile Menu
  useEffect(() => {
    if (isMenuOpen && mobileMenuRef.current) {
      const items = mobileMenuRef.current.querySelectorAll('.mobile-nav-item');
      if (items.length > 0) {
        remove(items);
        animate(items, {
          opacity: [0, 1],
          translateX: [-16, 0],
          duration: 350,
          delay: stagger(35),
          ease: 'outQuart',
        });
      }
    }
  }, [isMenuOpen]);

  return (
    <header
      ref={navContainerRef}
      className="sticky top-0 z-50 w-full bg-[#faf7f2]/95 dark:bg-[#131210]/95 backdrop-blur-md border-b-2 border-stone-800 dark:border-[#38332c] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Mark */}
          <div className="flex items-center gap-8">
            <Link href="/" className="nav-brand opacity-0 flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-none bg-[#181614] dark:bg-[#faf7f2] text-white dark:text-[#181614] border-2 border-stone-800 dark:border-[#e5decf] shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] flex items-center justify-center group-hover:bg-[#d95327] group-hover:text-white transition-all">
                <Scale className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-serif font-bold tracking-tight text-stone-900 dark:text-[#fbf8f2] group-hover:text-[#d95327] transition-colors">
                  LawOh
                </span>
                <span className="text-[10px] font-mono text-[#d95327] dark:text-[#e26d46] font-bold tracking-wider">
                  [GAZETTE]
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-bold tracking-wider uppercase">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link-item opacity-0 transition-all hover:-translate-y-0.5 ${
                      isActive
                        ? 'text-[#d95327] dark:text-[#e26d46] underline underline-offset-4 decoration-2 decoration-[#d95327]'
                        : 'text-stone-700 dark:text-stone-300 hover:text-[#d95327] dark:hover:text-[#e26d46]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <div className="nav-action-item">
              <ThemeLanguageControls />
            </div>

            {user && (
              <>
                <div className="nav-action-item">
                  <button
                    type="button"
                    onClick={() => (isDrawerOpen ? closeDrawer() : openDrawer())}
                    className="p-1.5 bg-stone-100 dark:bg-[#1f1c19] border-2 border-stone-800 dark:border-[#38332c] shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] text-stone-900 dark:text-[#fbf8f2] transition-transform active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center relative cursor-pointer hover:bg-stone-200 dark:hover:bg-[#24211c]"
                    title={isEn ? 'Messages' : 'Tin nhắn'}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {unreadChatCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-[#d95327] text-white text-[9px] font-mono font-bold border border-stone-900">
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                      </span>
                    )}
                  </button>
                </div>
                <div className="nav-action-item">
                  <NotificationBell />
                </div>
              </>
            )}

            {user ? (
              <div className="nav-action-item relative">
                {/* User Trigger Button with Retro Border */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-stone-100 dark:bg-[#1f1c19] border-2 border-stone-800 dark:border-[#38332c] shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] text-stone-900 dark:text-[#fbf8f2] transition-all text-xs font-mono hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                >
                  <img
                    src={avatarSrc}
                    alt={user.name || 'User avatar'}
                    className="w-6 h-6 rounded-none object-cover border border-stone-800 dark:border-stone-400 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}&backgroundColor=181614&textColor=faf7f2`;
                    }}
                  />
                  <span className="font-bold max-w-[110px] truncate">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-stone-100 dark:bg-[#181614] border-2 border-stone-800 dark:border-[#38332c] shadow-[4px_4px_0px_#181614] dark:shadow-[4px_4px_0px_#e5decf] py-1 z-50 text-xs font-mono overflow-hidden">
                    <div className="px-4 py-3 border-b-2 border-stone-800 dark:border-[#38332c] flex items-center gap-3 bg-stone-200 dark:bg-[#201d19]">
                      <img
                        src={avatarSrc}
                        alt={user.name || 'User avatar'}
                        className="w-10 h-10 rounded-none object-cover border-2 border-stone-800 dark:border-[#443d34] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}&backgroundColor=181614&textColor=faf7f2`;
                        }}
                      />
                      <div className="overflow-hidden space-y-1 flex-1">
                        <p className="font-serif font-bold text-stone-900 dark:text-[#fbf8f2] text-xs truncate">{user.name || 'User'}</p>
                        <p className="text-stone-500 text-[10px] truncate">{user.email}</p>
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-0.2 rounded-none text-[9px] font-mono font-bold uppercase border ${
                              user.role === 'admin'
                                ? 'bg-amber-100 text-amber-900 border-amber-800'
                                : user.role === 'lawyer'
                                ? 'bg-[#d95327]/15 text-[#d95327] border-[#d95327]'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-800'
                            }`}
                          >
                            {user.role === 'admin'
                              ? 'Admin'
                              : user.role === 'lawyer'
                              ? isEn
                                ? 'Lawyer'
                                : 'Luật sư'
                              : isEn
                              ? 'Client'
                              : 'Khách hàng'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-[#d95327] hover:bg-stone-200 dark:hover:bg-[#24211c] transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#d95327]" />
                          <span>{t('nav.adminPanel', 'Bảng quản trị')}</span>
                        </Link>
                      )}

                      {user.role === 'lawyer' && (
                        <>
                          <Link
                            href="/updateLawyerDetails"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-[#d95327] hover:bg-stone-200 dark:hover:bg-[#24211c] transition-colors"
                          >
                            <User className="w-4 h-4 text-[#d95327]" />
                            <span>{t('nav.lawyerProfile', 'Hồ sơ & Biểu phí')}</span>
                          </Link>
                          <Link
                            href="/bookingListLawyer"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-[#d95327] hover:bg-stone-200 dark:hover:bg-[#24211c] transition-colors"
                          >
                            <FileText className="w-4 h-4 text-stone-500" />
                            <span>{t('nav.lawyerBookings', 'Lịch hẹn khách hàng')}</span>
                          </Link>
                          <Link
                            href="/newsSelf"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-[#d95327] hover:bg-stone-200 dark:hover:bg-[#24211c] transition-colors"
                          >
                            <FileText className="w-4 h-4 text-[#d95327]" />
                            <span>{t('nav.lawyerNews', 'Viết & Quản lý bài viết')}</span>
                          </Link>
                          <Link
                            href="/videoSelf"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-[#d95327] hover:bg-stone-200 dark:hover:bg-[#24211c] transition-colors"
                          >
                            <Video className="w-4 h-4 text-stone-500" />
                            <span>{t('nav.lawyerVideos', 'Video chia sẻ')}</span>
                          </Link>
                        </>
                      )}

                      {user.role === 'user' && (
                        <Link
                          href="/bookingList"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-[#d95327] hover:bg-stone-200 dark:hover:bg-[#24211c] transition-colors"
                        >
                          <FileText className="w-4 h-4 text-stone-500" />
                          <span>{t('nav.myBookings', 'Lịch tư vấn của tôi')}</span>
                        </Link>
                      )}

                      <Link
                        href="/updateProfile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-[#d95327] hover:bg-stone-200 dark:hover:bg-[#24211c] border-t border-stone-200 dark:border-stone-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        <span>{t('nav.profile', 'Cài đặt tài khoản')}</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-left border-t border-stone-200 dark:border-stone-800 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.logout', 'Đăng xuất')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-action-item opacity-0 flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 hover:text-[#d95327] dark:hover:text-[#e26d46] transition-colors"
                >
                  {t('nav.login', 'Đăng nhập')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-none bg-[#d95327] hover:bg-[#c4441b] text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-stone-900 dark:border-stone-200 shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#181614] transition-all cursor-pointer"
                >
                  {t('nav.register', 'Đăng ký')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeLanguageControls />
            {user && (
              <button
                type="button"
                onClick={() => (isDrawerOpen ? closeDrawer() : openDrawer())}
                className="p-1.5 border-2 border-stone-800 dark:border-stone-600 text-stone-800 dark:text-stone-200 relative"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 bg-[#d95327] text-white text-[9px] font-bold">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 border-2 border-stone-800 dark:border-stone-600 text-stone-800 dark:text-stone-200"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden border-t-2 border-stone-800 dark:border-[#38332c] bg-[#faf7f2] dark:bg-[#131210] px-4 py-4 space-y-3 text-xs font-mono">
          {user && (
            <div className="mobile-nav-item opacity-0 p-3 bg-stone-200 dark:bg-[#1f1c19] border-2 border-stone-800 dark:border-[#38332c] flex items-center gap-3">
              <img
                src={avatarSrc}
                alt={user.name || 'User avatar'}
                className="w-10 h-10 rounded-none object-cover border border-stone-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}&backgroundColor=181614&textColor=faf7f2`;
                }}
              />
              <div className="overflow-hidden">
                <p className="font-bold text-stone-900 dark:text-white truncate">{user.name}</p>
                <p className="text-stone-500 text-[11px] truncate">{user.email}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="mobile-nav-item opacity-0 block py-2 text-stone-700 dark:text-stone-300 hover:text-[#d95327] uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 flex gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="mobile-nav-item opacity-0 w-full py-2 text-center border-2 border-rose-600 text-rose-600 font-bold uppercase tracking-wider"
              >
                {t('nav.logout', 'Đăng xuất')}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mobile-nav-item opacity-0 flex-1 py-2 text-center border-2 border-stone-800 dark:border-stone-600 text-stone-900 dark:text-white font-bold uppercase tracking-wider"
                >
                  {t('nav.login', 'Đăng nhập')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="mobile-nav-item opacity-0 flex-1 py-2 text-center bg-[#d95327] text-white font-bold uppercase tracking-wider border-2 border-stone-900"
                >
                  {t('nav.register', 'Đăng ký')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;