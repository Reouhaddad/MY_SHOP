import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, updateUserProfile } from './loginAPI';
import { refreshToken as refresh } from './loginAPI';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const initialState = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  isLoggedIn: false,
  isLoading: false,
  isRegistered: false,
  error: null,
  regError: null,
  isSuperuser: false,
  token: localStorage.getItem('token') || null,
};

export const loginAsync = createAsyncThunk(
  'login',
  async ({ credentials, includeRefreshToken }, thunkAPI) => {
    try {
      const response = await login(credentials);
      localStorage.setItem('token', response.access);
      if (includeRefreshToken) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'login/registerAsync',
  async (credentials, thunkAPI) => {
    try {
      const response = await register(credentials);
      return response;
    } catch (regError) {
      return thunkAPI.rejectWithValue(regError.message);
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'login/refreshAccessToken',
  async (_, thunkAPI) => {
    try {
      const response = await refresh();
      localStorage.setItem('token', response.access);
      toast.success('Token refreshed successfully!');
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  return { type: 'login/logout' };
};

export const checkTokenExpiration = createAsyncThunk(
  'login/checkTokenExpiration',
  async (_, thunkAPI) => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token) {
      thunkAPI.dispatch(handleLogout());
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        if (!refreshToken) {
          thunkAPI.dispatch(handleLogout());
          toast.error('Session expired. Please login again.');
        } else {
          const decodedRefreshToken = jwtDecode(refreshToken);
          if (decodedRefreshToken.exp < currentTime) {
            thunkAPI.dispatch(handleLogout());
            toast.error('Session expired. Please login again.');
          } else {
            await thunkAPI.dispatch(refreshAccessToken());
          }
        }
      }
    } catch (error) {
      thunkAPI.dispatch(handleLogout());
    }
  }
);

export const updateUserAsync = createAsyncThunk(
  'user/update',
  async (userData, thunkAPI) => {
    try {
      const response = await updateUserProfile(userData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.logged = true;
        state.isLoading = false;
        state.error = null;
        const decodedToken = jwtDecode(action.payload.access);
        state.username = decodedToken.username;
        state.isSuperuser = decodedToken.admin || false; // Vérification du statut de superutilisateur
        toast.success(`Login successful! Welcome ${state.username}!`);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase('login/logout', (state) => {
        state.isLoggedIn = false;
        state.username = '';
        state.isSuperuser = false; // Réinitialisation du statut de superutilisateur
        state.isLoading = false;
        state.error = null;
        state.regError = null;
        state.isRegistered = false;
        state.firstName = '';
        state.lastName = '';
        state.email = '';
      })
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.regError = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isRegistered = true;
        state.isLoading = false;
        state.regError = null;
        toast.success('Registration successful!')
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.regError = action.payload;
        toast.error(action.payload);
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.firstName = action.payload.firstName;
        state.lastName = action.payload.lastName;
        state.email = action.payload.email;
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const selectIsRegistered = (state) => state.login.isRegistered;
export const selectIsLoggedIn = (state) => state.login.isLoggedIn;
export const selectIsLoading = (state) => state.login.isLoading;
export const selectError = (state) => state.login.error;
export const selectRegError = (state) => state.login.regError;
export const selectUsername = (state) => state.login.username;
export const selectFirstName = (state) => state.login.firstName;
export const selectLastName = (state) => state.login.lastName;
export const selectEmail = (state) => state.login.email;
export const selectIsSuperuser = (state) => state.login.isSuperuser;
export const selectToken = (state) => state.login.token;

export default loginSlice.reducer;
