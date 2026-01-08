import { ResponseDto } from './base';
import { UserItemResponseDto } from './user';

export interface LoginDataResponseDto {
  token: string;
  user: UserItemResponseDto | any;
}

export interface RegisterDataResponseDto {
  id: string;
  email: string;
  name: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginFacebookRequestDto {
  id: string;
  full_name: string;
  email: string;
  avartar_url: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  phone?: number;
  name: string;
  img?: any;
  age: number;
  province: string;
}

export interface ChangePassRequestDto {
  newPass: string;
  resetToken: string;
}

export interface SendTokenResetRequestDto {
  email: string;
}

export interface VerifyEmailRequestDto {
  email: string;
  token: string;
}

export interface ResendVerifyEmailRequestDto {
  email: string;
}

// Wrapper Response Classes
export type LoginResponse = ResponseDto<LoginDataResponseDto>;
export type LoginResponseDto = ResponseDto<LoginDataResponseDto>;

export type RegisterResponse = ResponseDto<RegisterDataResponseDto>;
export type RegisterResponseDto = ResponseDto<RegisterDataResponseDto>;

export type VerifyEmailResponseDto = ResponseDto<null>;
export type ResendVerifyEmailResponseDto = ResponseDto<null>;
export type ForgotPasswordResponseDto = ResponseDto<null>;
export type ChangePasswordResponseDto = ResponseDto<null>;
export type AuthResponse = ResponseDto<null>;
