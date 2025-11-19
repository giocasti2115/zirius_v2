import { Request, Response } from 'express'
import mysql from 'mysql2/promise'
import jwt from 'jsonwebtoken'

// Configuración de la base de datos
const dbConfig = {
  host: 'database',
  user: 'root',
  password: 'rootpassword',
  database: 'ziriuzco_ziriuz_real',
  port: 3306
}

/**
 * Login para base de datos real
 */
export const loginReal = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null

  try {
    const { usuario, clave } = req.body

    if (!usuario) {
      res.status(400).json({
        success: false,
        message: 'El usuario es requerido'
      })
      return
    }

    if (!clave) {
      res.status(400).json({
        success: false,
        message: 'La clave es requerida'
      })
      return
    }

    connection = await mysql.createConnection(dbConfig)

    // Buscar usuario en la base de datos real
    const [users] = await connection.execute(
      'SELECT id, usuario, nombre, clave FROM usuarios WHERE usuario = ? AND activo = 1',
      [usuario]
    )

    const userArray = users as any[]
    
    if (userArray.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      })
      return
    }

    const user = userArray[0]

    // Verificar contraseña (en este sistema parece ser texto plano)
    if (user.clave !== clave) {
      res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      })
      return
    }

    // Generar token JWT
    const jwtSecret = process.env.JWT_SECRET || 'ziriuz-super-secret-jwt-key-change-in-production-2024'
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.usuario,
        nombre: user.nombre
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre
      }
    })

  } catch (error) {
    console.error('Error en loginReal:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}