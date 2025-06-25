'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { axiosInstance } from '@/fetchApi';
import { Button, Modal, Input, Textarea, Select, SelectItem, ModalHeader, ModalBody, ModalFooter, ModalContent, addToast } from '@heroui/react';
import { USER_PROFILE } from '@/constant/enum';
import { useChat } from '@/components/common/chatContext';

import { SocketContext } from '@/components/common/socketProvider';
import { useVideoCall } from '@/components/common/videoProvider';
import { PhoneOff, Video, X } from 'lucide-react';
interface RoomUpdateResponse{
  roomId:string;
   status: "waiting" | "started" | "rejected";
   clients:string[]
}
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
  const dashboardSocket = useContext(SocketContext)

  const { openVideoCall, handleReject, isCalling, isAccept, localStream, remoteStream, closeVideoCall } = useVideoCall();
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
// gán stream vào đống này
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  useEffect(() => {
    if (dashboardSocket) {
      dashboardSocket.socket?.on('room-update', (res: RoomUpdateResponse) => {
        console.log('Received room-update:', res);
        const client = res.clients[0];
        // trường hợp client khác id 
        // trường hợp nhiều nhất nó về null
        console.log(client,id);
//aaaaaaaaa
//đổi cái undefine lại thành số ha, mà rõ là cái room nó sẽ undefine khi reject rồi
        if (client === undefined) {
          if (res.status === 'waiting') {
            setIsCallModalOpen(true); // Mở modal khi trạng thái là waiting
          } else if (res.status === 'started') {
            setIsCallModalOpen(true); // Giữ modal mở khi cuộc gọi bắt đầu
            addToast({
              title: 'Cuộc gọi đã bắt đầu!',
              description: 'Kết nối với luật sư thành công.',
              color: 'success',
              variant: 'flat',
              timeout: 4000,
            });
          } else if (res.status === 'rejected') {
            setIsCallModalOpen(false); // Đóng modal khi bị từ chối
            addToast({
              title: 'Cuộc gọi bị từ chối',
              description: 'Luật sư đã từ chối cuộc gọi.',
              color: 'danger',
              variant: 'flat',
              timeout: 4000,
            });
          }
        }else{
          console.log('shit');
          if (res.status === 'started') {
            setIsCallModalOpen(true); // Giữ modal mở khi cuộc gọi bắt đầu
            addToast({
              title: 'Cuộc gọi đã bắt đầu!',
              description: 'Kết nối với luật sư thành công.',
              color: 'success',
              variant: 'flat',
              timeout: 4000,
            });
        }
      }
      });
// trường hợp thứ 2, khi accept thì cái chỗ đó nó có dữ kiện rồi
      return () => {
        dashboardSocket.socket?.off('room-update');
      };
    }
    // khi thay đổi cái này thì nó tự reload -> cập nhật lại á
  }, [dashboardSocket, id]);

  const handleCallVideo = () => {
    const userProfileStr = localStorage.getItem(USER_PROFILE) || '';
    let clientId = '';
  
    try {
      const userProfile = JSON.parse(userProfileStr) as { _id?: string };
      clientId = userProfile._id || '';
      if (!userProfileStr || !clientId) {
        addToast({
          title: 'Bạn phải đăng nhập trước khi gọi',
          description: 'Vui lòng đăng nhập!',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
        return;
      }
    } catch {
      addToast({
        title: 'Bạn phải đăng nhập trước khi gọi',
        description: 'Vui lòng đăng nhập!',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
      return;
    }
  
    // Gọi video với callerId là clientId, calleeId là id của luật sư
    // openVideoCall(clientId, id);
    //aaaaaaaaaaaaaaaaaaaaaaa
    openVideoCall('1', '2');
    setIsCallModalOpen(true); // Mở modal khi bắt đầu gọi
  };


  const cancelCall = () => {
  handleReject(); // Gọi reject từ hook
  setIsCallModalOpen(false);
  addToast({
    title: 'Đã hủy cuộc gọi',
    description: 'Cuộc gọi đã được hủy thành công.',
    color: 'warning',
    variant: 'flat',
    timeout: 4000,
  });
};

  useEffect(() => {
    const checkConversation = async () => {
      try {
        const response = await axiosInstance.get(`/chat/checkConvedddrsation/${id}`); // Sửa lỗi đánh máy
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
          description: 'Vui lòng đăng nhập!',
          color: 'danger',
          variant: 'flat',                              
          timeout: 4000,
        });
        return;
      }
    } catch {
      addToast({
        title: 'Bạn phải đăng nhập trước khi đặt lịch',
        description: 'Vui lòng đăng nhập!',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
      return;
    }

    if (!clientId || !formData.lawyer_id || !formData.booking_start || !formData.booking_end) {
      addToast({
        title: 'Vui lòng điền đầy đủ thông tin',
        description: 'Kiểm tra lại form đặt lịch.',
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
        title: '🎉 Đặt lịch thành công!',
        description: 'Vui lòng chờ luật sư duyệt.',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
      setIsSuccess(true);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      addToast({
        title: 'Lỗi khi đặt lịch',
        description: error.response?.data?.message || 'Vui lòng thử lại sau.',
        color: 'danger',
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
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
        marginTop: '70px',
      }}
    >
      <div
        style={{
          paddingLeft: '300px',
          paddingRight: '300px',
          margin: '0 auto',
          paddingTop: 40,
          paddingBottom: 40,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
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
            border: '4px solid #93C5FD',
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
            borderLeft: '4px solid #3B82F6',
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
          </div>
        </div>

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
         <Button color="primary" style={{ marginTop: '20px' }} onPress={() =>handleCallVideo()}>
          Gọi cho luật sư
          </Button>
        </div>
      </div>

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
{/* aaaaaaaaaaaaaaaaaaaaaaaaaaaaa */}
      {isCallModalOpen && (
  <Modal
    style={{
      background: 'linear-gradient(135deg, #f5f7fa, #e2e8f0)',
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
      maxWidth: '800px',
      width: '90%',
      animation: 'fadeIn 0.3s ease-in-out',
    }}
    isOpen={isCallModalOpen}
    onOpenChange={() => {
      closeVideoCall();
      setIsCallModalOpen(false);
    }}
    placement="center"
  >
    <ModalContent>
      <ModalHeader
        style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e3a8a',
            letterSpacing: '0.5px',
          }}
        >
          Cuộc gọi video
        </span>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => {
            closeVideoCall();
            setIsCallModalOpen(false);
          }}
          style={{
            padding: '8px',
            borderRadius: '50%',
            background: 'transparent',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <X size={20} color="#6b7280" />
        </Button>
      </ModalHeader>
      <ModalBody
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Remote Video - Main */}
          <div
            style={{
              position: 'relative',
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              height: '300px',
            }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
            {!isAccept && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                  color: '#ffffff',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    background: '#ffffff33',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Video size={32} color="#ffffff" />
                </div>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>
                  {lawyer?.name || 'Luật sư'}
                </span>
              </div>
            )}
          </div>

          {/* Local Video - Picture-in-Picture */}
          <div
            style={{
              position: 'absolute',
              top: '32px',
              right: '32px',
              width: '160px',
              height: '120px',
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              border: '2px solid #ffffff',
              zIndex: 10,
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Status */}
          <div
            style={{
              textAlign: 'center',
              padding: '12px 0',
              fontSize: '16px',
              fontWeight: '500',
              color: isCalling ? '#f59e0b' : isAccept ? '#16a34a' : '#6b7280',
              transition: 'color 0.3s ease',
            }}
          >
            {isCalling ? 'Đang gọi...' : isAccept ? 'Đang kết nối...' : 'Cuộc gọi đã kết thúc.'}
          </div>
        </div>
      </ModalBody>
      <ModalFooter
        style={{
          padding: '16px 24px',
          background: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <Button
          color="danger"
          variant="flat"
          onClick={cancelCall}
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#f9fafb',
            padding: '10px 24px',
            borderRadius: '20px',
            fontWeight: '600',
            transition: 'transform 0.2s ease, background 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <PhoneOff size={20} style={{ marginRight: '8px' }} />
          Hủy cuộc gọi
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)}
    </div>
  );
}