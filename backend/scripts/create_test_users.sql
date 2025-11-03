-- Script para crear usuarios de prueba en el sistema Zirius
-- Ejecutar en la base de datos ziriuzco_ziriuz

-- Crear usuarios de prueba
INSERT INTO usuarios (usuario, clave, nombre, email, activo) VALUES
('admin', 'admin123', 'Administrador Principal', 'admin@zirius.com', 1),
('tecnico1', 'tecnico123', 'Juan Pérez - Técnico', 'tecnico1@zirius.com', 1),
('analista1', 'analista123', 'María García - Analista', 'analista1@zirius.com', 1),
('coordinador1', 'coordinador123', 'Carlos López - Coordinador', 'coordinador1@zirius.com', 1),
('comercial1', 'comercial123', 'Ana Rodríguez - Comercial', 'comercial1@zirius.com', 1);

-- Obtener los IDs de los usuarios recién creados (ajustar según la estructura de tu tabla)
-- Asumiendo que los IDs son secuenciales, pero se puede ajustar

-- Crear roles para los usuarios (si existe tabla de roles)
-- Nota: Ajustar según la estructura real de la base de datos
INSERT INTO user_roles (id_usuario, role_type, activo) 
SELECT id, 'admin', 1 FROM usuarios WHERE usuario = 'admin'
UNION ALL
SELECT id, 'tecnico', 1 FROM usuarios WHERE usuario = 'tecnico1'
UNION ALL
SELECT id, 'analista', 1 FROM usuarios WHERE usuario = 'analista1'
UNION ALL
SELECT id, 'coordinador', 1 FROM usuarios WHERE usuario = 'coordinador1'
UNION ALL
SELECT id, 'comercial', 1 FROM usuarios WHERE usuario = 'comercial1';

-- Verificar que los usuarios se crearon correctamente
SELECT u.id, u.usuario, u.nombre, u.email, ur.role_type 
FROM usuarios u 
LEFT JOIN user_roles ur ON u.id = ur.id_usuario 
WHERE u.usuario IN ('admin', 'tecnico1', 'analista1', 'coordinador1', 'comercial1');