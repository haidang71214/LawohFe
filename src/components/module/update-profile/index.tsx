'use client';
import { axiosInstance } from '@/fetchApi';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { USER_PROFILE } from '@/constant/enum';

export default function UpdateProfile() {
  const [profile, setProfile] = useState({
    phone: 0,
    name: '',
    img: null as File | null,
    age: 0,
    role: '', // Vai trò sẽ không thay đổi, chỉ lấy từ localStorage
    province: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  // Lấy thông tin từ localStorage khi component mount
  useEffect(() => {
    const storedProfile = localStorage.getItem(USER_PROFILE);
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        console.log('Stored Profile:', parsedProfile);
        setProfile({
          phone: parsedProfile.phone || 0,
          name: parsedProfile.name || '',
          img: null,
          age: parsedProfile.age || 0,
          role: parsedProfile.role || '', // Giữ nguyên vai trò từ localStorage
          province: parsedProfile.province || '',
        });
      } catch (err) {
        console.error('Error parsing stored profile:', err);
        setError('Không thể tải thông tin hồ sơ từ localStorage.');
      }
    } else {
      setError('Không tìm thấy thông tin hồ sơ trong localStorage.');
    }
  }, []);

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

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation cơ bản cho số điện thoại và tuổi
    if (profile.phone < 0 || profile.age < 0) {
      setError('Số điện thoại và tuổi không được âm.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      const storedProfile = JSON.parse(localStorage.getItem(USER_PROFILE) || '{}');

      if (profile.phone !== 0) formData.append('phone', profile.phone.toString());
      if (profile.name) formData.append('name', profile.name);
      if (profile.img) formData.append('img', profile.img);
      if (profile.age !== 0) formData.append('age', profile.age.toString());
      // Giữ nguyên vai trò từ localStorage
      if (storedProfile.role) formData.append('role', storedProfile.role);
      if (profile.province) formData.append('province', profile.province);

      // Debug: Kiểm tra formData trước khi gửi
      console.log('FormData:', Object.fromEntries(formData.entries()));

      const response = await axiosInstance.patch('/users/updateMySelf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API response:', response.data);

      // Cập nhật lại localStorage với dữ liệu mới
      const updatedProfile = {
        ...JSON.parse(localStorage.getItem(USER_PROFILE) || '{}'),
        ...(profile.phone !== 0 && { phone: profile.phone }),
        ...(profile.name && { name: profile.name }),
        ...(profile.age !== 0 && { age: profile.age }),
        ...(profile.province && { province: profile.province }),
      };
      localStorage.setItem(USER_PROFILE, JSON.stringify(updatedProfile));

      setSuccess('Cập nhật thông tin thành công!');
      router.push('/');
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
          <label className="block text-sm font-medium text-gray-700">Tên</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input
            type="number"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
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
          <label className="block text-sm font-medium text-gray-700">Tuổi</label>
          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
          <input
            type="text"
            name="province"
            value={profile.province}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-black p-2 rounded-md hover:bg-blue-600 transition duration-200"
          style={{ cursor: 'pointer', borderColor: 'black', border: '2px', display: 'block' }}
          disabled={loading}
        >
          {loading ? 'Đang cập nhật...' : 'Gửi đi'}
        </button>
      </form>
    </div>
  );
}