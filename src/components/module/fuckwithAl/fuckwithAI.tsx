'use client';
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import styles from './fuckshiet.module.css';
import { Button, Input } from '@heroui/react';
import { axiosInstance } from '@/fetchApi';
import { useRouter } from 'next/navigation';


interface Review {
  _id: string;
  type: string;
  lawyer_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TypeLawyer {
  type: string[];
  createdAt: string;
  updatedAt: string;
  lawyer_id: string;
  __v: number;
  _id: string;
}

interface Lawyer {
  _id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  phone: number;
  avartar_url: string;
  province: string;
  star: number;
  createdAt: string;
  updatedAt: string;
  certificate: string[];
  description: string;
  experienceYear?: number;
  typeLawyer: TypeLawyer; // Cập nhật thành object
  reviews: Review[];
}

interface AIResponse {
  category: string;
  input_text: string;
  lawyers: Lawyer[];
}

export default function FukwithAI() {
  const [input, setInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ user: string; ai: AIResponse | null }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // Khởi tạo router
  const handleViewDetails = (lawyerId: string) => {
    router.push(`/lawyerDetail/${lawyerId}`);
  };
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/classification/classify', {
        text: input,
      });
      console.log('API Response:', response.data); // Debug dữ liệu trả về
      const data: AIResponse = response.data;

      if (!data || !data.category) {
        setChatHistory([...chatHistory, { user: input, ai: null }]);
      } else {
        setChatHistory([...chatHistory, { user: input, ai: data }]);
      }
      setInput('');
    } catch (err) {
      setChatHistory([...chatHistory, { user: input, ai: null }]);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      INSURANCE: 'Bảo hiểm',
      CORPORATE: 'Doanh nghiệp',
      CRIMINAL: 'Hình sự',
      INTELLECTUAL_PROPERTY: 'Sở hữu trí tuệ',
      CIVIL: 'Dân sự',
      TRANSPORTATION: 'Giao thông - Vận tải',
      FAMILY: 'Hôn nhân gia đình',
      INHERITANCE: 'Thừa kế - Di chúc',
      LAND: 'Đất đai',
      ADMINISTRATIVE: 'Hành chính',
      LABOR: 'Lao động',
      TAX: 'Thuế',
      UNKNOWN: 'Không xác định',
    };
    return labels[category] || category;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.overlay}></div>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Hỏi gì với AI?</h1>
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
              <div className={styles.inputContainer}>
                <Input
                  type="text"
                  placeholder="Nhập câu hỏi của bạn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className={styles.customInput}
                />
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? (
                    <span className={styles.spinner}>⏳</span>
                  ) : (
                    <span className={styles.buttonText}>Gửi</span>
                  )}
                </button>
              </div>
            </form>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </div>

      <div className={styles.chatContainer} ref={chatContainerRef}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={styles.chatMessage}>
            <div className={styles.userMessage}>
              <p><strong>Bạn:</strong> {chat.user}</p>
            </div>
            {chat.ai ? (
              <div className={styles.aiMessage}>
                <p>
                  <strong>AI:</strong> Đây là vấn đề thuộc danh mục{' '}
                  <span className={styles.categoryHighlight}>{getCategoryLabel(chat.ai.category)}</span>.
                </p>
                {chat.ai.lawyers && chat.ai.lawyers.length > 0 ? (
                  <div>
                    <p className={styles.suggestionText}>Gợi ý luật sư phù hợp:</p>
                    {chat.ai.lawyers.map((lawyer) => (
                      <div key={lawyer._id} className={styles.lawyerCard}>
                      <img
                        src={lawyer.avartar_url}
                        alt={lawyer.name}
                        className={styles.lawyerAvatar}
                      />
                      <div className={styles.lawyerInfo}>
                        <h3>{lawyer.name}</h3>
                        <div className={styles.starRating}>
                          <span>⭐</span>
                          <span className={styles.ratingText}>{lawyer.star}</span>
                        </div>
                        <p>
                          <span className={styles.typeLabel}><strong>Loại:</strong></span>{' '}
                          {lawyer.typeLawyer?.type?.length > 0 ? (
                            <span className={styles.typeValue}>
                              {lawyer.typeLawyer.type.map((type, idx) => (
                                <span key={idx}>
                                  {getCategoryLabel(type)}
                                  {idx < lawyer.typeLawyer.type.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span>Không có thông tin</span>
                          )}
                        </p>
                        <p>
                          <strong>Khu vực:</strong> {lawyer.province}
                        </p>
                        <p>{lawyer.description}</p>
                        <p>
                          <strong>Liên hệ:</strong> {lawyer.phone}
                        </p>
                        <div className={styles.viewDetailsButton}>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleViewDetails(lawyer._id)}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noLawyerText}>Không có kết quả phù hợp.</p>
                )}
              </div>
            ) : (
              <div className={styles.aiMessage}>
                <p className={styles.noLawyerText}>Không có kết quả phù hợp.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}