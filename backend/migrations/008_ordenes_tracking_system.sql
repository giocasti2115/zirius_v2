-- 008_ordenes_tracking_system.sql
-- Migración para sistema de tracking de órdenes de servicio
-- Fecha: 2024-11-16

-- =============================================
-- TABLA: ordenes_servicio
-- Descripción: Tabla principal de órdenes de servicio
-- =============================================
CREATE TABLE IF NOT EXISTS ordenes_servicio (
    id INT(11) NOT NULL AUTO_INCREMENT,
    numero_orden VARCHAR(50) NOT NULL UNIQUE,
    cliente VARCHAR(255) NOT NULL,
    equipo VARCHAR(255) NOT NULL,
    tipo_servicio ENUM('mantenimiento', 'reparacion', 'instalacion', 'diagnostico') NOT NULL,
    prioridad ENUM('baja', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
    estado ENUM('pendiente', 'asignada', 'en_progreso', 'en_reparacion', 'completada', 'cancelada', 'requiere_seguimiento') NOT NULL DEFAULT 'pendiente',
    descripcion TEXT,
    fecha_programada DATETIME NOT NULL,
    tiempo_estimado INT NOT NULL DEFAULT 120 COMMENT 'Tiempo estimado en minutos',
    tecnico_id INT(11) NULL,
    ubicacion_latitud DECIMAL(10, 8) NOT NULL,
    ubicacion_longitud DECIMAL(11, 8) NOT NULL,
    ubicacion_direccion TEXT NOT NULL,
    observaciones_iniciales TEXT,
    observaciones_finales TEXT,
    fecha_inicio DATETIME NULL,
    fecha_fin DATETIME NULL,
    tiempo_real INT NULL COMMENT 'Tiempo real trabajado en minutos',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_numero_orden (numero_orden),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_tecnico_id (tecnico_id),
    INDEX idx_fecha_programada (fecha_programada),
    INDEX idx_tipo_servicio (tipo_servicio),
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: tracking_ordenes
-- Descripción: Registro GPS en tiempo real de técnicos
-- =============================================
CREATE TABLE IF NOT EXISTS tracking_ordenes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    orden_id INT(11) NOT NULL,
    tecnico_id INT(11) NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    precision DECIMAL(5, 2) NOT NULL DEFAULT 10.00 COMMENT 'Precisión GPS en metros',
    velocidad DECIMAL(5, 2) NULL COMMENT 'Velocidad en km/h',
    rumbo DECIMAL(5, 2) NULL COMMENT 'Rumbo en grados (0-360)',
    altitud DECIMAL(8, 2) NULL COMMENT 'Altitud en metros',
    estado VARCHAR(50) NOT NULL COMMENT 'Estado del técnico: en_ruta, en_sitio, trabajando, etc.',
    observaciones TEXT,
    bateria_dispositivo INT NULL COMMENT 'Nivel de batería del dispositivo',
    senal_gps INT NULL COMMENT 'Calidad de señal GPS (1-5)',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_orden_id (orden_id),
    INDEX idx_tecnico_id (tecnico_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_estado (estado),
    INDEX idx_orden_timestamp (orden_id, timestamp),
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: checkin_checkout_ordenes
-- Descripción: Registro de check-in y check-out de órdenes
-- =============================================
CREATE TABLE IF NOT EXISTS checkin_checkout_ordenes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    orden_id INT(11) NOT NULL,
    tecnico_id INT(11) NOT NULL,
    tipo ENUM('check_in', 'check_out') NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    precision DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos específicos de check-in
    foto_inicial_url VARCHAR(500) NULL,
    observaciones_iniciales TEXT,
    estado_equipo_inicial ENUM('operativo', 'parcial', 'no_operativo', 'desconocido') NULL,
    condiciones_ambiente TEXT,
    
    -- Campos específicos de check-out
    foto_final_url VARCHAR(500) NULL,
    observaciones_finales TEXT,
    estado_equipo_final ENUM('operativo', 'parcial', 'no_operativo', 'requiere_seguimiento') NULL,
    trabajos_realizados TEXT,
    materiales_utilizados TEXT,
    herramientas_utilizadas TEXT,
    tiempo_trabajo INT NULL COMMENT 'Tiempo trabajado en minutos',
    requiere_visita_adicional BOOLEAN DEFAULT FALSE,
    proxima_visita_fecha DATE NULL,
    calificacion_cliente INT NULL COMMENT 'Calificación del cliente (1-5)',
    comentarios_cliente TEXT,
    
    -- Campos de validación
    distancia_ubicacion_orden DECIMAL(8, 2) NULL COMMENT 'Distancia en metros desde ubicación de orden',
    validacion_gps BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT,
    
    PRIMARY KEY (id),
    INDEX idx_orden_id (orden_id),
    INDEX idx_tecnico_id (tecnico_id),
    INDEX idx_tipo (tipo),
    INDEX idx_timestamp (timestamp),
    INDEX idx_orden_tipo (orden_id, tipo),
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: fotos_ordenes
-- Descripción: Galería de fotos de órdenes de servicio
-- =============================================
CREATE TABLE IF NOT EXISTS fotos_ordenes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    orden_id INT(11) NOT NULL,
    tecnico_id INT(11) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    url_publica VARCHAR(500) NULL,
    tipo ENUM('inicial', 'progreso', 'final', 'evidencia', 'problema', 'solucion') NOT NULL,
    categoria ENUM('equipo', 'reparacion', 'instalacion', 'ambiente', 'documentacion', 'herramientas') NOT NULL,
    descripcion TEXT,
    
    -- Metadatos de la foto
    metadata JSON COMMENT 'Metadatos técnicos de la foto',
    tamano_archivo INT NOT NULL COMMENT 'Tamaño en bytes',
    mime_type VARCHAR(100) NOT NULL,
    resolucion_ancho INT NULL,
    resolucion_alto INT NULL,
    
    -- Información GPS y contexto
    latitud DECIMAL(10, 8) NULL,
    longitud DECIMAL(11, 8) NULL,
    precision_gps DECIMAL(5, 2) NULL,
    
    -- Etiquetas y organización
    etiquetas JSON COMMENT 'Array de etiquetas para categorización',
    es_publica BOOLEAN DEFAULT FALSE,
    requiere_aprobacion BOOLEAN DEFAULT FALSE,
    aprobada_por INT(11) NULL,
    fecha_aprobacion DATETIME NULL,
    
    -- Procesamiento
    procesada BOOLEAN DEFAULT FALSE,
    thumbnail_url VARCHAR(500) NULL,
    comprimida_url VARCHAR(500) NULL,
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_orden_id (orden_id),
    INDEX idx_tecnico_id (tecnico_id),
    INDEX idx_tipo (tipo),
    INDEX idx_categoria (categoria),
    INDEX idx_timestamp (timestamp),
    INDEX idx_es_publica (es_publica),
    INDEX idx_orden_tipo (orden_id, tipo),
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: comentarios_fotos_ordenes
-- Descripción: Comentarios colaborativos en fotos
-- =============================================
CREATE TABLE IF NOT EXISTS comentarios_fotos_ordenes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    foto_id INT(11) NOT NULL,
    usuario_id INT(11) NOT NULL,
    contenido TEXT NOT NULL,
    tipo ENUM('observacion', 'pregunta', 'aprobacion', 'rechazo', 'sugerencia') NOT NULL DEFAULT 'observacion',
    respuesta_a INT(11) NULL COMMENT 'ID del comentario padre si es una respuesta',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_foto_id (foto_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_respuesta_a (respuesta_a),
    FOREIGN KEY (foto_id) REFERENCES fotos_ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (respuesta_a) REFERENCES comentarios_fotos_ordenes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: metricas_ordenes
-- Descripción: Métricas precalculadas para dashboard
-- =============================================
CREATE TABLE IF NOT EXISTS metricas_ordenes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    fecha DATE NOT NULL,
    periodo ENUM('diario', 'semanal', 'mensual') NOT NULL DEFAULT 'diario',
    
    -- Métricas básicas
    total_ordenes INT DEFAULT 0,
    ordenes_completadas INT DEFAULT 0,
    ordenes_pendientes INT DEFAULT 0,
    ordenes_en_progreso INT DEFAULT 0,
    ordenes_canceladas INT DEFAULT 0,
    
    -- Métricas de tiempo
    tiempo_promedio_resolucion DECIMAL(8, 2) DEFAULT 0 COMMENT 'En minutos',
    tiempo_total_trabajado INT DEFAULT 0 COMMENT 'En minutos',
    
    -- Métricas de eficiencia
    porcentaje_completadas DECIMAL(5, 2) DEFAULT 0,
    porcentaje_a_tiempo DECIMAL(5, 2) DEFAULT 0,
    porcentaje_sla_cumplido DECIMAL(5, 2) DEFAULT 0,
    
    -- Métricas por tipo
    ordenes_mantenimiento INT DEFAULT 0,
    ordenes_reparacion INT DEFAULT 0,
    ordenes_instalacion INT DEFAULT 0,
    ordenes_diagnostico INT DEFAULT 0,
    
    -- Métricas por prioridad
    ordenes_urgentes INT DEFAULT 0,
    ordenes_alta_prioridad INT DEFAULT 0,
    
    -- Métricas de satisfacción
    calificacion_promedio DECIMAL(3, 2) DEFAULT 0,
    total_calificaciones INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY unique_fecha_periodo (fecha, periodo),
    INDEX idx_fecha (fecha),
    INDEX idx_periodo (periodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: alertas_ordenes
-- Descripción: Sistema de alertas para órdenes críticas
-- =============================================
CREATE TABLE IF NOT EXISTS alertas_ordenes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    orden_id INT(11) NOT NULL,
    tipo_alerta ENUM('tiempo_excedido', 'sla_riesgo', 'equipo_critico', 'tecnico_inactivo', 'cliente_vip') NOT NULL,
    nivel ENUM('info', 'warning', 'error', 'critical') NOT NULL DEFAULT 'warning',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    
    -- Control de estado
    activa BOOLEAN DEFAULT TRUE,
    leida BOOLEAN DEFAULT FALSE,
    resuelta BOOLEAN DEFAULT FALSE,
    
    -- Asignación y seguimiento
    asignada_a INT(11) NULL,
    resuelta_por INT(11) NULL,
    fecha_resolucion DATETIME NULL,
    comentarios_resolucion TEXT,
    
    -- Configuración de notificaciones
    notificacion_enviada BOOLEAN DEFAULT FALSE,
    metodos_notificacion JSON COMMENT 'email, sms, push, etc.',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_orden_id (orden_id),
    INDEX idx_tipo_alerta (tipo_alerta),
    INDEX idx_nivel (nivel),
    INDEX idx_activa (activa),
    INDEX idx_asignada_a (asignada_a),
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
    FOREIGN KEY (asignada_a) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (resuelta_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =============================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_ordenes_estado_fecha ON ordenes_servicio(estado, fecha_programada);
CREATE INDEX idx_ordenes_tecnico_estado ON ordenes_servicio(tecnico_id, estado);
CREATE INDEX idx_tracking_orden_fecha ON tracking_ordenes(orden_id, timestamp DESC);
CREATE INDEX idx_fotos_orden_tipo ON fotos_ordenes(orden_id, tipo, timestamp DESC);

-- =============================================
-- TRIGGERS PARA AUTOMATIZACIÓN
-- =============================================

DELIMITER $$

-- Trigger para actualizar métricas al cambiar estado de orden
CREATE TRIGGER tr_ordenes_estado_change 
AFTER UPDATE ON ordenes_servicio
FOR EACH ROW
BEGIN
    -- Solo ejecutar si cambió el estado
    IF OLD.estado != NEW.estado THEN
        -- Insertar registro de cambio de estado
        INSERT INTO tracking_ordenes (orden_id, tecnico_id, latitud, longitud, estado, observaciones, timestamp)
        VALUES (NEW.id, NEW.tecnico_id, NEW.ubicacion_latitud, NEW.ubicacion_longitud, 
                CONCAT('Estado cambiado: ', OLD.estado, ' -> ', NEW.estado),
                CONCAT('Cambio automático de estado'), NOW());
        
        -- Crear alerta si es necesario
        IF NEW.estado = 'completada' AND NEW.tiempo_real > (NEW.tiempo_estimado * 1.5) THEN
            INSERT INTO alertas_ordenes (orden_id, tipo_alerta, nivel, titulo, descripcion)
            VALUES (NEW.id, 'tiempo_excedido', 'warning', 
                    'Orden completada con tiempo excedido',
                    CONCAT('La orden ', NEW.numero_orden, ' tardó ', NEW.tiempo_real, ' minutos vs ', NEW.tiempo_estimado, ' estimados'));
        END IF;
    END IF;
END$$

-- Trigger para calcular tiempo real al hacer check-out
CREATE TRIGGER tr_checkout_tiempo_calculo
AFTER INSERT ON checkin_checkout_ordenes
FOR EACH ROW
BEGIN
    IF NEW.tipo = 'check_out' THEN
        -- Buscar el check-in correspondiente
        SET @checkin_time = (
            SELECT timestamp 
            FROM checkin_checkout_ordenes 
            WHERE orden_id = NEW.orden_id 
            AND tecnico_id = NEW.tecnico_id 
            AND tipo = 'check_in' 
            AND timestamp < NEW.timestamp 
            ORDER BY timestamp DESC 
            LIMIT 1
        );
        
        -- Calcular tiempo real y actualizar orden
        IF @checkin_time IS NOT NULL THEN
            SET @tiempo_real = TIMESTAMPDIFF(MINUTE, @checkin_time, NEW.timestamp);
            
            UPDATE ordenes_servicio 
            SET tiempo_real = @tiempo_real,
                fecha_inicio = @checkin_time,
                fecha_fin = NEW.timestamp
            WHERE id = NEW.orden_id;
        END IF;
    END IF;
END$$

DELIMITER ;

-- =============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =============================================

-- Insertar órdenes de ejemplo
INSERT INTO ordenes_servicio (numero_orden, cliente, equipo, tipo_servicio, prioridad, estado, descripcion, fecha_programada, tiempo_estimado, ubicacion_latitud, ubicacion_longitud, ubicacion_direccion) VALUES
('OS-2024-001', 'Hospital San Rafael', 'Resonancia Magnética Siemens', 'mantenimiento', 'alta', 'asignada', 'Mantenimiento preventivo trimestral', '2024-11-16 08:00:00', 180, 6.2518, -75.5636, 'Cra 51C #62-78, Hospital San Rafael'),
('OS-2024-002', 'Clínica Bolivariana', 'TAC GE Healthcare', 'reparacion', 'urgente', 'en_progreso', 'Falla en sistema de enfriamiento', '2024-11-16 10:30:00', 240, 6.2442, -75.5515, 'Cra 25A #1A Sur-45, Clínica Bolivariana'),
('OS-2024-003', 'Centro Médico Imbanaco', 'Ecógrafo Philips', 'instalacion', 'media', 'pendiente', 'Instalación de nuevo equipo', '2024-11-16 14:00:00', 300, 6.2087, -75.5764, 'Cra 38A #5A-100, Centro Médico Imbanaco');

-- =============================================
-- COMENTARIOS FINALES
-- =============================================
-- Esta migración incluye:
-- 1. Tablas principales para tracking de órdenes
-- 2. Sistema completo de check-in/check-out
-- 3. Galería de fotos con metadatos
-- 4. Sistema de comentarios colaborativos  
-- 5. Métricas precalculadas para dashboard
-- 6. Sistema de alertas automáticas
-- 7. Triggers para automatización
-- 8. Índices optimizados para rendimiento
-- 9. Datos de prueba para desarrollo