import type { Metadata } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import Providers from "./provider";
import { ChatProvider } from "@/components/common/chatContext";
import SocketProvider from "@/components/common/socketProvider";
import ModalNewsContext from "@/components/common/ModalNewsContext";
import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import GlobalAnimeProvider from "@/components/common/GlobalAnimeProvider";
import GlobalRouteLoader from "@/components/common/GlobalRouteLoader";
import React, { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["vietnamese", "latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["vietnamese", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LawOh - Nền tảng Tư vấn & Dịch vụ Pháp lý",
  description: "Cổng thông tin, tra cứu án lệ, biểu mẫu pháp lý và kết nối luật sư chính quy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('APP_THEME');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Suspense fallback={null}>
            <GlobalRouteLoader />
          </Suspense>
          <GlobalAnimeProvider>
            <ChatProvider>
              <SocketProvider>
                <ModalNewsContext>
                  <Navbar />
                  {children}
                  <Footer />
                </ModalNewsContext>
              </SocketProvider>
            </ChatProvider>
          </GlobalAnimeProvider>
        </Providers>
      </body>
    </html>
  );
}
