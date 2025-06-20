'use client';

import { axiosInstance, BASE_URL } from '@/fetchApi';
import { addToast } from '@heroui/toast';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { StringeeClient, StringeeCall2 } from 'stringee';

interface VideoCallContextType {
  isCallOpen: boolean;
  setIsCallOpen: (value: boolean) => void;
  clientId: string | null;
  setClientId: (value: string | null) => void;
  lawyerId: string | null;
  setLawyerId: (value: string | null) => void;
  roomId: string | null;
  setRoomId: (value: string | null) => void;
  roomToken: string | null;
  setRoomToken: (value: string | null) => void;
  callClient: StringeeClient | null;
  setCallClient: (value: StringeeClient | null) => void;
  room: StringeeCall2 | null; // Sử dụng StringeeCall2 thay vì StringeeRoom
  setRoom: (value: StringeeCall2 | null) => void;
  incomingCall: { roomId: string; clientId: string; lawyerId: string } | null;
  setIncomingCall: (value: { roomId: string; clientId: string; lawyerId: string } | null) => void;
  joinCall: (roomId: string) => Promise<void>;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export function VideoCallProvider({ children }: { children: React.ReactNode }) {
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [callClient, setCallClient] = useState<StringeeClient | null>(null);
  const [room, setRoom] = useState<StringeeCall2 | null>(null); // Đổi sang StringeeCall2
  const [incomingCall, setIncomingCall] = useState<{ roomId: string; clientId: string; lawyerId: string } | null>(null);

  useEffect(() => {
    const userProfileStr = localStorage.getItem('USER_PROFILE') || '';
    if (userProfileStr) {
      const userProfile = JSON.parse(userProfileStr);
      const userId = userProfile._id;
      const socketInstance = io(BASE_URL);
      socketInstance.emit('joinUser', userId);
      socketInstance.on('incomingCall', (callData: { roomId: string; clientId: string; lawyerId: string }) => {
        setIncomingCall(callData);
        setIsCallOpen(true);
      });
      socketInstance.on('callEnded', () => {
        setIncomingCall(null);
        setIsCallOpen(false);
        setRoom(null);
        setCallClient(null);
        setRoomId(null);
        setRoomToken(null);
        const videosContainer = document.getElementById('videos-container');
        if (videosContainer) videosContainer.innerHTML = '';
      });
      return () => {
        socketInstance.disconnect();
      };
    }
  }, []);

  const joinCall = async (roomId: string) => {
    try {
      const userProfileStr = localStorage.getItem('USER_PROFILE') || '';
      const userProfile = JSON.parse(userProfileStr);
      const userId = userProfile._id;

      const roomTokenResponse = await axiosInstance.get(`/string-geesetup/room-token/${roomId}`);
      const { roomToken } = roomTokenResponse.data;
      const userTokenResponse = await axiosInstance.get(`/string-geesetup/user-token/${userId}`);
      const { userToken } = userTokenResponse.data;

      setRoomId(roomId);
      setRoomToken(roomToken);

      const client = new StringeeClient(); // Sử dụng trực tiếp từ import
      client.on('authen', (res: any) => console.log('Authenticated:', res));
      client.on('connect', () => console.log('Connected to Stringee Server'));
      client.on('disconnect', () => console.log('Disconnected from Stringee Server'));
      client.connect(userToken);
      setCallClient(client);

      // Tạm thời loại bỏ logic StringeeRoom vì bạn đang dùng StringeeCall2
      // Thay vào đó, tạo StringeeCall2 cho cuộc gọi 1-1
      const call = new StringeeCall2(client, userId, lawyerId || '', true); // true để bật video
      call.on('addlocaltrack', (localTrack: any) => {
        const videoElement = localTrack.attach();
        videoElement.setAttribute('controls', 'true');
        videoElement.setAttribute('playsinline', 'true');
        document.getElementById('videos-container')?.appendChild(videoElement);
      });
      call.on('addremotetrack', (track: any) => {
        const videoElement = track.attach();
        videoElement.setAttribute('controls', 'true');
        videoElement.setAttribute('playsinline', 'true');
        document.getElementById('videos-container')?.appendChild(videoElement);
      });
      call.on('signalingstate', (state: any) => {
        if (state.code === 6) {
          setIsCallOpen(false);
          addToast({
            title: 'Cuộc gọi đã kết thúc',
            description: state.reason,
            color: 'warning',
            variant: 'flat',
            timeout: 4000,
          });
        }
      });
      call.makeCall((response: any) => {
        if (response.r === 0) {
          setRoom(call); // Lưu call vào state
          setIsCallOpen(true);
          addToast({
            title: 'Tham gia cuộc gọi thành công!',
            description: `Cuộc gọi ${roomId}.`,
            color: 'success',
            variant: 'flat',
            timeout: 4000,
          });
        } else {
          addToast({
            title: 'Lỗi khi tham gia cuộc gọi',
            description: response.message || 'Vui lòng thử lại.',
            color: 'danger',
            variant: 'flat',
            timeout: 4000,
          });
        }
      });

    } catch (error) {
      console.error('Error joining call:', error);
      addToast({
        title: 'Lỗi khi tham gia cuộc gọi',
        description: 'Vui lòng thử lại.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const contextValue = useMemo(() => ({
    isCallOpen,
    setIsCallOpen,
    clientId,
    setClientId,
    lawyerId,
    setLawyerId,
    roomId,
    setRoomId,
    roomToken,
    setRoomToken,
    callClient,
    setCallClient,
    room,
    setRoom,
    incomingCall,
    setIncomingCall,
    joinCall,
  }), [isCallOpen, clientId, lawyerId, roomId, roomToken, callClient, room, incomingCall]);

  return (
    <VideoCallContext.Provider value={contextValue}>
      {children}
    </VideoCallContext.Provider>
  );
}

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};