'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Scale, Radio } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';

export default function GlobalRouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const [showSplash, setShowSplash] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(15);
  const [tickerStep, setTickerStep] = useState(0);

  const tickerMessages = [
    'KHỞI TẠO HỆ THỐNG CÔNG BÁO...',
    'ĐỒNG BỘ ÁN LỆ & TÒA ÁN NHÂN DÂN...',
    'KẾT NỐI ĐOÀN LUẬT SƯ CHÍNH QUY...',
    'XÁC THỰC MÃ HÓA BẢO MẬT DOCKET...',
  ];

  useEffect(() => {
    setMounted(true);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 10;
      });
    }, 120);

    const messageInterval = setInterval(() => {
      setTickerStep((prev) => (prev + 1) % tickerMessages.length);
    }, 280);

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 900);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [pathname, searchParams, mounted]);

  const isLight = mounted ? theme === 'light' : false;

  return (
    <>
      {/* Top Retro Ticker Bar on route navigation */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-stone-900 overflow-hidden pointer-events-none border-b border-stone-800">
          <div className="h-full w-full bg-gradient-to-r from-[#d95327] via-[#f59e0b] to-[#d95327] animate-shimmer shadow-[0_0_10px_#d95327]"></div>
        </div>
      )}

      {/* Fullscreen Mesmerizing Retro Archive Splash */}
      {showSplash && (
        <div
          suppressHydrationWarning
          className={`fixed inset-0 z-[99998] flex flex-col items-center justify-center p-4 transition-all duration-300 font-sans overflow-hidden select-none ${
            isLight
              ? 'bg-[#faf7f2] text-stone-900'
              : 'bg-[#100d0b] text-stone-100'
          }`}
        >
          {/* Retro CRT Scanlines & Halftone Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#d95327_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

          {/* Glowing Ambient Retro Phosphor Halo */}
          <div className="absolute w-[450px] h-[450px] bg-[#d95327]/15 rounded-full blur-[110px] pointer-events-none animate-pulse"></div>

          {/* Retro Editorial Registration Marks (Corners) */}
          <div className="absolute top-6 left-6 font-mono text-[10px] text-stone-400 dark:text-stone-600 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[#d95327] font-bold">+</span>
            <span>NO. LAWOH-ARCHIVE-2026</span>
          </div>
          <div className="absolute top-6 right-6 font-mono text-[10px] text-stone-400 dark:text-stone-600 flex items-center gap-1.5 pointer-events-none">
            <span>CHAMBER PROTOCOL</span>
            <span className="text-[#d95327] font-bold">SYS:ONLINE</span>
          </div>
          <div className="absolute bottom-6 left-6 font-mono text-[10px] text-stone-400 dark:text-stone-600 pointer-events-none">
            [ENCRYPTION: AES-256-TELETYPE]
          </div>
          <div className="absolute bottom-6 right-6 font-mono text-[10px] text-stone-400 dark:text-stone-600 pointer-events-none">
            © 2026 LAWOH LEGAL DISPATCH
          </div>

          {/* Main Retro Emblem & Loader Container */}
          <div className="relative flex flex-col items-center space-y-6 max-w-sm text-center z-10">
            
            {/* Spinning Concentric Notary Seal Seal Animation ("Ảo Ảo") */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Outer Dashed Rotating Gear / Stamp Ring */}
              <div className="absolute inset-0 border-2 border-dashed border-[#d95327]/60 rounded-full animate-[spin_12s_linear_infinite]"></div>
              {/* Middle Dotted Ring (Reverse Spin) */}
              <div className="absolute inset-2 border-2 border-dotted border-amber-600/40 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
              
              {/* Center Retro Tactile Badge */}
              <div className="relative w-16 h-16 border-2 border-stone-800 dark:border-stone-600 bg-[#d95327] text-white flex items-center justify-center shadow-[4px_4px_0px_#000] transform transition-transform hover:scale-105">
                <Scale className="w-8 h-8 text-stone-100 animate-pulse" />
                {/* Corner rivets */}
                <span className="absolute top-0.5 left-0.5 w-1 h-1 bg-stone-900"></span>
                <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-stone-900"></span>
                <span className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-stone-900"></span>
                <span className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-stone-900"></span>
              </div>
            </div>

            {/* Masthead Headline */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 font-mono text-[10px] uppercase font-bold tracking-widest text-[#d95327]">
                <Radio className="w-3 h-3 animate-ping" />
                <span>VIETNAM LEGAL BROADCAST</span>
              </div>
              <h2 className="text-2xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
                LawOh Gazette
              </h2>
              <p className="text-xs font-mono text-stone-500 dark:text-stone-400">
                Nền tảng Pháp lý & Danh bạ Luật sư Trực tuyến
              </p>
            </div>

            {/* Stepped Retro Analog Progress Bar */}
            <div className="w-64 space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] text-stone-600 dark:text-stone-400 font-bold">
                <span>[DOCKET-LOAD]</span>
                <span className="text-[#d95327]">{Math.min(100, progress)}%</span>
              </div>

              {/* Segmented Pixel Bar */}
              <div className="h-3 border-2 border-stone-800 dark:border-stone-600 bg-stone-200 dark:bg-stone-950 p-0.5 shadow-[2px_2px_0px_#d95327]">
                <div
                  className="h-full bg-gradient-to-r from-[#d95327] to-amber-500 transition-all duration-150 ease-out"
                  style={{ width: `${Math.min(100, progress)}%` }}
                ></div>
              </div>
            </div>

            {/* Typewriter Ticker Decoding Status */}
            <div className="p-2 border border-stone-300 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80 w-72">
              <p className="font-mono text-[10px] text-stone-600 dark:text-stone-400 uppercase tracking-wider truncate animate-pulse">
                &gt; {tickerMessages[tickerStep]}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
