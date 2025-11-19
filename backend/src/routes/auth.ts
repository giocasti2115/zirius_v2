import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { requireAuth } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@test.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT token para autenticación
 *                     refreshToken:
 *                       type: string
 *                       description: Token para renovar la sesión
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', AuthController.login)

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Renovar token de acceso
 *     description: Obtiene un nuevo token de acceso usando el refresh token
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de renovación válido
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Refresh token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh-token', AuthController.refreshToken)

// Temporary route to create test user
router.post('/create-test-user', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const db = require('../config/database').default
    
    const testUser = {
      nombre: 'Admin Test',
      email: 'admin@test.com',
      password: await bcrypt.hash('admin123', 10),
      telefono: '+57 300 000 0000',
      rol: 'admin',
      activo: 1
    }
    
    // Check if user exists
    const existingUser = await db.query('SELECT * FROM usuarios WHERE email = ?', [testUser.email])
    if (existingUser.length > 0) {
      res.status(400).json({ success: false, message: 'Usuario ya existe' })
      return
    }
    
    // Insert user
    await db.query(
      'INSERT INTO users (nombre, email, password, telefono, role, activo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [testUser.nombre, testUser.email, testUser.password, testUser.telefono, testUser.rol, testUser.activo]
    )
    
    res.json({ success: true, message: 'Usuario de prueba creado', email: testUser.email })
  } catch (error) {
    console.error('Error creating test user:', error)
    res.status(500).json({ success: false, message: 'Error creando usuario' })
  }
})

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida el token actual del usuario
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada exitosamente
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', requireAuth, AuthController.logout)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener perfil del usuario
 *     description: Retorna la información del usuario autenticado
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', requireAuth, AuthController.me)

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verificar token
 *     description: Verifica si el token actual es válido
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify', requireAuth, AuthController.verifyToken)

export default router