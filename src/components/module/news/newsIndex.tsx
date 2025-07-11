'use client'
import { axiosInstance } from '@/fetchApi';
import React, { useState, useEffect } from 'react';
import NewsCard from './card';
import { addToast, Select, SelectItem } from '@heroui/react';
import { useRouter } from 'next/navigation';

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

const statusOptions = {
  ALL: 'Tất cả',
  APPROVED: 'Đã duyệt',
  PENDING: 'Đang chờ duyệt',
  REJECTED: 'Đã từ chối',
};

export default function NewsSelf() {
  const [newsData, setNewsData] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
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
      // Remove the deleted news from state for instant UI update
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
      // Trigger re-fetch only on failure
      setIsDelete(!isDelete);
    }
  };

  const filteredNews = newsData.filter((news) => {
    const matchesType = filterType === 'ALL' || news.type === filterType;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'APPROVED' && news.isAccept) ||
      (filterStatus === 'PENDING' && !news.isAccept) ||
      (filterStatus === 'REJECTED' && !news.isAccept);
    const matchesSearch = news.mainTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  if (loading) return <div className="container mx-auto p-4">Đang tải...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  const acceptTotal = newsData.filter(news => news.isAccept).length;
  const pendingTotal = newsData.filter(news => !news.isAccept).length;
  const totalNews = newsData.length;

  return (
    <div className="mx-auto p-4" style={{ marginTop: 70, backgroundColor: '#f9f9f9', marginLeft: 240 }}>
      <h1 className="text-2xl font-bold mb-4">Quản lí bài đăng</h1>
      <div>
        <div className="flex flex-wrap items-center mb-4">
          <div style={{ display: 'block', width: '70%' }} className="md:w-1/2 mb-4 px-2">
            <label className="mr-2 font-medium">Tìm kiếm:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tiêu đề để tìm kiếm..."
              className="w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-1/2 mb-4 px-2">
            <label className="mr-2 font-medium">Lọc theo loại:</label>
            <Select
              variant="bordered"
              selectedKeys={[filterType]}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: 200, backgroundColor: 'white' }}
            >
              {[['ALL', 'Tất cả'], ...Object.entries(categoryLabels)].map(([key, label]) => (
                <SelectItem style={{ backgroundColor: 'white' }} key={key}>
                  {label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="md:w-1/2 mb-4 px-2">
            <label className="mr-2 font-medium">Lọc theo trạng thái:</label>
            <Select
              variant="bordered"
              selectedKeys={[filterStatus]}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: 200, backgroundColor: 'white' }}
            >
              {Object.entries(statusOptions).map(([key, label]) => (
                <SelectItem style={{ backgroundColor: 'white' }} key={key}>
                  {label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <div className="mb-6 flex justify-around">
          <div style={{ width: '25%', height: '100px', paddingTop: 10 }} className="bg-white rounded-lg shadow-md p-4 w-1/4 text-center">
            <span className="block text-gray-600">Tổng số video</span>
            <span className="text-2xl font-bold text-gray-800">{totalNews}</span>
          </div>
          <div style={{ width: '25%', height: '100px', paddingTop: 10 }} className="bg-white rounded-lg shadow-md p-4 w-1/4 text-center">
            <span className="block text-yellow-600">Chờ duyệt</span>
            <span className="text-2xl font-bold text-gray-800">{pendingTotal}</span>
          </div>
          <div style={{ width: '25%', height: '100px', paddingTop: 10 }} className="bg-white rounded-lg shadow-md p-4 w-1/4 text-center">
            <span className="block text-green-600">Đã duyệt</span>
            <span className="text-2xl font-bold text-gray-800">{acceptTotal}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4" style={{ flexWrap: 'wrap', display: 'flex' }}>
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