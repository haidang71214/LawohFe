'use client'
import React, { useState, useEffect } from 'react';
import { X, Send, CornerDownRight } from 'lucide-react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { axiosInstance } from '@/fetchApi';
import './index.css';

interface Comment {
  _id: string;
  user_id: {
    _id: string;
    name: string;
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
  video_id: string | null;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ videoUrl, onClose, video_id }) => {
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
      const userToken = localStorage.getItem('LOGIN_USER');
      if (!userToken) return;

      try {
        const res = await axiosInstance.get('/auth/getMySelf');
        setUser({
          _id: res.data._id,
          name: res.data.name,
        });
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchUser();
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!video_id) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/video/${video_id}`);
        setComments(res.data.response.comment || []);
      } catch (error) {
        console.log('Lỗi khi lấy bình luận:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [video_id]);

  // Handle main comment submission
  const handleSubmitComment = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const userToken = localStorage.getItem('LOGIN_USER');
    if (!userToken) {
      alert('Vui lòng đăng nhập để bình luận.');
      return;
    }

    if (!user) {
      alert('Đang tải thông tin người dùng. Vui lòng thử lại.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post(`/comment/createNewComment/${id}`, {
        video_id,
        content: newComment,
      });

      const newCommentData: Comment = {
        _id: response.data._id || Date.now().toString(),
        user_id: response.data.user_id || user,
        content: newComment,
        createdAt: response.data.createdAt || new Date().toISOString(),
        parent_comment_id: null,
      };

      setComments([newCommentData, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Lỗi khi gửi bình luận:', error);
      alert('Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || !video_id) return;

    const userToken = localStorage.getItem('LOGIN_USER');
    if (!userToken) {
      alert('Vui lòng đăng nhập để bình luận.');
      return;
    }

    if (!user) {
      alert('Đang tải thông tin người dùng. Vui lòng thử lại.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post(`/comment/createNewComment/${video_id}`, {
        video_id,
        content: replyContent,
        parent_comment_id: parentId,
      });

      const newReplyData: Comment = {
        _id: response.data._id || Date.now().toString(),
        user_id: response.data.user_id || user,
        content: replyContent,
        createdAt: response.data.createdAt || new Date().toISOString(),
        parent_comment_id: parentId,
      };

      setComments([newReplyData, ...comments]);
      setReplyContent('');
      setReplyTo(null);
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      alert('Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Organize comments into parent and replies
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

  if (!videoUrl || !video_id) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{top:50}}
      onClick={onClose} // Đóng modal khi click vào nền
    >
      <div
        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] flex animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan truyền
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 text-black hover:bg-white/20 rounded-full p-2"
          suppressHydrationWarning
        >
          <X className="w-6 h-4" />
        </Button>

        {/* Left: Video Player */}
        <div className="w-2/3 p-4 flex items-center justify-center bg-neutral-900">
          <video
            controls
            autoPlay
            className="w-full h-auto max-h-[80vh] object-contain"
            onError={() => console.error('Error loading video')}
            suppressHydrationWarning
          >
            <source src={videoUrl} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ phát video.
          </video>
        </div>

        {/* Right: Comment Section */}
        <div className="w-1/3 p-4 bg-white flex flex-col max-h-[80vh]">
          <h2 className="text-lg font-semibold text-black mb-4">Bình luận</h2>

          {/* Main Comment Input Form */}
          <form onSubmit={(e) => handleSubmitComment(e, video_id)} className="flex items-center space-x-2 mb-4">
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 bg-white border-gray-300 text-black"
              disabled={submitting}
              suppressHydrationWarning
            />
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
              suppressHydrationWarning
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <p className="text-black">Đang tải bình luận...</p>
            ) : comments.length === 0 ? (
              <p className="text-black">Chưa có bình luận nào.</p>
            ) : (
              getNestedComments().map((commentGroup) => (
                <div key={commentGroup[0]._id} className="space-y-2">
                  {commentGroup.map((comment, index) => (
                    <div
                      key={comment._id}
                      className={`bg-gray-100 p-3 rounded-lg ${index > 0 ? 'ml-6' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-black">
                          {index > 0 && <CornerDownRight className="w-4 h-4 inline mr-1" />}
                          {comment.user_id.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyTo(comment._id)}
                          className="text-xs text-gray-600 hover:text-black"
                          suppressHydrationWarning
                        >
                          Phản hồi
                        </Button>
                      </div>
                      <p className="text-sm text-black">{comment.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString('vi-VN')}
                      </p>
                      {/* Reply Form */}
                      {replyTo === comment._id && (
                        <form
                          onSubmit={(e) => handleSubmitReply(e, comment._id)}
                          className="flex items-center space-x-2 mt-2"
                        >
                          <Input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Viết phản hồi..."
                            className="flex-1 bg-white border-gray-300 text-black"
                            disabled={submitting}
                            suppressHydrationWarning
                          />
                          <Button
                            type="submit"
                            disabled={submitting || !replyContent.trim()}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                            suppressHydrationWarning
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewModal;