import { paymentEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  PaymentResponse,
  PaymentListResponse,
  PaymentUrlCreatedResponse,
  ResponseDto,
} from '@/types';

export const paymentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminPayments: builder.query<PaymentListResponse, void>({
      query: () => ({
        url: paymentEndpoints.ADMIN_LIST,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),
    getMyPayments: builder.query<PaymentListResponse, void>({
      query: () => ({
        url: paymentEndpoints.MY_PAYMENTS,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),
    getLawyerPayments: builder.query<PaymentListResponse, void>({
      query: () => ({
        url: paymentEndpoints.LAWYER_PAYMENTS,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),
    getLawyerIncome: builder.query<ResponseDto<{ totalIncome: number; pendingIncome: number; completedBookings: number }>, void>({
      query: () => ({
        url: paymentEndpoints.LAWYER_INCOME,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),
    getLawyerCommissionsForAdmin: builder.query<ResponseDto<any>, void>({
      query: () => ({
        url: paymentEndpoints.LAWYER_COMMISSIONS,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),
    getPaymentStatus: builder.query<ResponseDto<any>, string>({
      query: (txnRef) => ({
        url: paymentEndpoints.STATUS(txnRef),
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),
    createPaymentUrl: builder.mutation<PaymentUrlCreatedResponse, { booking_id?: string; amount?: number; orderInfo?: string }>({
      query: (body) => ({
        url: paymentEndpoints.CREATE_URL,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment'],
    }),
    refundToLawyer: builder.mutation<PaymentResponse, string>({
      query: (paymentId) => ({
        url: paymentEndpoints.REFUND_TO_LAWYER(paymentId),
        method: 'PATCH',
      }),
      invalidatesTags: ['Payment'],
    }),
  }),
});

export const {
  useGetAdminPaymentsQuery,
  useGetMyPaymentsQuery,
  useGetLawyerPaymentsQuery,
  useGetLawyerIncomeQuery,
  useGetLawyerCommissionsForAdminQuery,
  useGetPaymentStatusQuery,
  useCreatePaymentUrlMutation,
  useRefundToLawyerMutation,
} = paymentApi;
