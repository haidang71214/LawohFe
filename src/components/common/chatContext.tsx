
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  openChat: (conversationId: string | null, lawyerId: string) => void;
  closeChat: () => void;
  isChatOpen: boolean;
  currentConversationId: string | null;
  currentLawyerId: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentLawyerId, setCurrentLawyerId] = useState<string | null>(null);

  const openChat = (conversationId: string | null, lawyerId: string) => {
    setCurrentConversationId(conversationId);
    setCurrentLawyerId(lawyerId);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setCurrentConversationId(null);
    setCurrentLawyerId(null);
  };

  return (
    <ChatContext.Provider value={{ openChat, closeChat, isChatOpen, currentConversationId, currentLawyerId }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};