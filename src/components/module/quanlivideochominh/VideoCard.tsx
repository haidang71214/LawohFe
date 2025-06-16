import React from 'react';
import { Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface VideoCardProps {
  video: Video;
  index: number;
  onDelete: (videoId: string) => void; // Add onDelete
  onPlay: (videoUrl: string, videoId: string) => void; // Update to accept videoId
}

const VideoCard: React.FC<VideoCardProps> = ({ video, index, onDelete, onPlay }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      INSURANCE: 'bg-teal-500', // Trust, protection
    CIVIL: 'bg-blue-500', // Justice, stability (as provided)
      LAND: 'bg-emerald-600', // Earth, property
      CORPORATE: 'bg-indigo-600', // Professionalism
      TRANSPORTATION: 'bg-orange-500', // Energy, movement
      ADMINISTRATIVE: 'bg-slate-600', // Neutrality, bureaucracy
      CRIMINAL: 'bg-red-500', // Urgency, danger (as provided)
      FAMILY: 'bg-pink-500', // Warmth, relationships (as provided)
      LABOR: 'bg-yellow-600', // Effort, work
      INTELLECTUAL_PROPERTY: 'bg-purple-600', // Creativity
      INHERITANCE: 'bg-amber-600', // Legacy
      TAX: 'bg-lime-600', // Finance
      BUSINESS: 'bg-green-500', // Growth, commerce (as provided)
      DEFAULT: 'bg-gray-500', // Fallback (as provided)'
    };
    return colors[category as keyof typeof colors] || colors.DEFAULT;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      INSURANCE: 'Bảo hiểm',
      CIVIL: 'Dân sự',
      LAND: 'Đất đai',
      CORPORATE: 'Doanh nghiệp',
      TRANSPORTATION: 'Giao thông',
      ADMINISTRATIVE: 'Hành chính',
      CRIMINAL: 'Hình sự',
      FAMILY: 'Gia đình',
      LABOR: 'Lao động',
      INTELLECTUAL_PROPERTY: 'Sở hữu trí tuệ',
      INHERITANCE: 'Thừa kế',
      TAX: 'Thuế',
      BUSINESS: 'Kinh doanh',
      DEFAULT: 'Mặc định',
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div
      className="break-inside-avoid mb-6 animate-fade-in group cursor-pointer"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => onPlay(video.video_url, video._id)}
    >
      <div className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={video.thumnail_url}
            alt={video.description}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(video.video_url, video._id);
              }}
              className="bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-200"
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`${getCategoryColor(video.categories)} text-white text-xs px-2 py-1 rounded-full font-medium`}>
              {getCategoryLabel(video.categories)}
            </span>
          </div>
          {/* Star Rating */}
          <div className="absolute top-3 right-3 flex items-center bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {video.star}
          </div>
        </div>
        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2 text-sm leading-5">
            {video.description}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {new Date(video.createdAt).toLocaleDateString('vi-VN')}
            </span>
            <Button
  onClick={(e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan sang thẻ cha
    onDelete(video._id);
    
  }}
  variant="destructive"
  size="sm"
  suppressHydrationWarning
>
  Xóa
</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;