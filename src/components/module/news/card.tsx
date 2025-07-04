"use client"

import React from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { News } from './newsIndex'

// Định nghĩa kiểu cho LawyerCategories với index signature


const badgeColorMap: Record<string, { bg: string; text: string }> = {
  INSURANCE: { bg: "#14b8a6", text: "#ffffff" }, // bg-teal-500
  CIVIL: { bg: "#3b82f6", text: "#ffffff" }, // bg-blue-500
  LAND: { bg: "#059669", text: "#ffffff" }, // bg-emerald-600
  BUSINESS: { bg: "#22c55e", text: "#ffffff" }, // bg-green-500
  TRANSPORTATION: { bg: "#f97316", text: "#ffffff" }, // bg-orange-500
  ADMINISTRATIVE: { bg: "#475569", text: "#ffffff" }, // bg-slate-600
  CRIMINAL: { bg: "#ef4444", text: "#ffffff" }, // bg-red-500
  FAMILY: { bg: "#ec4899", text: "#ffffff" }, // bg-pink-500
  LABOR: { bg: "#ca8a04", text: "#ffffff" }, // bg-yellow-600
  INTELLECTUAL_PROPERTY: { bg: "#9333ea", text: "#ffffff" }, // bg-purple-600
  INHERITANCE: { bg: "#d97706", text: "#ffffff" }, // bg-amber-600
  TAX: { bg: "#65a30d", text: "#ffffff" }, // bg-lime-600
  DEFAULT: { bg: "#6b7280", text: "#ffffff" }, // bg-gray-500
};

interface NewsCardProps {
  news: News
  index: number
  onClick?: (news: News) => void
  onDelete?: (id: string) => void
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
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
  }
  return labels[category as keyof typeof labels] || category
}

const NewsCard: React.FC<NewsCardProps> = ({ news, index, onClick, onDelete }) => {
  const thumbnail = news.image_url?.[0] || '/placeholder.svg'
  // Get colors from badgeColorMap, default to DEFAULT if category not found
  const { bg, text } = badgeColorMap[news.type] || badgeColorMap.DEFAULT

  return (
    <div
      className="break-inside-avoid animate-fade-in group cursor-pointer"
      style={{ animationDelay: `${index * 100}ms`, width:400}}
      onClick={() => onClick?.(news)}
    >
      <div className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
        {/* Image Container */}
        <div style={{ maxWidth: '400px', height: 'auto' }}>
  <div style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden' }} className="group">
    <img
      src={thumbnail}
      alt={news.mainTitle }
      style={{borderTopLeftRadius:20,borderTopRightRadius:20 ,width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
      className="group-hover:scale-110"
      loading="lazy"
    />
    {/* Overlay */}
    <div  className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
  style={{
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0,0,0,0))',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '1rem',
    animationDelay: '2000ms'
  }}>
     <p
      style={{
        fontSize: '0.875rem',
        color: 'rgba(255,255,255,0.85)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {news.content}
    </p>
    </div>
    {/* Category Badge */}
    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
      <span style={{ backgroundColor: bg, color: text, fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: '500' }}>
        {getCategoryLabel(news.type)}
      </span>
    </div>
    {/* Accept Status */}
    {news.isAccept ? <div  style={{ backgroundColor:'#D5FDDD',position: 'absolute', top: '12px', right: '12px', color: '#29A36A', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center' }} >
      Đã duyệt
    </div>:<div  style={{ position: 'absolute', top: '12px',color:' rgb(202, 138, 4)',backgroundColor:'rgb(254, 252, 232)' , right: '12px', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center' }}>
      Chưa duyệt
      </div>

    }
    
   


  </div>
  {/* Main Title */}
  <div style={{ padding: '8px 0', textAlign: 'center' }}>
    <p style={{ fontSize: '1rem', fontWeight: '500' }}>{news.mainTitle}</p>
  </div>
</div>
        {/* Content */}
        <div className="p-4">
       
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(news.createdAt).toLocaleDateString('vi-VN')}
            </div>
            {onDelete && (
             <Button
               onClick={(e) => {
                 e.stopPropagation(); // Ngăn sự kiện click lan sang thẻ cha
                 onDelete(news._id);
                 
               }}
               variant="destructive"
               size="sm"
               suppressHydrationWarning
             >
               Xóa
             </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsCard