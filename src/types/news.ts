import { ResponseDto, PaginatedData } from './base';

export interface NewsItemResponseDto {
  _id: string;
  type: string;
  mainTitle: string;
  content: string;
  image_urls: string[];
  isAccept?: boolean;
  isDeleted?: boolean;
  author_id?: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface NewsListResponseDataDto extends PaginatedData<NewsItemResponseDto> {
  data: NewsItemResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateNewsRequestDto {
  type: string;
  mainTitle: string;
  content: string;
  imgs?: (File | Blob)[];
  images?: (File | Blob)[];
}

export type UpdateNewsRequestDto = Partial<CreateNewsRequestDto>;

export interface ApproveNewsRequestDto {
  id: string;
  isAccept: boolean;
}

// Wrapper Response Classes
export type NewsResponse = ResponseDto<NewsItemResponseDto>;
export type NewsResponseDto = ResponseDto<NewsItemResponseDto>;

export type NewsListResponse = ResponseDto<NewsItemResponseDto[] | NewsListResponseDataDto>;
export type NewsListResponseDto = ResponseDto<NewsListResponseDataDto>;
