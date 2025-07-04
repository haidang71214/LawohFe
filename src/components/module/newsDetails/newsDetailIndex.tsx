'use client';
import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/fetchApi';
import NewsDetail from './NewsDetail';

interface DetailNewsProps {
  id: string;
}

interface NewsDetailData {
  _id: string;
  type: string;
  mainTitle: string;
  content: string;
  isAccept: boolean;
  image_url: string[];
  createdAt?: string;
  views?: number;
  updatedAt?: string;
  userId?: string;
}

export default function NewsDetailIndex({ id }: DetailNewsProps) {
  const [news, setNews] = useState<NewsDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('ID received:', id);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError('ID tin tức không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchNewsDetail = async () => {
      try {
        const response = await axiosInstance.get(`/news/${id}`);
        const data = response.data;

        // Validate required fields based on API response
        if (!data || !data._id || !data.mainTitle || !data.content || !data.type || !data.image_url) {
          throw new Error('Dữ liệu tin tức không đầy đủ.');
        }

        setNews(data);
      } catch (err) {
        setError('Không thể tải chi tiết tin tức.');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  if (loading) return <div className="container mx-auto p-4">Đang tải...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!news) return <div className="container mx-auto p-4">Không tìm thấy tin tức.</div>;

  return (
    <div className="container mx-auto p-4">
      <NewsDetail news={news} />
    </div>
  );
}