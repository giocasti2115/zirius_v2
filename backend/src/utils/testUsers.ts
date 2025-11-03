// Usuarios de prueba hardcodeados para desarrollo (temporal)
// En producción, estos vendrán de la base de datos

export const TEST_USERS = [
  {
    id: 1,
    usuario: 'admin',
    clave: 'admin123',
    nombre: 'Administrador Principal',
    email: 'admin@zirius.com',
    activo: 1,
    role_type: 'admin'
  },
  {
    id: 2,
    usuario: 'tecnico1',
    clave: 'tecnico123',
    nombre: 'Juan Pérez - Técnico',
    email: 'tecnico1@zirius.com',
    activo: 1,
    role_type: 'tecnico'
  },
  {
    id: 3,
    usuario: 'analista1',
    clave: 'analista123',
    nombre: 'María García - Analista',
    email: 'analista1@zirius.com',
    activo: 1,
    role_type: 'analista'
  },
  {
    id: 4,
    usuario: 'coordinador1',
    clave: 'coordinador123',
    nombre: 'Carlos López - Coordinador',
    email: 'coordinador1@zirius.com',
    activo: 1,
    role_type: 'coordinador'
  },
  {
    id: 5,
    usuario: 'comercial1',
    clave: 'comercial123',
    nombre: 'Ana Rodríguez - Comercial',
    email: 'comercial1@zirius.com',
    activo: 1,
    role_type: 'comercial'
  }
];

export function findTestUser(username: string) {
  return TEST_USERS.find(user => user.usuario === username);
}

export function validateTestCredentials(username: string, password: string) {
  const user = findTestUser(username);
  return user && user.clave === password ? user : null;
}