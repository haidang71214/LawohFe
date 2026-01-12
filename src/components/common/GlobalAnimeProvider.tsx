'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { animateButtonPress, animateStaggerFadeIn } from '@/lib/animations';

export const GlobalAnimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Attach dynamic button press physics globally
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('button, a[role="button"], .anime-btn, .anime-clickable');
      if (clickable && clickable instanceof HTMLElement) {
        animateButtonPress(clickable);
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => document.removeEventListener('click', handleGlobalClick, { capture: true });
  }, []);

  // Stagger animate page components and cards on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.anime-stagger, .anime-card');
      if (cards && cards.length > 0) {
        // Take up to 12 visible top-level cards
        const targetCards = Array.from(cards).slice(0, 12) as HTMLElement[];
        animateStaggerFadeIn(targetCards);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
};

export default GlobalAnimeProvider;
