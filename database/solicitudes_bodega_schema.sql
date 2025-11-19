-- ==================================================
-- ESTRUCTURA DE BASE DE DATOS: SOLICITUDES DE BODEGA
-- ==================================================
-- Fecha: 18 de Noviembre 2025
-- Propósito: Crear tablas para módulo Solicitudes de Bodega
-- Base: ziriuzco_ziriuz_dev

USE ziriuzco_ziriuz_dev;

-- ==================================================
-- TABLA PRINCIPAL: solicitudes_bodega
-- ==================================================
CREATE TABLE IF NOT EXISTS solicitudes_bodega (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    
    -- Información básica
    aviso VARCHAR(100) NOT NULL COMMENT 'Número de aviso de la solicitud',
    
    -- Relaciones con otras tablas
    id_cliente INT UNSIGNED DEFAULT NULL COMMENT 'ID del cliente',
    id_sede INT UNSIGNED DEFAULT NULL COMMENT 'ID de la sede',
    id_equipo INT UNSIGNED DEFAULT NULL COMMENT 'ID del equipo',
    id_orden INT UNSIGNED DEFAULT NULL COMMENT 'ID de la orden relacionada',
    id_creador INT UNSIGNED DEFAULT NULL COMMENT 'ID del usuario que creó la solicitud',
    id_aprobador INT UNSIGNED DEFAULT NULL COMMENT 'ID del usuario que aprobó',
    id_procesador INT UNSIGNED DEFAULT NULL COMMENT 'ID del usuario que procesó',
    
    -- Estado y clasificación
    estado ENUM('pendiente', 'aprobada', 'despachada', 'terminada', 'rechazada') DEFAULT 'pendiente' COMMENT 'Estado actual de la solicitud',
    prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media' COMMENT 'Prioridad de la solicitud',
    tipo_servicio ENUM('correctivo', 'preventivo', 'garantia', 'instalacion') DEFAULT 'correctivo' COMMENT 'Tipo de servicio',
    
    -- Información detallada
    observaciones TEXT DEFAULT NULL COMMENT 'Observaciones generales de la solicitud',
    ubicacion_equipo VARCHAR(255) DEFAULT NULL COMMENT 'Ubicación específica del equipo',
    contacto_sede VARCHAR(255) DEFAULT NULL COMMENT 'Persona de contacto en la sede',
    telefono_contacto VARCHAR(50) DEFAULT NULL COMMENT 'Teléfono de contacto',
    
    -- Valores monetarios
    valor_total DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Valor total de la solicitud',
    valor_repuestos DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Valor total de repuestos',
    valor_items_adicionales DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Valor total de items adicionales',
    
    -- Fechas de seguimiento
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la solicitud',
    fecha_aprobacion TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de aprobación',
    fecha_despacho TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de despacho',
    fecha_terminacion TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de terminación',
    
    -- Campos de auditoría
    activo TINYINT(1) DEFAULT 1 COMMENT 'Registro activo (1) o inactivo (0)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_aviso (aviso),
    INDEX idx_cliente (id_cliente),
    INDEX idx_sede (id_sede),
    INDEX idx_equipo (id_equipo),
    INDEX idx_orden (id_orden),
    INDEX idx_creador (id_creador),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha_solicitud (fecha_solicitud),
    INDEX idx_activo (activo),
    
    -- Claves foráneas (comentadas para evitar errores si las tablas no existen)
    -- FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE SET NULL,
    -- FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE SET NULL,
    -- FOREIGN KEY (id_equipo) REFERENCES equipos(id) ON DELETE SET NULL,
    -- FOREIGN KEY (id_orden) REFERENCES ordenes(id) ON DELETE SET NULL,
    -- FOREIGN KEY (id_creador) REFERENCES usuarios(id) ON DELETE SET NULL,
    -- FOREIGN KEY (id_aprobador) REFERENCES usuarios(id) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabla principal de solicitudes de bodega y repuestos';

-- ==================================================
-- TABLA: solicitudes_bodega_repuestos
-- ==================================================
CREATE TABLE IF NOT EXISTS solicitudes_bodega_repuestos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    id_solicitud INT UNSIGNED NOT NULL COMMENT 'ID de la solicitud de bodega',
    id_repuesto INT UNSIGNED DEFAULT NULL COMMENT 'ID del repuesto (si existe en catálogo)',
    
    -- Información del repuesto
    codigo_repuesto VARCHAR(100) DEFAULT NULL COMMENT 'Código del repuesto',
    descripcion VARCHAR(500) NOT NULL COMMENT 'Descripción del repuesto',
    marca VARCHAR(100) DEFAULT NULL COMMENT 'Marca del repuesto',
    modelo VARCHAR(100) DEFAULT NULL COMMENT 'Modelo del repuesto',
    
    -- Cantidades y precios
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1.00 COMMENT 'Cantidad solicitada',
    precio_unitario DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Precio unitario del repuesto',
    precio_total DECIMAL(15,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED COMMENT 'Precio total calculado',
    
    -- Estado específico del repuesto
    estado ENUM('pendiente', 'aprobado', 'despachado', 'entregado', 'rechazado') DEFAULT 'pendiente',
    
    -- Información adicional
    observaciones TEXT DEFAULT NULL COMMENT 'Observaciones específicas del repuesto',
    proveedor VARCHAR(255) DEFAULT NULL COMMENT 'Proveedor del repuesto',
    fecha_entrega_estimada DATE DEFAULT NULL COMMENT 'Fecha estimada de entrega',
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_solicitud (id_solicitud),
    INDEX idx_repuesto (id_repuesto),
    INDEX idx_codigo (codigo_repuesto),
    INDEX idx_estado (estado),
    
    -- Clave foránea
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_bodega(id) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Repuestos específicos incluidos en cada solicitud de bodega';

-- ==================================================
-- TABLA: solicitudes_bodega_items_adicionales
-- ==================================================
CREATE TABLE IF NOT EXISTS solicitudes_bodega_items_adicionales (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación
    id_solicitud INT UNSIGNED NOT NULL COMMENT 'ID de la solicitud de bodega',
    
    -- Información del item
    descripcion VARCHAR(500) NOT NULL COMMENT 'Descripción del item adicional',
    categoria VARCHAR(100) DEFAULT NULL COMMENT 'Categoría del item (herramientas, materiales, etc.)',
    
    -- Cantidades y precios
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1.00 COMMENT 'Cantidad solicitada',
    precio_unitario DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Precio unitario estimado',
    precio_total DECIMAL(15,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED COMMENT 'Precio total calculado',
    
    -- Estado del item
    estado ENUM('pendiente', 'aprobado', 'despachado', 'entregado', 'rechazado') DEFAULT 'pendiente',
    
    -- Información adicional
    observaciones TEXT DEFAULT NULL COMMENT 'Observaciones específicas del item',
    justificacion TEXT DEFAULT NULL COMMENT 'Justificación de la necesidad del item',
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_solicitud (id_solicitud),
    INDEX idx_categoria (categoria),
    INDEX idx_estado (estado),
    
    -- Clave foránea
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_bodega(id) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Items adicionales (no repuestos) incluidos en solicitudes de bodega';

-- ==================================================
-- TABLA: solicitudes_bodega_novedades
-- ==================================================
CREATE TABLE IF NOT EXISTS solicitudes_bodega_novedades (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación
    id_solicitud INT UNSIGNED NOT NULL COMMENT 'ID de la solicitud de bodega',
    id_usuario INT UNSIGNED DEFAULT NULL COMMENT 'ID del usuario que genera la novedad',
    
    -- Información de la novedad
    accion VARCHAR(100) NOT NULL COMMENT 'Tipo de acción (creada, aprobada, rechazada, etc.)',
    observaciones TEXT DEFAULT NULL COMMENT 'Descripción detallada de la novedad',
    
    -- Estado anterior y nuevo (para tracking de cambios)
    estado_anterior VARCHAR(50) DEFAULT NULL COMMENT 'Estado antes del cambio',
    estado_nuevo VARCHAR(50) DEFAULT NULL COMMENT 'Estado después del cambio',
    
    -- Información adicional
    valores_modificados JSON DEFAULT NULL COMMENT 'JSON con campos modificados',
    ip_usuario VARCHAR(45) DEFAULT NULL COMMENT 'IP del usuario que realizó la acción',
    user_agent TEXT DEFAULT NULL COMMENT 'User agent del navegador',
    
    -- Fecha y auditoría
    fecha_novedad TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la novedad',
    
    -- Índices
    INDEX idx_solicitud (id_solicitud),
    INDEX idx_usuario (id_usuario),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha_novedad),
    
    -- Clave foránea
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_bodega(id) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Historial de cambios y novedades de las solicitudes de bodega';

-- ==================================================
-- TABLA: solicitudes_bodega_estados
-- ==================================================
CREATE TABLE IF NOT EXISTS solicitudes_bodega_estados (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    
    -- Información del estado
    estado VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del estado',
    descripcion VARCHAR(255) DEFAULT NULL COMMENT 'Descripción del estado',
    color VARCHAR(7) DEFAULT '#6B7280' COMMENT 'Color hex para UI',
    icono VARCHAR(50) DEFAULT NULL COMMENT 'Icono para UI',
    orden INT DEFAULT 0 COMMENT 'Orden de visualización',
    
    -- Configuración
    permite_edicion TINYINT(1) DEFAULT 1 COMMENT 'Permite editar la solicitud en este estado',
    es_estado_final TINYINT(1) DEFAULT 0 COMMENT 'Es un estado final (terminada, rechazada)',
    notificar_cambio TINYINT(1) DEFAULT 1 COMMENT 'Enviar notificación al cambiar a este estado',
    
    -- Auditoría
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_estado (estado),
    INDEX idx_orden (orden),
    INDEX idx_activo (activo)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Catálogo de estados disponibles para solicitudes de bodega';

-- ==================================================
-- DATOS INICIALES
-- ==================================================

-- Insertar estados básicos
INSERT IGNORE INTO solicitudes_bodega_estados (estado, descripcion, color, icono, orden, es_estado_final) VALUES
('pendiente', 'Solicitud creada, pendiente de aprobación', '#F59E0B', 'clock', 1, 0),
('aprobada', 'Solicitud aprobada, lista para despacho', '#10B981', 'check-circle', 2, 0),
('despachada', 'Repuestos despachados, en tránsito', '#3B82F6', 'truck', 3, 0),
('terminada', 'Solicitud completada exitosamente', '#059669', 'check-circle-2', 4, 1),
('rechazada', 'Solicitud rechazada', '#EF4444', 'x-circle', 5, 1);

-- ==================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ==================================================

-- Insertar algunas solicitudes de prueba
INSERT IGNORE INTO solicitudes_bodega (
    id, aviso, id_cliente, id_sede, id_equipo, id_creador, estado, prioridad, 
    tipo_servicio, observaciones, ubicacion_equipo, contacto_sede, telefono_contacto,
    valor_total, fecha_solicitud
) VALUES
(1, 'SB-2025-001', 1, 1, 1, 1, 'pendiente', 'alta', 'correctivo', 
 'Solicitud urgente de repuestos para equipo dental principal', 
 'Consultorio 1', 'Dr. García', '300-123-4567', 450000.00, '2025-11-15 09:30:00'),

(2, 'SB-2025-002', 2, 2, 2, 1, 'aprobada', 'media', 'preventivo', 
 'Repuestos para mantenimiento preventivo mensual', 
 'Sala de equipos', 'Técnico López', '300-234-5678', 280000.00, '2025-11-16 14:15:00'),

(3, 'SB-2025-003', 3, 3, 3, 2, 'despachada', 'media', 'correctivo', 
 'Filtros y componentes de repuesto para unidad dental', 
 'Consultorio 3', 'Dra. Martínez', '300-345-6789', 150000.00, '2025-11-17 11:45:00'),

(4, 'SB-2025-004', 1, 1, 4, 2, 'terminada', 'baja', 'garantia', 
 'Repuesto bajo garantía para autoclave', 
 'Área de esterilización', 'Auxiliar Pérez', '300-456-7890', 0.00, '2025-11-10 16:20:00'),

(5, 'SB-2025-005', 2, 2, 5, 1, 'rechazada', 'media', 'correctivo', 
 'Solicitud rechazada por presupuesto insuficiente', 
 'Consultorio 2', 'Dr. Rodríguez', '300-567-8901', 750000.00, '2025-11-12 10:10:00');

-- Insertar repuestos de prueba
INSERT IGNORE INTO solicitudes_bodega_repuestos (
    id_solicitud, descripcion, cantidad, precio_unitario, estado, observaciones
) VALUES
(1, 'Filtro de aire principal para compresor', 2, 85000.00, 'pendiente', 'Filtro original de fábrica'),
(1, 'Manguera de alta presión 2m', 1, 125000.00, 'pendiente', 'Repuesto urgente'),
(1, 'Kit de juntas y sellos', 1, 240000.00, 'pendiente', 'Incluye manual de instalación'),

(2, 'Aceite hidráulico 1L', 4, 35000.00, 'aprobado', 'Para mantenimiento mensual'),
(2, 'Filtro hidráulico secundario', 2, 65000.00, 'aprobado', 'Cambio preventivo'),

(3, 'Lámpara LED para unidad dental', 1, 150000.00, 'despachado', 'Enviado el 17/11/2025');

-- Insertar items adicionales de prueba
INSERT IGNORE INTO solicitudes_bodega_items_adicionales (
    id_solicitud, descripcion, categoria, cantidad, precio_unitario, estado
) VALUES
(1, 'Destornilladores especializados', 'herramientas', 1, 45000.00, 'pendiente'),
(2, 'Guantes de nitrilo caja x100', 'materiales', 2, 25000.00, 'aprobado'),
(3, 'Alcohol isopropílico 1L', 'materiales', 1, 18000.00, 'despachado');

-- Insertar novedades de prueba
INSERT IGNORE INTO solicitudes_bodega_novedades (
    id_solicitud, id_usuario, accion, observaciones, estado_anterior, estado_nuevo, fecha_novedad
) VALUES
(1, 1, 'creada', 'Solicitud de bodega creada por sistema', NULL, 'pendiente', '2025-11-15 09:30:00'),
(2, 1, 'creada', 'Solicitud de bodega creada por sistema', NULL, 'pendiente', '2025-11-16 14:15:00'),
(2, 2, 'aprobada', 'Solicitud aprobada por supervisor', 'pendiente', 'aprobada', '2025-11-16 16:30:00'),
(3, 1, 'creada', 'Solicitud de bodega creada por sistema', NULL, 'pendiente', '2025-11-17 11:45:00'),
(3, 2, 'aprobada', 'Solicitud aprobada para despacho', 'pendiente', 'aprobada', '2025-11-17 13:00:00'),
(3, 2, 'despachada', 'Repuestos despachados a sede', 'aprobada', 'despachada', '2025-11-17 15:30:00'),
(4, 2, 'terminada', 'Solicitud completada exitosamente', 'despachada', 'terminada', '2025-11-11 14:20:00'),
(5, 2, 'rechazada', 'Solicitud rechazada por presupuesto insuficiente', 'pendiente', 'rechazada', '2025-11-12 11:45:00');

-- ==================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ==================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_solicitud_estado_fecha ON solicitudes_bodega (estado, fecha_solicitud DESC);
CREATE INDEX IF NOT EXISTS idx_solicitud_cliente_estado ON solicitudes_bodega (id_cliente, estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_creador_fecha ON solicitudes_bodega (id_creador, fecha_solicitud DESC);

-- Índice para búsquedas de texto
CREATE FULLTEXT INDEX IF NOT EXISTS idx_solicitud_busqueda ON solicitudes_bodega (observaciones);

-- ==================================================
-- VISTAS ÚTILES
-- ==================================================

-- Vista para dashboard de solicitudes
CREATE OR REPLACE VIEW vista_solicitudes_bodega_dashboard AS
SELECT 
    sb.estado,
    COUNT(*) as total_solicitudes,
    SUM(sb.valor_total) as valor_total,
    AVG(DATEDIFF(
        CASE 
            WHEN sb.estado = 'terminada' THEN sb.fecha_terminacion
            ELSE CURDATE()
        END, 
        sb.fecha_solicitud
    )) as promedio_dias
FROM solicitudes_bodega sb
WHERE sb.activo = 1
GROUP BY sb.estado;

-- ==================================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ==================================================

DELIMITER //

-- Trigger para actualizar valor_total cuando se insertan/actualizan repuestos
CREATE TRIGGER IF NOT EXISTS tr_actualizar_valor_repuestos
    AFTER INSERT ON solicitudes_bodega_repuestos
    FOR EACH ROW
BEGIN
    UPDATE solicitudes_bodega 
    SET valor_repuestos = (
        SELECT COALESCE(SUM(precio_total), 0) 
        FROM solicitudes_bodega_repuestos 
        WHERE id_solicitud = NEW.id_solicitud
    ),
    valor_total = valor_repuestos + valor_items_adicionales
    WHERE id = NEW.id_solicitud;
END //

-- Trigger para actualizar valor_total cuando se insertan/actualizan items adicionales
CREATE TRIGGER IF NOT EXISTS tr_actualizar_valor_items
    AFTER INSERT ON solicitudes_bodega_items_adicionales
    FOR EACH ROW
BEGIN
    UPDATE solicitudes_bodega 
    SET valor_items_adicionales = (
        SELECT COALESCE(SUM(precio_total), 0) 
        FROM solicitudes_bodega_items_adicionales 
        WHERE id_solicitud = NEW.id_solicitud
    ),
    valor_total = valor_repuestos + valor_items_adicionales
    WHERE id = NEW.id_solicitud;
END //

DELIMITER ;

-- ==================================================
-- PERMISOS Y COMENTARIOS FINALES
-- ==================================================

-- Comentario final
SELECT 'Base de datos de Solicitudes de Bodega creada exitosamente' as mensaje,
       'Tablas: solicitudes_bodega, solicitudes_bodega_repuestos, solicitudes_bodega_items_adicionales, solicitudes_bodega_novedades, solicitudes_bodega_estados' as tablas_creadas,
       '5 solicitudes de prueba insertadas' as datos_prueba;