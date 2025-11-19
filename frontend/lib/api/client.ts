import axios, { AxiosResponse } from 'axios';

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
console.log('🌐 API_BASE_URL:', API_BASE_URL);

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log('� Debug config:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: (config.baseURL || '') + (config.url || '')
    });
    console.log('�🔄 API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    const token = localStorage.getItem('token'); // Cambiado de 'auth_token' a 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API Response:', response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.statusText, error.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token'); // Cambiado de 'auth_token' a 'token'
      localStorage.removeItem('user'); // Cambiado de 'user_data' a 'user'
      window.location.href = '/login'; // Mejor redirigir al login en lugar de '/'
    }
    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
  message?: string;
}

// Generic API functions
export const api = {
  get: <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.get(`http://localhost:3002/api/v1${url}`).then((res) => res.data),
  
  post: <T>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.post(`http://localhost:3002/api/v1${url}`, data).then((res) => res.data),
  
  put: <T>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.put(`http://localhost:3002/api/v1${url}`, data).then((res) => res.data),
  
  patch: <T>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.patch(`http://localhost:3002/api/v1${url}`, data).then((res) => res.data),
  
  delete: <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.delete(`http://localhost:3002/api/v1${url}`).then((res) => res.data),
};