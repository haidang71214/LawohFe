'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import VideoCard from './VideoCard';
import CreateVideoModal from './CreateVideoModal';
import VideoPreviewModal from './VideoPreviewModal';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { axiosInstance } from '@/fetchApi';
import './index.css';
import { addToast } from '@heroui/toast';

interface Video {
  _id: string;
  categories: string;
  user_id: string;
  video_url: string;
  thumnail_url: string;
  star: number;
  description: string;
  accept: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const VideoManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; id: string } | null>(null);
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/video/getPrivateVideo');
        console.log('API Response:', response.data);
        const fetchedVideos = response.data.data || [] || null ;
        setVideos(fetchedVideos);
        setFilteredVideos(fetchedVideos);
      } catch (err) {
        console.log('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    const filtered = videos.filter((video) =>
      video.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVideos(filtered);
  }, [searchTerm, videos]);

  const handleDeleteVideo = async (videoId: string) => {
    const userToken = localStorage.getItem('LOGIN_USER');
    if (!userToken) {
      addToast({
        title: 'LỖI',
        description: 'Thiếu xác thực để xóa',
        variant: 'solid',
      });
      return;
    }

    try {
      await axiosInstance.delete(`/video/${videoId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const updatedVideos = videos.filter((video) => video._id !== videoId);
      setVideos(updatedVideos);
      setFilteredVideos(updatedVideos);
      addToast({
        title: 'Thành công',
        description: 'Video đã được xóa thành công!',
        variant: 'solid',
      });
    } catch (error) {
      console.error('Lỗi khi xóa video:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể xóa video. Vui lòng thử lại.',
        variant: 'solid',
      });
    }
  };

  const handleCreateVideo = (newVideo: Omit<Video, '_id' | 'createdAt' | 'updatedAt' | '__v'>) => {
    const video: Video = {
      ...newVideo,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };
    setVideos([video, ...videos]);
    setFilteredVideos([video, ...filteredVideos]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50" style={{ marginTop: 70 }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
                  style={{ marginRight: 50 }}
                />
                <Input
                  type="text"
                  placeholder="Tìm kiếm video..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white/60 border-border/60 focus:bg-white transition-colors"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-black rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              suppressHydrationWarning
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo Video
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý video</h2>
          <p className="text-muted-foreground">Khám phá và quản lý bộ sưu tập video của bạn</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6">
            {filteredVideos.map((video, index) => (
              <VideoCard
                key={video._id}
                video={video}
                index={index}
                onDelete={handleDeleteVideo}
                onPlay={(url, id) => setSelectedVideo({ url, id })}
              />
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && !loading  && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground">Không có video</h3>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateVideoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVideo}
      />

      {selectedVideo && (
        <VideoPreviewModal
          videoUrl={selectedVideo.url}
          video_id={selectedVideo.id}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default VideoManager;