'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center bg-white/10 dark:bg-slate-800/80 backdrop-blur-md p-1 rounded-xl border border-white/20 dark:border-slate-700 text-xs shadow-xs transition-all">
      <Globe className="w-3.5 h-3.5 text-blue-400 mx-1.5" />
      <button
        onClick={() => setLanguage('vi')}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs ${
          language === 'vi'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-gray-200 hover:text-white hover:bg-white/10'
        }`}
        title="Tiếng Việt"
      >
        <span>🇻🇳</span>
        <span className="font-semibold">VI</span>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs ${
          language === 'en'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-gray-200 hover:text-white hover:bg-white/10'
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span className="font-semibold">EN</span>
      </button>
    </div>
  );
}
