'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Scale, RotateCw, CheckCircle2 } from 'lucide-react';
import { addToast } from '@heroui/toast';
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/store/queries/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryEmail = searchParams.get('email') || '';
  const queryToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(queryEmail);
  const [token, setToken] = useState(queryToken);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  useEffect(() => {
    if (queryEmail) setEmail(queryEmail);
    if (queryToken) setToken(queryToken);
  }, [queryEmail, queryToken]);

  // Auto verify if both email and token are in the URL
  useEffect(() => {
    if (queryEmail && queryToken) {
      verifyEmail({ email: queryEmail, token: queryToken })
        .unwrap()
        .then(() => {
          addToast({
            title: 'Kích hoạt thành công',
            description: 'Tài khoản đã được xác thực tự động. Đang chuyển hướng...',
            color: 'success',
          });
          setTimeout(() => router.push('/login'), 1500);
        })
        .catch(() => {
          // Keep form open for manual retry
        });
    }
  }, [queryEmail, queryToken, verifyEmail, router]);

  useEffect(() => {
    let interval: any;
    if (countdown > 0) {
      interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token) {
      addToast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập Email và mã OTP',
        color: 'warning',
      });
      return;
    }

    try {
      await verifyEmail({ email: email.trim(), token: token.trim() }).unwrap();
      addToast({
        title: 'Kích hoạt thành công',
        description: 'Tài khoản đã kích hoạt thành công. Đang chuyển tới Đăng nhập...',
        color: 'success',
      });
      setTimeout(() => router.push('/login'), 1200);
    } catch (err: any) {
      addToast({
        title: 'Xác thực thất bại',
        description: err?.data?.message || err?.message || 'Mã OTP không chính xác hoặc đã hết hạn',
        color: 'danger',
      });
    }
  };

  const handleResend = async () => {
    if (!email || !canResend || isResending) return;

    try {
      await resendVerification({ email: email.trim() }).unwrap();
      addToast({
        title: 'Đã gửi lại mã OTP',
        description: 'Mã xác thực mới đã được gửi tới email.',
        color: 'success',
      });
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      addToast({
        title: 'Không thể gửi lại',
        description: err?.data?.message || err?.message || 'Vui lòng thử lại sau',
        color: 'danger',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">
      {/* Background Linear Radial Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2023_1px,transparent_1px),linear-gradient(to_bottom,#1f2023_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="relative w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#191a1e] border border-[#26282e] flex items-center justify-center text-[#f7f8f8] group-hover:border-[#5e6ad2] transition-colors">
              <Scale className="w-4 h-4 text-[#5e6ad2]" />
            </div>
            <span className="font-semibold text-base tracking-tight text-[#f7f8f8]">
              LawOh
            </span>
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-[#f7f8f8]">
            Xác thực Email
          </h1>
          <p className="text-xs text-[#8a8f98]">
            Kích hoạt tài khoản để bắt đầu sử dụng các dịch vụ pháp lý
          </p>
        </div>

        {/* Linear Form Card */}
        <div className="rounded-xl border border-[#222326] bg-[#0d0e11] p-6 sm:p-8 shadow-2xl linear-glow space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#8a8f98]">
                Địa chỉ Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3 py-2 rounded-md bg-[#121316] border border-[#222326] text-[#f7f8f8] focus:outline-none focus:border-[#5e6ad2]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#8a8f98]">
                Mã OTP Xác thực (6 số)
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 rounded-md bg-[#121316] border border-[#222326] text-[#f7f8f8] placeholder:text-[#33353a] focus:outline-none focus:border-[#5e6ad2]"
              />
            </div>

            <div className="flex items-center justify-end text-[11px] pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isResending}
                className={`flex items-center gap-1 ${
                  canResend
                    ? 'text-[#5e6ad2] hover:text-[#7a84e0] font-medium'
                    : 'text-[#62666d] cursor-not-allowed'
                }`}
              >
                <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {canResend ? 'Gửi lại mã OTP' : `Gửi lại sau (${countdown}s)`}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 rounded-md bg-[#f7f8f8] hover:bg-[#e1e2e5] disabled:opacity-50 text-[#08090a] font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm pt-2"
            >
              {isVerifying ? (
                <span>Đang kích hoạt...</span>
              ) : (
                <>
                  <span>Xác nhận kích hoạt</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#8a8f98]">
          Đã kích hoạt?{' '}
          <Link href="/login" className="text-[#f7f8f8] hover:text-[#5e6ad2] font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090a] flex items-center justify-center text-xs text-[#62666d]">
          Đang tải...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
