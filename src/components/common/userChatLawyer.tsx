'use client';
import { USER_PROFILE } from '@/constant/enum';
import { addToast } from '@heroui/toast';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface UserProfile {
  _id: string;
  name: string;
}

interface Message {
  _id?: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface UserChatLawyerProps {
  id: string;
  onClose: () => void;
}

export default function UserChatLawyer({ id, onClose }: UserChatLawyerProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth * 0.8 - 300, y: window.innerHeight - 450 - 20 });
  const [isDragging, setIsDragging] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    console.log('Conversation ID:', id);
    const userProfileRaw = localStorage.getItem(USER_PROFILE);
    if (!userProfileRaw) {
      console.error('USER_PROFILE not found in localStorage');
      alert('Please log in to continue chatting.');
      return;
    }

    try {
      const userProfile: UserProfile = JSON.parse(userProfileRaw);
      const currentUserId = userProfile._id;
      if (!currentUserId || !id) {
        console.error('Invalid userId or conversationId:', { currentUserId, id });
        return;
      }
      setUserId(currentUserId);
// 8080
      const newSocket = io('https://lawohbe.onrender.com', {
        transports: ['websocket', 'polling'],
      });
      setSocket(newSocket);

      newSocket.emit('joinRoom', id);
      console.log(`Joined room: ${id}`);

      const fetchMessages = async () => {
        setIsLoading(true);
        try {
          // 8080
          const response = await axios.get(`https://lawohbe.onrender.com/chat/messages/${id}`);
          console.log('Messages API Response:', response.data);
          const transformedMessages = response.data.map((msg: any) => ({
            _id: msg._id,
            content: msg.content,
            senderId: msg.sender?._id || msg.senderId || '',
            createdAt: msg.createdAt,
          }));
          setMessages(transformedMessages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMessages();

      newSocket.on('newMessage', (message: any) => {
        const transformedMessage: Message = {
          _id: message._id,
          content: message.content,
          senderId: message.sender?._id || message.sender || 'lon',
          createdAt: message.createdAt,
        };
        setMessages((prev) => {
          if (transformedMessage._id && prev.some((msg) => msg._id === transformedMessage._id)) {
            return prev;
          }
          return [...prev, transformedMessage];
        });
      });

      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('Error parsing USER_PROFILE:', error);
      alert('Failed to load user profile. Please log in again.');
    }
  }, [id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragRef.current) {
      setIsDragging(true);
      const rect = dragRef.current.getBoundingClientRect();
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragRef.current) {
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      const maxX = window.innerWidth - (isExpanded ? 500 : 300);
      const maxY = window.innerHeight - (isExpanded ? 500 : 450);
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      setPosition({ x: boundedX, y: boundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const sendMessage = () => {
    if (!socket || !messageInput.trim() || !id || messageInput.length > 500) {
      addToast({
        title: "Nghe bài trình chưa ?",
        description: "Lo mà nhập cho đúng đi",
        color: "danger",
        variant: "flat",
        timeout: 3000,
      });
      return;
    }

    const userProfileRaw = localStorage.getItem(USER_PROFILE);
    if (!userProfileRaw) {
      console.error('USER_PROFILE not found in localStorage');
      return;
    }

    try {
      const userProfile: UserProfile = JSON.parse(userProfileRaw);
      const currentUserId = userProfile._id;
      const senderName = userProfile.name || 'Unknown';
      const currentTime = new Date().toISOString();

      const messagePayload = {
        conversationId: id,
        senderId: currentUserId,
        content: `${senderName}:\n${messageInput}`,
        createdAt: currentTime,
      };
      socket.emit('sendMessage', messagePayload);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      style={{
        position: 'fixed',
        width: isExpanded ? '500px' : '300px',
        height: isExpanded ? '500px' : '450px',
        padding: '10px',
        paddingBottom: '25px',
        backgroundColor: '#1a202c',
        left: `${position.x}px`,
        top: `${position.y}px`,
        display: id ? 'block' : 'none',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        transition: isDragging ? 'none' : 'width 0.3s, height 0.3s',
        zIndex: 1000,
      }}
    >
      <div
        ref={dragRef}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: '5px',
          backgroundColor: '#2d3748',
          borderRadius: '5px 5px 0 0',
        }}
        onMouseDown={handleMouseDown}
      >
        <div>
          <button
            onClick={toggleExpand}
            style={{
              padding: '2px 8px',
              marginRight: '5px',
              border: '1px solid #4a5568',
              borderRadius: '5px',
              backgroundColor: '#2d3748',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4a5568')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2d3748')}
          >
            {isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '2px 8px',
              border: '1px solid #4a5568',
              borderRadius: '5px',
              backgroundColor: '#2d3748',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4a5568')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2d3748')}
          >
            Đóng
          </button>
        </div>
      </div>
      <div
        ref={chatContainerRef}
        style={{
          height: 'calc(100% - 40px)',
          overflowY: 'auto',
          border: '1px solid #4a5568',
          padding: '5px',
          backgroundColor: '#2d3748',
          borderRadius: '0 0 5px 5px',
          // Custom scroll bar styles
          scrollbarWidth: 'thin', // For Firefox
          scrollbarColor: '#4a5568 #2d3748', // For Firefox
        }}
        className="custom-scrollbar"
      >
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px; /* Smaller width for the scroll bar */
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #2d3748; /* Track color */
            border-radius: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a5568; /* Thumb color */
            border-radius: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096; /* Thumb color on hover */
          }
        `}</style>
        {isLoading ? (
          <div style={{ color: '#e2e8f0', textAlign: 'center' }}>Loading...</div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={msg._id || index}
                style={{
                  color: '#e2e8f0',
                  margin: '3px 0',
                  textAlign: msg.senderId && userId ? (msg.senderId === userId ? 'right' : 'left') : 'left',
                  maxWidth: '70%',
                  marginLeft: msg.senderId && userId ? (msg.senderId === userId ? 'auto' : '0') : '0',
                  marginRight: msg.senderId && userId ? (msg.senderId === userId ? '0' : 'auto') : 'auto',
                  backgroundColor: msg.senderId && userId ? (msg.senderId === userId ? '#3B82F6' : '#26A69A') : '#26A69A',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  overflowX: 'hidden',
                }}
              >
                {msg.content}{' '}
             
              </div>
            ))}
          </>
        )}
      </div>
      <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{
            width: '100%',
            padding: '3px',
            boxSizing: 'border-box',
            border: '1px solid #4a5568',
            borderRadius: '5px',
            backgroundColor: '#2d3748',
            color: '#e2e8f0',
            outline: 'none',
            fontSize: '0.9rem',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '3px 8px',
            border: '1px solid #4a5568',
            borderRadius: '5px',
            backgroundColor: '#2d3748',
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4a5568')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2d3748')}
        >
          Send
        </button>
      </div>
    </div>
  );
}