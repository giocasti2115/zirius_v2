import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import db from '../config/database'
import { JWTUtils } from '../utils/jwt'
import { LoginRequest, LoginResponse, User, RefreshTokenRequest } from '../types/auth'
import Joi from 'joi'

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida'
  })
})

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'El refresh token es requerido'
  })
})

export class AuthController {
  /**
   * Login de usuario
   */
  static async login(req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>): Promise<void> {
    try {
      // Validar datos de entrada
      const { error, value } = loginSchema.validate(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details?.[0]?.message || 'Error de validación'
        })
        return
      }

      const { email, password } = value

      // Buscar usuario por email
      const userQuery = `
        SELECT id, nombre, email, password, telefono, rol, activo, created_at, updated_at
        FROM usuarios 
        WHERE email = ? AND activo = 1
      `
      
      const userResult = await db.query(userQuery, [email])
      const users = userResult as any[]
      
      if (!users || users.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        })
        return
      }

      const user = users[0] as User & { password: string }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        })
        return
      }

      // Generar tokens
      const { token, refreshToken } = JWTUtils.generateTokenPair(user)

      // Remover password del objeto usuario
      const { password: _, ...userWithoutPassword } = user

      // Log de login exitoso
      console.log(`✅ Login exitoso: ${user.email} (${user.rol})`)

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userWithoutPassword,
          token,
          refreshToken
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Logout de usuario
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log(`🚪 Logout: ${req.user?.email}`)
      
      res.json({
        success: true,
        message: 'Logout exitoso'
      })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        })
        return
      }

      res.json({
        success: true,
        data: {
          user: req.user
        }
      })
    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Renovar token de acceso usando refresh token
   */
  static async refreshToken(req: Request<{}, any, RefreshTokenRequest>, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const { error, value } = refreshTokenSchema.validate(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details?.[0]?.message || 'Error de validación'
        })
        return
      }

      const { refreshToken } = value

      // Verificar refresh token
      let payload
      try {
        payload = JWTUtils.verifyRefreshToken(refreshToken)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Refresh token inválido'
        res.status(401).json({
          success: false,
          message: errorMessage
        })
        return
      }

      // Buscar usuario en la base de datos
      const userQuery = `
        SELECT id, nombre, email, telefono, rol, activo, created_at, updated_at
        FROM usuarios 
        WHERE id = ? AND activo = 1
      `
      
      const userResult = await db.query(userQuery, [payload.userId])
      const users = userResult as any[]
      
      if (!users || users.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo'
        })
        return
      }

      const user = users[0] as User

      // Generar nuevo access token
      const newToken = JWTUtils.generateAccessToken(user)

      console.log(`🔄 Token renovado: ${user.email}`)

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          token: newToken,
          user
        }
      })
    } catch (error) {
      console.error('Refresh token error:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Verificar si el token es válido
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        })
        return
      }

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: req.user,
          valid: true
        }
      })
    } catch (error) {
      console.error('Verify token error:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        })
        return
      }

      const changePasswordSchema = Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      })

      const { error, value } = changePasswordSchema.validate(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details?.[0]?.message || 'Error de validación'
        })
        return
      }

      const { currentPassword, newPassword } = value

      // Obtener contraseña actual del usuario
      const userQuery = `SELECT password FROM usuarios WHERE id = ?`
      const userResult = await db.query(userQuery, [req.user.id])
      const users = userResult as any[]
      
      if (!users || users.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        })
        return
      }

      const currentHashedPassword = users[0].password

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentHashedPassword)
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        })
        return
      }

      // Hash de la nueva contraseña
      const newHashedPassword = await bcrypt.hash(newPassword, 10)

      // Actualizar contraseña
      const updateQuery = `UPDATE usuarios SET password = ?, updated_at = NOW() WHERE id = ?`
      await db.query(updateQuery, [newHashedPassword, req.user.id])

      console.log(`🔐 Contraseña cambiada: ${req.user.email}`)

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      })
    } catch (error) {
      console.error('Change password error:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}