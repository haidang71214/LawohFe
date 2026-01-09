import { ResponseDto, PaginatedData } from './base';

export interface BookingItemResponseDto {
  _id: string;
  client_id: any;
  lawyer_id: any;
  booking_start: string | Date;
  booking_end: string | Date;
  typeBooking: string;
  note?: string;
  status: string;
  amount: number;
  income?: number;
  hours?: string;
  date?: string;
  description?: string;
  category?: string;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BookingListResponseDataDto extends PaginatedData<BookingItemResponseDto> {
  data: BookingItemResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateBookingRequestDto {
  lawyer_id: string;
  booking_start: string | Date;
  booking_end: string | Date;
  typeBooking: string;
  note?: string;
  category?: string;
  description?: string;
}

// Wrapper Response Classes
export type BookingResponse = ResponseDto<BookingItemResponseDto>;
export type BookingResponseDto = ResponseDto<BookingItemResponseDto>;

export type BookingListResponse = ResponseDto<BookingListResponseDataDto | BookingItemResponseDto[]>;
export type BookingListResponseDto = ResponseDto<BookingListResponseDataDto>;
