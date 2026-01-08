import { ResponseDto, PaginatedData } from './base';

export interface UserItemResponseDto {
  _id: string;
  email: string;
  name: string;
  phone?: number;
  avartar_url?: string;
  role: 'user' | 'admin' | 'lawyer' | string;
  province?: string;
  age?: number;
  warn?: string;
  isEmailVerified?: boolean;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  description?: string;
  experienceYear?: number;
  certificate?: string[];
  lawyer_request_status?: 'pending' | 'approved' | 'rejected' | string;
  lawyer_request_reason?: string;
  pending_type_lawyer?: string[];
  pending_sub_type_lawyers?: string[];
}

export interface UserListResponseDataDto extends PaginatedData<UserItemResponseDto> {
  data: UserItemResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateUserRequestDto {
  email: string;
  password: string;
  name: string;
  phone?: number;
  img?: any;
  age: number;
  role: 'user' | 'admin' | 'lawyer' | string;
  province: string;
  warn?: string;
}

export interface UpdateUserRequestDto {
  password?: string;
  phone?: number;
  name?: string;
  img?: any;
  age?: number;
  role?: 'user' | 'admin' | 'lawyer' | string;
  province?: string;
  avartar_url?: string;
}

export interface UpdateLawyerUserRequestDto {
  phone?: number;
  name?: string;
  img?: any;
  age?: number;
  role?: 'user' | 'admin' | 'lawyer' | string;
  province?: string;
}

export interface ChangeRoleRequestDto {
  newRole: string;
}

export interface RequestLawyerRoleRequestDto {
  description: string;
  experienceYear: number;
  type_lawyer?: string[];
  sub_type_lawyers?: string[];
  certificate?: string[];
  certificate_files?: File[];
}

export interface RejectLawyerRequestRequestDto {
  reason: string;
}

// Wrapper Response Types
export type UserResponse = ResponseDto<UserItemResponseDto>;
export type UserResponseDto = ResponseDto<UserItemResponseDto>;
export type UserListResponse = ResponseDto<UserListResponseDataDto>;
export type UserListResponseDto = ResponseDto<UserListResponseDataDto>;
