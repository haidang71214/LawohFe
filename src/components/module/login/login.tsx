"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/fetchApi";
import { LOGIN_USER, USER_PROFILE } from "@/constant/enum";
import { Input, Button, addToast } from "@heroui/react";

export default function LoginIndex() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/loginUser", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem(LOGIN_USER, token);

      const profileRes = await axiosInstance.get("/auth/getMySelf");
      localStorage.setItem(USER_PROFILE, JSON.stringify(profileRes.data));
      console.log(profileRes.data);
      
      addToast({
        title: "🎉 Đăng nhập thành công!",
        description: "Chào mừng bạn đã trở lại 💼",
        color: "success",
        variant: "flat",
        timeout: 3000,
      });

      router.push("/");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";

      addToast({
        title: "❌ Lỗi đăng nhập!",
        description: errorMessage,
        color: "danger",
        variant: "flat",
        timeout: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <img
        src="/caibuatien.jpg"
        alt="Lady Justice"
        className="h-4/5 object-contain"
        style={{ width: "60%", height: "auto" }}
      />
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-pink-50">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-bold">Đăng nhập</h2>
          <p>
            Nếu bạn chưa có tài khoản hãy đăng ký{" "}
            <a href="/register" className="text-blue-600 font-semibold">
              ở đây
            </a>
            !
          </p>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Mật khẩu */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Nút đăng nhập */}
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            className="w-full"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}
