
'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Filter, Search, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { addToast } from '@heroui/toast';
import { axiosInstance } from '@/fetchApi';
import '../../module/quanlivideochominh/index.css';

interface Video {
  _id: string;
  categories: string;
  user_id: string;
  video_url: string;
  thumnail_url: string; // Sửa typo nếu cần thành thumbnail_url
  star: number;
  description: string;
  accept: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  status: number;
  data: Video[];
}

const VideoAdminManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        let allVideos: Video[] = [];

        if (statusFilter === 'ALL') {
          // Lấy cả true và false khi statusFilter là ALL
          const [approvedResponse, pendingResponse] = await Promise.all([
            axiosInstance.get<ApiResponse>(`/video/getAllVideoAdmin/true`, {
              headers: { 'Content-Type': 'application/json' },
            }),
            axiosInstance.get<ApiResponse>(`/video/getAllVideoAdmin/false`, {
              headers: { 'Content-Type': 'application/json' },
            }),
          ]);
          if (approvedResponse.data.status === 200 && Array.isArray(approvedResponse.data.data)) {
            allVideos = [...allVideos, ...approvedResponse.data.data];
          }
          if (pendingResponse.data.status === 200 && Array.isArray(pendingResponse.data.data)) {
            allVideos = [...allVideos, ...pendingResponse.data.data];
          }
        } else {
          // Lấy theo trạng thái cụ thể (APPROVED -> true, PENDING -> false)
          const status = statusFilter === 'APPROVED' ? 'true' : 'false';
          const response = await axiosInstance.get<ApiResponse>(`/video/getAllVideoAdmin/${status}`, {
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.data.status === 200 && Array.isArray(response.data.data)) {
            allVideos = response.data.data;
          }
        }

        if (allVideos.length > 0) {
          setVideos(allVideos);
          setFilteredVideos(allVideos);
        } else {
          throw new Error('No videos found or invalid data format from API');
        }
      } catch (error) {
        console.log('Fetch error:', error);
        addToast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách video. Vui lòng thử lại sau.',
          variant: 'solid',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [statusFilter]);

  // Filter videos based on search, status, and category
  useEffect(() => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'APPROVED') {
        filtered = filtered.filter(video => video.accept === true);
      } else if (statusFilter === 'PENDING') {
        filtered = filtered.filter(video => video.accept === false);
      }
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(video => video.categories === categoryFilter);
    }

    setFilteredVideos(filtered);
  }, [searchTerm, statusFilter, categoryFilter, videos]);

  const getCategoryLabel = (category: string) => {
    const labels = {
      "INSURANCE": 'Bảo hiểm',
      "CORPORATE": 'Doanh nghiệp',
      "CRIMINAL": 'Hình sự',
      "INTELLECTUAL_PROPERTY": 'Sở hữu trí tuệ',
      "CIVIL": 'Dân sự',
      "TRANSPORTATION": 'Giao thông - Vận tải',
      "FAMILY": 'Hôn nhân gia đình',
      "INHERITANCE": 'Thừa kế - Di chúc',
      "LAND": 'Đất đai',
      "ADMINISTRATIVE": 'Hành chính',
      "LABOR": 'Lao động',
      "TAX": 'Thuế',
      
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getStatusColor = (accept: boolean) => {
    return accept ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50';
  };

  const getStatusText = (accept: boolean) => {
    return accept ? 'Đã duyệt' : 'Chờ duyệt';
  };

const handleAcceptOrRejectVideo = async (videoId: string, action: 'accept' | 'reject') => {
  try {
    const reason = action === 'accept' ? 'Đã được accept' : 'Đã bị reject';
    const response = await axiosInstance.patch(`/video/acceptOrReject/${videoId}`, {
      reason: reason,
      action: action,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(response);
    if (response.status === 200) {
      if (action === 'accept') {
        setVideos(prev => prev.map(video =>
          video._id === videoId ? { ...video, accept: true } : video
        ));
        addToast({
          title: 'Thành công',
          description: 'Video đã được duyệt',
        });
      } else if (action === 'reject') {
        setVideos(prev => prev.filter(video => video._id !== videoId));
        addToast({
          title: 'Thành công',
          description: 'Video đã bị từ chối và xóa khỏi hệ thống',
          variant: 'solid',
        });
      }
    }
  } catch (error) {
    console.error('Error accepting/rejecting video:', error);
    addToast({
      title: 'Lỗi',
      description: 'Không thể thực hiện hành động. Vui lòng thử lại sau.',
      variant: 'solid',
    });
  }
};


  const handleViewVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ paddingLeft: '20%', marginTop: 90 }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Video</h1>
        <p className="text-muted-foreground">Duyệt và quản lý video pháp luật của người dùng</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề hoặc người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                  <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Danh mục" />
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
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{videos.length}</div>
            <p className="text-xs text-muted-foreground">Tổng số video</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {videos.filter(v => !v.accept).length}
            </div>
            <p className="text-xs text-muted-foreground">Chờ duyệt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {videos.filter(v => v.accept).length}
            </div>
            <p className="text-xs text-muted-foreground">Đã duyệt</p>
          </CardContent>
        </Card>
      </div>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Video ({filteredVideos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVideos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.map((video) => (
                  <TableRow key={video._id}>
                    <TableCell>
                      <img
                        src={video.thumnail_url}
                        alt={video.description}
                        className="w-16 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewVideo(video)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate font-medium">
                        {video.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {getCategoryLabel(video.categories)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {video.user_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{video.star}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(video.accept)}`}>
                        {getStatusText(video.accept)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(video.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVideo(video)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!video.accept && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcceptOrRejectVideo(video._id, 'accept')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcceptOrRejectVideo(video._id, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy video nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Xem trước Video</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video">
                <video
                  src={selectedVideo.video_url}
                  controls
                  className="w-full h-full rounded-lg"
                  poster={selectedVideo.thumnail_url}
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{selectedVideo.description}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Danh mục: {getCategoryLabel(selectedVideo.categories)}</span>
                  <span>Người tạo: {selectedVideo.user_id}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedVideo.star}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  {!selectedVideo.accept && (
                    <>
                      <Button
                        onClick={() => {
                          handleAcceptOrRejectVideo(selectedVideo._id, 'accept');
                          setIsVideoModalOpen(false);
                        }}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Duyệt Video
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleAcceptOrRejectVideo(selectedVideo._id, 'reject');
                          setIsVideoModalOpen(false);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoAdminManager;
