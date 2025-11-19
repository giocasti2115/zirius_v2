-- Crear tablas para Solicitudes de Bodega - Simplificado
USE ziriuzco_ziriuz_dev;

-- Tabla principal de solicitudes de bodega
CREATE TABLE IF NOT EXISTS solicitudes_bodega (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    aviso VARCHAR(100) NOT NULL,
    id_cliente INT UNSIGNED DEFAULT NULL,
    id_sede INT UNSIGNED DEFAULT NULL,
    id_equipo INT UNSIGNED DEFAULT NULL,
    id_orden INT UNSIGNED DEFAULT NULL,
    id_creador INT UNSIGNED DEFAULT NULL,
    id_aprobador INT UNSIGNED DEFAULT NULL,
    estado ENUM('pendiente', 'aprobada', 'despachada', 'terminada', 'rechazada') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
    tipo_servicio ENUM('correctivo', 'preventivo', 'garantia') DEFAULT 'correctivo',
    observaciones TEXT DEFAULT NULL,
    ubicacion_equipo VARCHAR(255) DEFAULT NULL,
    contacto_sede VARCHAR(255) DEFAULT NULL,
    telefono_contacto VARCHAR(50) DEFAULT NULL,
    valor_total DECIMAL(15,2) DEFAULT 0.00,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL DEFAULT NULL,
    fecha_despacho TIMESTAMP NULL DEFAULT NULL,
    fecha_terminacion TIMESTAMP NULL DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de repuestos de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes_bodega_repuestos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT UNSIGNED NOT NULL,
    id_repuesto INT UNSIGNED DEFAULT NULL,
    descripcion VARCHAR(500) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    precio_unitario DECIMAL(15,2) DEFAULT 0.00,
    precio_total DECIMAL(15,2) DEFAULT 0.00,
    estado ENUM('pendiente', 'aprobado', 'despachado', 'entregado', 'rechazado') DEFAULT 'pendiente',
    observaciones TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_bodega(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de items adicionales
CREATE TABLE IF NOT EXISTS solicitudes_bodega_items_adicionales (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT UNSIGNED NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    precio_unitario DECIMAL(15,2) DEFAULT 0.00,
    precio_total DECIMAL(15,2) DEFAULT 0.00,
    estado ENUM('pendiente', 'aprobado', 'despachado', 'entregado', 'rechazado') DEFAULT 'pendiente',
    observaciones TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_bodega(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de novedades/historial
CREATE TABLE IF NOT EXISTS solicitudes_bodega_novedades (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT UNSIGNED NOT NULL,
    id_usuario INT UNSIGNED DEFAULT NULL,
    accion VARCHAR(100) NOT NULL,
    observaciones TEXT DEFAULT NULL,
    fecha_novedad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_bodega(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar datos de prueba
INSERT IGNORE INTO solicitudes_bodega (id, aviso, id_cliente, id_sede, id_equipo, id_creador, estado, prioridad, tipo_servicio, observaciones, valor_total) VALUES
(1, 'SB-2025-001', 1, 1, 1, 1, 'pendiente', 'alta', 'correctivo', 'Solicitud urgente de repuestos para equipo dental', 450000.00),
(2, 'SB-2025-002', 2, 2, 2, 1, 'aprobada', 'media', 'preventivo', 'Repuestos para mantenimiento preventivo', 280000.00),
(3, 'SB-2025-003', 3, 3, 3, 2, 'despachada', 'media', 'correctivo', 'Filtros y componentes de repuesto', 150000.00),
(4, 'SB-2025-004', 1, 1, 4, 2, 'terminada', 'baja', 'garantia', 'Repuesto bajo garantía', 0.00),
(5, 'SB-2025-005', 2, 2, 5, 1, 'rechazada', 'media', 'correctivo', 'Solicitud rechazada por presupuesto', 750000.00);

-- Insertar repuestos de prueba
INSERT IGNORE INTO solicitudes_bodega_repuestos (id_solicitud, descripcion, cantidad, precio_unitario, precio_total, estado) VALUES
(1, 'Filtro de aire principal para compresor', 2, 85000.00, 170000.00, 'pendiente'),
(1, 'Manguera de alta presión 2m', 1, 125000.00, 125000.00, 'pendiente'),
(2, 'Aceite hidráulico 1L', 4, 35000.00, 140000.00, 'aprobado'),
(3, 'Lámpara LED para unidad dental', 1, 150000.00, 150000.00, 'despachado');

-- Insertar items adicionales de prueba
INSERT IGNORE INTO solicitudes_bodega_items_adicionales (id_solicitud, descripcion, cantidad, precio_unitario, precio_total, estado) VALUES
(1, 'Destornilladores especializados', 1, 45000.00, 45000.00, 'pendiente'),
(2, 'Guantes de nitrilo caja x100', 2, 25000.00, 50000.00, 'aprobado');

-- Insertar novedades de prueba
INSERT IGNORE INTO solicitudes_bodega_novedades (id_solicitud, id_usuario, accion, observaciones) VALUES
(1, 1, 'creada', 'Solicitud de bodega creada'),
(2, 2, 'aprobada', 'Solicitud aprobada por supervisor'),
(3, 2, 'despachada', 'Repuestos despachados a sede'),
(4, 2, 'terminada', 'Solicitud completada'),
(5, 2, 'rechazada', 'Rechazada por presupuesto insuficiente');

SELECT 'Tablas de Solicitudes de Bodega creadas exitosamente' as resultado;