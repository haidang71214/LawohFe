import React from 'react';
import { Scale, Radio } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] bg-[#100d0b] text-stone-100 flex flex-col items-center justify-center p-4 selection:bg-[#d95327] selection:text-white transition-colors duration-200 overflow-hidden select-none font-sans">
      {/* Retro CRT Scanlines & Halftone Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#d95327_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

      {/* Glowing Ambient Retro Phosphor Halo */}
      <div className="absolute w-[420px] h-[420px] bg-[#d95327]/15 rounded-full blur-[110px] pointer-events-none animate-pulse"></div>

      {/* Retro Editorial Registration Marks (Corners) */}
      <div className="absolute top-6 left-6 font-mono text-[10px] text-stone-500 flex items-center gap-1.5 pointer-events-none">
        <span className="text-[#d95327] font-bold">+</span>
        <span>NO. LAWOH-ARCHIVE-2026</span>
      </div>
      <div className="absolute top-6 right-6 font-mono text-[10px] text-stone-500 flex items-center gap-1.5 pointer-events-none">
        <span>CHAMBER PROTOCOL</span>
        <span className="text-[#d95327] font-bold">SYS:ONLINE</span>
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-stone-500 pointer-events-none">
        [ENCRYPTION: AES-256-TELETYPE]
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-stone-500 pointer-events-none">
        © 2026 LAWOH LEGAL DISPATCH
      </div>

      {/* Main Retro Emblem & Loader Container */}
      <div className="relative flex flex-col items-center space-y-6 max-w-sm text-center z-10 animate-fade-in">
        
        {/* Spinning Concentric Notary Seal Animation ("Ảo Ảo") */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer Dashed Rotating Gear / Stamp Ring */}
          <div className="absolute inset-0 border-2 border-dashed border-[#d95327]/60 rounded-full animate-[spin_12s_linear_infinite]"></div>
          {/* Middle Dotted Ring (Reverse Spin) */}
          <div className="absolute inset-2 border-2 border-dotted border-amber-600/40 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
          
          {/* Center Retro Tactile Badge */}
          <div className="relative w-16 h-16 border-2 border-stone-600 bg-[#d95327] text-white flex items-center justify-center shadow-[4px_4px_0px_#000]">
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-stone-700 bg-stone-900 font-mono text-[10px] uppercase font-bold tracking-widest text-[#d95327]">
            <Radio className="w-3 h-3 animate-ping" />
            <span>VIETNAM LEGAL BROADCAST</span>
          </div>
          <h2 className="text-2xl font-serif font-black tracking-tight text-stone-50">
            LawOh Gazette
          </h2>
          <p className="text-xs font-mono text-stone-400">
            Nền tảng Pháp lý & Danh bạ Luật sư Trực tuyến
          </p>
        </div>

        {/* Stepped Retro Analog Progress Bar */}
        <div className="w-64 space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px] text-stone-400 font-bold">
            <span>[DOCKET-LOAD]</span>
            <span className="text-[#d95327] animate-pulse">CONNECTING...</span>
          </div>

          {/* Segmented Pixel Bar */}
          <div className="h-3 border-2 border-stone-600 bg-stone-950 p-0.5 shadow-[2px_2px_0px_#d95327] overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-[#d95327] via-amber-500 to-[#d95327] animate-shimmer"></div>
          </div>
        </div>

        {/* Typewriter Ticker Decoding Status */}
        <div className="p-2 border border-stone-800 bg-stone-900/80 w-72">
          <p className="font-mono text-[10px] text-stone-400 uppercase tracking-wider truncate animate-pulse">
            &gt; ĐANG TẢI DỮ LIỆU CÔNG BÁO PHÁP LÝ...
          </p>
        </div>
      </div>
    </div>
  );
}

