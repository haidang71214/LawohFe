// app/providers.tsx
"use client";
import {HeroUIProvider} from '@heroui/react'
import {ToastProvider} from "@heroui/toast";

export default function Providers({children} :any) {
  return (
    <HeroUIProvider>
<ToastProvider
  placement="bottom-left"
  toastProps={{
    variant: "flat",
    timeout: 3000,
    classNames: {
      base: "z-[9999] max-w-sm bg-white text-black border border-gray-300 shadow-lg backdrop-blur-md rounded-lg",
      content: "px-4 py-3",
      title: "text-base font-semibold",
      description: "text-sm text-gray-700",
      icon: "text-red-500",
    },
  }}
/>
      {children}
    </HeroUIProvider>
  )
}