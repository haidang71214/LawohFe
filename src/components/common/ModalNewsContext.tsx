'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { axiosInstance } from '@/fetchApi';
import { addToast } from '@heroui/toast';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';

export enum LawyerCategories {
  INSURANCE = 'Bảo hiểm',
  CIVIL = 'Dân sự',
  LAND = 'Đất đai',
  BUSINESS = 'Doanh nghiệp',
  TRANSPORTATION = 'Giao thông - Vận tải',
  ADMINISTRATIVE = 'Hành chính',
  CRIMINAL = 'Hình sự',
  FAMILY = 'Hôn nhân gia đình',
  LABOR = 'Lao động',
  INTELLECTUALPROPERTY = 'Sở hữu trí tuệ',
  INHERITANCE = 'Thừa kế - Di chúc',
  TAX = 'Thuế',
}

export enum ETypeLawyer {
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

interface ModalContextType {
  isModalOpen: boolean;
  newPost: { title: string; content: string; images: File[]; category: ETypeLawyer | '' };
  openModal: () => void;
  closeModal: () => void;
  handleSubmitPost: () => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export default function ModalNewsContext({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', images: [] as File[], category: '' as ETypeLawyer | '' });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewPost({ title: '', content: '', images: [], category: '' }); // Reset form on close
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setNewPost(prev => ({ ...prev, images: [...prev.images, ...fileArray] }));
    }
  };

  const handleSubmitPost = async () => {
    try {
      const token = localStorage.getItem('LOGIN_USER');
      if (!token) throw new Error('No authentication token found');

      const user = JSON.parse(localStorage.getItem('USER_PROFILE') || '{}');
      if (!user?._id) throw new Error('User ID not found');

      if (!newPost.category) throw new Error('Vui lòng chọn danh mục');

      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      formData.append('mainTitle', newPost.title);
      formData.append('content', newPost.content);
      formData.append('type', newPost.category);
      formData.append('userId', user._id);

      // Thêm từng file hình ảnh vào FormData
      newPost.images.forEach((file) => {
        formData.append(`imgs`, file); // Backend mong đợi mảng hình ảnh
      });

      // Gửi yêu cầu POST với FormData
      await axiosInstance.post('/news', formData);

      addToast({
        title: '🎉 Tạo bài đăng thành công!',
        description: 'Bài đăng của bạn đã được lưu.',
        color: 'success',
        variant: 'flat',
        timeout: 3000,
      });
      closeModal();
      router.push('/'); // Điều hướng đến trang mong muốn (có thể thay đổi thành trang news cá nhân)
    } catch (error) {
      console.error('Error creating post:', error);
      addToast({
        title: '❌ Lỗi khi tạo bài đăng!',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại sau.',
        color: 'secondary',
        variant: 'flat',
        timeout: 3000,
      });
    }
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, newPost, openModal, closeModal, handleSubmitPost }}>
      {children}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="lg" style={{ backgroundColor: 'white !important' }}>
        <ModalContent style={{ backgroundColor: 'white', boxShadow: 'inherit' }}>
          <ModalHeader>Tạo bài đăng mới</ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="mt-1 p-2 w-full border rounded"
                placeholder="Nhập tiêu đề"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Danh mục</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value as ETypeLawyer })}
                className="mt-1 p-2 w-full border rounded"
              >
                <option value="">Chọn danh mục</option>
                {Object.entries(LawyerCategories).map(([key, value]) => (
                  <option key={key} value={ETypeLawyer[key as keyof typeof ETypeLawyer]}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nội dung</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="mt-1 p-2 w-full border rounded h-32"
                placeholder="Nhập nội dung"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 p-2 w-full border rounded"
              />
              {newPost.images.length > 0 && (
                <div className="mt-2">
                  {newPost.images.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="mt-2 w-20 h-20 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={closeModal} style={{ color: 'black' }}>
              Hủy
            </Button>
            <Button onPress={handleSubmitPost} style={{ backgroundColor: '#4CAF50', color: 'white' }}>
              Đăng bài
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalNewsContext');
  }
  return context;
};