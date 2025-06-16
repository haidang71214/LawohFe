'use client';
import React, { useState } from 'react';
import { axiosInstance } from '@/fetchApi';
import { addToast } from '@heroui/toast';

export default function RegisterIndex() {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [province, setProvince] = useState('');
  const [img, setImg] = useState<File | null>(null); // Để lưu file hình ảnh
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImg(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Tạo FormData để gửi dữ liệu dạng multipart (bao gồm file ảnh)
      const formData = new FormData();
  
      formData.append('email', email);
      formData.append('password', password);
      formData.append('phone', phone);
      formData.append('name', userName);
      formData.append('age', age);
      formData.append('province', province);
      if (img) {
        formData.append('img', img); // Gửi file ảnh nếu có
      }
  
  
      const response = await axiosInstance.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Đăng ký thành công:', response.data);
  
      addToast({
        title: 'Thành công',
        description: 'Đăng ký tài khoản thành công!',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
  
      // Reset form sau khi đăng ký thành công
      setEmail('');
      setUserName('');
      setPassword('');
      setPhone('');
      setAge('');
      setProvince('');
      setImg(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      console.error('Lỗi đăng ký:', errorMessage);
  
      addToast({
        title: 'Lỗi',
        description: 'Đăng ký tài khoản thất bại. Vui lòng thử lại.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100" style={{maxHeight:'10000px'}}>
      {/* Form bên trái */}
      <div className="w-full md:w-1/2 flex items-center justify-center  bg-pink-50"  style={{height:'950px'}}>
        <form onSubmit={handleSubmit} className="w-full max-w-sm" >
          <h2 className="text-2xl font-bold">Đăng Ký</h2>
          <p>
            Nếu bạn đã có tài khoản hãy đăng nhập{' '}
            <a href="/login" className="text-blue-600 font-semibold">
              ở đây
            </a>
            !
          </p>

          {/* Tên người dùng */}
          <div>
            <label className="block text-sm font-medium">Tên Người Dùng</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                fill="none"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 19.5a8.999 8.999 0 0 1 14.998 0"
                />
              </svg>
              <input
                type="text"
                placeholder="Điền tên người dùng"
                className="w-full bg-transparent focus:outline-none"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                style={{ padding: '15px' }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={0.7}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              <input
                type="email"
                placeholder="Điền Email của bạn"
                className="w-full bg-transparent focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '15px' }}
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium">Mật Khẩu</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={0.7}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <input
                type="password"
                placeholder="Điền mật khẩu của bạn"
                className="w-full bg-transparent focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '15px' }}
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium">Số Điện Thoại</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={0.7}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0-2.485 2.015-4.5 4.5-4.5h10.5c2.485 0 4.5 2.015 4.5 4.5v10.5c0 2.485-2.015 4.5-4.5 4.5H6.75c-2.485 0-4.5-2.015-4.5-4.5V6.75Zm14.25 12.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                />
              </svg>
              <input
                type="tel"
                placeholder="Điền số điện thoại"
                className="w-full bg-transparent focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{ padding: '15px' }}
              />
            </div>
          </div>

          {/* Tuổi */}
          <div>
            <label className="block text-sm font-medium">Tuổi</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={0.7}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <input
                type="number"
                placeholder="Điền tuổi của bạn"
                className="w-full bg-transparent focus:outline-none"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="0"
                style={{ padding: '15px' }}
              />
            </div>
          </div>

          {/* Tỉnh/Thành */}
          <div>
            <label className="block text-sm font-medium">Tỉnh/Thành</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={0.7}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <input
                type="text"
                placeholder="Điền tỉnh/thành của bạn"
                className="w-full bg-transparent focus:outline-none"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
                style={{ padding: '15px' }}
              />
            </div>
          </div>

          {/* Hình ảnh (tùy chọn) */}
          <div>
            <label className="block text-sm font-medium">Hình Ảnh Đại Diện (Tùy Chọn)</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={0.7}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                className="w-full bg-transparent focus:outline-none"
                onChange={handleImageChange}
                style={{ padding: '15px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 border border-black rounded hover:bg-black hover:text-white transition"
            disabled={loading}
          >
            {loading ? 'Đang Đăng Ký...' : 'Đăng Ký'}
          </button>
        </form>
      </div>

      {/* Hình bên phải */}
      <img
        src="/caibuatien.jpg"
        alt="Lady Justice"
        className="h-4/5 object-contain"
        style={{ width: '60%', height: 'auto' }}
      />
    </div>
  );
}