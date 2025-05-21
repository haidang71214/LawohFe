'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea } from '@heroui/react';
import { USER_PROFILE } from '@/constant/enum';
import { axiosInstance } from '@/fetchApi';

// Define Vietnamese translations
export enum LawyerCategoriesVietnamese {
  INSURANCE = 'Bảo hiểm',
  CIVIL = 'Dân sự',
  LAND = 'Đất đai',
  BUSINESS = 'Doanh nghiệp',
  TRANSPORTATION = 'Giao thông - Vận tải',
  ADMINISTRATIVE = 'Hành chính',
  CRIMINAL = 'Hình sự',
  FAMILY = 'Hôn nhân gia đình',
  LABOR = 'Lao động',
  INTELLECTUALPROPERTY = 'Sở hữu trí tuệ',
  INHERITANCE = 'Thừa kế - Di chúc',
  TAX = 'Thuế',
}

const statusColors: Record<string, string> = {
  none: '#f0ad4e', // orange color for "Pending approval"
  approved: '#5cb85c', // green color for approved status
  rejected: '#d9534f', // red color for rejected status
};

export default function BookingList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [lawyerNames, setLawyerNames] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  // Get clientId from localStorage
  useEffect(() => {
    const storedClient = localStorage.getItem(USER_PROFILE);
    let id: string | null = null;
    try {
      const profileObj = JSON.parse(storedClient || '{}');
      id = profileObj?._id || null;
    } catch {
      id = storedClient || null;
    }
    setClientId(id);
  }, []);

  // Fetch bookings list
  useEffect(() => {
    if (!clientId) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/users/getListBookingUser/${clientId}`);
        console.log(response);
        setBookings(response.data);
        
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError('Lấy danh sách booking thất bại, vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [clientId]);

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await axiosInstance.delete(`/booking/userCancelBooking/${bookingId}`);
      addToast({
        title: `${response.data}`,
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
      setBookings(bookings.filter((b) => b._id !== bookingId));
    } catch (err: any) {
      const msg = err.response?.data || 'Lỗi khi xóa lịch, vui lòng thử lại';
      if (err.response?.status === 409) {
        addToast({
          title: msg,
          color: 'warning',
          variant: 'flat',
          timeout: 6000,
        });
      } else {
        addToast({
          title: msg,
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
      }
    }
  };

  const handlePayment = async (bookingId: string, amount: number) => {
    try {
      console.log(amount);
      const response = await axiosInstance.post('/payment/create-payment-url', {
        amount: amount,
        orderInfo: `Thanh toan cho booking ${bookingId}`,
        orderType: 'booking',
        bookingId: bookingId,
      });
      const paymentUrl = response.data.paymentUrl;
      window.open(paymentUrl, '_blank');
      addToast({
        title: 'Đã tạo liên kết thanh toán, vui lòng kiểm tra!',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
    } catch (err: any) {
      const msg = err.response?.data || 'Lỗi khi tạo thanh toán, vui lòng thử lại';
      addToast({
        title: msg,
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleReview = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };


  // chỗ này nó đang lấy bookingId, nhưng cái mình cần là lawyer id
  const handleSubmitReview = async () => {
    if (!selectedBookingId || rating === 0 || !comment.trim()) {
      addToast({
        title: 'Vui lòng nhập đầy đủ đánh giá và bình luận!',
        color: 'warning',
        variant: 'flat',
        timeout: 4000,
      });
      return;
    }

    try {
      // nhận id của thằng luật sư
      await axiosInstance.post(`/review/${selectedBookingId}`, {
        rating,
        comment,
      });
      addToast({
        title: 'Đánh giá thành công!',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
      setIsModalOpen(false);
      setRating(0);
      setComment('');
      setSelectedBookingId(null);
    } catch (err: any) {
      const msg = err.response?.data || 'Lỗi khi gửi đánh giá, vui lòng thử lại!';
      addToast({
        title: msg,
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRating(0);
    setComment('');
    setSelectedBookingId(null);
  };

  // Fetch lawyer names for lawyer_ids that don't have names yet
  useEffect(() => {
    const lawyerIdsToFetch = bookings
      .map((b) => b.lawyer_id)
      .filter((id) => id && !lawyerNames[id]);

    if (lawyerIdsToFetch.length === 0) return;

    const fetchLawyerNames = async () => {
      try {
        const promises = lawyerIdsToFetch.map((id) =>
          axios.get(`http://localhost:8080/users/${id}`).then((res) => ({
            id,
            name: res.data.data.user.name || 'Unknown name',
          }))
        );

        const results = await Promise.all(promises);

        setLawyerNames((prev) => {
          const newMap = { ...prev };
          results.forEach(({ id, name }) => {
            newMap[id] = name;
          });
          return newMap;
        });
      } catch (err) {
        console.error('Error fetching lawyer names:', err);
      }
    };

    fetchLawyerNames();
  }, [bookings, lawyerNames]);

  // Function to get the translated booking type
  const getBookingTypeLabel = (typeBooking: string) => {
    if (!typeBooking) return '';
    const key = typeBooking as keyof typeof LawyerCategoriesVietnamese;
    return LawyerCategoriesVietnamese[key] || typeBooking;
  };

  if (!clientId) {
    return <p>Đang lấy thông tin user, vui lòng đợi...</p>;
  }

  return (
    <div
      style={{
        height: '70vh',
        maxWidth: '1000px',
        margin: 'auto',
        padding: 20,
        marginTop: 70,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: 20,
          color: '#007bff',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          fontWeight: 'bold',
          fontSize: '1.8rem',
        }}
      >
        Danh sách đặt lịch
      </h2>
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && bookings.length === 0 && <p>Chưa có booking nào.</p>}

      {!loading && !error && bookings.length > 0 && (
        <Table
          aria-label="Danh sách Booking của User"
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          }}
        >
          <TableHeader
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              textTransform: 'uppercase',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
          >
            <TableColumn style={{ padding: '12px 8px' }}>STT</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Luật sư</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Loại booking</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Bắt đầu</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Kết thúc</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Trạng thái</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Ghi chú</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Ngày tạo</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Chi phí cần trả</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Hành động</TableColumn>
          </TableHeader>
          <TableBody>
            {bookings.map((b: any, index: number) => {
              const isEven = index % 2 === 0;
              const status = b.status === 'none' ? 'none' : b.status || '';

              return (
                <TableRow
                  key={b._id}
                  style={{
                    backgroundColor: isEven ? '#f9f9f9' : '#ffffff',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#e6f2ff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = isEven
                      ? '#f9f9f9'
                      : '#ffffff';
                  }}
                >
                  <TableCell style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {index + 1}
                  </TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>
                    {lawyerNames[b.lawyer_id] ?? 'Đang tải...'}
                  </TableCell>
                  <TableCell style={{ padding: '10px 8px', fontWeight: '600' }}>
                    {getBookingTypeLabel(b.typeBooking)}
                  </TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>
                    {b.booking_start ? new Date(b.booking_start).toLocaleString() : ''}
                  </TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>
                    {b.booking_end ? new Date(b.booking_end).toLocaleString() : ''}
                  </TableCell>
                  <TableCell
                    style={{
                      padding: '10px 8px',
                      fontWeight: '600',
                      color: statusColors[status] || '#333',
                    }}
                  >
                    {status === 'none' ? 'Đang chờ phê duyệt' : b.status ?? ''}
                  </TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>{b.note ?? ''}</TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(b.income)} VND
                  </TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>
                    {b.status === 'accept' && (
                      <Button
                        color="primary"
                        onClick={() => handlePayment(b._id, b.income || 0)}
                        style={{ marginRight: '8px' }}
                      >
                        Thanh toán
                      </Button>
                    )}
                    {b.status === 'done' && (
                      <Button
                        style={{ backgroundColor: '#ccc' }}
                        color="success"
                        onClick={() => handleReview(b.lawyer_id)}
                      >
                        Đánh giá
                      </Button>
                    )}
                    <Button
                      style={{ backgroundColor: '#ccc' }}
                      color="danger"
                      onClick={() => handleDeleteBooking(b._id)}
                      disabled={b.status === 'rejected'}
                      title={b.status === 'rejected' ? 'Đã bị từ chối, không thể xóa' : 'Xóa lịch'}
                    >
                      Xóa lịch
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Modal for Review */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
  <ModalContent>
    <ModalHeader>Đánh giá lịch hẹn</ModalHeader>
    <ModalBody>
      <label>Đánh giá</label>
      <Input
        type="number"
        value={rating.toString()} // Chuyển đổi number sang string
        onChange={(e) => setRating(Math.max(1, Math.min(5, Number(e.target.value))))}
        min={1}
        max={5}
        style={{ marginBottom: '10px' }}
      />
      <label>Nhận xét chất lượng:</label>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        style={{ marginBottom: '10px' }}
      />
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={handleCloseModal} style={{ marginRight: '8px' }}>
        Hủy
      </Button>
      <Button color="success" onClick={handleSubmitReview}>
        Gửi đánh giá
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
    </div>
  );
}