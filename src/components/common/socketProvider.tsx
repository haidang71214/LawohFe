'use client';

import React, { createContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { URL_SOCKET } from '@/fetchApi';

import { useGetMeQuery } from '@/store/queries/auth';
import webStorageClient from '@/utils/webStorageClient';

export const SocketContext = createContext<{
  socket: Socket | undefined;
  isConnected: boolean;
}>({
  socket: undefined,
  isConnected: false,
});

export default function SocketProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [socket, setSocket] = useState<Socket>();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { data: meResponse } = useGetMeQuery();
  const currentUser: any = meResponse?.data || null;

  const getUserId = () => {
    if (currentUser?._id || currentUser?.id) return currentUser._id || currentUser.id;
    try {
      const u = webStorageClient.getUser();
      return u?._id || u?.id || '';
    } catch {}
    return '';
  };

  const currentUserId = getUserId();

  useEffect(() => {
    const targetUrl = URL_SOCKET || 'http://localhost:3300';
    const isSecure = targetUrl.startsWith('https');
    const newSocket = io(targetUrl, {
      transports: ['polling'],
      secure: isSecure,
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: {
        userId: currentUserId,
      },
      query: {
        userId: currentUserId,
      },
    });

    newSocket.on('connect', () => {
      setSocket(newSocket);
      setIsConnected(true);
      newSocket.emit('join-dashboard');
      if (currentUserId) {
        newSocket.emit('userLogin', currentUserId);
      }
    });

    newSocket.on('dashboard-joined', () => {
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // When currentUserId changes, emit userLogin
  useEffect(() => {
    if (socket && socket.connected && currentUserId) {
      socket.emit('userLogin', currentUserId);
    }
  }, [socket, currentUserId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}