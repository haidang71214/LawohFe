'use client';

import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';
import { useLanguage } from '@/i18n/LanguageContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-1.5 bg-stone-100 dark:bg-[#1f1c19] border-2 border-stone-800 dark:border-stone-400 shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] text-stone-900 dark:text-[#fbf8f2] transition-transform active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center cursor-pointer ${className}`}
      title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-stone-900" />
      )}
    </button>
  );
};

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`px-2.5 py-1 bg-stone-100 dark:bg-[#1f1c19] border-2 border-stone-800 dark:border-stone-400 shadow-[2px_2px_0px_#181614] dark:shadow-[2px_2px_0px_#e5decf] text-stone-900 dark:text-[#fbf8f2] font-mono text-xs font-bold uppercase tracking-wider transition-transform active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 cursor-pointer ${className}`}
      title="Đổi ngôn ngữ / Switch Language"
      aria-label="Toggle Language"
    >
      <Globe className="w-3.5 h-3.5 text-[#d95327] dark:text-[#f59e0b]" />
      <span>{language === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  );
};

export default function ThemeLanguageControls({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
}
