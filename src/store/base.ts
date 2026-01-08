import { baseQueryWithReauth } from '@/utils/baseQueryWithReauth';
import { createApi } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Lawyer',
    'Booking',
    'News',
    'Video',
    'Comment',
    'Chat',
    'Payment',
    'Form',
    'PriceRange',
    'Classification',
    'Review',
    'Package',
    'Notification',
  ],
  endpoints: () => ({}),
});
