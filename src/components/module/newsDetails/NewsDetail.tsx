'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { LOGIN_USER } from '@/constant/enum';
import { axiosInstance } from '@/fetchApi';
import TextToSpeech from '@/components/common/TextToSpeech';
import { addToast } from '@heroui/react';

interface NewsDetailData {
  _id: string;
  type: string;
  mainTitle: string;
  content: string;
  isAccept: boolean;
  image_url: string[];
  createdAt?: string;
  updatedAt?: string;
  userId?: {
    name: string;
  };
}

interface NewsDetailProps {
  news: NewsDetailData;
}

export default function NewsDetail({ news }: NewsDetailProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccept, setIsAccept] = useState(news.isAccept);
  const [isApproving, setIsApproving] = useState(false); // Loading state for approve button
  const title = news.mainTitle || 'Không có tiêu đề';
  const content = news.content || 'Không có nội dung';
  const createdAt = news.createdAt || '';
  const imageUrls = news.image_url || [];
  const userNameAuthor = news.userId?.name || 'Không rõ tác giả';

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem(LOGIN_USER);
      if (token) {
        try {
          const response = await axiosInstance.get('/auth/getMySelf', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = response.data.data || response.data;
          setIsAdmin(userData.role === 'admin');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleApproveNews = async () => {
    setIsApproving(true);
    try {
      setIsAccept(true); // Optimistic update
      await axiosInstance.patch(`/news/AcceptNews/${news._id}`);
      addToast({
        title: 'Duyệt thành công',
        variant: 'solid',
        color: 'success',
      });
    } catch (error) {
      setIsAccept(false); // Revert on failure
      console.error('Error approving news:', error);
      addToast({
        title: 'Duyệt thất bại',
        variant: 'solid',
        color: 'danger',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const formattedDate = createdAt
    ? format(new Date(createdAt), 'dd/MM/yyyy')
    : 'Không có ngày tạo';

  const renderContentWithImages = () => {
    const usedImageIndices = new Set<number>();
    const parts = content.split(/(\[image:\d+\])/);

    const renderedContent = parts.map((part, index) => {
      const match = part.match(/\[image:(\d+)\]/);
      if (match) {
        const imageIndex = parseInt(match[1]) - 1;
        if (imageIndex >= 0 && imageIndex < imageUrls.length) {
          usedImageIndices.add(imageIndex);
          return (
            <img
              key={`image-${index}`}
              src={imageUrls[imageIndex]}
              alt={`Hình ảnh tin tức ${imageIndex + 1}`}
              className="w-full max-w-full h-auto object-cover rounded-lg shadow-md"
            />
          );
        }
        return null;
      }

      if (/<[a-z][\s\S]*>/i.test(part)) {
        return (
          <div
            key={`html-${index}`}
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      }

      return part.split('\n').map((line, i) =>
        line.trim() ? (
          <p key={`text-${index}-${i}`} className="text-gray-800 leading-relaxed mb-2">
            {line.trim()}
          </p>
        ) : null
      );
    });

    const supplementalImages = imageUrls.filter((_, index) => !usedImageIndices.has(index));

    return { renderedContent, supplementalImages };
  };

  const { renderedContent, supplementalImages } = renderContentWithImages();
  const rawContent = news.content || 'Không có nội dung';
  const cleanContent = rawContent.replace(/\[image:\d+\]/g, '');

  return (
    <div style={{ width: '60%', margin: '0 auto', paddingLeft: 50 }}>
      <h1 style={{ fontSize: '35px', textAlign: 'center' }} className="text-3xl font-bold mb-2">
        {title}
      </h1>
      <p className="text-sm text-gray-500 mb-4 text-center">Ngày tạo: {formattedDate}</p>
      <TextToSpeech text={cleanContent} />
      <div className="space-y-4">{renderedContent}</div>
      {supplementalImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Hình ảnh bổ sung</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {supplementalImages.map((url, index) => (
              <img
                key={`supplemental-${index}`}
                src={url}
                alt={`Hình ảnh bổ sung ${index + 1}`}
                className="w-full max-w-full h-auto object-cover rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
      )}

      {imageUrls.length === 0 && (
        <p className="mt-4 text-sm text-gray-600">Không có hình ảnh</p>
      )}

      {isAdmin ? (
        <div>
          <div className="mt-8 text-right pr-4" style={{ paddingLeft: 20 }}>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Tác giả:</span> {userNameAuthor}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Ngày cập nhật:</span> {formattedDate}
            </p>
          </div>
          <div className="mt-2">
            Trạng thái:{' '}
            <span
              style={{
                backgroundColor: isAccept ? '#1d4ed8' : 'red',
                color: 'white',
                width: '135px',
                display: 'inline-block',
                textAlign: 'center',
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              {isAccept ? 'Đã duyệt' : 'Chưa duyệt'}
            </span>
          </div>
          {!isAccept && (
            <div className="mt-4">
              <button
                style={{
                  backgroundColor: isApproving ? '#6b7280' : '#2563eb',
                  color: '#fff',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: isApproving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => {
                  if (!isApproving) e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  if (!isApproving) e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onClick={handleApproveNews}
                disabled={isApproving}
              >
                {isApproving ? 'Đang duyệt...' : 'Duyệt'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 text-right pr-4" style={{ paddingLeft: 20 }}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Tác giả:</span> {userNameAuthor}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Ngày cập nhật:</span> {formattedDate}
          </p>
        </div>
      )}
    </div>
  );
}