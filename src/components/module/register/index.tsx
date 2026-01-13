'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
  Upload,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RotateCw,
  CheckCircle2,
  Eye,
  EyeOff,
  Stamp,
} from 'lucide-react';
import { addToast } from '@heroui/toast';
import {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from '@/store/queries/auth';
import { useProvinces } from '@/lib/useProvinces';

export default function RegisterIndex() {
  const { provinces } = useProvinces();
  const [step, setStep] = useState<'REGISTER' | 'VERIFY'>('REGISTER');

  // Form states
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [province, setProvince] = useState('');
  const [img, setImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // OTP Verification states
  const [otpToken, setOtpToken] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const router = useRouter();

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (step === 'VERIFY' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImg(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast({
        title: 'Mật khẩu không khớp',
        description: 'Mật khẩu xác nhận phải trùng khớp với mật khẩu đã nhập.',
        variant: 'solid',
      });
      return;
    }

    if (password.length < 6) {
      addToast({
        title: 'Mật khẩu quá ngắn',
        description: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.',
        variant: 'solid',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email.trim());
      formData.append('password', password);
      formData.append('name', userName.trim());
      if (phone && phone.trim()) formData.append('phone', phone.trim());
      if (img) formData.append('img', img);
      if (age) formData.append('age', String(age).trim());
      if (province) formData.append('province', province.trim());

      await register(formData).unwrap();

      addToast({
        title: 'Đăng ký bước 1 thành công',
        description: 'Vui lòng kiểm tra hộp thư email để lấy mã OTP xác thực tài khoản.',
        variant: 'solid',
      });

      setStep('VERIFY');
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      addToast({
        title: 'Đăng ký thất bại',
        description: err?.data?.message || err?.message || 'Vui lòng kiểm tra lại thông tin.',
        variant: 'solid',
      });
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otpToken.trim()) {
      addToast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mã OTP xác thực',
        variant: 'solid',
      });
      return;
    }

    try {
      await verifyEmail({
        email: email.trim(),
        token: otpToken.trim(),
      }).unwrap();

      addToast({
        title: 'Kích hoạt tài khoản thành công',
        description: 'Tài khoản của bạn đã sẵn sàng. Đang chuyển hướng tới trang Đăng nhập...',
        variant: 'solid',
      });

      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err: any) {
      addToast({
        title: 'Xác thực thất bại',
        description: err?.data?.message || err?.message || 'Mã OTP không chính xác hoặc đã hết hạn',
        variant: 'solid',
      });
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResending) return;

    try {
      await resendVerification({ email: email.trim() }).unwrap();
      addToast({
        title: 'Đã gửi lại mã OTP',
        description: 'Mã xác thực mới đã được gửi tới email của bạn.',
        variant: 'solid',
      });
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      addToast({
        title: 'Gửi lại thất bại',
        description: err?.data?.message || err?.message || 'Không thể gửi lại mã vào lúc này',
        variant: 'solid',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#161111] text-stone-900 dark:text-stone-100 flex flex-col justify-center items-center px-4 py-12 font-sans transition-colors duration-200">
      <div className="relative w-full max-w-xl space-y-6">
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
            <span>ĐĂNG KÝ HỒ SƠ DÂN SỰ & PHÁP NHÂN</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-50">
            {step === 'REGISTER' ? 'Kê Khai Tạo Tài Khoản' : 'Xác Thực Danh Tính Email'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {step === 'REGISTER' ? (
              <>
                Đã có tài khoản đã xác thực?{' '}
                <Link href="/login" className="text-[#b33927] dark:text-[#e85d46] font-mono font-bold uppercase underline underline-offset-2">
                  Đăng nhập ngay
                </Link>
              </>
            ) : (
              `Mã bảo mật OTP 6 chữ số đã được gửi tới hòm thư ${email}`
            )}
          </p>
        </div>

        {/* Notary Docket Card */}
        <div className="border-2 border-stone-800 dark:border-[#b33927] bg-white dark:bg-[#1e1515] p-6 sm:p-8 shadow-[6px_6px_0px_#b33927] dark:shadow-[6px_6px_0px_#e85d46] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-dashed border-stone-300 dark:border-stone-700 pb-3 font-mono text-[10px] uppercase text-stone-500">
            <span>[DOCKET: REG-FORM-2026]</span>
            <span className="text-[#b33927] dark:text-[#e85d46] font-bold">OFFICIAL REGISTRY</span>
          </div>

          {step === 'REGISTER' ? (
            /* STEP 1: REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    Thư điện tử *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                  />
                </div>
              </div>

              {/* Row 2: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-3 pr-9 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    Xác nhận Mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-3 pr-9 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Phone & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Độ tuổi *
                  </label>
                  <input
                    type="number"
                    min="16"
                    max="100"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="28"
                    className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                  />
                </div>
              </div>

              {/* Row 4: Province */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  Tỉnh / Thành phố Thường trú *
                </label>
                <select
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 font-sans focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                >
                  <option value="">Chọn khu vực sinh sống</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300">
                  Ảnh hồ sơ cá nhân (Tùy chọn)
                </label>
                <div className="flex items-center gap-3 p-3 border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-10 h-10 object-cover border border-stone-800 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 border border-stone-400 bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-500 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 text-[11px] font-mono font-bold uppercase cursor-pointer hover:bg-stone-100">
                      <Upload className="w-3 h-3 text-[#b33927] dark:text-[#e85d46]" />
                      <span>Chọn tệp ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-stone-500 mt-1 truncate font-mono">
                      {img ? img.name : 'PNG, JPG hoặc WebP tối đa 5MB'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Disclaimer */}
              <div className="flex items-start gap-2 pt-2 text-[11px] text-stone-500 leading-relaxed font-sans">
                <ShieldCheck className="w-3.5 h-3.5 text-[#b33927] dark:text-[#e85d46] shrink-0 mt-0.5" />
                <span>
                  Bằng việc bấm Tiếp tục, bạn cam kết thông tin kê khai là chính xác và đồng ý nhận mã xác thực OTP qua Thư điện tử.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 border-2 border-stone-800 dark:border-[#e85d46] bg-[#b33927] dark:bg-[#e85d46] hover:bg-[#d6452e] dark:hover:bg-[#f07b68] text-white dark:text-stone-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#40130d] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isRegistering ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Đang khởi tạo hồ sơ...
                  </span>
                ) : (
                  <>
                    <span>Tiếp tục (Nhận mã OTP)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifySubmit} className="space-y-5 text-xs">
              <div className="p-4 border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] space-y-2 text-center">
                <div className="w-10 h-10 border-2 border-[#b33927] dark:border-[#e85d46] bg-[#b33927]/10 text-[#b33927] dark:text-[#e85d46] flex items-center justify-center mx-auto">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Nhập mã xác thực 6 số
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Vui lòng kiểm tra hộp thư đến của <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase text-stone-700 dark:text-stone-300 block text-center">
                  MÃ OTP BẢO MẬT
                </label>
                <input
                  type="text"
                  required
                  disabled={isVerifying}
                  maxLength={10}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 border-2 border-stone-800 dark:border-stone-700 bg-stone-50 dark:bg-[#140e0e] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#b33927] dark:focus:border-[#e85d46]"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <button
                  type="button"
                  onClick={() => setStep('REGISTER')}
                  disabled={isVerifying}
                  className="text-stone-600 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  ← Đổi thông tin email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isResending || isVerifying}
                  className={`flex items-center gap-1 ${
                    canResend && !isVerifying
                      ? 'text-[#b33927] dark:text-[#e85d46] font-bold'
                      : 'text-stone-400 cursor-not-allowed'
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
                disabled={isVerifying || !otpToken.trim()}
                className="w-full py-3 border-2 border-stone-800 dark:border-[#e85d46] bg-[#b33927] dark:bg-[#e85d46] hover:bg-[#d6452e] dark:hover:bg-[#f07b68] text-white dark:text-stone-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#40130d] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Đang kích hoạt tài khoản...
                  </span>
                ) : (
                  <>
                    <span>Xác Nhận & Kích Hoạt Hồ Sơ</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] font-mono text-stone-500">
          © {new Date().getFullYear()} LawOh LegalTech • Tiêu chuẩn an ninh AES-256
        </p>
      </div>
    </div>
  );
}