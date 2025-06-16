'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Play, Filter, Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VideoCard from "./VideoCard";
import '../../components/module/quanlivideochominh/index.css';
import { addToast } from "@heroui/toast";
import { axiosInstance } from "@/fetchApi";
import VideoPreviewModal from "@/components/module/quanlivideochominh/VideoPreviewModal";
import CreateVideoModal from "@/components/module/quanlivideochominh/CreateVideoModal";

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

interface ApiResponse {
  item: Video[];
  total: number;
  page: number;
  limit: number;
}

const VideoManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [type, setType] = useState("ALL");
  const [total, setTotal] = useState(0);
 const [selectedVideo, setSelectedVideo] = useState<{ url: string; id: string } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter(); // Initialize router for navigation

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/video/getvideoPublic?page=${page}&limit=10&type=${type === "ALL" ? "" : type}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data: ApiResponse = response.data;
        console.log("API Response:", data);
        if (data.item && Array.isArray(data.item)) {
          setVideos(data.item);
          setFilteredVideos(data.item);
          setTotal(data.total || 0);
        } else {
          throw new Error("Invalid data format from API");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        addToast({
          title: "Lỗi",
          description: "Không thể tải danh sách video. Vui lòng thử lại sau.",
          variant: "solid",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page, type]);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < Math.ceil(total / 10)) setPage(page + 1);
  };

  useEffect(() => {
    let filtered = videos;
    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.categories.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredVideos(filtered);
  }, [searchTerm, videos]);

  const handleCreateVideo = (newVideo: Omit<Video, '_id' | 'createdAt' | 'updatedAt' | '__v'>) => {
    const video: Video = {
      ...newVideo,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0
    };
    setVideos([video, ...videos]);
    setFilteredVideos([video, ...filteredVideos]);
  };

  // Handle "Tạo Video" button click
  const handleOpenCreateModal = () => {
    const user = localStorage.getItem("LOGIN_USER");
    if (!user) {
      addToast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn phải đăng nhập trước khi tạo video.",
        variant: "solid",
      });
      router.push("/login"); // Redirect to login page
      return;
    }
    setIsCreateModalOpen(true); // Open modal if user is logged in
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-4 py-8" style={{marginTop:70}}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="notranslate text-3xl font-bold text-foreground">Video Pháp Luật</h1>
          <p className="text-muted-foreground">Khám phá kiến thức pháp luật qua video</p>
        </div>
        <Button
          onClick={handleOpenCreateModal} // Use new handler
          className="bg-red-500 hover:bg-red-600 text-black rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          suppressHydrationWarning
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Video
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm video..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            suppressHydrationWarning
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="CIVIL">Dân sự</SelectItem>
              <SelectItem value="CRIMINAL">Hình sự</SelectItem>
              <SelectItem value="FAMILY">Gia đình</SelectItem>
              <SelectItem value="BUSINESS">Kinh doanh</SelectItem>
              <SelectItem value="INSURANCE">Bảo hiểm</SelectItem>
              <SelectItem value="LAND">Đất đai</SelectItem>
              <SelectItem value="CORPORATE">Doanh nghiệp</SelectItem>
              <SelectItem value="TRANSPORTATION">Giao thông</SelectItem>
              <SelectItem value="ADMINISTRATIVE">Hành chính</SelectItem>
              <SelectItem value="LABOR">Lao động</SelectItem>
              <SelectItem value="INTELLECTUAL_PROPERTY">Sở hữu trí tuệ</SelectItem>
              <SelectItem value="INHERITANCE">Thừa kế</SelectItem>
              <SelectItem value="TAX">Thuế</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Hiển thị {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
      </div>
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePreviousPage}
          disabled={page === 1 || loading}
          className="bg-gray-200 hover:bg-gray-300"
          suppressHydrationWarning
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span>Trang {page} / {Math.ceil(total / 10)}</span>
        <Button
          onClick={handleNextPage}
          disabled={page === Math.ceil(total / 10) || loading}
          className="bg-gray-200 hover:bg-gray-300"
          suppressHydrationWarning
        >
          <ChevronRight className="w-4 h-.Advance to the next page4" />
        </Button>
      </div>

      {filteredVideos.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-0">
          {filteredVideos.map((video, index) => (
            <VideoCard
              key={video._id}
              video={video}
              index={index}
              onPlay={(url, id) => setSelectedVideo({ url, id })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Play className="w-12 h-12 text-muted-foreground" suppressHydrationWarning/>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Không tìm thấy video</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || type !== "ALL"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Không có video nào để hiển thị"}
          </p>
        </div>
      )}
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