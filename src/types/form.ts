import { ResponseDto, PaginatedData } from './base';

export interface FormItemResponseDto {
  _id: string;
  type: string;
  mainContent: string;
  description: string;
  uri_secure?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface FormListResponseDataDto extends PaginatedData<FormItemResponseDto> {
  data: FormItemResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface CreateFormRequestDto {
  type: string;
  mainContent: string;
  description: string;
  formFile?: File | Blob | any;
  file?: File | Blob | any;
}

export interface FindAllFormRequestDto {
  page?: number;
  limit?: number;
  type?: string;
}

export interface UpdateFormRequestDto {
  id?: string;
  type?: string;
  mainContent?: string;
  description?: string;
  formFile?: File | Blob | any;
  file?: File | Blob | any;
}

// Wrapper Response Classes
export type FormResponse = ResponseDto<FormItemResponseDto>;
export type FormResponseDto = ResponseDto<FormItemResponseDto>;

export type FormListResponse = ResponseDto<FormItemResponseDto[] | FormListResponseDataDto>;
export type FormListResponseDto = ResponseDto<FormListResponseDataDto>;
