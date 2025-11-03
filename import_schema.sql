-- Script para crear la estructura completa de la base de datos Ziriuz
-- Basado en el sistema PHP original

USE ziriuzco_ziriuz;

-- Tabla de servicios (tipos de servicio disponibles)
CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  descripcion TEXT,
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de marcas de equipos
CREATE TABLE IF NOT EXISTS marcas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(191) NOT NULL,
  descripcion TEXT,
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de clases de equipos
CREATE TABLE IF NOT EXISTS clases (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(191) NOT NULL,
  descripcion TEXT,
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de modelos de equipos
CREATE TABLE IF NOT EXISTS modelos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_marca INT UNSIGNED,
  id_clase INT UNSIGNED,
  nombre VARCHAR(191) NOT NULL,
  descripcion TEXT,
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_marca) REFERENCES marcas(id),
  FOREIGN KEY (id_clase) REFERENCES clases(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(191) NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  rol VARCHAR(50) DEFAULT 'usuario',
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de solicitudes de bodega
CREATE TABLE IF NOT EXISTS solicitudes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cliente INT,
  id_sede INT,
  id_equipo INT,
  tipo_solicitud VARCHAR(50) NOT NULL, -- 'bodega', 'decommission', etc.
  estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'aprobada', 'despachada', 'terminada', 'rechazada'
  prioridad VARCHAR(20) DEFAULT 'media', -- 'baja', 'media', 'alta', 'urgente'
  descripcion TEXT,
  observaciones TEXT,
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP NULL,
  id_usuario_solicita INT UNSIGNED,
  id_usuario_aprueba INT UNSIGNED NULL,
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_cliente) REFERENCES clientes(id),
  FOREIGN KEY (id_sede) REFERENCES sedes(id),
  FOREIGN KEY (id_equipo) REFERENCES equipos(id),
  FOREIGN KEY (id_usuario_solicita) REFERENCES usuarios(id),
  FOREIGN KEY (id_usuario_aprueba) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de órdenes de trabajo
CREATE TABLE IF NOT EXISTS ordenes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero_orden VARCHAR(50) UNIQUE NOT NULL,
  id_solicitud INT UNSIGNED,
  id_cliente INT,
  id_sede INT,
  id_equipo INT,
  id_servicio INT UNSIGNED,
  estado VARCHAR(50) DEFAULT 'creada', -- 'creada', 'asignada', 'en_proceso', 'completada', 'cancelada'
  prioridad VARCHAR(20) DEFAULT 'media',
  descripcion_problema TEXT,
  solucion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_asignacion TIMESTAMP NULL,
  fecha_inicio TIMESTAMP NULL,
  fecha_finalizacion TIMESTAMP NULL,
  id_tecnico INT UNSIGNED NULL,
  costo_estimado DECIMAL(10,2),
  costo_real DECIMAL(10,2),
  tiempo_estimado INT, -- en minutos
  tiempo_real INT, -- en minutos
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id),
  FOREIGN KEY (id_cliente) REFERENCES clientes(id),
  FOREIGN KEY (id_sede) REFERENCES sedes(id),
  FOREIGN KEY (id_equipo) REFERENCES equipos(id),
  FOREIGN KEY (id_servicio) REFERENCES services(id),
  FOREIGN KEY (id_tecnico) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de visitas técnicas
CREATE TABLE IF NOT EXISTS visitas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_orden INT UNSIGNED,
  id_cliente INT,
  id_sede INT,
  id_tecnico INT UNSIGNED,
  tipo_visita VARCHAR(50) NOT NULL, -- 'diagnostico', 'correctivo', 'preventivo', 'instalacion', 'garantia'
  estado VARCHAR(50) DEFAULT 'programada', -- 'programada', 'en_curso', 'completada', 'cancelada', 'reprogramada'
  fecha_programada TIMESTAMP NOT NULL,
  fecha_inicio TIMESTAMP NULL,
  fecha_fin TIMESTAMP NULL,
  observaciones_tecnico TEXT,
  observaciones_cliente TEXT,
  firma_cliente VARCHAR(255), -- Path to signature file
  calificacion TINYINT, -- 1-5 stars
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_orden) REFERENCES ordenes(id),
  FOREIGN KEY (id_cliente) REFERENCES clientes(id),
  FOREIGN KEY (id_sede) REFERENCES sedes(id),
  FOREIGN KEY (id_tecnico) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero_cotizacion VARCHAR(50) UNIQUE NOT NULL,
  id_cliente INT,
  id_sede INT,
  id_orden INT UNSIGNED NULL,
  estado VARCHAR(50) DEFAULT 'borrador', -- 'borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'
  subtotal DECIMAL(12,2) DEFAULT 0,
  descuento DECIMAL(5,2) DEFAULT 0, -- porcentaje
  impuestos DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  vigencia_dias INT DEFAULT 30,
  fecha_vencimiento DATE,
  observaciones TEXT,
  terminos_condiciones TEXT,
  id_usuario_crea INT UNSIGNED,
  fecha_aprobacion TIMESTAMP NULL,
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_cliente) REFERENCES clientes(id),
  FOREIGN KEY (id_sede) REFERENCES sedes(id),
  FOREIGN KEY (id_orden) REFERENCES ordenes(id),
  FOREIGN KEY (id_usuario_crea) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de items de cotización
CREATE TABLE IF NOT EXISTS cotizacion_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cotizacion INT UNSIGNED,
  tipo_item VARCHAR(50) NOT NULL, -- 'servicio', 'repuesto', 'mano_obra'
  descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(8,2) DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_cotizacion) REFERENCES cotizaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de repuestos
CREATE TABLE IF NOT EXISTS repuestos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  id_marca INT UNSIGNED NULL,
  categoria VARCHAR(100),
  precio_compra DECIMAL(10,2),
  precio_venta DECIMAL(10,2),
  stock_actual INT DEFAULT 0,
  stock_minimo INT DEFAULT 0,
  ubicacion VARCHAR(100),
  activo TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_marca) REFERENCES marcas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;