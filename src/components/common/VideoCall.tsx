'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, addToast } from '@heroui/react';
import { axiosInstance } from '@/fetchApi';
import { useVideoCall } from './videoCallContext';
import { USER_PROFILE } from '@/constant/enum';
import { useRouter } from 'next/navigation';

export default function VideoCall() {
  const { isCallOpen, setIsCallOpen, clientId, lawyerId } = useVideoCall();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const clientRef = useRef<any>(null); // Sẽ gán sau khi import động
  const [AgoraRTC, setAgoraRTC] = useState<any>(null); // Lưu instance của AgoraRTC
  const router = useRouter();

  // Import động agora-rtc-sdk-ng chỉ trên client
  useEffect(() => {
    import('agora-rtc-sdk-ng').then((module) => {
      setAgoraRTC(module.default);
      clientRef.current = module.default.createClient({ mode: 'rtc', codec: 'vp8' });
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, []);

  useEffect(() => {
    console.log('isCallOpen:', isCallOpen, 'clientId:', clientId, 'lawyerId:', lawyerId, 'AgoraRTC:', AgoraRTC);
    if (isCallOpen && clientId && lawyerId && AgoraRTC) {
      startCall();
    } else if (!isCallOpen && clientRef.current) {
      leaveCall();
    }
  }, [isCallOpen, clientId, lawyerId, AgoraRTC]);
  useEffect(() => {
    if (typeof window !== 'undefined' && AgoraRTC) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log('Media devices accessed successfully:', stream);
          stream.getTracks().forEach((track) => track.stop()); // Stop stream to avoid preview
        })
        .catch((err) => {
          console.log('Error requesting media devices:', err);
          addToast({
            title: 'Lỗi quyền truy cập',
            description: 'Vui lòng cho phép camera và microphone trong trình duyệt.',
            color: 'danger',
            variant: 'flat',
            timeout: 4000,
          });
        });
    }
  }, [AgoraRTC]);
  const startCall = async () => {
    if (!clientRef.current || !AgoraRTC) {
      console.error('Client hoặc AgoraRTC chưa sẵn sàng');
      return;
    }
    try {
      const userProfileStr = localStorage.getItem(USER_PROFILE); // Thay 'shit' bằng tên biến rõ ràng
      if (!userProfileStr) {
        addToast({
          title: `Chưa đăng nhập`,
          description: `Bạn cần đăng nhập để tham gia gọi`,
          color: 'danger',
          variant: 'flat',
          timeout: 3000,
        });
        router.push('/login');
        return;
      }
  
      const response = await axiosInstance.get(`/video/TokenCallVideo/${clientId}/${lawyerId}`);
      console.log('API Response:', response.data);
      const { data } = response.data;
      if (!data?.appId || !data?.channelName || !data?.token) {
        throw new Error('Dữ liệu token từ API không hợp lệ');
      }
  
      // Kiểm tra quyền truy cập thiết bị mà không gán vào biến stream
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch((err) => {
        console.error('Lỗi quyền truy cập thiết bị:', err);
        addToast({
          title: 'Lỗi quyền truy cập',
          description: 'Vui lòng cho phép camera và microphone trong trình duyệt.',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
        throw err;
      });
  
      // Sử dụng clientId trực tiếp (chuỗi) vì token được tạo từ buildTokenWithAccount
      await clientRef.current.join(data.appId, data.channelName, data.token, clientId);
      const localStream = await AgoraRTC.createCameraVideoTrack();
      await clientRef.current.publish(localStream);
  
      if (localVideoRef.current) {
        try {
          await localStream.play(localVideoRef.current);
          console.log('Video playing on localVideoRef');
        } catch (e) {
          console.error('Lỗi khi play video:', e);
          addToast({
            title: 'Lỗi video',
            description: 'Không thể hiển thị video. Kiểm tra quyền camera.',
            color: 'danger',
            variant: 'flat',
            timeout: 4000,
          });
        }
      }
  
      clientRef.current.on('user-published', async (user: any, mediaType: 'audio' | 'video' | 'datachannel') => {
        console.log(`Người dùng ${user.uid} tham gia với mediaType: ${mediaType}`);
        await clientRef.current.subscribe(user, mediaType);
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
        addToast({
          title: `Người dùng ${user.uid} đã tham gia`,
          description: `Loại media: ${mediaType}`,
          color: 'success',
          variant: 'flat',
          timeout: 3000,
        });
      });
  
      clientRef.current.on('user-unpublished', (user: any) => {
        console.log(`Người dùng ${user.uid} đã rời cuộc gọi`);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        addToast({
          title: `Người dùng ${user.uid} đã rời`,
          description: 'Cuộc gọi đã kết thúc với người dùng này',
          color: 'warning',
          variant: 'flat',
          timeout: 3000,
        });
      });
    } catch (error : any) {
      console.error('Lỗi khi khởi tạo cuộc gọi:', error);
      if (error.message.includes('NotAllowedError') || error.message.includes('Permission denied')) {
        addToast({
          title: 'Lỗi quyền truy cập',
          description: 'Vui lòng cho phép camera và microphone.',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
      } else if (error.message.includes('NotFoundError')) {
        addToast({
          title: 'Lỗi thiết bị',
          description: 'Không tìm thấy camera hoặc microphone.',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
      } else {
        addToast({
          title: 'Lỗi gọi video',
          description: 'Vui lòng thử lại sau',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
      }
    }
  };

  const leaveCall = () => {
    if (clientRef.current) {
      clientRef.current.leave();
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setIsCallOpen(false);
  };

  return (
    <Modal
      isOpen={isCallOpen}
      onOpenChange={() => setIsCallOpen(false)}
      placement="top-center"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <ModalContent>
        <ModalHeader style={{ fontSize: '20px', color: '#1E3A8A', fontWeight: '700' }}>
          Cuộc gọi video
        </ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          <video ref={localVideoRef} autoPlay muted style={{ width: '300px', margin: '10px' }} />
          <video ref={remoteVideoRef} autoPlay style={{ width: '300px', margin: '10px' }} />
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="flat"
            onClick={leaveCall}
            style={{
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#F9FAFB',
              padding: '8px 20px',
              borderRadius: '20px',
            }}
          >
            Rời cuộc gọi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}