import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import webStorageClient from '@/utils/webStorageClient';
import { authApi } from '../queries/auth';

interface AuthSliceState {
  isAuthenticated: boolean;
  user?: any;
  isHydrated: boolean;
}

const initialState: AuthSliceState = {
  isAuthenticated: false,
  user: undefined,
  isHydrated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserFromStorage: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = undefined;
      state.isAuthenticated = false;
      webStorageClient.logout();
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.isHydrated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        const payload = action.payload as any;
        const resData = payload?.data || payload;
        const token = resData?.token || resData?.accessToken;
        const user = resData?.user || resData;

        if (token) {
          webStorageClient.setToken(token);
        }
        if (user) {
          webStorageClient.setUser(user);
          state.user = user;
          state.isAuthenticated = true;
        }
      }
    );
  },
});

export const { setUserFromStorage, logout, setHydrated } = authSlice.actions;

export default authSlice.reducer;
