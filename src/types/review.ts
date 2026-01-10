import { ResponseDto, PaginatedData } from './base';

export interface ReviewItemResponseDto {
  _id: string;
  lawyer_id: string;
  client_id: any;
  booking_id?: string;
  rating: number;
  star?: number;
  comment: string;
  review_date?: string | Date;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ReviewListResponseDataDto extends PaginatedData<ReviewItemResponseDto> {
  data: ReviewItemResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateReviewRequestDto {
  lawyerId?: string;
  rating: number;
  star?: number;
  comment: string;
  bookingId?: string;
}

// Wrapper Response Classes
export type ReviewResponse = ResponseDto<ReviewItemResponseDto>;
export type ReviewResponseDto = ResponseDto<ReviewItemResponseDto>;

export type ReviewListResponse = ResponseDto<ReviewItemResponseDto[] | ReviewListResponseDataDto>;
export type ReviewListResponseDto = ResponseDto<ReviewListResponseDataDto>;
