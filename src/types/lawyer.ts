import { ResponseDto, PaginatedData } from './base';
import { ETypeLawyer } from './enum';

export interface LawyerItemResponseDto {
  _id: string;
  name: string;
  email: string;
  phone?: number;
  avartar_url?: string;
  province?: string;
  description?: string;
  type_lawyer: (ETypeLawyer | string)[];
  sub_type_lawyers: string[];
  experienceYear: number;
  certificate: string[];
  stars?: number;
  rating?: number;
}

export interface LawyerListResponseDataDto extends PaginatedData<LawyerItemResponseDto> {
  data: LawyerItemResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface FilterLawyerRequestDto {
  typeLawyer?: string;
  type_lawyer?: string;
  type?: string;
  province?: string;
  name?: string;
  stars?: number;
  experienceYear?: number;
  page?: number;
  limit?: number;
}

export interface CreateLawyerRequestDto {
  description: string;
  type_lawyer: (ETypeLawyer | string)[];
  sub_type_lawyers: string[];
  name?: string;
  phone?: number;
  age?: number;
  province?: string;
  avartar_url?: string;
  experienceYear: number;
  certificate: string[];
}

export interface UpdateLawyerRequestDto {
  description: string;
  type_lawyer: (ETypeLawyer | string)[];
  sub_type_lawyers: string[];
  experienceYear: number;
  certificate: string[];
  name?: string;
  phone?: number;
  province?: string;
}

// Wrapper Response Classes
export type LawyerResponse = ResponseDto<LawyerItemResponseDto>;
export type LawyerResponseDto = ResponseDto<LawyerItemResponseDto>;

export type LawyerListResponse = ResponseDto<LawyerItemResponseDto[] | LawyerListResponseDataDto>;
export type LawyerListResponseDto = ResponseDto<LawyerListResponseDataDto>;
