import { Request, Response, NextFunction } from 'express'
import db from '../config/database'
import { JWTUtils } from '../utils/jwt'
import { User, AuthMiddlewareOptions } from '../types/auth'

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

/**
 * Middleware de autenticación JWT moderno
 */
export const authMiddleware = (options: AuthMiddlewareOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extraer token del header Authorization
      const token = JWTUtils.extractTokenFromHeader(req.headers.authorization as string)
      
      if (!token) {
        if (options.optional) {
          return next()
        }
        return res.status(401).json({
          success: false,
          message: 'Token de acceso requerido',
          code: 'NO_TOKEN'
        })
      }

      // Verificar token
      let payload
      try {
        payload = JWTUtils.verifyAccessToken(token)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token inválido'
        return res.status(401).json({
          success: false,
          message: errorMessage,
          code: errorMessage.includes('expired') ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
        })
      }

      // Buscar usuario en la base de datos
      const userQuery = `
        SELECT id, nombre, correo, activo
        FROM usuarios 
        WHERE id = ? AND activo = 1
      `
      
      const userResult = await db.query(userQuery, [payload.userId])
      const users = userResult as any[]
      
      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo',
          code: 'USER_NOT_FOUND'
        })
      }

      const user = users[0] as User
      
      // Verificar roles si se especifican
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a este recurso',
            code: 'INSUFFICIENT_PERMISSIONS',
            requiredRoles: options.roles,
            userRole: user.role
          })
        }
      }

      // Adjuntar usuario a la request
      req.user = user
      
      next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

/**
 * Middleware que requiere autenticación
 */
export const requireAuth = authMiddleware()

/**
 * Middleware que requiere rol de administrador
 */
export const requireAdmin = authMiddleware({ roles: ['admin'] })

/**
 * Middleware que requiere rol de técnico o superior
 */
export const requireTechnician = authMiddleware({ roles: ['admin', 'coordinador', 'tecnico'] })

/**
 * Middleware de autenticación opcional
 */
export const optionalAuth = authMiddleware({ optional: true })

/**
 * Middleware que requiere roles específicos
 */
export const requireRoles = (roles: string[]) => authMiddleware({ roles })

// Legacy compatibility exports
export const authenticateToken = requireAuth
export const authenticate = requireAuth
export const requireRole = requireRoles
export const requireTecnico = requireTechnician
export const requireAnalista = authMiddleware({ roles: ['admin', 'analista'] })
export const requireCoordinador = authMiddleware({ roles: ['admin', 'coordinador'] })
export const requireComercial = authMiddleware({ roles: ['admin', 'comercial'] })