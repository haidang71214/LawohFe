import { ResponseDto, PaginatedData } from './base';

export interface MarketPriceRangeItemResponseDto {
  _id: string;
  Type: string;
  minPrice: number;
  maxPrice: number;
  description: string;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CustomPriceItemResponseDto {
  _id: string;
  lawyerId: string;
  Type: string;
  price: number;
  description: string;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MarketPriceRangeListResponseDataDto extends PaginatedData<MarketPriceRangeItemResponseDto> {
  data: MarketPriceRangeItemResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CustomPriceRangeRequestDto {
  Type: string;
  price: number;
  description: string;
}

export interface CreateCustomPriceRequestDto {
  Type: string;
  price: number;
  description: string;
}

export interface UpdatePriceByLawyerRequestDto {
  Type: string;
  price: number;
  description: string;
}

export interface UpdatePriceRangeRequestDto {
  Type?: string;
  minPrice: number;
  maxPrice: number;
  description: string;
}

// Wrapper Response Classes
export type PriceRangeResponse = ResponseDto<MarketPriceRangeItemResponseDto | CustomPriceItemResponseDto>;
export type PriceRangeResponseDto = ResponseDto<MarketPriceRangeItemResponseDto | CustomPriceItemResponseDto>;

export type PriceRangeListResponse = ResponseDto<MarketPriceRangeListResponseDataDto | MarketPriceRangeItemResponseDto[]>;
export type PriceRangeListResponseDto = ResponseDto<MarketPriceRangeListResponseDataDto>;
