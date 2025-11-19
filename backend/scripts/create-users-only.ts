import bcrypt from 'bcryptjs'
import db from '../src/config/database'

async function createUsersTable() {
  try {
    console.log('🚀 Creando tabla de usuarios...')
    
    // Crear tabla de usuarios
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'tecnico', 'analista', 'coordinador', 'comercial') DEFAULT 'tecnico',
        nombre VARCHAR(100) NOT NULL,
        activo TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `
    
    await db.query(createTableQuery)
    console.log('✅ Tabla de usuarios creada')
    
    // Verificar si ya existen usuarios
    const existingUsers = await db.query('SELECT COUNT(*) as count FROM users')
    const userCount = (existingUsers as any[])[0].count
    
    if (userCount > 0) {
      console.log(`📊 Ya existen ${userCount} usuarios en la base de datos`)
      return
    }
    
    console.log('👥 Creando usuarios de prueba...')
    
    // Crear contraseñas hasheadas
    const adminPassword = await bcrypt.hash('admin123', 10)
    const tecnicoPassword = await bcrypt.hash('tecnico123', 10)
    const analistaPassword = await bcrypt.hash('analista123', 10)
    const coordinadorPassword = await bcrypt.hash('coordinador123', 10)
    const comercialPassword = await bcrypt.hash('comercial123', 10)
    
    // Insertar usuarios de prueba
    const users = [
      ['admin', 'admin@ziriuz.com', adminPassword, 'admin', 'Administrador del Sistema'],
      ['tecnico1', 'tecnico1@ziriuz.com', tecnicoPassword, 'tecnico', 'Juan Carlos Técnico'],
      ['analista1', 'analista1@ziriuz.com', analistaPassword, 'analista', 'María Elena Analista'],
      ['coordinador1', 'coordinador1@ziriuz.com', coordinadorPassword, 'coordinador', 'Pedro Coordinador'],
      ['comercial1', 'comercial1@ziriuz.com', comercialPassword, 'comercial', 'Ana Comercial']
    ]
    
    for (const user of users) {
      const insertQuery = `
        INSERT INTO users (username, email, password, role, nombre) 
        VALUES (?, ?, ?, ?, ?)
      `
      await db.query(insertQuery, user)
      console.log(`✅ Usuario creado: ${user[0]} (${user[3]})`)
    }
    
    console.log('🎉 Todos los usuarios de prueba fueron creados exitosamente!')
    console.log('')
    console.log('📋 Credenciales de acceso:')
    console.log('  admin / admin123')
    console.log('  tecnico1 / tecnico123')
    console.log('  analista1 / analista123')
    console.log('  coordinador1 / coordinador123')
    console.log('  comercial1 / comercial123')
    
  } catch (error) {
    console.error('❌ Error creando usuarios:', error)
  } finally {
    process.exit(0)
  }
}

createUsersTable()