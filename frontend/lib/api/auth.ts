import { api, ApiResponse } from './client';

// Auth types
export interface LoginCredentials {
  usuario: string;
  clave: string;
}

export interface User {
  id: number;
  usuario: string;
  nombre: string;
  email?: string;
  correo?: string;  // Campo adicional para BD real
  roles: string[];
}

export interface LoginResponse {
  token: string;
  sessionId: number;
  user: User;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Auth API functions
export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        // Store token and user data
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Error al iniciar sesión',
          statusCode: error.response?.status || 500
        }
      };
    }
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      return response;
    } catch (error: any) {
      // Clear local storage even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      return {
        success: true,
        message: 'Sesión cerrada'
      };
    }
  },

  // Get current user info
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      return await api.get<{ user: User }>('/auth/me');
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Error al obtener información del usuario',
          statusCode: error.response?.status || 500
        }
      };
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<ApiResponse> => {
    try {
      return await api.post('/auth/change-password', data);
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Error al cambiar contraseña',
          statusCode: error.response?.status || 500
        }
      };
    }
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string; sessionId: number }>> => {
    try {
      const response = await api.post<{ token: string; sessionId: number }>('/auth/refresh-token');
      
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Error al renovar token',
          statusCode: error.response?.status || 500
        }
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user has specific role
  hasRole: (role: string): boolean => {
    const user = authApi.getCurrentUser();
    return user?.roles.includes(role) || user?.roles.includes('admin') || false;
  }
};