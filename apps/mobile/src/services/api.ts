import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';

export const api = axios.create({
  baseURL: Config.apiUrl,
  timeout: Config.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('smartpark_user_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // secure store fallback in environments where not available
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn(`[API Error] ${error.config?.url} returned ${error.response.status}`);
    } else {
      console.warn(`[API Network Error] ${error.config?.url}: ${error.message}`);
    }
    return Promise.reject(error);
  }
);
