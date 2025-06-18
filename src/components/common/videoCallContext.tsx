"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface VideoCallContextType {
  isCallOpen: boolean;
  setIsCallOpen: (open: boolean) => void;
  clientId: string | null;
  setClientId: (id: string | null) => void;
  lawyerId: string | null;
  setLawyerId: (id: string | null) => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export function VideoCallProvider({ children }: { children: ReactNode }) {
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [lawyerId, setLawyerId] = useState<string | null>(null);

  return (
   //làm context cho cái web
    <VideoCallContext.Provider value={{ isCallOpen, setIsCallOpen, clientId, setClientId, lawyerId, setLawyerId }}>
      {children}
    </VideoCallContext.Provider>
  );
}

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error("useVideoCall must be used within a VideoCallProvider");
  }
  return context;
};