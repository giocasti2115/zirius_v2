import { Request } from 'express'

// Authentication Types
export interface User {
  id: number
  nombre: string
  email: string
  telefono: string
  rol: 'admin' | 'tecnico' | 'cliente' | 'coordinador'
  activo: number
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
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
  rol: string
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