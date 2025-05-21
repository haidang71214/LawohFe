'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
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

// Define a Booking interface based on the API response
interface Booking {
  _id: string;
  client_id: string;
  lawyer_id: string;
  booking_start: string;
  booking_end: string;
  status: string;
  typeBooking: string;
  note: string;
  income:number
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function BookingListForLawyer() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  // Get lawyerId from localStorage
  useEffect(() => {
    const storedClient = localStorage.getItem(USER_PROFILE);
    let id: string | null = null;
    try {
      const profileObj = JSON.parse(storedClient || '{}');
      id = profileObj?._id || null;
    } catch {
      id = storedClient || null;
    }
    setLawyerId(id);
  }, []);

  // Fetch bookings list for lawyer
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/booking/LawyerGetListBooking');
      console.log(response);

      const fetchedBookings = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
      console.log(fetchedBookings);

      setBookings(fetchedBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      } else {
        setError('Lấy danh sách booking thất bại, vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lawyerId) return;
    fetchBookings();
  }, [lawyerId]);

  // Fetch client names for client_ids that don't have names yet
  useEffect(() => {
    const clientIdsToFetch = bookings
      .map((b) => b.client_id)
      .filter((id): id is string => !!id && !clientNames[id]);

    if (clientIdsToFetch.length === 0) return;

    const fetchClientNames = async () => {
      try {
        const promises = clientIdsToFetch.map((id) =>
          axiosInstance.get(`/users/${id}`).then((res) => ({
            id,
            name: res.data.data?.user?.name || 'Tên không xác định',
          }))
        );

        const results = await Promise.all(promises);

        setClientNames((prev) => {
          const newMap = { ...prev };
          results.forEach(({ id, name }) => {
            newMap[id] = name;
          });
          return newMap;
        });
      }  catch (err) {
         console.error('Error fetching client names:', err);
       }
    };

    fetchClientNames();
  }, [bookings, clientNames]);

// Function to accept a booking
// Function to accept a booking
const acceptBooking = async (booking: Booking) => {
   if (!lawyerId) {
     setError('Không tìm thấy thông tin luật sư, vui lòng đăng nhập lại!');
     return;
   }
 
   try {
     setUpdating(booking._id);
     console.log(`Accepting booking for client ${booking.client_id} by lawyer ${lawyerId}`);
 
     // ✅ Đúng method: PATCH
     // ✅ Đúng param: booking.client_id
     const response = await axiosInstance.patch(`/booking/lawyerAcceptBooking/${booking.client_id}/${booking._id}`, {
       lawyerId,
     });
 
     console.log('Accept response:', response.data);
     await fetchBookings();
   } catch (err: any) {
     console.error('Error accepting booking:', err.response?.data || err.message);
     if (err.response?.status === 401) {
       setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
     } else if (err.response?.status === 404) {
       setError('API không tồn tại, kiểm tra lại đường dẫn hoặc backend!');
     } else {
       setError('Chấp nhận booking thất bại, vui lòng thử lại!');
     }
   } finally {
     setUpdating(null);
   }
 };
 

  // Function to reject a booking
  const rejectBooking = async (booking: Booking) => {
    if (!lawyerId) {
      setError('Không tìm thấy thông tin luật sư, vui lòng đăng nhập lại!');
      return;
    }
  
    try {
      setUpdating(booking._id);
      console.log(`Accepting booking for client ${booking.client_id} by lawyer ${lawyerId}`);
  
      // ✅ Đúng method: PATCH
      // ✅ Đúng param: booking.client_id, truyền vào booking_id cho reject luôn, vì nếu không có booking id thì nó sẽ hơi ngơ
      const response = await axiosInstance.patch(`/booking/rejectBooking/${booking.client_id}/${booking._id}`, {
        lawyerId,
      });
  
      console.log('Accept response:', response.data);
      await fetchBookings();
    } catch (err: any) {
      console.error('Error accepting booking:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      } else if (err.response?.status === 404) {
        setError('API không tồn tại, kiểm tra lại đường dẫn hoặc backend!');
      } else {
        setError('Chấp nhận booking thất bại, vui lòng thử lại!');
      }
    } finally {
      setUpdating(null);
    }
  };

  // Function to get the translated booking type
  const getBookingTypeLabel = (typeBooking: string) => {
    if (!typeBooking) return '';
    const key = typeBooking as keyof typeof LawyerCategoriesVietnamese;
    return LawyerCategoriesVietnamese[key] || typeBooking;
  };

  if (!lawyerId) {
    return <p>Đang lấy thông tin luật sư, vui lòng đợi...</p>;
  }

  return (
    <div
      style={{
        maxWidth: '90%',
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
        Danh sách Booking của Luật sư
      </h2>
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (!bookings || bookings.length === 0) && <p>Chưa có booking nào.</p>}

      {!loading && !error && bookings && bookings.length > 0 && (
        <Table
          aria-label="Danh sách Booking của Luật sư"
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
            <TableColumn style={{ padding: '12px 8px' }}>Khách hàng</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Loại booking</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Bắt đầu</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Kết thúc</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Trạng thái</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Hành động</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Ghi chú</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Thu nhập ước tính</TableColumn>
            <TableColumn style={{ padding: '12px 8px' }}>Ngày tạo</TableColumn>
          </TableHeader>
          <TableBody>
            {bookings.map((b: Booking, index: number) => {
              const isEven = index % 2 === 0;
              const status = b.status === 'none' ? 'none' : b.status || '';
              const isUpdating = updating === b._id;

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
                    {clientNames[b.client_id] ?? 'Đang tải...'}
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
                      padding: '20px 20px',
                      fontWeight: '600',
                      color: statusColors[status] || '#333',
                    }}
                  >
                    {status === 'none'
                      ? 'Đang chờ phê duyệt'
                      : status === 'approved'
                      ? 'Đã chấp nhận'
                      : status === 'rejected'
                      ? 'Đã từ chối'
                      : b.status ?? ''}
                  </TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>
                    {status === 'none' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => acceptBooking(b)}
                          disabled={isUpdating}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: isUpdating ? '#ccc' : '#5cb85c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => rejectBooking(b)}
                          disabled={isUpdating}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: isUpdating ? '#ccc' : '#d9534f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      `- đã ${b.status}`
                    )}
                  </TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>{b.note ?? ''}</TableCell>
                  <TableCell>{isNaN(b.income) ? 'Không xác định' : (b.income * 0.9).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                  <TableCell style={{ padding: '10px 8px' }}>
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}
                  </TableCell>
                  
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}