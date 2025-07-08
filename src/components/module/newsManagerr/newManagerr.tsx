'use client'
import { axiosInstance } from '@/fetchApi';
import React, { useState, useEffect } from 'react';

import {  Button, Select, SelectItem } from '@heroui/react';
import {  useRouter } from 'next/navigation';
import NewsCard from '../news/card';
import { useModal } from '@/components/common/ModalNewsContext';

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

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get('/news');
        setNewsData(response.data);
      } catch (err) {
        setError("Không thể tải tin tức.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);
  
  const router = useRouter(); // Khởi tạo router
  const handleNavigate =(id:string)=>{
    router.push(`/newsDetail/${id}`)
  }
  const filteredNews = newsData.filter((news) => {
    const matchesType = filterType === 'ALL' || news.type === filterType;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'APPROVED' && news.isAccept) ||
      (filterStatus === 'PENDING' && !news.isAccept) ||
      (filterStatus === 'REJECTED' && !news.isAccept); // Adjust based on your rejection logic
    const matchesSearch = news.mainTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });
    const { openModal } = useModal(); // Use the context to open the modal
  
  
  if (loading) return <div className="container mx-auto p-4">Đang tải...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
const handleCreatePost = () => {
      openModal();
      return;
    
    // Trigger the modal via context
  };
  const acceptTotal = newsData.filter(news => news.isAccept).length;
  const pendingTotal = newsData.filter(news => !news.isAccept).length;
  const totalNews = newsData.length;
  return (
    <div className="mx-auto p-4" style={{ margin:'0 auto',padding:100,backgroundColor: '#f9f9f9' }}>
      <h1 className="text-2xl font-bold mb-4">Quản lí bài đăng</h1>
      <div>
        <div className="flex flex-wrap items-center mb-4">
        <div style={{display:'block',width:'70%'}} className="md:w-1/2 mb-4 px-2">
              <label className="mr-2 font-medium">Tìm kiếm:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tiêu đề để tìm kiếm..."
                className="w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          <div className="md:w-1/2 px-2" style={{paddingTop:20}}>
            <label className="mr-2 font-medium" >Lọc theo loại:</label>
            <Select
              variant="bordered"
              selectedKeys={[filterType]}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: 200, backgroundColor: 'white',marginBottom:20 }}
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
          <div className="md:w-1/2 mb-4 px-2">
            <Button style={{backgroundColor:'#DA3644',color:'white'}} onPress={handleCreatePost} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Tạo bài đăng mới
            </Button>
          </div>
        </div>
        <div className="mb-6 flex justify-around" style={{marginBottom:20}}>
          <div style={{width:'25%',height:'100px',paddingTop:10}} className="bg-white rounded-lg shadow-md p-4 w-1/4 text-center">
            <span className="block text-gray-600">Tổng số video</span>  
            <span className="text-2xl font-bold text-gray-800">{totalNews}</span>
          </div>
          <div style={{width:'25%',height:'100px',paddingTop:10}} className="bg-white rounded-lg shadow-md p-4 w-1/4 text-center">
            <span className="block text-yellow-600">Chờ duyệt</span>
            <span className="text-2xl font-bold text-gray-800">{pendingTotal}</span>
          </div>
          <div style={{width:'25%',height:'100px',paddingTop:10}} className="bg-white rounded-lg shadow-md p-4 w-1/4 text-center">
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
              onDelete={(id) => console.log("Xoá bài viết:", id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}