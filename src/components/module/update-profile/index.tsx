"use client";
import { axiosInstance } from '@/fetchApi';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function UpdateProfile() {
  const [profile, setProfile] = useState({
    password: '',
    phone: 0,
    name: '',
    img: null as File | null,
    age: 0,
    role: '',
    province: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lấy thông tin người dùng từ API chỉ một lần khi component mount

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'age') {
      setProfile((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
      }));
    } else if (name === 'img') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setProfile((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const router = useRouter();

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation cơ bản
    if (!profile.name || !profile.password || !profile.phone || !profile.age || !profile.role || !profile.province) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      setLoading(false);
      return;
    }

    if (profile.phone < 0 || profile.age < 0) {
      setError('Số điện thoại và tuổi không được âm.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('password', profile.password);
      formData.append('phone', profile.phone.toString());
      formData.append('name', profile.name);
      if (profile.img) formData.append('img', profile.img);
      formData.append('age', profile.age.toString());
      formData.append('role', profile.role);
      formData.append('province', profile.province);

      // Debug: Kiểm tra formData trước khi gửi
      console.log('FormData:', Object.fromEntries(formData.entries()));

      const token = localStorage.getItem('token');
      const response = await axiosInstance.patch('/users/updateMySelf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Thêm token nếu cần
        },
      });
      console.log('API response:', response.data);

      setSuccess('Cập nhật thông tin thành công!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật thông tin thất bại.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4" style={{ marginTop: '10%' }}>
      <h1 style={{ margin: '0 auto', textAlign: 'center' }} className="text-2xl font-bold mb-4">
        Cập nhật thông tin cá nhân
      </h1>
      {loading && <p className="text-center text-gray-500">Đang tải...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {success && <p className="text-center text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên *</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu *</label>
          <input
            type="password"
            name="password"
            value={profile.password}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
          <input
            type="number"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
          <input
            type="file"
            name="img"
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tuổi *</label>
          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vai trò *</label>
          <input
            type="text"
            name="role"
            value={profile.role}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
          <input
            type="text"
            name="province"
            value={profile.province}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-black p-2 rounded-md hover:bg-blue-600 transition duration-200"
          style={{ cursor: 'pointer', borderColor: 'black', border: '2px', display: 'block' }}
          disabled={loading}
          onClick={() => router.push('/')}  
        >
          {loading ? 'Đang cập nhật...' : 'Gửi đi'}
        </button>
      </form>
    </div>
  );
}