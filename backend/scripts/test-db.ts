import db from '../src/config/database'

async function testConnection() {
  try {
    console.log('🧪 Probando conexión a la base de datos...')
    
    const result = await db.query('SELECT 1 as test')
    console.log('✅ Conexión exitosa:', result)
    
    const tables = await db.query('SHOW TABLES')
    console.log('📋 Tablas disponibles:', tables)
    
    const users = await db.query('SELECT COUNT(*) as count FROM users')
    console.log('👥 Usuarios en la base de datos:', users)
    
  } catch (error) {
    console.error('❌ Error de conexión:', error)
  } finally {
    process.exit(0)
  }
}

testConnection()