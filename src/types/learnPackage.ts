import { ResponseDto, PaginatedData } from './base';

export type LearnPackageType = 'none' | 'standard' | 'gold' | 'deluxe' | string;

export interface LearnPackageItemResponseDto {
  _id: string;
  name: string;
  price: number;
  type?: LearnPackageType;
  description?: string;
  learn_start?: string | Date;
  learn_end?: string | Date;
  is_active: boolean;
  features?: string[];
  durationMonths?: number;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LearnPackageListResponseDataDto extends PaginatedData<LearnPackageItemResponseDto> {
  data: LearnPackageItemResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateLearnPackageRequestDto {
  name: string;
  price: number;
  type?: LearnPackageType;
  description?: string;
  learn_start?: string | Date;
  learn_end?: string | Date;
  is_active?: boolean;
}

export type UpdateLearnPackageRequestDto = Partial<CreateLearnPackageRequestDto>;

// Wrapper Response Classes
export type LearnPackageResponse = ResponseDto<LearnPackageItemResponseDto>;
export type LearnPackageResponseDto = ResponseDto<LearnPackageItemResponseDto>;

export type LearnPackageListResponse = ResponseDto<LearnPackageItemResponseDto[] | LearnPackageListResponseDataDto>;
export type LearnPackageListResponseDto = ResponseDto<LearnPackageListResponseDataDto>;
