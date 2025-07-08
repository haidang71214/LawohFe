'use client'

import React, { useEffect, useState } from 'react'
import { Clock, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { axiosInstance } from '@/fetchApi'
import { LOGIN_USER } from '@/constant/enum'

export interface News {
  _id: string
  type: string
  mainTitle: string
  content: string
  image_url: string[]
  userId: string | { name: string } | undefined // Updated to handle both string and object
  createdAt: Date
  isAccept: boolean
}

interface NewsCardProps {
  news: News
  index: number
  onClick?: (news: News) => void
  onDelete?: (id: string) => void
}

const badgeColorMap: Record<string, { bg: string; text: string }> = {
  INSURANCE: { bg: '#14b8a6', text: '#ffffff' }, // bg-teal-500
  CIVIL: { bg: '#3b82f6', text: '#ffffff' }, // bg-blue-500
  LAND: { bg: '#059669', text: '#ffffff' }, // bg-emerald-600
  BUSINESS: { bg: '#22c55e', text: '#ffffff' }, // bg-green-500
  TRANSPORTATION: { bg: '#f97316', text: '#ffffff' }, // bg-orange-500
  ADMINISTRATIVE: { bg: '#475569', text: '#ffffff' }, // bg-slate-600
  CRIMINAL: { bg: '#ef4444', text: '#ffffff' }, // bg-red-500
  FAMILY: { bg: '#ec4899', text: '#ffffff' }, // bg-pink-500
  LABOR: { bg: '#ca8a04', text: '#ffffff' }, // bg-yellow-600
  INTELLECTUAL_PROPERTY: { bg: '#9333ea', text: '#ffffff' }, // bg-purple-600
  INHERITANCE: { bg: '#d97706', text: '#ffffff' }, // bg-amber-600
  TAX: { bg: '#65a30d', text: '#ffffff' }, // bg-lime-600
  DEFAULT: { bg: '#6b7280', text: '#ffffff' }, // bg-gray-500
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
  const [isLawyer, setIsLawyer] = useState(false)
  const [isHehe,setIsHehe] = useState(false)
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem(LOGIN_USER)
      if (token) {
        try {
          const response = await axiosInstance.get('/auth/getMySelf', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const userData = response.data.data || response.data
          const idAdmin = userData.role === 'lawyer'
          const isHehe = userData.role === 'admin'
          setIsLawyer(idAdmin)
          setIsHehe(isHehe)
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }

    fetchUserData()
  }, [])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const thumbnail = news.image_url?.[0] || 'https://via.placeholder.com/400'
  const { bg, text } = badgeColorMap[news.type] || badgeColorMap.DEFAULT
  const categoryLabel = getCategoryLabel(news.type)
  const excerpt = news.content.length > 100 ? news.content.substring(0, 100) + '...' : news.content
  // Handle both string and object cases for userId
  const author = typeof news.userId === 'string' ? news.userId : news.userId?.name || 'Ẩn danh'
  const authorInitial = author ? author.charAt(0) : '?' // Safe fallback for avatar
  const readTime = '5 phút' // Placeholder since readTime is not in News interface

  const cardStyle: React.CSSProperties = {
    width: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
  }

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '300px',
    overflow: 'hidden',
  }

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  }

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  }

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: bg,
    color: text,
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    transition: 'all 0.2s ease',
  }

  const statusBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
  }

  const headerStyle: React.CSSProperties = {
    padding: '1.5rem 1.5rem 0.5rem 1.5rem',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    lineHeight: '1.4',
    color: '#111827',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    transition: 'color 0.2s ease',
  }

  const contentStyle: React.CSSProperties = {
    padding: '0 1.5rem 1.5rem 1.5rem',
  }

  const excerptStyle: React.CSSProperties = {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    lineHeight: '1.6',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }

  const metaContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#6b7280',
  }

  const authorContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  }

  const authorInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  }

  const avatarStyle: React.CSSProperties = {
    height: '1.5rem',
    width: '1.5rem',
    marginRight: '0.5rem',
    borderRadius: '50%',
    background: 'linear-gradient(to right, #3b82f6, #9333ea)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  }

  const timeContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  }

  const timeItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  }

  const footerStyle: React.CSSProperties = {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
  }

  const readMoreContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  }

  const readMoreTextStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#9ca3af',
  }

  const progressBarStyle: React.CSSProperties = {
    width: '1.5rem',
    height: '0.125rem',
    background: 'linear-gradient(to right, #3b82f6, #9333ea)',
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  }

  return (
    <div
      className="break-inside-avoid animate-fade-in"
      style={{ ...cardStyle, animationDelay: `${index * 100}ms` }}
      onClick={() => onClick?.(news)}
      onMouseEnter={(e) => {
        const card = e.currentTarget
        card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        card.style.transform = 'translateY(-8px)'
        const image = card.querySelector('img') as HTMLImageElement
        if (image) image.style.transform = 'scale(1.1)'
        const overlay = card.querySelector('[data-overlay]') as HTMLElement
        if (overlay) overlay.style.opacity = '1'
        const title = card.querySelector('[data-title]') as HTMLElement
        if (title) title.style.color = '#3b82f6'
        const progressBar = card.querySelector('[data-progress]') as HTMLElement
        if (progressBar) progressBar.style.transform = 'scaleX(1)'
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget
        card.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        card.style.transform = 'translateY(0)'
        const image = card.querySelector('img') as HTMLImageElement
        if (image) image.style.transform = 'scale(1)'
        const overlay = card.querySelector('[data-overlay]') as HTMLElement
        if (overlay) overlay.style.opacity = '0'
        const title = card.querySelector('[data-title]') as HTMLElement
        if (title) title.style.color = '#111827'
        const progressBar = card.querySelector('[data-progress]') as HTMLElement
        if (progressBar) progressBar.style.transform = 'scaleX(0)'
      }}
    >
      <div style={imageContainerStyle}>
        <img src={thumbnail} alt={news.mainTitle} style={imageStyle} loading="lazy" />
        <div data-overlay style={overlayStyle} />
        <div style={badgeStyle}>{categoryLabel}</div>
        <div
          style={{
            ...statusBadgeStyle,
            backgroundColor: news.isAccept ? '#D5FDDD' : 'rgb(254, 252, 232)',
            color: news.isAccept ? '#29A36A' : 'rgb(202, 138, 4)',
          }}
        >
          {news.isAccept ? 'Đã duyệt' : isLawyer ? 'Đang chờ duyệt' : 'Chưa duyệt'}
        </div>
      </div>

      <div style={headerStyle}>
        <h3 data-title style={titleStyle}>
          {news.mainTitle}
        </h3>
      </div>

      <div style={contentStyle}>
        <p style={excerptStyle}>{excerpt}</p>

        <div style={metaContainerStyle}>
          <div style={authorContainerStyle}>
            <div style={authorInfoStyle}>
              <div style={avatarStyle}>{authorInitial}</div>
              <span style={timeItemStyle}>
                <User style={{ height: '0.75rem', width: '0.75rem', marginRight: '0.25rem' }} />
                {author}
              </span>
            </div>
          </div>

          <div style={timeContainerStyle}>
            <span style={timeItemStyle}>
              <Calendar style={{ height: '0.75rem', width: '0.75rem', marginRight: '0.25rem' }} />
              {formatDate(news.createdAt)}
            </span>
            <span style={timeItemStyle}>
              <Clock style={{ height: '0.75rem', width: '0.75rem', marginRight: '0.25rem' }} />
              {readTime}
            </span>
          </div>
        </div>

        <div style={footerStyle}>
          <div style={readMoreContainerStyle}>
            <span style={readMoreTextStyle}>Nhấn để đọc thêm</span>
            <div data-progress style={progressBarStyle} />
            {isHehe && onDelete && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(news._id)
                }}
                variant="destructive"
                size="sm"
                style={{ backgroundColor: '#DA3644', color: 'white' }}
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