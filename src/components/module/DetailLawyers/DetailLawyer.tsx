'use client';

import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/fetchApi';
import { Button, Modal, Input, Textarea, Select, SelectItem, ModalHeader, ModalBody, ModalFooter, ModalContent, addToast } from '@heroui/react';
import { USER_PROFILE } from '@/constant/enum';
import { useChat } from '@/components/common/chatContext';
import { useVideoCall } from '@/components/common/videoCallContext';
const LawyerCategories: Record<string, string> = {
  INSURANCE: 'Bảo hiểm',
  CIVIL: 'Dân sự',
  LAND: 'Đất đai',
  CORPORATE: 'Doanh nghiệp',
  TRANSPORTATION: 'Giao thông - Vận tải',
  ADMINISTRATIVE: 'Hành chính',
  CRIMINAL: 'Hình sự',
  FAMILY: 'Hôn nhân gia đình',
  LABOR: 'Lao động',
  INTELLECTUAL_PROPERTY: 'Sở hữu trí tuệ',
  INHERITANCE: 'Thừa kế - Di chúc',
  TAX: 'Thuế',
};

interface TypeLawyer {
  _id: string;
  type: string[];
  lawyer_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SubType {
  _id: string;
  parentType: string;
  subType: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Lawyer {
  _id: string;
  name: string;
  star: number;
  typeLawyer: TypeLawyer | null;
  subTypes: SubType[] | null;
  role: string;
  province: string;
  avartar_url: string;
  email: string;
  phone: number;
  description: string;
  certificate: string[];
  experienceYear: number;
  customPrice: { price: number; description: string; type: string }[];
}

interface DetailLawyerProps {
  id: string;
}

interface Client {
  _id: string;
  name: string;
  avartar_url: string;
}

interface Review {
  _id: string;
  client_id: Client;
  lawyer_id: string;
  rating: number;
  comment: string;
  review_date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function translateTypeLawyer(typeInput: string[] | string | undefined): string {
  if (!typeInput || (Array.isArray(typeInput) && typeInput.length === 0)) return 'Chưa có thông tin';

  if (typeof typeInput === 'string') {
    return LawyerCategories[typeInput] || typeInput;
  }

  if (Array.isArray(typeInput)) {
    return typeInput
      .map((t) => LawyerCategories[t] || t)
      .join(', ');
  }

  return 'Chưa có thông tin';
}
interface RoomEvent {
  info: {
    userId: string;
  };
}
export default function DetailLawyer({ id }: DetailLawyerProps) {
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookedLawyerIds, setBookedLawyerIds] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
// gọi hàm này ra
  const [formData, setFormData] = useState({
    client_id: '',
    lawyer_id: '',
    booking_start: '',
    booking_end: '',
    typeBooking: '',
    note: '',
  });

  const [hasExistingConversation, setHasExistingConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { openChat } = useChat();
  const { setIsCallOpen, setClientId, setLawyerId, setRoomId, setRoomToken, setCallClient, setRoom } = useVideoCall();
  useEffect(() => {
    const checkConversation = async () => {
      try {
        const response = await axiosInstance.get(`/chat/checkConvedddrsation/${id}`);
        if (response.data && response.data.data) {
          setHasExistingConversation(true);
          setConversationId(response.data.data._id);
          console.log('Conversation exists, showing continue chat option');
        } else {
          setHasExistingConversation(false);
          setConversationId(null);
          console.log('No conversation found, showing create new chat option');
        }
      } catch {
        setHasExistingConversation(false);
        setConversationId(null);
      }
    };

    if (id) {
      checkConversation();
    }
  }, [id]);
  // gọi video 
  interface TrackInfo {
    serverId: string;
    // Thêm các thuộc tính khác nếu cần, dựa trên tài liệu Stringee
  }
  
  const subscribe = async (trackInfo: TrackInfo, room: any) => {
    try {
      const track = await room.subscribe(trackInfo.serverId);
      track.on('ready', () => {
        const videoElement = track.attach();
        videoElement.setAttribute('controls', 'true');
        videoElement.setAttribute('playsinline', 'true');
        document.getElementById('videos-container')?.appendChild(videoElement);
      });
    } catch (error) {
      console.error('Error subscribing to track:', error);
      addToast({
        title: 'Lỗi khi đăng ký track',
        description: 'Vui lòng thử lại.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };
  
  const handleStartCall = async () => {
    const userProfileStr = localStorage.getItem(USER_PROFILE) || '';
    try {
      const userProfile = JSON.parse(userProfileStr);
      const clientId = userProfile._id;
      if (!clientId) {
        addToast({
          title: 'Bạn phải đăng nhập trước khi gọi',
          description: 'Vui lòng đăng nhập!',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
        return;
      }
  
      // Gọi backend để tạo phòng
      await axiosInstance.get('/string-geesetup/init');
      const roomResponse = await axiosInstance.post('/string-geesetup/create-room', {
        clientId,
        lawyerId: lawyer?._id,
      });
      const { roomId } = roomResponse.data;
      const roomTokenResponse = await axiosInstance.get(`/string-geesetup/room-token/${roomId}`);
      const { roomToken } = roomTokenResponse.data;
      const userTokenResponse = await axiosInstance.get(`/string-geesetup/user-token/${clientId}`);
      const { userToken } = userTokenResponse.data;
  
      setClientId(clientId);
      setLawyerId(lawyer?._id || '');
      setRoomId(roomId);
      setRoomToken(roomToken);
  
      // Khởi tạo Stringee client
      if (!window.StringeeClient || !window.StringeeVideo) {
        throw new Error('Stringee SDK not loaded');
      }
      const client = new window.StringeeClient();
      client.on('authen', (res: any) => console.log('Authenticated:', res));
      client.on('connect', () => console.log('Connected to Stringee Server'));
      client.on('disconnect', () => console.log('Disconnected from Stringee Server'));
      client.connect(userToken);
      setCallClient(client);
  
      // Tạo luồng video cục bộ
      const localTrack = await window.StringeeVideo.createLocalVideoTrack(client, {
        audio: true,
        video: true,
        videoDimensions: { width: 640, height: 360 },
      });
  
      const videoElement = localTrack.attach();
      videoElement.setAttribute('controls', 'true');
      videoElement.setAttribute('playsinline', 'true');
      document.getElementById('videos-container')?.appendChild(videoElement);
  
      // Tham gia phòng
      const roomData = await window.StringeeVideo.joinRoom(client, roomToken);
      const room = roomData.room;
      setRoom(room);
  
      // Sửa typo và thay thế clearAllOnMethos
      room.off('joinroom');
      room.off('leaveroom');
      room.off('addtrack');
      room.off('removetrack');
  
      room.on('joinroom', (event: RoomEvent) => {
        console.log('User joined room:', event.info);
        addToast({
          title: 'Người dùng tham gia',
          description: `User ${event.info.userId} đã tham gia.`,
          color: 'success',
          variant: 'flat',
          timeout: 4000,
        });
      });
      room.on('leaveroom', (event: RoomEvent) => {
        console.log('User left room:', event.info);
        addToast({
          title: 'Người dùng đã rời phòng',
          description: `User ${event.info.userId} đã rời.`,
          color: 'warning',
          variant: 'flat',
          timeout: 4000,
        });
      });
      room.on('addtrack', (e: { info: { track: TrackInfo } }) => {
        const track = e.info.track;
        if (track.serverId === localTrack.serverId) return;
        if (room.getTracks().length > 2) {
          console.log('Room full, rejecting new track');
          return;
        }
        subscribe(track, room); // Truyền room vào subscribe
      });
      room.on('removetrack', (e: { track: any }) => {
        const track = e.track;
        if (!track) return;
        const mediaElements = track.detach();
        mediaElements.forEach((element: HTMLElement) => element.remove());
      });
  
      roomData.listTracksInfo.forEach((info: TrackInfo) => subscribe(info, room));
      await room.publish(localTrack);
  
      setIsCallOpen(true);
      addToast({
        title: 'Cuộc gọi đã bắt đầu!',
        description: `Phòng họp ${roomId} đã được tạo.`,
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
  
      // Gửi roomId cho luật sư qua chat
      if (conversationId) {
        await axiosInstance.post('/chat/message', {
          conversationId,
          senderId: clientId,
          content: `Tham gia cuộc gọi video tại: ${window.location.origin}?room=${roomId}`,
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
      addToast({
        title: 'Lỗi khi bắt đầu cuộc gọi',
        description: 'Vui lòng thử lại sau.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };
  //
  const fetchUserBookedLawyers = async () => {
    try {
      const userProfileStr = localStorage.getItem(USER_PROFILE) || '';
      if (!userProfileStr) return;

      const userProfile = JSON.parse(userProfileStr) as { _id?: string };
      const clientId = userProfile._id;
      if (!clientId) return;

      const response = await axiosInstance.get(`/users/getListBookingUser/${clientId}`);
      if (Array.isArray(response.data)) {
        const ids = response.data.map((item: any) => item.lawyer_id);
        setBookedLawyerIds(ids);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách booking của user:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      setErrorReviews(null);

      const response = await axiosInstance.get(`/review/${id}`);
      if (Array.isArray(response.data)) {
        setReviews(response.data);
      } else {
        setErrorReviews('Không tìm thấy đánh giá nào.');
        setReviews([]);
      }
    } catch (err: any) {
      setErrorReviews('Lỗi khi lấy đánh giá. Vui lòng thử lại sau.');
      console.error('Error fetching reviews:', err.response?.data || err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchLawyer = async () => {
    if (!id || typeof id !== 'string') {
      setError('ID không hợp lệ. Vui lòng cung cấp ID trong URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let response = await axiosInstance.get(`/lawyer/vLawyer?id=${id}`);
      let lawyerData = response.data?.data?.data;

      if (!lawyerData) {
        response = await axiosInstance.get(`/users/${id}`);
        lawyerData = response.data?.data?.user;
      }

      if (lawyerData) {
        setLawyer({
          ...lawyerData,
          typeLawyer: lawyerData.typeLawyer || { type: [], _id: '', lawyer_id: '', createdAt: '', updatedAt: '', __v: 0 },
          subTypes: lawyerData.subTypes || [],
          certificate: lawyerData.certificate || [],
          customPrice: lawyerData.customPrice || [],
          description: lawyerData.description || 'Chưa có mô tả',
          experienceYear: lawyerData.experienceYear || 0,
          star: lawyerData.star || 0,
        });
        fetchReviews();
      } else {
        setError('Không tìm thấy thông tin luật sư từ cả hai nguồn.');
        setLawyer(null);
      }
    } catch (err: any) {
      setError(`Không thể tải thông tin luật sư. Lỗi: ${err.response?.status || 'Không xác định'}`);
      console.error('Error fetching lawyer:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyer();
  }, [id]);

  useEffect(() => {
    fetchUserBookedLawyers();
    setIsSuccess(false);
  }, [isSuccess]);

  const handleCreateNewChat = async () => {
    try {
      const userProfileStr = localStorage.getItem(USER_PROFILE) || '';
      if (!userProfileStr) {
        addToast({
          title: 'Bạn phải đăng nhập trước khi chat',
          description: 'Vui lòng đăng nhập!',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
        return;
      }

      const userProfile = JSON.parse(userProfileStr) as { _id?: string };
      const clientId = userProfile._id;

      if (!clientId) {
        addToast({
          title: 'Không tìm thấy thông tin người dùng',
          description: 'Vui lòng đăng nhập lại!',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
        return;
      }

      const createResponse = await axiosInstance.post('/chat/conversation', {
        participants: [clientId, id],
      });
      console.log('API Response:', createResponse);
      if (createResponse.data && createResponse.data._id) {
        addToast({
          title: '🎉 Tạo cuộc trò chuyện thành công!',
          description: 'Bạn có thể bắt đầu chat với luật sư',
          color: 'success',
          variant: 'flat',
          timeout: 3000,
        });

        setHasExistingConversation(true);
        const newConversationId = createResponse.data._id;
        setConversationId(newConversationId);
        openChat(newConversationId, id);
      } else {
        throw new Error('Failed to create conversation: Invalid response structure');
      }
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      addToast({
        title: 'Lỗi tạo cuộc trò chuyện',
        description: error.response?.data?.message || error.message || 'Vui lòng thử lại sau',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleContinueChat = async (conversationId: string | null) => {
    try {
      const userProfileStr = localStorage.getItem(USER_PROFILE) || '';
      if (!userProfileStr) {
        addToast({
          title: 'Bạn phải đăng nhập trước khi chat',
          description: 'Vui lòng đăng nhập!',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
        return;
      }

      if (!conversationId) {
        addToast({
          title: 'Cuộc trò chuyện không tồn tại',
          description: 'Vui lòng tạo cuộc trò chuyện mới',
          color: 'warning',
          variant: 'flat',
          timeout: 4000,
        });
        setHasExistingConversation(false);
        return;
      }

      openChat(conversationId, id);
    } catch (error: any) {
      console.error('Error continuing chat:', error);
      addToast({
        title: 'Lỗi khi tiếp tục chat',
        description: 'Vui lòng thử lại sau',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleChatAction = async () => {
    if (hasExistingConversation && conversationId) {
      await handleContinueChat(conversationId);
    } else {
      await handleCreateNewChat();
    }
  };

  const handleSubmit = async () => {
    const userProfileStr = localStorage.getItem(USER_PROFILE) || '';
    let clientId = '';
    try {
      const userProfile = JSON.parse(userProfileStr) as { _id?: string };
      clientId = userProfile._id || '';
      if (!userProfileStr) {
        addToast({
          title: 'Bạn phải đăng nhập trước khi đặt lịch',
          description: 'Vui lòng ạ !',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
      }
    } catch {
      addToast({
        title: 'Bạn phải đăng nhập trước khi đặt lịch',
        description: 'Vui lòng ạ !',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }

    if (!clientId || !formData.lawyer_id || !formData.booking_start || !formData.booking_end) {
      addToast({
        title: '❌ vui lòng điền đẩy đủ thông tin',
        description: 'Bạn kiểm tra lại form',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        client_id: clientId,
        lawyer_id: formData.lawyer_id,
      };

      const response = await axiosInstance.post('/booking/userCreateBooking', payload);
      console.log('Booking created successfully:', response.data);

      addToast({
        title: '🎉 Tạo form thành công!',
        description: 'Vui lòng chờ để luật sư duyệt ạ !',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
      setIsSuccess(true);
      setIsOpen(false);
    } catch (error: any) {
      addToast({
        title: 'Vui lòng kiểm tra lại form ạ',
        description: `${error}`,
        color: 'warning',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', minHeight: '100vh' }}>
        <div style={{ fontSize: '20px', color: '#3B82F6', fontWeight: '600' }}>Đang tải...</div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', minHeight: '100vh' }}>
        <div style={{ fontSize: '18px', color: '#EF4444', fontWeight: '500' }}>{error || 'Không tìm thấy thông tin luật sư.'}</div>
      </div>
    );
  }

  const isLawyerBooked = bookedLawyerIds.includes(lawyer._id);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', // Gradient nền nhẹ nhàng
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
        marginTop: '70px',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          paddingLeft:'300px',
          paddingRight:'300px',
          margin: '0 auto',
          paddingTop: 40,
          paddingBottom: 40,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', // Gradient xanh dương
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          color: '#F9FAFB',
          animation: 'fadeIn 1s ease-in-out',
        }}
      >
        <img
          src={lawyer.avartar_url !== 'null' ? lawyer.avartar_url : '/default-avatar.png'}
          alt={lawyer.name}
          style={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: 12,
            border: '4px solid #93C5FD', // Viền xanh nhạt
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          }}
        />
        <h1
          style={{
            margin: '0 0 5px',
            fontWeight: '700',
            fontSize: 28,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {lawyer.name}
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: '#D1D5DB' }}>{lawyer.province}</p>
        <div style={{ marginTop: 10, fontSize: 18, color: '#FBBF24' }}>{'★'.repeat(lawyer.star || 0)}</div>
      </div>

      {/* Main Content Section */}
      <div
        style={{
          maxWidth: 940,
          margin: '0 auto',
          display: 'flex',
          padding: '40px 0',
          gap: 40,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* Lawyer Info Card */}
        <div
          style={{
            flex: '1 1 600px',
            background: '#fff',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            fontSize: 14,
            lineHeight: 1.6,
            color: '#333',
            transition: 'transform 0.3s ease',
            borderLeft: '4px solid #3B82F6', // Viền trái xanh dương
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <p style={{ marginBottom: 15 }}>
            <strong style={{ color: '#1E3A8A' }}>Mô tả:</strong> <br />
            <span style={{ whiteSpace: 'pre-wrap', color: '#555' }}>{lawyer.description || 'Chưa có mô tả'}</span>
          </p>
          <p style={{ marginBottom: 15 }}>
            <strong style={{ color: '#1E3A8A' }}>Chuyên môn:</strong>{' '}
            <span style={{ color: '#3B82F6' }}>
              {lawyer.typeLawyer && lawyer.typeLawyer.type?.length
                ? translateTypeLawyer(lawyer.typeLawyer.type)
                : 'Chưa có thông tin'}
            </span>
          </p>
          <p style={{ marginBottom: 15 }}>
            <strong style={{ color: '#1E3A8A' }}>Chuyên ngành chi tiết:</strong>{' '}
            <span style={{ color: '#3B82F6' }}>
              {lawyer.subTypes && lawyer.subTypes.length && lawyer.subTypes[0]?.subType?.length
                ? lawyer.subTypes[0].subType.join(', ')
                : 'Chưa có thông tin'}
            </span>
          </p>
          <p style={{ marginBottom: 15 }}>
            <strong style={{ color: '#1E3A8A' }}>Chứng chỉ, bằng cấp cá nhân:</strong>
          </p>
          {lawyer.certificate && lawyer.certificate.length ? (
            <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 15 }}>
              {lawyer.certificate.map((cert, i) => (
                <li key={i} style={{ marginBottom: 6, color: '#555' }}>
                  {cert}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#777' }}>Chưa có thông tin</p>
          )}
          <strong style={{ color: '#1E3A8A' }}>Giá tư vấn:</strong>
          {lawyer.customPrice && Array.isArray(lawyer.customPrice) && lawyer.customPrice.length ? (
            lawyer.customPrice.map((price, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '15px',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #f9fafb, #e5e7eb)',
                  borderRadius: '10px',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <p style={{ margin: '5px 0' }}>
                  <strong style={{ color: '#3B82F6' }}>+ </strong>
                  {price.price.toLocaleString()} VND/ngày
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Loại:</strong> {translateTypeLawyer(price.type)}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Mô tả:</strong> {price.description || 'Chưa có mô tả'}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: '#777', marginTop: 8 }}>Chưa có thông tin giá tư vấn.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              color={isLawyerBooked ? 'secondary' : 'primary'}
              style={{
                background: isLawyerBooked
                  ? 'linear-gradient(135deg, #6B7280, #4B5563)'
                  : 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                color: '#F9FAFB',
                padding: '12px 30px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s ease, background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onPress={() => {
                setFormData((prev) => ({
                  ...prev,
                  lawyer_id: lawyer._id,
                }));
                setIsOpen(true);
              }}
            >
              {isLawyerBooked ? 'Đặt thêm' : 'Đặt lịch ngay'}
            </Button>
            <Button
          color="success"
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#F9FAFB',
            padding: '12px 30px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease',
            marginLeft: '10px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onPress={handleStartCall}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Gọi ngay
        </Button>
          </div>
        </div>

        {/* Experience Card */}
        <div
          style={{
            flex: '0 0 280px',
            background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
            borderRadius: '15px',
            padding: '30px',
            textAlign: 'center',
            color: '#F9FAFB',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ fontSize: 56, fontWeight: '700', marginBottom: 12, color: '#FBBF24' }}>
            {lawyer.experienceYear || 0}
          </div>
          <div style={{ fontSize: 16, fontWeight: '600', color: '#D1D5DB' }}>
            năm kinh nghiệm làm việc
          </div>
          <Button
            onClick={() => handleChatAction()}
            style={{
              marginTop: '20px',
              background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
              color: '#1E3A8A',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '20px',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.2s ease, background 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {hasExistingConversation ? 'Nhắn tiếp' : 'Tạo tin nhắn'}
          </Button>
      {/* Experience Card */}
      <div style={{ flex: '0 0 280px', background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', borderRadius: '15px', padding: '30px', textAlign: 'center', color: '#F9FAFB', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
          <div style={{ fontSize: 56, fontWeight: '700', marginBottom: 12, color: '#FBBF24' }}>{lawyer.experienceYear || 0}</div>
          <div style={{ fontSize: 16, fontWeight: '600', color: '#D1D5DB' }}>năm kinh nghiệm làm việc</div>
        </div>
      </div>

      {/* Reviews Section giữ nguyên */}
      {/* Modal Booking giữ nguyên */}
        </div>

      {/* Reviews Section */}
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '40px 0' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '30px',
            color: '#1E3A8A',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Đánh giá từ khách hàng
        </h2>
        {loadingReviews ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#3B82F6', fontSize: '18px' }}>
            Đang tải đánh giá...
          </div>
        ) : errorReviews ? (
          <div style={{ textAlign: 'center', color: '#EF4444', padding: '20px', fontSize: '16px' }}>
            {errorReviews}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={index}
              style={{
                marginBottom: '20px',
                padding: '20px',
                background: '#fff',
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                animation: 'slideIn 0.5s ease',
                borderLeft: '3px solid #3B82F6',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <img
                  src={review.client_id.avartar_url || '/default-avatar.png'}
                  alt={review.client_id.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '12px',
                    border: '2px solid #3B82F6',
                  }}
                />
                <div>
                  <strong style={{ fontSize: '16px', color: '#1E3A8A' }}>{review.client_id.name}</strong>
                  <div style={{ fontSize: '14px', color: '#777', marginTop: '2px' }}>
                    {new Date(review.review_date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#FBBF24', marginBottom: '8px' }}>
                {'★'.repeat(review.rating)}
              </div>
              <p style={{ marginTop: '8px', color: '#555', fontSize: '15px', lineHeight: '1.5' }}>{review.comment}</p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#777', fontSize: '16px' }}>Chưa có đánh giá.</p>
        )}
      </div>

      {/* Modal Booking */}
      {isOpen && (
        <Modal
          style={{
            background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
          }}
          isOpen={isOpen}
          onOpenChange={() => setIsOpen(false)}
          placement="top-center"
        >
          <ModalContent>
            <ModalHeader style={{ fontSize: '20px', color: '#1E3A8A', fontWeight: '700' }}>
              Đặt lịch tư vấn
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: '5px', fontWeight: '500', color: '#333' }}>Thời gian bắt đầu:</div>
              <Input
                type="datetime-local"
                value={formData.booking_start}
                onChange={(e) => setFormData({ ...formData, booking_start: e.target.value })}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  color: '#333',
                }}
              />
              <div style={{ marginBottom: '5px', fontWeight: '500', color: '#333', marginTop: '15px' }}>
                Thời gian kết thúc:
              </div>
              <Input
                type="datetime-local"
                value={formData.booking_end}
                onChange={(e) => setFormData({ ...formData, booking_end: e.target.value })}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  color: '#333',
                }}
              />
              <div style={{ marginBottom: '5px', fontWeight: '500', color: '#333', marginTop: '15px' }}>
                Chọn loại tư vấn:
              </div>
              <Select
                className="max-w-xs"
                placeholder="Chọn kiểu tư vấn"
                selectedKeys={formData.typeBooking ? [formData.typeBooking] : []}
                onSelectionChange={(keys) =>
                  setFormData({ ...formData, typeBooking: String(Array.from(keys)[0] || '') })
                }
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '5px',
                }}
              >
                {Object.entries(LawyerCategories).map(([key, label]) => (
                  <SelectItem
                    key={key}
                    data-value={key}
                    style={{
                      background: 'linear-gradient(135deg, #f9fafb, #e5e7eb)',
                      color: '#333',
                      padding: '8px',
                    }}
                  >
                    {label}
                  </SelectItem>
                ))}
              </Select>
              <Textarea
                label="Ghi chú"
                placeholder="Ghi chú cho luật sư..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '10px',
                  color: '#333',
                  marginTop: '15px',
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#F9FAFB',
                  padding: '8px 20px',
                  borderRadius: '20px',
                }}
              >
                Đóng
              </Button>
              {isLawyerBooked ? (
                <Button
                  color="secondary"
                  onClick={handleSubmit}
                  style={{
                    background: 'linear-gradient(135deg, #6B7280, #4B5563)',
                    color: '#F9FAFB',
                    padding: '8px 20px',
                    borderRadius: '20px',
                  }}
                >
                  Đặt lịch thêm
                </Button>
              ) : (
                <Button
                  color="primary"
                  onClick={handleSubmit}
                  style={{
                    background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                    color: '#F9FAFB',
                    padding: '8px 20px',
                    borderRadius: '20px',
                  }}
                >
                  Đặt lịch ngay
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}