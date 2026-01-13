// app/providers.tsx
"use client";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ThemeProvider } from '@/theme/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <HeroUIProvider>
            <ToastProvider
              placement="bottom-right"
              toastOffset={20}
              toastProps={{
                variant: "flat",
                timeout: 3500,
                classNames: {
                  base: "!z-[2147483647]",
                },
              }}
            />
            {children}
          </HeroUIProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}