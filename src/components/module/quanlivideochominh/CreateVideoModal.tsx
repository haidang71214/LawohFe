
import React, { useState } from 'react';
import { X, Upload, Video, Image } from 'lucide-react';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { axiosInstance } from '@/fetchApi'; // Giả sử bạn đã cấu hình axiosInstance

interface Video {
  categories: string;
  user_id: string;
  video_url: string;
  thumnail_url: string; // Đổi tên cho khớp với API
  star: number;
  description: string;
  accept: boolean;
}

export enum VideoLawCategory {
  INSURANCE = 'INSURANCE',
  CIVIL = 'CIVIL',
  LAND = 'LAND',
  CORPORATE = 'CORPORATE',
  TRANSPORTATION = 'TRANSPORTATION',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  CRIMINAL = 'CRIMINAL',
  FAMILY = 'FAMILY',
  LABOR = 'LABOR',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  INHERITANCE = 'INHERITANCE',
  TAX = 'TAX',
}

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (video: Video) => void;
}

const CreateVideoModal: React.FC<CreateVideoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [categories, setCategories] = useState<VideoLawCategory>(VideoLawCategory.CIVIL);
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('categories', categories);
    if (thumbnail) formData.append('thubnail', thumbnail);
    if (videoFile) formData.append('video', videoFile);
    formData.append('description', description);

    try {
      const response = await axiosInstance.post('/video/createNewVideo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newVideo: Video = {
        categories: response.data.categories || categories,
        user_id: 'current-user', // Cần lấy từ response nếu backend trả về
        video_url: response.data.video_url || (videoFile ? URL.createObjectURL(videoFile) : ''),
        thumnail_url: response.data.thumnail_url || (thumbnail ? URL.createObjectURL(thumbnail) : ''),
        star: response.data.star || 0, // Giả sử backend cung cấp hoặc dùng giá trị mặc định
        description: response.data.description || description,
        accept: response.data.accept || false,
      };

      onSubmit(newVideo);

      // Reset form
      setCategories(VideoLawCategory.CIVIL);
      setDescription('');
      setThumbnail(null);
      setVideoFile(null);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Error creating video:', err);
      setError('Failed to create video. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Tạo Video Mới</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
              suppressHydrationWarning
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-white/80 mt-2">Chia sẻ video tuyệt vời của bạn</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Danh mục</label>
            <Select value={categories} onValueChange={(value) => setCategories(value as VideoLawCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(VideoLawCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <label htmlFor="thumbnail" className="text-sm font-medium">Ảnh thu nhỏ</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-red-400 transition-colors">
              {thumbnail ? (
                <div className="space-y-2">
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-muted-foreground">{thumbnail.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Chọn ảnh thu nhỏ</p>
                </div>
              )}
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                className="hidden"
                suppressHydrationWarning
              />
              <Button
                type="button"
                variant="shadow"
                className="mt-2"
                onClick={() => document.getElementById('thumbnail')?.click()}
                suppressHydrationWarning
              >
                <Upload className="w-4 h-4 mr-2" />
                Chọn ảnh
              </Button>
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <label htmlFor="video" className="text-sm font-medium">Video</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-red-400 transition-colors">
              {videoFile ? (
                <div className="space-y-2">
                  <Video className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-sm text-muted-foreground">{videoFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Chọn file video</p>
                </div>
              )}
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
                suppressHydrationWarning
              />
              <Button
                type="button"
                variant="shadow"
                className="mt-2"
                onClick={() => document.getElementById('video')?.click()}
                suppressHydrationWarning
              >
                <Upload className="w-4 h-4 mr-2" />
                Chọn video
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Mô tả</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả cho video của bạn..."
              className="min-h-[100px] resize-none"
              required
              suppressHydrationWarning
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="shadow"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
              suppressHydrationWarning
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              disabled={loading || !description.trim() || !thumbnail || !videoFile}
              suppressHydrationWarning
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </div>
              ) : (
                'Tạo Video'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVideoModal;