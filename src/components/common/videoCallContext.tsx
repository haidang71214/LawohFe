'use client';

import { axiosInstance, BASE_URL } from '@/fetchApi';
import { addToast } from '@heroui/toast';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// Define interfaces for Stringee SDK types
interface StringeeClient {
  on: (event: string, callback: (res: any) => void) => void;
  connect: (token: string) => void;
  disconnect: () => void;
}

interface StringeeVideoTrack {
  serverId: string;
  attach: () => HTMLVideoElement;
  detach: () => HTMLElement[];
  on: (event: string, callback: () => void) => void;
}

interface StringeeRoom {
  subscribe: (serverId: string) => Promise<StringeeVideoTrack>;
  publish: (track: StringeeVideoTrack) => Promise<void>;
  getTracks: () => StringeeVideoTrack[];
  on: (event: string, callback: (e: any) => void) => void;
  off: (event: string) => void;
}

// Define event interfaces
interface RoomEvent {
  info: {
    userId: string;
    [key: string]: any;
  };
}

interface TrackEvent {
  info: {
    track: {
      serverId: string;
      [key: string]: any;
    };
  };
}

interface RemoveTrackEvent {
  track: StringeeVideoTrack | null;
}

interface VideoCallContextType {
  isCallOpen: boolean;
  setIsCallOpen: (open: boolean) => void;
  clientId: string | null;
  setClientId: (id: string | null) => void;
  lawyerId: string | null;
  setLawyerId: (id: string | null) => void;
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  roomToken: string | null;
  setRoomToken: (token: string | null) => void;
  callClient: StringeeClient | null;
  setCallClient: (client: StringeeClient | null) => void;
  room: StringeeRoom | null;
  setRoom: (room: StringeeRoom | null) => void;
  incomingCall: { roomId: string; clientId: string; lawyerId: string } | null;
  setIncomingCall: (call: { roomId: string; clientId: string; lawyerId: string } | null) => void;
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
  const [room, setRoom] = useState<StringeeRoom | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ roomId: string; clientId: string; lawyerId: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [socket, setSocket] = useState<Socket | null>(null);

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
      setSocket(socketInstance);
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

      const client = new window.StringeeClient();
      client.on('authen', (res: any) => console.log('Authenticated:', res));
      client.on('connect', () => console.log('Connected to Stringee Server'));
      client.on('disconnect', () => console.log('Disconnected from Stringee Server'));
      client.connect(userToken);
      setCallClient(client);

      const localTrack = await window.StringeeVideo.createLocalVideoTrack(client, {
        audio: true,
        video: true,
        videoDimensions: { width: 640, height: 360 },
      });

      const videoElement = localTrack.attach();
      videoElement.setAttribute('controls', 'true');
      videoElement.setAttribute('playsinline', 'true');
      document.getElementById('videos-container')?.appendChild(videoElement);

      const roomData = await window.StringeeVideo.joinRoom(client, roomToken);
      const newRoom = roomData.room;
      setRoom(newRoom);

      // Remove existing event listeners
      newRoom.off('joinroom');
      newRoom.off('leaveroom');
      newRoom.off('addtrack');
      newRoom.off('removetrack');

      newRoom.on('joinroom', (event: RoomEvent) => {
        console.log('User joined room:', event.info);
        addToast({
          title: 'Người dùng tham gia',
          description: `User ${event.info.userId} đã tham gia.`,
          color: 'success',
          variant: 'flat',
          timeout: 4000,
        });
      });
      newRoom.on('leaveroom', (event: RoomEvent) => {
        console.log('User left room:', event.info);
        addToast({
          title: 'Người dùng đã rời phòng',
          description: `User ${event.info.userId} đã rời.`,
          color: 'warning',
          variant: 'flat',
          timeout: 4000,
        });
      });
      newRoom.on('addtrack', (e: TrackEvent) => {
        const track = e.info.track;
        if (track.serverId === localTrack.serverId) return;
        if (newRoom.getTracks().length > 2) {
          console.log('Room full, rejecting new track');
          return;
        }
        subscribe(track);
      });
      newRoom.on('removetrack', (e: RemoveTrackEvent) => {
        const track = e.track;
        if (!track) return;
        const mediaElements = track.detach();
        mediaElements.forEach((element: HTMLElement) => element.remove());
      });

      roomData.listTracksInfo.forEach((info: { serverId: string }) => subscribe(info));
      await newRoom.publish(localTrack);

      setIsCallOpen(true);
      addToast({
        title: 'Tham gia cuộc gọi thành công!',
        description: `Phòng họp ${roomId}.`,
        color: 'success',
        variant: 'flat',
        timeout: 4000,
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

  const subscribe = async (trackInfo: { serverId: string }) => {
    if (!room) return;
    const track = await room.subscribe(trackInfo.serverId);
    track.on('ready', () => {
      const videoElement = track.attach();
      videoElement.setAttribute('controls', 'true');
      videoElement.setAttribute('playsinline', 'true');
      document.getElementById('videos-container')?.appendChild(videoElement);
    });
  };

  return (
    <VideoCallContext.Provider
      value={{
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
      }}
    >
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