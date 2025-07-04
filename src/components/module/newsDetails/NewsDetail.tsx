'use client';
import React from 'react';

interface NewsDetailData {
  _id: string;
  type: string;
  mainTitle: string;
  content: string;
  isAccept: boolean;
  image_url: string[];
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

interface NewsDetailProps {
  news: NewsDetailData;
}

export default function NewsDetail({ news }: NewsDetailProps) {
  // Safely handle properties with fallback values
  const title = news.mainTitle || 'Không có tiêu đề';
  const content = news.content || 'Không có nội dung';
  const createdAt = news.createdAt || 'Không có ngày tạo';
  const imageUrls = news.image_url || [];

  // Example: Strip HTML tags from content if it exists
  const formattedContent = content ? content.replace(/<[^>]+>/g, '') : content;

  // Example: Format createdAt to remove time portion if it exists
  const formattedDate = createdAt ? createdAt.replace(/T.*$/, '') : createdAt;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">Ngày tạo: {formattedDate}</p>
      <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: formattedContent }} />
      <div className="mt-4">
        {imageUrls.length > 0 ? (
          imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Hình ảnh tin tức ${index + 1}`}
              className="w-full h-auto mt-2"
            />
          ))
        ) : (
          <p>Không có hình ảnh</p>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-500">Loại: {news.type}</p>
      <p className="mt-1 text-sm text-gray-500">Trạng thái: {news.isAccept ? 'Đã duyệt' : 'Chưa duyệt'}</p>
    </div>
  );
}