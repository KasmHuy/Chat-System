import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi, fetchMe as fetchMeApi } from '../api/authApi.js';
import { updateProfile as updateProfileApi } from '../api/userApi.js';

const token = localStorage.getItem('token');

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;
  if (typeof responseData === 'string' && responseData.trim()) return responseData;
  if (responseData?.message) return responseData.message;
  if (responseData?.error) return responseData.error;
  return error.message || fallback;
}

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const data = await loginApi(payload);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Login failed'));
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const data = await registerApi(payload);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Registration failed'));
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const data = await fetchMeApi();
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to fetch user'));
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const data = await updateProfileApi(id, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Update failed'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token,
    user: null,
    isAuthenticated: Boolean(token),
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearUpdateError(state) {
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email,
          displayName: action.payload.displayName || action.payload.username,
          avatarUrl: action.payload.avatarUrl || null,
          role: action.payload.role,
          online: action.payload.online,
          createdAt: action.payload.createdAt,
        };
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      // register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email,
          displayName: action.payload.displayName || action.meta.arg.displayName || action.payload.username,
          avatarUrl: action.payload.avatarUrl || action.meta.arg.avatarUrl || null,
          role: action.payload.role,
          online: action.payload.online,
          createdAt: action.payload.createdAt,
        };
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      // fetchMe
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Unable to fetch user';
        localStorage.removeItem('token');
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Merge updated fields into existing user
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || 'Update failed';
      });
  },
});

export const { logout, clearUpdateError } = authSlice.actions;
export default authSlice.reducer;
