import { authEndpoints } from '@/constants/endpoints';
import { baseApi } from '../base';
import {
  LoginRequestDto,
  LoginResponse,
  RegisterRequestDto,
  RegisterResponse,
  UserResponse,
  ResponseDto,
} from '@/types';

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequestDto>({
      query: (body) => ({
        url: authEndpoints.LOGIN,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<RegisterResponse, RegisterRequestDto | FormData>({
      query: (body) => ({
        url: authEndpoints.REGISTER,
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: builder.mutation<ResponseDto<null>, { email: string; token: string }>({
      query: (body) => ({
        url: authEndpoints.VERIFY_EMAIL,
        method: 'POST',
        body,
      }),
    }),
    resendVerification: builder.mutation<ResponseDto<null>, { email: string }>({
      query: (body) => ({
        url: authEndpoints.RESEND_VERIFICATION,
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<UserResponse, void>({
      query: () => ({
        url: authEndpoints.ME,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    refreshToken: builder.mutation<ResponseDto<{ token: string }>, { refreshToken: string }>({
      query: (body) => ({
        url: authEndpoints.REFRESH_TOKEN,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useRefreshTokenMutation,
} = authApi;
