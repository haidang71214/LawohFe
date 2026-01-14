import React, { Suspense } from 'react';
import LawyersDirectory from '@/components/module/lawyers/LawyersDirectory';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090a] flex items-center justify-center text-xs text-[#62666d]">
          Đang tải danh bạ luật sư...
        </div>
      }
    >
      <LawyersDirectory />
    </Suspense>
  );
}