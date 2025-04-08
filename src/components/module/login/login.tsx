"use client"
import React, { useState } from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
export default function LoginIndex() {
     const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log({ email, password });
};
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Hình tượng công lý bên trái */}
     <img src="/caibuatien.jpg" alt="Lady Justice" className="h-4/5 object-contain" style={{width:'60%',height:'auto'}}/>


      {/* Form bên phải */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-pink-50">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-bold">Đăng nhập</h2>
          <p>
            Nếu bạn chưa có tài khoản hãy đăng ký <a href="/register" className="text-blue-600 font-semibold">ở đây</a>!
          </p>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.7}  stroke="currentColor" style={{width:'30px'}} >
  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
</svg>

              <input
                type="email"
                placeholder="Điền Email của bạn"
                className="w-full bg-transparent focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{padding:'15px'}}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center border-b border-gray-400 py-2">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.7}  stroke="currentColor" style={{width:'30px'}}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>


              <input
                type="password"
                placeholder="Điền mật khẩu của bạn"
                className="w-full bg-transparent focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                 style={{padding:'15px'}}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <a href="#" className="text-gray-600 hover:text-black">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="w-full py-2 border border-black rounded hover:bg-black hover:text-white transition">
            Đăng nhập
          </button>

          <div className="text-center text-sm text-gray-500">hoặc tiếp tục với</div>

          <div className="flex justify-center space-x-4">
              <FacebookIcon />

           <AppleIcon/>
           <GoogleIcon/>
          </div>
        </form>
      </div>
    </div>
  )
}
