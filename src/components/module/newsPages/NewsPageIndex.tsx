'use client'
import { axiosInstance } from '@/fetchApi';
import React, { useState, useEffect } from 'react';
import { addToast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import NewsCard from '../news/card';
import styles from './AboutUs.module.css'; // Correct CSS module import

// Định nghĩa kiểu cho news
export interface News {
  _id: string;
  type: string;
  mainTitle: string;
  content: string;
  image_url: string[];
  userId: string;
  createdAt: Date;
  isAccept: boolean;
}

const categoryLabels: Record<string, string> = {
  INSURANCE: 'Bảo hiểm',
  CIVIL: 'Dân sự',
  LAND: 'Đất đai',
  BUSINESS: 'Kinh doanh',
  TRANSPORTATION: 'Giao thông',
  ADMINISTRATIVE: 'Hành chính',
  CRIMINAL: 'Hình sự',
  FAMILY: 'Gia đình',
  LABOR: 'Lao động',
  INTELLECTUAL_PROPERTY: 'Sở hữu trí tuệ',
  INHERITANCE: 'Thừa kế',
  TAX: 'Thuế',
};

// Define styles
const containerStyle: React.CSSProperties = {
  margin: '0 auto',
  padding: '2rem',
  marginTop: '70px',
  backgroundColor: '#f9fafb',
  minHeight: '100vh',
};



const filterContainerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  padding: '1.5rem',
  marginBottom: '2rem',
};

const filterRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  marginBottom: '1rem',
};

const filterItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: '200px',
  flex: '1',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '0.5rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  backgroundColor: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  backgroundColor: '#ffffff',
  outline: 'none',
  cursor: 'pointer',
};




const newsGridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5rem',
  justifyContent: 'flex-start',
};

export default function NewsSelf() {
  const [newsData, setNewsData] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDelete, setIsDelete] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get('/news/GetAllNews');
        setNewsData(response.data);
      } catch (err) {
        setError("Không thể tải tin tức.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [isDelete]);

  const handleNavigate = (id: string) => {
    router.push(`/newsDetail/${id}`);
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await axiosInstance.delete(`/news/${id}`);
      setNewsData((prevNews) => prevNews.filter((news) => news._id !== id));
      addToast({
        title: 'Xóa thành công',
        variant: 'solid',
      });
    } catch (error) {
      console.log(error);
      addToast({
        title: 'Xóa thất bại',
        variant: 'solid',
        color: 'danger',
      });
      setIsDelete(!isDelete);
    }
  };

  const filteredNews = newsData.filter((news) => {
    const matchesType = filterType === 'ALL' || news.type === filterType;
    const matchesSearch = news.mainTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch && news.isAccept;
  });

  if (loading) return <div style={containerStyle}>Đang tải...</div>;
  if (error) return <div style={{ ...containerStyle, color: '#ef4444' }}>{error}</div>;


  return (
    <div style={{marginTop:70}}>
       <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerHeading}>Cập nhật luật pháp với LawOh</h1>
          <p className={styles.headerDescription}>“Từ tin tức đến hành động – Tất cả bắt đầu tại LawOh”</p>
        </div>
      </header>
      <div style={containerStyle}>
        <div style={filterContainerStyle}>
          <div style={filterRowStyle}>
            <div style={filterItemStyle}>
              <label style={labelStyle}>Tìm kiếm:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tiêu đề để tìm kiếm..."
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={filterItemStyle}>
              <label style={labelStyle}>Lọc theo loại:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={selectStyle}
              >
                <option value="ALL">Tất cả</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
       
        <div style={newsGridStyle}>
          {filteredNews.map((news, index) => (
            <NewsCard
              key={news._id}
              news={news}
              index={index}
              onClick={(news) => handleNavigate(news._id)}
              onDelete={(id) => handleDeleteNews(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}