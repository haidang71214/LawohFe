'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, CornerDownRight, MessageSquare, RotateCw } from 'lucide-react';
import { axiosInstance } from '@/fetchApi';
import webStorageClient from '@/utils/webStorageClient';
import toast from '@/lib/toast';
import { useLanguage } from '@/i18n/LanguageContext';

interface Comment {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    avartar_url?: string;
    avatar_url?: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  rating?: number;
  parent_comment_id?: string | null;
}

interface User {
  _id: string;
  name: string;
}

interface VideoPreviewModalProps {
  videoUrl: string | null;
  onClose: () => void;
  video_id?: string | null;
  videoId?: string | null;
  isOpen?: boolean;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ videoUrl, onClose, video_id, videoId }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const activeVideoId = videoId || video_id;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      // 1. Get cached user from localStorage first
      const localUser = webStorageClient.getUser();
      if (localUser) {
        setUser({
          _id: localUser._id || localUser.id || 'me',
          name: localUser.name || localUser.fullname || 'User',
        });
      }

      const token = webStorageClient.getToken();
      if (!token) return;

      try {
        const res = await axiosInstance.get('/auth/me');
        const userData = res?.data?.data || res?.data;
        if (userData) {
          setUser({
            _id: userData._id || userData.id || 'me',
            name: userData.name || userData.fullname || 'User',
          });
        }
      } catch (error) {
        // Fallback gracefully without breaking component
        console.warn('Lỗi khi lấy thông tin người dùng từ /auth/me:', error);
      }
    };

    fetchUser();
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!activeVideoId) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/video/${activeVideoId}`);
        const videoData = res.data?.data || res.data?.response || res.data;
        setComments(videoData?.comment || videoData?.comments || []);
      } catch (error) {
        console.log('Lỗi khi lấy bình luận:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [activeVideoId]);

  // Handle main comment submission
  const handleSubmitComment = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await axiosInstance.post(`/comment/video/${id}`, {
        content: newComment,
      });

      const resData = response.data?.data || response.data;
      const newCommentData: Comment = {
        _id: resData._id || Date.now().toString(),
        user_id: (resData.user_id as any) || user || { _id: 'me', name: 'Tôi' },
        content: newComment,
        createdAt: resData.createdAt || new Date().toISOString(),
        parent_comment_id: null,
      };

      setComments([newCommentData, ...comments]);
      setNewComment('');
      toast.success(isEn ? 'Comment posted' : 'Đã đăng ý kiến thảo luận');
    } catch (error) {
      console.error('Lỗi khi gửi bình luận:', error);
      toast.error(isEn ? 'Failed to post comment' : 'Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || !activeVideoId) return;

    try {
      setSubmitting(true);
      const response = await axiosInstance.post(`/comment/video/${activeVideoId}`, {
        content: replyContent,
        parent_comment_id: parentId,
      });

      const resData = response.data?.data || response.data;
      const newReplyData: Comment = {
        _id: resData._id || Date.now().toString(),
        user_id: (resData.user_id as any) || user || { _id: 'me', name: 'Tôi' },
        content: replyContent,
        createdAt: resData.createdAt || new Date().toISOString(),
        parent_comment_id: parentId,
      };

      setComments([newReplyData, ...comments]);
      setReplyContent('');
      setReplyTo(null);
      toast.success(isEn ? 'Reply posted' : 'Đã gửi phản hồi');
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      toast.error(isEn ? 'Failed to reply' : 'Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };
  console.log(comments)
  const getNestedComments = () => {
    const parentComments = comments.filter((comment) => !comment.parent_comment_id);
    
   const replies = comments.filter((comment) => comment.parent_comment_id);

    const nestedComments: Comment[][] = [];
    parentComments.forEach((parent) => {
      const commentGroup = [parent];
      const childReplies = replies.filter((reply) => reply.parent_comment_id === parent._id);
      commentGroup.push(...childReplies);
      nestedComments.push(commentGroup);
    });

    return nestedComments;
  };

  if (!videoUrl || !activeVideoId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/85 backdrop-blur-xs"
        onClick={onClose}
      ></div>

      {/* Retro Modal Dialog */}
      <div className="relative w-full max-w-6xl max-h-[90vh] border-2 border-stone-800 dark:border-[#f59e0b] bg-[#faf6ee] dark:bg-[#1d1813] shadow-[8px_8px_0px_#b45309] overflow-hidden flex flex-col lg:flex-row text-xs">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 border border-stone-800 bg-stone-900 text-white hover:bg-stone-800 shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Video Player Column */}
        <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[520px] border-b-2 lg:border-b-0 lg:border-r-2 border-stone-800">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full max-h-[65vh] lg:max-h-[90vh] object-contain"
          />
        </div>

        {/* Comments Column */}
        <div className="w-full lg:w-96 bg-[#faf6ee] dark:bg-[#1d1813] flex flex-col h-[360px] lg:h-auto">
          {/* Comments Header */}
          <div className="p-4 border-b-2 border-stone-800 dark:border-stone-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#b45309] dark:text-[#f59e0b]" />
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                {isEn ? 'Discussion & Opinions Log' : 'Sổ Ý Kiến & Thảo Luận'}
              </h3>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-stone-800 bg-stone-200 dark:bg-stone-800">
              {comments.length} {isEn ? 'ENTRIES' : 'ĐÓNG GÓP'}
            </span>
          </div>

          {/* Comments Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="py-12 text-center font-mono text-stone-500">
                <RotateCw className="w-4 h-4 animate-spin mx-auto text-[#b45309] mb-1" />
                <span>{isEn ? 'Retrieving discussion...' : 'Đang truy xuất ý kiến...'}</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="py-12 text-center text-stone-500 space-y-1">
                <p className="font-mono text-xs">{isEn ? 'No discussion entries yet.' : 'Chưa có ý kiến thảo luận nào.'}</p>
                <p className="text-[10px]">{isEn ? 'Be the first to share your opinion!' : 'Hãy là người đầu tiên để lại ý kiến!'}</p>
              </div>
            ) : (
              getNestedComments().map((group, gIdx) => {
                const parent = group[0];
                const replies = group.slice(1);

                return (
                  <div key={parent._id || gIdx} className="space-y-1.5">
                    {/* Parent Comment */}
                    <div className="p-3 border border-stone-800 dark:border-stone-700 bg-white dark:bg-[#14100c] space-y-1">
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-bold text-[#b45309] dark:text-[#f59e0b]">
                          {parent?.user_id?.name || (isEn ? 'Client / Lawyer' : 'Đương sự')}
                        </span>
                        <span className="text-stone-500">
                          {parent.createdAt ? new Date(parent.createdAt).toLocaleDateString(isEn ? 'en-US' : 'vi-VN') : ''}
                        </span>
                      </div>

                      <p className="text-stone-800 dark:text-stone-200 text-xs leading-relaxed font-sans">
                        {parent.content}
                      </p>

                      <div className="pt-0.5">
                        <button
                          onClick={() => setReplyTo(replyTo === parent._id ? null : parent._id)}
                          className="font-mono text-[10px] text-stone-500 hover:text-[#b45309] underline"
                        >
                          {replyTo === parent._id ? (isEn ? 'Cancel' : 'Hủy') : (isEn ? 'Reply' : 'Phản hồi')}
                        </button>
                      </div>
                    </div>

                    {/* Replies */}
                    {replies.map((reply) => (
                      <div key={reply._id} className="ml-5 p-2.5 border border-stone-300 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 space-y-0.5">
                        <div className="flex items-center justify-between font-mono text-[9px]">
                          <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-[#b45309]" />
                            {reply?.user_id?.name || (isEn ? 'User' : 'Người dùng')}
                          </span>
                          <span className="text-stone-500">
                            {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString(isEn ? 'en-US' : 'vi-VN') : ''}
                          </span>
                        </div>
                        <p className="text-stone-700 dark:text-stone-300 text-[11px] pl-4 font-sans">{reply.content}</p>
                      </div>
                    ))}

                    {/* Reply Input Box */}
                    {replyTo === parent._id && (
                      <form
                        onSubmit={(e) => handleSubmitReply(e, parent._id)}
                        className="ml-5 flex items-center gap-1"
                      >
                        <input
                          type="text"
                          required
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={isEn ? 'Enter reply...' : 'Nhập phản hồi...'}
                          className="flex-1 px-2.5 py-1 border border-stone-800 dark:border-stone-700 bg-white dark:bg-[#14100c] text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-2.5 py-1 border border-stone-800 bg-[#b45309] text-white font-mono text-xs uppercase"
                        >
                          {isEn ? 'Send' : 'Gửi'}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* New Comment Input */}
          <form
            onSubmit={(e) => handleSubmitComment(e, activeVideoId)}
            className="p-3 border-t-2 border-stone-800 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 flex items-center gap-2"
          >
            <input
              type="text"
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isEn ? 'Write your opinion/comment...' : 'Ghi ý kiến thảo luận...'}
              className="flex-1 px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#14100c] text-xs font-sans text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#b45309]"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-2 border-2 border-stone-800 dark:border-[#f59e0b] bg-[#b45309] dark:bg-[#f59e0b] text-white dark:text-stone-950 font-mono font-bold text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewModal;