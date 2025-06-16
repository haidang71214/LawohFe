'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { addToast } from '@heroui/react';
import Link from 'next/link';
import { axiosInstance } from '@/fetchApi';

export default function PaymentResult() {
  return (
    <Suspense fallback={<p>Đang xử lý kết quả thanh toán...</p>}>
      <PaymentResultContent />
    </Suspense>
  );
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [txnRef, setTxnRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // First, check if parameters are already in the URL (from backend redirect)
    const status = searchParams.get('status');
    const code = searchParams.get('code');
    const txnRef = searchParams.get('txnRef');
    const message = searchParams.get('message');

    if (status) {
      setPaymentStatus(status);
      setCode(code);
      setTxnRef(txnRef);
      setErrorMessage(message);

      if (status === 'success') {
        addToast({
          title: 'Thanh toán thành công!',
          color: 'success',
          variant: 'flat',
          timeout: 4000,
        });
      } else if (status === 'failed') {
        addToast({
          title: `Thanh toán thất bại. Mã lỗi: ${code}`,
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
      } else if (status === 'error') {
        addToast({
          title: message || 'Đã xảy ra lỗi khi xử lý thanh toán!',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
      }
    } else {
      // Fallback: Fetch payment status using vnp_TxnRef
      const vnpTxnRef = searchParams.get('vnp_TxnRef');
      if (vnpTxnRef) {
        axiosInstance
          .get(`/payment/get-payment-status/${vnpTxnRef}`)
          .then((response) => {
            const { status, txnRef } = response.data;
            setPaymentStatus(status);
            setTxnRef(txnRef);
            setCode(status === 'success' ? '00' : '97'); // Map status to code

            if (status === 'success') {
              addToast({
                title: 'Thanh toán thành công!',
                color: 'success',
                variant: 'flat',
                timeout: 4000,
              });
            } else {
              addToast({
                title: `Thanh toán thất bại. Mã lỗi: ${status === 'failed' ? '97' : 'unknown'}`,
                color: 'danger',
                variant: 'flat',
                timeout: 4000,
              });
            }
          })
          .catch((error) => {
            setPaymentStatus('error');
            setErrorMessage('Lỗi khi lấy trạng thái thanh toán: ' + error.message);
            addToast({
              title: 'Lỗi khi lấy trạng thái thanh toán!',
              color: 'danger',
              variant: 'flat',
              timeout: 4000,
            });
          });
      }
    }
  }, [searchParams]);

  if (!paymentStatus) {
    return <p>Đang xử lý kết quả thanh toán...</p>;
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: 'auto',
        padding: '20px',
        textAlign: 'center',
        marginTop: '100px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ color: paymentStatus === 'success' ? '#5cb85c' : '#d9534f', marginBottom: '20px' }}>
        {paymentStatus === 'success' ? 'Thanh toán thành công!' : paymentStatus === 'failed' ? 'Thanh toán thất bại' : 'Lỗi xử lý thanh toán'}
      </h2>
      {paymentStatus === 'success' && (
        <>
          <p>Mã giao dịch: {txnRef}</p>
          <p>Mã trạng thái: {code}</p>
        </>
      )}
      {paymentStatus === 'failed' && (
        <>
          <p>Mã lỗi: {code}</p>
          <p>Mã giao dịch: {txnRef}</p>
        </>
      )}
      {paymentStatus === 'error' && <p>{errorMessage}</p>}
      <Link href="/">
        <button
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Quay lại danh sách lịch hẹn
        </button>
      </Link>
    </div>
  );
}