import db from '../src/config/database';
import { UserModel } from '../src/models/User';

interface TestUser {
  usuario: string;
  clave: string;
  nombre: string;
  email: string;
  role_type: 'admin' | 'tecnico' | 'analista' | 'coordinador' | 'comercial';
}

const testUsers: TestUser[] = [
  {
    usuario: 'admin',
    clave: 'admin123',
    nombre: 'Administrador Principal',
    email: 'admin@zirius.com',
    role_type: 'admin'
  },
  {
    usuario: 'tecnico1',
    clave: 'tecnico123',
    nombre: 'Juan Pérez - Técnico',
    email: 'tecnico1@zirius.com',
    role_type: 'tecnico'
  },
  {
    usuario: 'analista1',
    clave: 'analista123',
    nombre: 'María García - Analista',
    email: 'analista1@zirius.com',
    role_type: 'analista'
  },
  {
    usuario: 'coordinador1',
    clave: 'coordinador123',
    nombre: 'Carlos López - Coordinador',
    email: 'coordinador1@zirius.com',
    role_type: 'coordinador'
  },
  {
    usuario: 'comercial1',
    clave: 'comercial123',
    nombre: 'Ana Rodríguez - Comercial',
    email: 'comercial1@zirius.com',
    role_type: 'comercial'
  }
];

async function createTestUsers() {
  console.log('🚀 Iniciando creación de usuarios de prueba...');
  
  try {
    // Verificar conexión a la base de datos
    await db.query('SELECT 1');
    console.log('✅ Conexión a la base de datos establecida');

    for (const user of testUsers) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await UserModel.findByUsername(user.usuario);
        
        if (existingUser) {
          console.log(`⚠️  Usuario '${user.usuario}' ya existe, saltando...`);
          continue;
        }

        // Crear usuario
        console.log(`📝 Creando usuario: ${user.usuario}`);
        
        const userId = await db.query(
          'INSERT INTO usuarios (usuario, clave, nombre, email, activo) VALUES (?, ?, ?, ?, 1)',
          [user.usuario, user.clave, user.nombre, user.email]
        );

        console.log(`✅ Usuario '${user.usuario}' creado con ID: ${userId.insertId || 'N/A'}`);

        // Crear rol del usuario (si existe tabla de roles)
        try {
          await db.query(
            'INSERT INTO user_roles (id_usuario, role_type, activo) VALUES (?, ?, 1)',
            [userId.insertId, user.role_type]
          );
          console.log(`✅ Rol '${user.role_type}' asignado a '${user.usuario}'`);
        } catch (roleError) {
          console.log(`⚠️  No se pudo asignar rol a '${user.usuario}' (tabla user_roles puede no existir)`);
        }

      } catch (userError) {
        console.error(`❌ Error creando usuario '${user.usuario}':`, userError);
      }
    }

    // Mostrar usuarios creados
    console.log('\n📋 Usuarios de prueba disponibles:');
    console.log('==========================================');
    
    for (const user of testUsers) {
      console.log(`👤 Usuario: ${user.usuario}`);
      console.log(`🔑 Contraseña: ${user.clave}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🏷️  Rol: ${user.role_type}`);
      console.log(`👥 Nombre: ${user.nombre}`);
      console.log('------------------------------------------');
    }

    console.log('\n🎉 ¡Proceso completado! Puedes usar estas credenciales para acceder al sistema.');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
createTestUsers();