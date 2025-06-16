'use client';

import React, { useEffect, useState } from 'react';
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

  // Fetch bookings and payment status
  useEffect(() => {
    if (!clientId) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/users/getListBookingUser/${clientId}`);
        const checkPayment = await axiosInstance.get(`/payment/userGetPayment?client_id=${clientId}`);
        
        // Map bookings with payment status
        const updatedBookings = response.data.map((booking: any) => {
          const payment = checkPayment.data.find(
            (p: any) => p.booking_id === booking._id && p.status === 'success'
          );
          return {
            ...booking,
            isPaid: !!payment, // Set isPaid to true if a successful payment exists
          };
        });

        setBookings(updatedBookings);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError('Lấy danh sách booking hoặc thanh toán thất bại, vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [clientId]);

  // Check payment status after payment attempt
  const checkPaymentStatus = async (bookingId: string) => {
    try {
      const response = await axiosInstance.get(`/payment/userGetPayment?client_id=${clientId}`);
      const payment = response.data.find(
        (p: any) => p.booking_id === bookingId && p.status === 'success'
      );
      if (payment) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, isPaid: true } : b
          )
        );
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

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
      const msg = err.response?.data?.message || 'Lỗi khi xóa lịch, vui lòng thử lại';
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

  const handlePayment = async (bookingId: string, amount: number, lawyerId: string, clientId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking) {
      addToast({
        title: 'Không tìm thấy booking!',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
      return;
    }

    if (booking.isPaid) {
      addToast({
        title: 'Booking này đã được thanh toán!',
        color: 'warning',
        variant: 'flat',
        timeout: 4000,
      });
      return;
    }

    try {
      // Check for existing payments
      const paymentResponse = await axiosInstance.get(`/payment/userGetPayment?client_id=${clientId}`);
      const existingPayment = paymentResponse.data.find(
        (p: any) => p.booking_id === bookingId
      );

      if (existingPayment) {
        if (existingPayment.status === 'success') {
          setBookings((prev) =>
            prev.map((b) =>
              b._id === bookingId ? { ...b, isPaid: true } : b
            )
          );
          addToast({
            title: 'Booking này đã được thanh toán!',
            color: 'warning',
            variant: 'flat',
            timeout: 4000,
          });
          return;
        }
        if (existingPayment.status === 'pending' && existingPayment.paymentUrl) {
          window.open(existingPayment.paymentUrl, '_blank');
          addToast({
            title: 'Đã mở liên kết thanh toán hiện có!',
            color: 'success',
            variant: 'flat',
            timeout: 4000,
          });
          setTimeout(() => checkPaymentStatus(bookingId), 5000);
          return;
        }
      }

      // Create new payment
      const response = await axiosInstance.post('/payment/create-payment-url', {
        amount: amount,
        orderInfo: `Thanh toan cho booking ${bookingId}`,
        orderType: 'booking',
        bookingId: bookingId,
        lawyerId: lawyerId,
        clientId: clientId,
      });

      const paymentUrl = response.data.paymentUrl;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank');
        addToast({
          title: 'Đã tạo liên kết thanh toán, vui lòng kiểm tra!',
          color: 'success',
          variant: 'flat',
          timeout: 4000,
        });
        setTimeout(() => checkPaymentStatus(bookingId), 5000);
      } else {
        throw new Error('Không nhận được URL thanh toán!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo thanh toán, vui lòng thử lại';
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
      const booking = bookings.find((b) => b._id === selectedBookingId);
      if (!booking) {
        throw new Error('Không tìm thấy booking!');
      }
      await axiosInstance.post(`/review/${booking.lawyer_id}`, {
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
      const msg = err.response?.data?.message || 'Lỗi khi gửi đánh giá, vui lòng thử lại!';
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

  // Fetch lawyer names
  useEffect(() => {
    const lawyerIdsToFetch = bookings
      .map((b) => b.lawyer_id)
      .filter((id) => id && !lawyerNames[id]);

    if (lawyerIdsToFetch.length === 0) return;

    const fetchLawyerNames = async () => {
      try {
        const promises = lawyerIdsToFetch.map((id) =>
          axiosInstance.get(`/users/${id}`).then((res) => ({
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

  // Function to get translated booking type
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
        maxWidth: '100%',
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
                    {b.status === 'accept' && !b.isPaid && (
                      <Button
                        color="primary"
                        onClick={() => handlePayment(b._id, b.income, b.lawyer_id, b.client_id || clientId || '')}
                        style={{ marginRight: '8px' }}
                      >
                        Thanh toán
                      </Button>
                    )}
                    {b.status === 'accept' && b.isPaid && (
                      <Button
                        color="success"
                        disabled
                        style={{ marginRight: '8px', backgroundColor: '#5cb85c', color: '#fff' }}
                      >
                        Đã thanh toán
                      </Button>
                    )}
                    {b.status === 'done' && (
                      <Button
                        style={{ backgroundColor: '#ccc' }}
                        color="success"
                        onClick={() => handleReview(b._id)}
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
              value={rating.toString()}
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