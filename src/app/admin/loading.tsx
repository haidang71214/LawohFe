import React from 'react';
import { Scale } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col font-sans selection:bg-[#5e6ad2] selection:text-white">
      {/* Top Bar Skeleton */}
      <header className="sticky top-0 z-40 bg-[#08090a]/90 backdrop-blur-md border-b border-[#1f2023] px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#191a1e] border border-[#26282e] flex items-center justify-center text-[#5e6ad2]">
            <Scale className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#f7f8f8]">LawOh</span>
            <span className="px-1.5 py-0.5 rounded bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[10px] font-mono text-[#5e6ad2]">
              Admin OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-24 h-6 rounded-md bg-[#121316] border border-[#222326] animate-pulse"></div>
        </div>
      </header>

      {/* Body Skeleton with Sidebar and Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 gap-6">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-60 shrink-0 space-y-2">
          <div className="h-4 w-20 bg-[#16171b] rounded mb-3"></div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="h-8 rounded-lg bg-[#0d0e11] border border-[#1f2023] animate-pulse"
            ></div>
          ))}
        </div>

        {/* Content Viewport Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-20 rounded-xl bg-[#0d0e11] border border-[#222326] p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-[#16171b] rounded"></div>
              <div className="h-3 w-64 bg-[#121316] rounded"></div>
            </div>
            <div className="h-7 w-28 bg-[#16171b] rounded-md"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-[#0d0e11] border border-[#222326] p-4 space-y-2 animate-pulse"
              >
                <div className="h-3 w-24 bg-[#16171b] rounded"></div>
                <div className="h-7 w-32 bg-[#191a1e] rounded"></div>
                <div className="h-2.5 w-20 bg-[#121316] rounded"></div>
              </div>
            ))}
          </div>

          <div className="h-72 rounded-xl bg-[#0d0e11] border border-[#222326] p-6 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#222326] border-t-[#5e6ad2] animate-spin"></div>
            <span className="text-xs text-[#8a8f98] font-mono">Đang đồng bộ dữ liệu quản trị...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
