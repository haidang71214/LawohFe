'use client';

import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/fetchApi';

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
}

interface DetailLawyerProps {
  id: string;
}

// Hàm dịch mảng hoặc string chuyên ngành sang tiếng Việt
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

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (error || !lawyer) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{error || 'Không tìm thấy thông tin luật sư.'}</div>;
  }

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
      {/* Header */}
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

      {/* Content */}
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
        {/* Left Content */}
        <div style={{ flex: '1 1 600px', fontSize: 14, lineHeight: 1.6, color: '#333' }}>
          <p>
            <strong>Mô tả:</strong> <br />
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

          {/* Social icons footer */}
          <div style={{ marginTop: 50, display: 'flex', gap: 20, color: '#666' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" style={{ fontSize: 22, color: '#3b5998' }}>
              <svg
                fill="#3b5998"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M22 12a10 10 0 1 0-11.62 9.88v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.3 3h-1.9v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" style={{ fontSize: 22, color: '#0077b5' }}>
              <svg
                fill="#0077b5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M4.98 3.5C4.98 5 4 6 2.5 6S.01 5 0 3.5 1 1 2.5 1 4.98 2 4.98 3.5zM0 8h5v12H0zM8 8h5v1.7h.1c.7-1.3 2.5-2.7 5.1-2.7 5.4 0 6.4 3.5 6.4 8.1V20H19v-6.5c0-1.6 0-3.6-2.3-3.6s-2.7 1.8-2.7 3.5V20H8z" />
              </svg>
            </a>
            <a href="https://rss.com" target="_blank" rel="noreferrer" aria-label="RSS" style={{ fontSize: 22, color: '#f26522' }}>
              <svg
                fill="#f26522"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M3.28 18.2a1.68 1.68 0 1 1 3.36 0 1.68 1.68 0 0 1-3.36 0zm-.62-6.4v3a9.25 9.25 0 0 1 9.25 9.25h3a12.26 12.26 0 0 0-12.25-12.25zm0-3v3a12.28 12.28 0 0 1 12.25 12.25h3A15.3 15.3 0 0 0 2.66 8.4z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Content */}
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
            năm kinh nghiệm tư vấn
          </div>
        </div>
      </div>
    </div>
  );
}
