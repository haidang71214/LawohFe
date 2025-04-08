"use client"
import React, { useState } from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';

export default function RegisterIndex() {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password, userName });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Form bên trái */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-pink-50">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-bold">Đăng ký</h2>
          <p>
            Nếu bạn đã có tài khoản hãy đăng nhập <a href="/login" className="text-blue-600 font-semibold">ở đây</a>!
          </p>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium">Tên người dùng</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" fill="none" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 19.5a8.999 8.999 0 0 1 14.998 0" />
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.7} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Mật khẩu</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.7} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
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

          <button type="submit" className="w-full py-2 border border-black rounded hover:bg-black hover:text-white transition">
            Đăng ký
          </button>

          <div className="text-center text-sm text-gray-500">hoặc tiếp tục với</div>

          <div className="flex justify-center space-x-4">
            <FacebookIcon className="cursor-pointer" />
            <AppleIcon className="cursor-pointer" />
            <GoogleIcon className="cursor-pointer" />
          </div>
        </form>
      </div>

      {/* Hình bên phải */}
      <img src="/caibuatien.jpg" alt="Lady Justice" className="h-4/5 object-contain" style={{ width: '60%', height: 'auto' }} />
    </div>
  );
}
