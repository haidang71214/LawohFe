export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300/api/v1';

export const authEndpoints = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ME: '/auth/me',
  REFRESH_TOKEN: '/auth/refresh-token',
  FACEBOOK_LOGIN: '/auth/facebook-login',
};

export const userEndpoints = {
  LIST_ALL: '/users',
  DETAIL: (id: string) => `/users/${id}`,
  UPDATE_ME: '/users/me',
  UPDATE_USER: (id: string) => `/users/${id}`,
  UPDATE_ROLE: (id: string) => `/users/${id}/role`,
  USER_BOOKINGS: (id: string) => `/users/${id}/bookings`,
  REQUEST_LAWYER: '/users/request-lawyer',
  LAWYER_REQUESTS: '/users/lawyer-requests',
  ACCEPT_LAWYER_REQUEST: (id: string) => `/users/lawyer-requests/${id}/accept`,
  REJECT_LAWYER_REQUEST: (id: string) => `/users/lawyer-requests/${id}/reject`,
};

export const lawyerEndpoints = {
  LIST: '/lawyer',
  FILTER: '/lawyer/filter',
  DETAIL: (id: string) => `/lawyer/${id}`,
  UPDATE_ME: '/lawyer/me',
  ADMIN_UPDATE_LAWYER: (id: string) => `/lawyer/${id}`,
  DELETE_LAWYER: (id: string) => `/lawyer/${id}`,
};

export const priceRangeEndpoints = {
  LIST: '/price-range',
  CUSTOM_PRICE: '/price-range/custom',
  GET_BY_TYPE: (type: string) => `/price-range/${type}`,
  UPDATE_PRICE: (type: string) => `/price-range/${type}`,
};

export const bookingEndpoints = {
  CREATE: '/booking',
  LAWYER_LIST: '/booking/lawyer',
  DETAIL: (id: string) => `/booking/${id}`,
  ACCEPT: (id: string) => `/booking/${id}/accept`,
  REJECT: (id: string) => `/booking/${id}/reject`,
  CANCEL: (id: string) => `/booking/${id}`,
};

export const newsEndpoints = {
  PUBLIC: '/news/public',
  LIST_ALL: '/news',
  ADMIN_LIST: '/news/admin',
  MY_NEWS: '/news/my-news',
  DETAIL: (id: string) => `/news/${id}`,
  CREATE: '/news',
  APPROVE: (id: string) => `/news/${id}/approve`,
  REJECT: (id: string) => `/news/${id}/reject`,
  DELETE: (id: string) => `/news/${id}`,
};

export const videoEndpoints = {
  PUBLIC: '/video/public',
  MY_VIDEOS: '/video/my-videos',
  ADMIN_LIST: '/video/admin',
  DETAIL: (id: string) => `/video/${id}`,
  CREATE: '/video',
  MODERATE: (id: string) => `/video/${id}/moderate`,
  DELETE: (id: string) => `/video/${id}`,
};

export const commentEndpoints = {
  CREATE_FOR_VIDEO: (videoId: string) => `/comment/video/${videoId}`,
  DELETE: (id: string) => `/comment/${id}`,
};

export const chatEndpoints = {
  CONVERSATIONS: '/chat/conversations',
  USER_CONVERSATIONS: (userId: string) => `/chat/conversations/${userId}`,
  CHECK: (lawyerId: string) => `/chat/conversations/check/${lawyerId}`,
  MESSAGES: (conversationId: string) => `/chat/messages/${conversationId}`,
  SEND_MESSAGE: '/chat/messages',
  UNREAD_COUNT: '/mess-notification/unread-count',
};

export const paymentEndpoints = {
  CREATE_URL: '/payment/create-url',
  VNPAY_RETURN: '/payment/vnpay-return',
  STATUS: (txnRef: string) => `/payment/status/${txnRef}`,
  ADMIN_LIST: '/payment/admin',
  MY_PAYMENTS: '/payment/my-payments',
  LAWYER_PAYMENTS: '/payment/lawyer-payments',
  LAWYER_INCOME: '/payment/lawyer-income',
  LAWYER_COMMISSIONS: '/payment/admin/lawyer-commissions',
  DETAIL: (id: string) => `/payment/${id}`,
  REFUND_TO_LAWYER: (paymentId: string) => `/payment/refundToLawyer/${paymentId}`,
};

export const formEndpoints = {
  LIST: '/form',
  DETAIL: (id: string) => `/form/${id}`,
  DOWNLOAD: (id: string) => `/form/${id}/download`,
  CREATE: '/form',
  DELETE: (id: string) => `/form/${id}`,
};

export const classificationEndpoints = {
  PREDICT: '/classification/predict',
  CATEGORIES: '/classification/categories',
};

export const reviewEndpoints = {
  BY_LAWYER: (lawyerId: string) => `/review/lawyer/${lawyerId}`,
  CREATE: (lawyerId: string) => `/review/lawyer/${lawyerId}`,
};

export const learnPackageEndpoints = {
  LIST: '/learn-package',
  DETAIL: (id: string) => `/learn-package/${id}`,
  CREATE: '/learn-package',
  UPDATE: (id: string) => `/learn-package/${id}`,
  DELETE: (id: string) => `/learn-package/${id}`,
  SUBSCRIBE: (id: string) => `/learn-package/${id}/subscribe`,
};

export const notificationEndpoints = {
  LIST: '/notification',
  UNREAD_COUNT: '/notification/unread-count',
  READ_ALL: '/notification/read-all',
  READ: (id: string) => `/notification/read/${id}`,
  CLEAR_ALL: '/notification/clear-all',
  DELETE: (id: string) => `/notification/${id}`,
};
