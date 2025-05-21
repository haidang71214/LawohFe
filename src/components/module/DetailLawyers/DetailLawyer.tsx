'use client';

import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/fetchApi';
import { Button, Modal, Input, Textarea, Select, SelectItem, ModalHeader, ModalBody, ModalFooter, ModalContent, addToast } from '@heroui/react';
import { USER_PROFILE } from '@/constant/enum';

// Enum dịch chuyên ngành sang tiếng Việt
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
  typeLawyer: TypeLawyer;
  subTypes: SubType[];
  role: string;
  province: string;
  avartar_url: string;
  email: string;
  phone: number;
  description: string;
  certificate: string[];
  experienceYear: number;
  customPrice: { price: number, description: string, type: string }[];
}

interface DetailLawyerProps {
  id: string;
}

function translateTypeLawyer(typeInput: string[] | string): string {
  if (!typeInput) return 'Chưa có thông tin';

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

  const [formData, setFormData] = useState({
    client_id: '',
    lawyer_id: '',
    booking_start: '',
    booking_end: '',
    typeBooking: '',
    note: '',
  });
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
  const [reviews, setReviews] = useState<Review[]>([]);
const [loadingReviews, setLoadingReviews] = useState(false);
const [errorReviews, setErrorReviews] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user’s booked lawyers (from ShittingFile)
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
// fetch review 
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

useEffect(() => {
  const fetchLawyer = async () => {
    if (!id || typeof id !== 'string') {
      setError('ID không hợp lệ. Vui lòng cung cấp ID trong URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/lawyer/vLawyer?id=${id}`);
      const lawyerData = response.data?.data?.data;

      if (lawyerData) {
        setLawyer(lawyerData);
        fetchReviews(); // Gọi fetchReviews sau khi lấy thông tin luật sư
      } else {
        setError('Không tìm thấy thông tin luật sư.');
        setLawyer(null);
      }
    } catch (err: any) {
      setError('Không thể tải thông tin luật sư. Vui lòng thử lại sau.');
      console.error('Error fetching lawyer:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchLawyer();
}, [id]);

  useEffect(() => {
    fetchUserBookedLawyers();
    setIsSuccess(false);
  }, [isSuccess]);

  useEffect(() => {
    const fetchLawyer = async () => {
      if (!id || typeof id !== 'string') {
        setError('ID không hợp lệ. Vui lòng cung cấp ID trong URL.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/lawyer/vLawyer?id=${id}`);
        const lawyerData = response.data?.data?.data;
        console.log(lawyerData);
        
        if (lawyerData) {
          setLawyer(lawyerData);
        } else {
          setError('Không tìm thấy thông tin luật sư.');
          setLawyer(null);
        }
      } catch (err: any) {
        setError('Không thể tải thông tin luật sư. Vui lòng thử lại sau.');
        console.error('Error fetching lawyer:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [id]);

  const handleSubmit = async () => {
    const userProfileStr = localStorage.getItem(USER_PROFILE) || '';
    let clientId = '';
    try {
      const userProfile = JSON.parse(userProfileStr) as { _id?: string };
      clientId = userProfile._id || '';
    } catch {
      console.error('Lỗi parse USER_PROFILE từ localStorage');
    }

    if (!clientId || !formData.lawyer_id || !formData.booking_start || !formData.booking_end) {
      addToast({
        title: "❌ vui lòng điền đẩy đủ thông tin",
        description: "Bạn kiểm tra lại form",
        color: "danger",
        variant: "flat",
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
        title: "🎉 Tạo form thành công!",
        description: "Vui lòng chờ để luật sư duyệt ạ !",
        color: "success",
        variant: "flat",
        timeout: 4000,
      });
      setIsSuccess(true);
      setIsOpen(false);
    } catch (error: any) {
      addToast({
        title: "Vui lòng booking những thứ mà luật sư này chuyên ạ" ,
        description: `${error}`,
        color: "warning",
        variant: "flat",
        timeout: 4000,
      })
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (error || !lawyer) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{error || 'Không tìm thấy thông tin luật sư.'}</div>;
  }

  const isLawyerBooked = bookedLawyerIds.includes(lawyer._id);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#222',
        marginTop: '70px',
      }}
    >
      <div
        style={{
          maxWidth: 940,
          margin: '0 auto',
          paddingTop: 40,
          paddingBottom: 40,
          textAlign: 'center',
          borderBottom: '1px solid #ddd',
        }}
      >
        <img
          src={lawyer.avartar_url !== 'null' ? lawyer.avartar_url : '/default-avatar.png'}
          alt={lawyer.name}
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: 12,
          }}
        />
        <h1 style={{ margin: '0 0 5px', fontWeight: '700', fontSize: 24 }}>{lawyer.name}</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#555' }}>{lawyer.province}</p>
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
        <div style={{ flex: '1 1 600px', fontSize: 14, lineHeight: 1.6, color: '#333' }}>
          <p>
            <strong>Mô tả:</strong> <br />
            <span style={{ whiteSpace: 'pre-wrap' }}>{lawyer.description || 'Chưa có mô tả'}</span>
          </p>
          <p>
            <strong>Số sao: {lawyer.star || 'Chưa có sao'} </strong> <br />
            <span style={{ whiteSpace: 'pre-wrap' }}>{lawyer.description || 'Chưa có mô tả'}</span>
          </p>
          <p>
            <strong>Chuyên môn:</strong>{' '}
            {lawyer.typeLawyer?.type?.length
              ? translateTypeLawyer(lawyer.typeLawyer.type)
              : 'Chưa có thông tin'}
          </p>

          <p>
            <strong>Chuyên ngành chi tiết:</strong>{' '}
            {lawyer.subTypes?.length && lawyer.subTypes[0]?.subType?.length
              ? lawyer.subTypes[0].subType.join(', ')
              : 'Chưa có thông tin'}
          </p>

          <p>
            <strong>Chứng chỉ, bằng cấp cá nhân:</strong>
          </p>
          {lawyer.certificate?.length ? (
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              {lawyer.certificate.map((cert, i) => (
                <li key={i} style={{ marginBottom: 6, color: '#555' }}>
                  {cert}
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có thông tin</p>
          )}
          <strong>Giá tư vấn : </strong>
          {lawyer.customPrice.map((price, index) => (
            <div
              key={index}
              style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            >
              <p>
                <strong>+ </strong>
                {price.price.toLocaleString()} VND/ngày
              </p>
              <p>
                <strong>Loại: </strong>
                {translateTypeLawyer(price.type)}
              </p>
              <p>
                <strong>Mô tả: </strong>
                {price.description || 'Chưa có mô tả'}
              </p>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              color={isLawyerBooked ? 'secondary' : 'primary'}
              style={{
                backgroundColor: isLawyerBooked ? '#3C3C3C' : '#3C3C3C',
                color: 'white',
                padding: '10px 20px',
                border: '1px solid black',
                borderRadius: '8px',
                fontSize: '16px',
              }}
              onPress={() => {
                setFormData((prev) => ({
                  ...prev,
                  lawyer_id: lawyer._id,
                }));
                setIsOpen(true); // Mở modal khi nhấn nút
              }}
            >
              {isLawyerBooked ? 'Đặt thêm' : 'Đặt lịch ngay'}
            </Button>
          </div>
        </div>

        <div
          style={{
            flex: '0 0 280px',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 30,
            textAlign: 'center',
            color: '#555',
          }}
        >
          <div style={{ fontSize: 56, fontWeight: '600', marginBottom: 12, color: '#999' }}>
            {lawyer.experienceYear || 0}
          </div>
          <div style={{ fontSize: 14, fontWeight: '600', color: '#999' }}>
            năm kinh nghiệm làm việc
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '40px 0' }}>
  <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Đánh giá từ khách hàng</h2>

  {loadingReviews ? (
    <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải đánh giá...</div>
  ) : errorReviews ? (
    <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{errorReviews}</div>
  ) : reviews.length > 0 ? (
    reviews.map((review, index) => (
      <div
        key={index}
        style={{
          marginBottom: '20px',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <img
            src={review.client_id.avartar_url || '/default-avatar.png'}
            alt={review.client_id.name}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginRight: '12px',
            }}
          />
          <strong>{review.client_id.name}</strong>
          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#777' }}>
            {new Date(review.review_date).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>
          {'★'.repeat(review.rating)}
        </div>
        <p style={{ marginTop: '8px', color: '#555' }}>{review.comment}</p>
      </div>
    ))
  ) : (
    <p style={{ textAlign: 'center', color: '#555' }}>Chưa có đánh giá.</p>
  )}
</div>
      {isOpen && (
        <Modal style={{ backgroundColor: '#CFC5C2' }} isOpen={isOpen} onOpenChange={() => setIsOpen(false)} placement="top-center">
          <ModalContent>
            <ModalHeader>Đặt lịch tư vấn</ModalHeader>
            <ModalBody>
              <div>Thời gian bắt đầu:</div>
              <Input
                type="datetime-local"
                value={formData.booking_start}
                onChange={(e) => setFormData({ ...formData, booking_start: e.target.value })}
              />
              <div>Thời gian kết thúc:</div>
              <Input
                type="datetime-local"
                value={formData.booking_end}
                onChange={(e) => setFormData({ ...formData, booking_end: e.target.value })}
              />
              <div>Chọn loại tư vấn:</div>
              <Select
                className="max-w-xs"
                placeholder="Chọn kiểu tư vấn"
                selectedKeys={formData.typeBooking ? [formData.typeBooking] : []}
                onSelectionChange={(keys) =>
                  setFormData({ ...formData, typeBooking: String(Array.from(keys)[0] || '') })
                }
              >
                {Object.entries(LawyerCategories).map(([key, label]) => (
                  <SelectItem key={key} data-value={key} style={{ backgroundColor: '#3C3C3C', color: 'white' }}>
                    {label}
                  </SelectItem>
                ))}
              </Select>

              <Textarea
                label="Ghi chú"
                placeholder="Ghi chú cho luật sư..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onClick={() => setIsOpen(false)}>
                Đóng
              </Button>
              {isLawyerBooked ? (
                <Button color="secondary" onClick={handleSubmit}>
                  Đặt lịch thêm
                </Button>
              ) : (
                <Button color="primary" onClick={handleSubmit}>
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