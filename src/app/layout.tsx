import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import '../../src/output.css';
import Providers from "./provider";
import { ChatProvider } from "@/components/common/chatContext";
import SocketProvider from "@/components/common/socketProvider";
import VideoProvider from "@/components/common/videoProvider";
import CallModalProvider from "@/components/common/CallModalProvider";
import ModalNewsContext from "@/components/common/ModalNewsContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LawOh - Tư vấn giải pháp luật",
  description: "LawOh - Tư vấn giải pháp luật",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <script src="https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Correctly wrap your children with ToastProvider */}
        <Providers>
  <ChatProvider>
    <SocketProvider>
  <VideoProvider>
    <CallModalProvider>
      <ModalNewsContext>
      {children}
      </ModalNewsContext>
    
    </CallModalProvider>
    </VideoProvider>
    </SocketProvider>
  </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}
