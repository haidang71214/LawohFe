import { ResponseDto, PaginatedData } from './base';

export interface PaymentItemResponseDto {
  _id: string;
  amount: number;
  orderInfo: string;
  status: string;
  client_id: any;
  lawyer_id: any;
  booking_id?: any;
  transaction_no?: string;
  payment_method?: string;
  payment_date?: string | Date;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PaymentUrlResponseDto {
  paymentUrl: string;
  txnRef?: string;
}

export interface PaymentListResponseDataDto extends PaginatedData<PaymentItemResponseDto> {
  data: PaymentItemResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreatePaymentRequestDto {
  amount: number;
  orderInfo: string;
  orderType: string;
  bankCode?: string;
  clientId: string;
  lawyerId: string;
  bookingId?: string;
}

export type UpdatePaymentRequestDto = Partial<CreatePaymentRequestDto>;

// Wrapper Response Classes
export type PaymentResponse = ResponseDto<PaymentItemResponseDto>;
export type PaymentResponseDto = ResponseDto<PaymentItemResponseDto>;

export type PaymentUrlCreatedResponse = ResponseDto<PaymentUrlResponseDto>;
export type PaymentUrlCreatedResponseDto = ResponseDto<PaymentUrlResponseDto>;

export type PaymentListResponse = ResponseDto<PaymentItemResponseDto[] | PaymentListResponseDataDto>;
export type PaymentListResponseDto = ResponseDto<PaymentListResponseDataDto>;
