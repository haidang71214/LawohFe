'use client';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Button,
} from '@heroui/react';
import { addToast } from '@heroui/toast';
import { LOGIN_USER } from '@/constants/enum';
import { axiosInstance } from '@/fetchApi';

interface UserInfo {
  _id: string;
  name: string;
}

interface Payment {
  _id: string;
  transaction_no: string;
  amount: number;
  payment_method: string;
  status: string;
  client_id?: UserInfo | string;
  lawyer_id?: UserInfo | string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(LOGIN_USER);
      if (!token) return;

      const res = await axiosInstance.get('/payment/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      
      const raw = res.data?.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setPayments(raw);
    } catch (err) {
      console.error('Lỗi lấy danh sách payment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (paymentId: string) => {
    try {
      const token = localStorage.getItem(LOGIN_USER);
      if (!token) return;

      setRefundingId(paymentId);
      await axiosInstance.patch(`/payment/refundToLawyer/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
     
      
      addToast({
        title: 'Thanh toán thành công',
        description: 'Đã giải ngân tiền cho luật sư.',
        color: 'success',
      });
      await fetchPayments();
    } catch (err) {
      console.error('Refund lỗi:', err);
      addToast({
        title: 'Thất bại',
        description: 'Giải ngân cho luật sư không thành công.',
        color: 'danger',
      });
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <div style={{ padding: 40, marginTop: 60 }}>
      <div style={{ marginLeft: 240, padding: 20, width: '80%' }}>
        <Card>
          <CardHeader className="text-xl font-bold text-blue-600">
            📄 Danh sách Giao Dịch (Payment)
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <Table
              isStriped
              className="border border-gray-300 rounded-md shadow-sm"
              aria-label="Danh sách thanh toán"
            >
              <TableHeader>
                <TableColumn className="border border-gray-300 text-center">STT</TableColumn>
                <TableColumn className="border border-gray-300 text-center">Mã giao dịch</TableColumn>
                <TableColumn className="border border-gray-300 text-center">Số tiền</TableColumn>
                <TableColumn className="border border-gray-300 text-center">Phương thức</TableColumn>
                <TableColumn className="border border-gray-300 text-center">Trạng thái</TableColumn>
                <TableColumn className="border border-gray-300 text-center">Khách hàng</TableColumn>
                <TableColumn className="border border-gray-300 text-center">Luật sư</TableColumn>
                <TableColumn className="border border-gray-300 text-center">Ngày tạo</TableColumn>
                <TableColumn className="border border-gray-300 text-center">Hành động</TableColumn>
              </TableHeader>
            
              <TableBody>
                {payments.map((p, index) => (
                  <TableRow key={p._id}>
                    <TableCell className="border border-gray-300 text-center">{index + 1}</TableCell>
                    <TableCell className="border border-gray-300 text-center">{p.transaction_no}</TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      {p.amount.toLocaleString('vi-VN')} VND
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">{p.payment_method}</TableCell>
                    <TableCell className="border border-gray-300 text-center font-semibold capitalize">
                      {p.status}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      {typeof p.client_id === 'object' ? p.client_id.name : p.client_id}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      {typeof p.lawyer_id === 'object' ? p.lawyer_id.name : p.lawyer_id}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      {new Date(p.createdAt).toLocaleTimeString('vi-VN')} <br />
                      {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      {p.status === 'success' ? (
                        <Button
                          color="success"
                          size="sm"
                          onPress={() => handleRefund(p._id)}
                          isDisabled={refundingId === p._id}
                        >
                          {refundingId === p._id ? 'Đang xử lý...' : '💸 Trả tiền luật sư'}
                        </Button>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
