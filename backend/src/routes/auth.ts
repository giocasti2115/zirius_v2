import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Public routes
router.post('/login', AuthController.login)
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
      'INSERT INTO usuarios (nombre, email, password, telefono, rol, activo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [testUser.nombre, testUser.email, testUser.password, testUser.telefono, testUser.rol, testUser.activo]
    )
    
    res.json({ success: true, message: 'Usuario de prueba creado', email: testUser.email })
  } catch (error) {
    console.error('Error creating test user:', error)
    res.status(500).json({ success: false, message: 'Error creando usuario' })
  }
})

// Protected routes
router.post('/logout', requireAuth, AuthController.logout)
router.get('/me', requireAuth, AuthController.me)
router.get('/profile', requireAuth, AuthController.me)
router.post('/change-password', requireAuth, AuthController.changePassword)
router.get('/verify', requireAuth, AuthController.verifyToken)

export default router