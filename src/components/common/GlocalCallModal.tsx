'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, addToast } from '@heroui/react';
import { axiosInstance } from '@/fetchApi';
import { useVideoCall } from './videoCallContext';

export default function GlobalCallModal() {
  const {
    isCallOpen,
    setIsCallOpen,
    roomId,
    room,
    callClient,
    incomingCall,
    setIncomingCall,
    joinCall,
    setRoomId,
    setRoomToken,
    setCallClient,
    setRoom,
  } = useVideoCall();

  const handleShareScreen = async () => {
    try {
      if (!window.StringeeVideo) {
        throw new Error('Stringee SDK chưa được tải');
      }
      if (!callClient || !room) {
        throw new Error('Client hoặc phòng chưa được khởi tạo');
      }
      const screenTrack = await window.StringeeVideo.createLocalVideoTrack(callClient, {
        audio: false,
        video: true,
        screen: true,
        videoDimensions: { width: 1280, height: 720 },
      });
      const videoElement = screenTrack.attach();
      videoElement.setAttribute('controls', 'true');
      videoElement.setAttribute('playsinline', 'true');
      const videosContainer = document.getElementById('videos-container');
      if (videosContainer) {
        videosContainer.appendChild(videoElement);
      } else {
        throw new Error('Không tìm thấy container video');
      }
      await room.publish(screenTrack);
      addToast({
        title: 'Bắt đầu chia sẻ màn hình',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
    } catch (error) {
      console.error('Lỗi khi chia sẻ màn hình:', error);
      addToast({
        title: 'Lỗi khi chia sẻ màn hình',
        description: 'Vui lòng thử lại sau.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleEndCall = async () => {
    try {
      if (room) {
        room.off('joinroom');
        room.off('leaveroom');
        room.off('addtrack');
        room.off('removetrack');
      }
      if (callClient) {
        callClient.disconnect();
      }
      const videosContainer = document.getElementById('videos-container');
      if (videosContainer) {
        videosContainer.innerHTML = '';
      }
      if (roomId) {
        await axiosInstance.put('/string-geesetup/delete-room', { roomId });
      }
      setIsCallOpen(false);
      setRoom(null);
      setCallClient(null);
      setRoomId(null);
      setRoomToken(null);
      setIncomingCall(null);
      addToast({
        title: 'Cuộc gọi đã kết thúc',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
    } catch (error) {
      console.error('Lỗi khi kết thúc cuộc gọi:', error);
      addToast({
        title: 'Lỗi khi kết thúc cuộc gọi',
        description: 'Vui lòng thử lại sau.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleAcceptCall = async () => {
    try {
      if (incomingCall) {
        await joinCall(incomingCall.roomId);
        addToast({
          title: 'Đã chấp nhận cuộc gọi',
          color: 'success',
          variant: 'flat',
          timeout: 4000,
        });
      }
    } catch (error) {
      console.error('Lỗi khi chấp nhận cuộc gọi:', error);
      addToast({
        title: 'Lỗi khi chấp nhận cuộc gọi',
        description: 'Vui lòng thử lại sau.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
    setIsCallOpen(false);
    addToast({
      title: 'Đã từ chối cuộc gọi',
      color: 'success',
      variant: 'flat',
      timeout: 4000,
    });
  };

  return (
    <Modal
      isOpen={isCallOpen}
      onOpenChange={handleEndCall}
      style={{ background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', borderRadius: '15px' }}
    >
      <ModalContent>
        <ModalHeader style={{ color: '#1E3A8A', fontWeight: '700' }}>
          {incomingCall ? 'Cuộc gọi đến' : 'Cuộc gọi video'}
        </ModalHeader>
        <ModalBody>
          <div
            id="videos-container"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}
          />
        </ModalBody>
        <ModalFooter>
          {incomingCall ? (
            <>
              <Button
                color="success"
                onClick={handleAcceptCall}
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#F9FAFB',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  marginRight: '10px',
                }}
              >
                Chấp nhận
              </Button>
              <Button
                color="danger"
                onClick={handleRejectCall}
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#F9FAFB',
                  padding: '8px 20px',
                  borderRadius: '20px',
                }}
              >
                Từ chối
              </Button>
            </>
          ) : (
            <>
              <Button
                color="primary"
                onClick={handleShareScreen}
                style={{
                  background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                  color: '#F9FAFB',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  marginRight: '10px',
                }}
              >
                Chia sẻ màn hình
              </Button>
              <Button
                color="danger"
                onClick={handleEndCall}
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#F9FAFB',
                  padding: '8px 20px',
                  borderRadius: '20px',
                }}
              >
                Kết thúc cuộc gọi
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}