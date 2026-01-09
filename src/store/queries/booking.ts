import { bookingEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  BookingResponse,
  BookingListResponse,
  CreateBookingRequestDto,
} from '@/types';

export const bookingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLawyerBookings: builder.query<BookingListResponse, void>({
      query: () => ({
        url: bookingEndpoints.LAWYER_LIST,
        method: 'GET',
      }),
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation<BookingResponse, CreateBookingRequestDto>({
      query: (body) => ({
        url: bookingEndpoints.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking'],
    }),
    acceptBooking: builder.mutation<BookingResponse, string>({
      query: (id) => ({
        url: bookingEndpoints.ACCEPT(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Booking'],
    }),
    rejectBooking: builder.mutation<BookingResponse, string>({
      query: (id) => ({
        url: bookingEndpoints.REJECT(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation<BookingResponse, string>({
      query: (id) => ({
        url: bookingEndpoints.CANCEL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetLawyerBookingsQuery,
  useLazyGetLawyerBookingsQuery,
  useCreateBookingMutation,
  useAcceptBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
} = bookingApi;
