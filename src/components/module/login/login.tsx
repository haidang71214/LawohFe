'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scale, Mail, Lock, ArrowRight, Eye, EyeOff, Stamp } from 'lucide-react';
import { LOGIN_USER, USER_PROFILE } from '@/constants/enum';
import { useLoginMutation, useLazyGetMeQuery } from '@/store/queries/auth';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

export default function LoginIndex() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [getMe, { isLoading: isFetchingMe }] = useLazyGetMeQuery();

  const loading = isLoggingIn || isFetchingMe;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e?: React.FormEvent<HTMLFormElement>, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();

    const targetEmail = customEmail || email;
    const targetPassword = customPass || password;

    if (!targetEmail || !targetPassword) {
      toast.warning(
        isEn ? 'Missing credentials' : 'Thiếu thông tin',
        isEn ? 'Please enter both Email and Password' : 'Vui lòng nhập đầy đủ Email và Mật khẩu'
      );
      return;
    }

    try {
      const response = (await login({ email: targetEmail, password: targetPassword }).unwrap()) as any;
      const token = response?.data?.token || response?.token;
      if (token) {
        localStorage.setItem(LOGIN_USER, token);
      }

      const profileRes = (await getMe().unwrap()) as any;
      const userData = profileRes?.data || profileRes;
      localStorage.setItem(USER_PROFILE, JSON.stringify(userData));

      toast.success(
        t('auth.loginSuccess', 'Đăng nhập thành công!'),
        `${isEn ? 'Welcome back' : 'Chào mừng trở lại'}, ${userData?.name || userData?.email}`
      );

      if (userData?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.message || (isEn ? 'Invalid email or password' : 'Sai thông tin email hoặc mật khẩu');
      const isUnverified =
        errorMsg.toLowerCase().includes('not activated') ||
        errorMsg.toLowerCase().includes('chưa kích hoạt') ||
        errorMsg.toLowerCase().includes('verify your account') ||
        err?.status === 403;

      if (isUnverified) {
        toast.warning(
          isEn ? 'Account not activated' : 'Tài khoản chưa kích hoạt',
          isEn
            ? 'A new OTP has been sent to your email. Redirecting to verification page...'
            : 'Mã OTP mới đã được gửi về email của bạn. Đang chuyển hướng đến trang xác thực...'
        );
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(targetEmail)}`);
        }, 1200);
        return;
      }

      toast.error(isEn ? 'Sign in failed' : 'Đăng nhập thất bại', errorMsg);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#161111] flex items-center justify-center text-xs font-mono text-stone-500">
        {t('common.loading', 'Đang khởi động cổng chứng thực...')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#161111] text-stone-900 dark:text-stone-100 flex flex-col justify-center items-center px-4 py-12 font-sans transition-colors duration-200">
      <div className="relative w-full max-w-[440px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-9 h-9 border-2 border-stone-800 dark:border-[#e85d46] bg-[#b33927] dark:bg-[#e85d46] text-white dark:text-stone-950 flex items-center justify-center shadow-[3px_3px_0px_#40130d]">
              <Scale className="w-5 h-5" />
            </div>
            <span className="font-serif font-black text-xl tracking-tight text-stone-900 dark:text-stone-50">
              LawOh LegalTech
            </span>
          </Link>

          <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#b33927] dark:text-[#e85d46] font-bold">
            <Stamp className="w-3.5 h-3.5" />
            <span>CỔNG XÁC THỰC CÔNG CHỨNG ĐIỆN TỬ</span>
          </div>

          <h1 className="text-2xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
            {t('auth.loginTitle', 'Đăng Nhập Tài Khoản')}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {t('auth.loginSubtitle', 'Nhập thông tin danh tính để truy cập hệ thống hồ sơ pháp lý.')}
          </p>
        </div>

        {/* Notary Docket Card */}
        <div className="border-2 border-stone-800 dark:border-[#b33927] bg-white dark:bg-[#1e1515] p-7 shadow-[6px_6px_0px_#b33927] dark:shadow-[6px_6px_0px_#e85d46] space-y-5">
          <div className="flex items-center justify-between border-b-2 border-dashed border-stone-300 dark:border-stone-700 pb-3 font-mono text-[10px] uppercase text-stone-500">
            <span>[DOCKET: AUTH-LOGIN]</span>
            <span className="text-[#b33927] dark:text-[#e85d46] font-bold">AES-256 ENCRYPTED</span>
          </div>

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                {t('auth.email', 'Địa chỉ Thư điện tử')} *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  {t('auth.password', 'Mật mã bảo mật')} *
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info(
                      t('auth.forgotPassword', 'Quên mật khẩu?'),
                      isEn
                        ? 'Please contact platform administrator for password recovery.'
                        : 'Vui lòng liên hệ ban quản trị để được cấp lại mật khẩu.'
                    );
                  }}
                  className="text-[11px] font-mono text-stone-500 hover:text-[#b33927] dark:hover:text-[#e85d46]"
                >
                  {t('auth.forgotPassword', 'Quên mật khẩu?')}
                </a>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 border-2 border-stone-800 dark:border-[#e85d46] bg-[#b33927] dark:bg-[#e85d46] hover:bg-[#d6452e] dark:hover:bg-[#f07b68] text-white dark:text-stone-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#40130d] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>{isEn ? 'Verifying Credentials...' : 'Đang xác thực hồ sơ...'}</span>
              ) : (
                <>
                  <span>{t('auth.loginButton', 'Xác Thực & Đăng Nhập')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register Footer */}
        <p className="text-center text-xs text-stone-600 dark:text-stone-400">
          {t('auth.noAccount', 'Chưa đăng ký hồ sơ?')}{' '}
          <Link href="/register" className="text-[#b33927] dark:text-[#e85d46] font-mono font-bold uppercase underline underline-offset-4">
            {t('auth.registerButton', 'Đăng ký tài khoản')}
          </Link>
        </p>
      </div>
    </div>
  );
}
