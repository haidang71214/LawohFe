'use client';

import React from 'react';
import Hero from '@/components/module/hero/Hero';
import Services from '@/components/Services';
import HomeVideoSection from '@/components/module/home/HomeVideoSection';
import LawyerRanking from '@/components/module/lawyerRanking/LawyerRanking';
import Blog from '@/components/module/blog/Blog';

const HomePage = () => {
  return (
    <main className="min-h-screen bg-[#faf7f2] dark:bg-[#131210] text-stone-900 dark:text-[#f4efe6] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#d95327] selection:text-white transition-colors duration-300">
      {/* Retro Paper Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05] z-[9999]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <Hero />
      <Services />
      <HomeVideoSection />
      <LawyerRanking />
      <Blog />
    </main>
  );
};

export default HomePage;
