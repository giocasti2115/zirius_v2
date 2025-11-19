-- Inicialización de la base de datos Zirius DEV
-- Este script se ejecuta automáticamente cuando se crea el contenedor MySQL
USE ziriuzco_ziriuz_dev;

-- Crear tabla de usuarios
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
);

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  documento VARCHAR(50),
  telefono VARCHAR(50),
  email VARCHAR(100),
  direccion TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de equipos
CREATE TABLE IF NOT EXISTS equipos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  modelo VARCHAR(100),
  marca VARCHAR(100),
  serie VARCHAR(100),
  estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo',
  cliente_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Crear tabla de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT,
  cliente_id INT,
  tipo VARCHAR(100),
  descripcion TEXT,
  estado ENUM('pendiente', 'en_proceso', 'completada', 'cancelada') DEFAULT 'pendiente',
  prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_estimada_resolucion TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Crear tabla de ordenes de trabajo
CREATE TABLE IF NOT EXISTS ordenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  solicitud_id INT,
  numero_orden VARCHAR(50) UNIQUE,
  descripcion TEXT,
  estado ENUM('creada', 'asignada', 'en_proceso', 'completada', 'cancelada') DEFAULT 'creada',
  tecnico_asignado_id INT,
  fecha_inicio TIMESTAMP NULL,
  fecha_fin TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id),
  FOREIGN KEY (tecnico_asignado_id) REFERENCES users(id)
);

-- Crear tabla de visitas
CREATE TABLE IF NOT EXISTS visitas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orden_id INT,
  fecha_programada TIMESTAMP,
  fecha_inicio TIMESTAMP NULL,
  fecha_fin TIMESTAMP NULL,
  estado ENUM('programada', 'en_curso', 'completada', 'cancelada') DEFAULT 'programada',
  observaciones TEXT,
  calificacion_cliente INT CHECK (calificacion_cliente >= 1 AND calificacion_cliente <= 5),
  duracion_estimada INT COMMENT 'Duración en minutos',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_id) REFERENCES ordenes(id)
);

-- Crear tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  solicitud_id INT,
  numero_cotizacion VARCHAR(50) UNIQUE,
  descripcion TEXT,
  monto_total DECIMAL(10,2),
  estado ENUM('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida') DEFAULT 'borrador',
  fecha_vencimiento TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id)
);

