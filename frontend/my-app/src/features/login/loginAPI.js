import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.detail || 'Login failed');
  }
};

export const register = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.detail || 'Registration failed');
  }
}

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.detail || 'Error refreshing token');
  }
};
export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/updateUser`, userData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error || 'Error updating user profile');
  }
};