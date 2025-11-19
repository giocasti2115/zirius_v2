import jwt, { SignOptions } from 'jsonwebtoken'
import { JWTPayload, User } from '../types/auth'

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'ziriuz-secret-key-2025'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ziriuz-refresh-secret-2025'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

export class JWTUtils {
  /**
   * Generate access token
   */
  static generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    const options: SignOptions = {
      expiresIn: '24h'
    }

    return jwt.sign(payload, JWT_SECRET, options)
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    const options: SignOptions = {
      expiresIn: '7d'
    }

    return jwt.sign(payload, JWT_REFRESH_SECRET, options)
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token')
      } else {
        throw new Error('Token verification failed')
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token')
      } else {
        throw new Error('Refresh token verification failed')
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null
    
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null
    }
    
    return parts[1] || null
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(user: User) {
    return {
      token: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    }
  }
}