-- Insertar usuarios de prueba con contraseñas hasheadas
-- Todas las contraseñas son las mismas que creamos antes
INSERT INTO users (username, email, password, role, nombre) VALUES
('admin', 'admin@ziriuz.com', '$2a$10$oIGy96GvAlW/6IfpPRPKd..E2LxP5en4gGc7Y79xT2xKlWiSsM2TO', 'admin', 'Administrador del Sistema'),
('tecnico1', 'tecnico1@ziriuz.com', '$2a$10$oIGy96GvAlW/6IfpPRPKd..E2LxP5en4gGc7Y79xT2xKlWiSsM2TO', 'tecnico', 'Juan Carlos Técnico'),
('analista1', 'analista1@ziriuz.com', '$2a$10$oIGy96GvAlW/6IfpPRPKd..E2LxP5en4gGc7Y79xT2xKlWiSsM2TO', 'analista', 'María Elena Analista'),
('coordinador1', 'coordinador1@ziriuz.com', '$2a$10$oIGy96GvAlW/6IfpPRPKd..E2LxP5en4gGc7Y79xT2xKlWiSsM2TO', 'coordinador', 'Pedro Coordinador'),
('comercial1', 'comercial1@ziriuz.com', '$2a$10$oIGy96GvAlW/6IfpPRPKd..E2LxP5en4gGc7Y79xT2xKlWiSsM2TO', 'comercial', 'Ana Comercial')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Insertar datos de ejemplo para clientes
INSERT INTO clientes (nombre, documento, telefono, email, direccion) VALUES
('Clínica Dental San José', '900123456-1', '+57 1 234-5678', 'contacto@clinicasanjose.com', 'Carrera 15 #85-32, Bogotá'),
('Odontología Integral Medellín', '900234567-2', '+57 4 456-7890', 'info@odontologiaintegral.com', 'Calle 70 #45-67, Medellín'),
('Centro Odontológico Cali', '900345678-3', '+57 2 678-9012', 'gerencia@centroocali.com', 'Avenida 6N #28-45, Cali')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar datos de ejemplo para equipos
INSERT INTO equipos (nombre, modelo, marca, serie, estado, cliente_id) VALUES
('Unidad Dental Principal', 'Kavo Estetica E50', 'Kavo', 'KV2024001', 'activo', 1),
('Compresor Principal', 'Schulz CSL-10', 'Schulz', 'SC2024001', 'activo', 1),
('Unidad Dental Secundaria', 'Sirona Intego Pro', 'Sirona', 'SR2024001', 'activo', 2),
('Autoclave', 'Dentsply Statim 5000S', 'Dentsply', 'DS2024001', 'activo', 2),
('Rayos X', 'Planmeca ProMax 3D', 'Planmeca', 'PM2024001', 'mantenimiento', 3)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar datos de ejemplo para solicitudes
INSERT INTO solicitudes (equipo_id, cliente_id, tipo, descripcion, estado, prioridad) VALUES
(1, 1, 'Mantenimiento Preventivo', 'Revisión trimestral de unidad dental', 'pendiente', 'media'),
(2, 1, 'Reparación', 'Compresor presenta ruidos anormales', 'en_proceso', 'alta'),
(3, 2, 'Mantenimiento Correctivo', 'Fallo en sistema de aspiración', 'completada', 'alta'),
(4, 2, 'Calibración', 'Calibración anual de autoclave', 'pendiente', 'media'),
(5, 3, 'Reparación Urgente', 'Equipo de rayos X no enciende', 'en_proceso', 'urgente')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Insertar datos de ejemplo para ordenes
INSERT INTO ordenes (solicitud_id, numero_orden, descripcion, estado, tecnico_asignado_id) VALUES
(1, 'ORD-2024-001', 'Mantenimiento preventivo unidad dental', 'asignada', 2),
(2, 'ORD-2024-002', 'Reparación compresor - cambio de filtros', 'en_proceso', 2),
(3, 'ORD-2024-003', 'Reparación sistema aspiración', 'completada', 2),
(4, 'ORD-2024-004', 'Calibración autoclave', 'creada', NULL),
(5, 'ORD-2024-005', 'Reparación urgente equipo rayos X', 'asignada', 2)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Insertar datos de ejemplo para visitas
INSERT INTO visitas (orden_id, fecha_programada, estado, observaciones, duracion_estimada) VALUES
(1, '2024-11-05 09:00:00', 'programada', 'Visita de mantenimiento preventivo', 120),
(2, '2024-11-04 14:00:00', 'en_curso', 'Reparación en progreso', 90),
(3, '2024-11-02 10:00:00', 'completada', 'Reparación completada exitosamente', 150),
(4, '2024-11-06 11:00:00', 'programada', 'Calibración programada', 60),
(5, '2024-11-03 16:00:00', 'en_curso', 'Diagnóstico de falla', 180)
ON DUPLICATE KEY UPDATE observaciones = VALUES(observaciones);

-- Insertar datos de ejemplo para cotizaciones
INSERT INTO cotizaciones (solicitud_id, numero_cotizacion, descripcion, monto_total, estado) VALUES
(1, 'COT-2024-001', 'Mantenimiento preventivo unidad dental', 150000.00, 'aprobada'),
(2, 'COT-2024-002', 'Reparación compresor + repuestos', 350000.00, 'aprobada'),
(3, 'COT-2024-003', 'Reparación sistema aspiración', 280000.00, 'aprobada'),
(4, 'COT-2024-004', 'Calibración autoclave', 120000.00, 'enviada'),
(5, 'COT-2024-005', 'Reparación urgente rayos X', 800000.00, 'enviada')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Mostrar información de inicialización
SELECT 'Database initialized successfully' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as cliente_count FROM clientes;
SELECT COUNT(*) as equipo_count FROM equipos;
SELECT COUNT(*) as solicitud_count FROM solicitudes;
SELECT COUNT(*) as orden_count FROM ordenes;
SELECT COUNT(*) as visita_count FROM visitas;
SELECT COUNT(*) as cotizacion_count FROM cotizaciones;