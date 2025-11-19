import { Request } from 'express'

// Authentication Types
export interface User {
  id: number
  username?: string
  nombre: string
  email: string
  role: 'admin' | 'tecnico' | 'analista' | 'coordinador' | 'comercial'
  activo: number
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  usuario: string
  clave: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    user: Omit<User, 'password'>
    token: string
    refreshToken: string
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User
}

export interface JWTPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthMiddlewareOptions {
  roles?: string[]
  optional?: boolean
}