-- Migración inicial de la base de datos ZIRIUZ
-- Fecha: 2025-11-02

-- Tabla de usuarios
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

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  documento VARCHAR(50),
  telefono VARCHAR(50),
  email VARCHAR(100),
  direccion TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_nombre (nombre),
  INDEX idx_documento (documento),
  INDEX idx_activo (activo),
  INDEX idx_deleted (deleted_at)
);

-- Tabla de sedes
CREATE TABLE IF NOT EXISTS sedes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(100),
  contacto_principal VARCHAR(100),
  ciudad VARCHAR(100),
  departamento VARCHAR(100),
  codigo_postal VARCHAR(20),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  INDEX idx_cliente (cliente_id),
  INDEX idx_nombre (nombre),
  INDEX idx_ciudad (ciudad),
  INDEX idx_activo (activo),
  INDEX idx_deleted (deleted_at)
);

-- Tabla de tipos de equipos
CREATE TABLE IF NOT EXISTS tipos_equipos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
);

-- Tabla de marcas de equipos
CREATE TABLE IF NOT EXISTS marcas_equipos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
);

-- Tabla de modelos de equipos
CREATE TABLE IF NOT EXISTS modelos_equipos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  marca_id INT NOT NULL,
  tipo_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  especificaciones JSON,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (marca_id) REFERENCES marcas_equipos(id),
  FOREIGN KEY (tipo_id) REFERENCES tipos_equipos(id),
  INDEX idx_marca (marca_id),
  INDEX idx_tipo (tipo_id),
  INDEX idx_nombre (nombre)
);

-- Tabla de equipos
CREATE TABLE IF NOT EXISTS equipos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sede_id INT NOT NULL,
  modelo_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  serie VARCHAR(100),
  codigo_interno VARCHAR(100),
  fecha_instalacion DATE,
  fecha_garantia DATE,
  estado ENUM('activo', 'inactivo', 'mantenimiento', 'dado_baja') DEFAULT 'activo',
  ubicacion VARCHAR(255),
  observaciones TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE,
  FOREIGN KEY (modelo_id) REFERENCES modelos_equipos(id),
  INDEX idx_sede (sede_id),
  INDEX idx_modelo (modelo_id),
  INDEX idx_serie (serie),
  INDEX idx_codigo (codigo_interno),
  INDEX idx_estado (estado),
  INDEX idx_activo (activo),
  INDEX idx_deleted (deleted_at)
);

-- Tabla de solicitudes de servicio
CREATE TABLE IF NOT EXISTS solicitudes_servicio (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo ENUM('preventivo', 'correctivo', 'instalacion', 'retiro') NOT NULL,
  prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
  estado ENUM('pendiente', 'aprobada', 'asignada', 'en_proceso', 'completada', 'rechazada') DEFAULT 'pendiente',
  descripcion TEXT NOT NULL,
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_programada DATETIME,
  fecha_completada DATETIME,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id),
  FOREIGN KEY (usuario_id) REFERENCES users(id),
  INDEX idx_equipo (equipo_id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_tipo (tipo),
  INDEX idx_estado (estado),
  INDEX idx_fecha_solicitud (fecha_solicitud),
  INDEX idx_fecha_programada (fecha_programada)
);

-- Tabla de ordenes de trabajo
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  solicitud_id INT NOT NULL,
  tecnico_id INT,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  estado ENUM('creada', 'asignada', 'en_proceso', 'completada', 'cancelada') DEFAULT 'creada',
  fecha_asignacion DATETIME,
  fecha_inicio DATETIME,
  fecha_fin DATETIME,
  duracion_estimada INT, -- en minutos
  duracion_real INT, -- en minutos
  descripcion_trabajo TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitudes_servicio(id),
  FOREIGN KEY (tecnico_id) REFERENCES users(id),
  INDEX idx_solicitud (solicitud_id),
  INDEX idx_tecnico (tecnico_id),
  INDEX idx_codigo (codigo),
  INDEX idx_estado (estado),
  INDEX idx_fecha_asignacion (fecha_asignacion)
);

-- Tabla de repuestos
CREATE TABLE IF NOT EXISTS repuestos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  precio DECIMAL(10,2),
  stock INT DEFAULT 0,
  stock_minimo INT DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_codigo (codigo),
  INDEX idx_nombre (nombre),
  INDEX idx_marca (marca),
  INDEX idx_stock (stock)
);

-- Tabla de repuestos utilizados en ordenes
CREATE TABLE IF NOT EXISTS orden_repuestos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orden_id INT NOT NULL,
  repuesto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  FOREIGN KEY (repuesto_id) REFERENCES repuestos(id),
  INDEX idx_orden (orden_id),
  INDEX idx_repuesto (repuesto_id)
);