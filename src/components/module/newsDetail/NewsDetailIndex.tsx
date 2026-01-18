'use client';

import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/fetchApi';
import NewsDetail from './NewsDetail';
import DetailNewsSlider from './DetailNewsSlider';
import { ArrowLeft, RotateCw, Newspaper, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useGetMeQuery } from '@/store/queries/auth';
import webStorageClient from '@/utils/webStorageClient';

interface DetailNewsProps {
  id: string;
}

export default function NewsDetailIndex({ id }: DetailNewsProps) {
  const [news, setNews] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current user info
  const { data: meResponse } = useGetMeQuery();
  const [clientUser, setClientUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientUser(webStorageClient.getUser());
    }
  }, []);

  const currentUser = meResponse?.data || clientUser;

  const fetchNewsDetail = async () => {
    if (!id || typeof id !== 'string') {
      setError('ID bài viết không hợp lệ.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/news/${id}`);
      const data = response.data?.data || response.data?.response || response.data;
      if (!data || !data._id) {
        throw new Error('Dữ liệu bài viết không tồn tại hoặc đã bị gỡ.');
      }

      setNews(data);
    } catch (err: any) {
      console.error('Error fetching news detail:', err);
      setError(err?.response?.data?.message || 'Không thể tải chi tiết bài viết.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] dark:bg-[#151311] text-stone-900 dark:text-stone-100 flex flex-col font-sans">
        <section className="pt-10 pb-8 border-b-2 border-stone-800 dark:border-[#96592e] bg-stone-100/90 dark:bg-[#1e1915]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="h-6 w-48 bg-stone-300 dark:bg-stone-700 animate-pulse" />
          </div>
        </section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full flex items-center justify-center">
          <div className="p-8 text-center text-xs font-mono text-stone-500 flex items-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[#6d4123] dark:text-[#df9b63]" />
            <span>Đang tải nội dung công báo pháp lý...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] dark:bg-[#151311] text-stone-900 dark:text-stone-100 flex flex-col font-sans">
        <section className="pt-10 pb-8 border-b-2 border-stone-800 dark:border-[#96592e] bg-stone-100/90 dark:bg-[#1e1915]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Link
              href="/newsPage"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#6d4123] dark:text-[#df9b63] font-bold uppercase hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang công báo</span>
            </Link>
          </div>
        </section>
        <div className="max-w-xl mx-auto px-4 py-16 w-full text-center">
          <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1c1814] shadow-[6px_6px_0px_#6d4123] dark:shadow-[6px_6px_0px_#df9b63] p-8 space-y-4">
            <Newspaper className="w-12 h-12 mx-auto text-stone-400 opacity-60" />
            <h3 className="font-serif font-black text-lg text-stone-900 dark:text-stone-100">
              Không tìm thấy bài viết
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
              {error || 'Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc chưa được công khai.'}
            </p>
            <div className="pt-2">
              <Link
                href="/newsPage"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-stone-900 bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_#000]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Xem danh sách bản tin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4ed] dark:bg-[#151311] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Editorial Top Masthead Bar */}
      <section className="pt-8 pb-6 border-b-2 border-stone-800 dark:border-[#96592e] bg-stone-100/90 dark:bg-[#1e1915]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 border-b border-stone-300 dark:border-stone-700/60 pb-2">
            <Link
              href="/newsPage"
              className="inline-flex items-center gap-1.5 font-bold text-[#6d4123] dark:text-[#df9b63] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← BẢN TIN CÔNG BÁO PHÁP LUẬT</span>
            </Link>
            <span className="hidden sm:inline">LAWOH LEGAL GAZETTE • VOL. 2026</span>
            <span className="font-bold">CHI TIẾT ÁN LỆ</span>
          </div>
        </div>
      </section>

      {/* Main Gazette Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Column (8 Cols) */}
          <div className="lg:col-span-8">
            <NewsDetail
              news={news}
              currentUser={currentUser}
              onRefresh={fetchNewsDetail}
            />
          </div>

          {/* Right Sidebar: Author & Related Articles (4 Cols) */}
          <div className="lg:col-span-4 sticky top-6">
            <DetailNewsSlider
              type={news.type}
              authorInfo={news.userId || news.author_id}
              currentArticleId={news._id || id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}