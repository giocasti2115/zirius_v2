-- Migración 009: Sistema de Tracking para Equipos
-- Fecha: 2024-03-20
-- Descripción: Tablas para tracking GPS, mantenimientos, fotos y alertas de equipos

-- Crear tabla de equipos (base)
CREATE TABLE IF NOT EXISTS equipos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    serie VARCHAR(100) UNIQUE NOT NULL,
    tipo ENUM('ventilador', 'monitor', 'bomba', 'desfibrilador', 'ecografo', 'rayos_x', 'otro') NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    estado ENUM('operativo', 'mantenimiento', 'fuera_servicio', 'calibracion') DEFAULT 'operativo',
    ubicacion_actual VARCHAR(255),
    latitud_actual DECIMAL(10, 8),
    longitud_actual DECIMAL(11, 8),
    fecha_ultima_ubicacion TIMESTAMP NULL,
    fecha_adquisicion DATE,
    fecha_vencimiento_garantia DATE,
    usuario_responsable_id INT,
    proximo_mantenimiento DATE,
    horas_operacion INT DEFAULT 0,
    costo_adquisicion DECIMAL(12, 2),
    numero_patrimonio VARCHAR(50),
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_equipos_tipo (tipo),
    INDEX idx_equipos_estado (estado),
    INDEX idx_equipos_serie (serie),
    INDEX idx_equipos_ubicacion (ubicacion_actual),
    INDEX idx_equipos_responsable (usuario_responsable_id),
    INDEX idx_equipos_proximo_mant (proximo_mantenimiento)
);

-- Crear tabla de zonas autorizadas para equipos
CREATE TABLE IF NOT EXISTS equipos_zonas_autorizadas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    radio INT NOT NULL COMMENT 'Radio en metros',
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    INDEX idx_zona_equipo (equipo_id),
    INDEX idx_zona_coordenadas (latitud, longitud)
);

-- Crear tabla de tracking GPS de equipos
CREATE TABLE IF NOT EXISTS equipos_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    direccion VARCHAR(255),
    precision_gps FLOAT COMMENT 'Precisión en metros',
    dentro_zona_autorizada BOOLEAN DEFAULT TRUE,
    velocidad FLOAT COMMENT 'Velocidad en km/h',
    altitud FLOAT COMMENT 'Altitud en metros',
    usuario_id INT,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_tracking_equipo (equipo_id),
    INDEX idx_tracking_fecha (fecha_registro),
    INDEX idx_tracking_coordenadas (latitud, longitud),
    INDEX idx_tracking_zona (dentro_zona_autorizada)
);

-- Crear tabla de mantenimientos de equipos
CREATE TABLE IF NOT EXISTS equipos_mantenimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    tipo ENUM('preventivo', 'correctivo', 'calibracion', 'instalacion') NOT NULL,
    estado ENUM('programado', 'en_progreso', 'completado', 'cancelado') DEFAULT 'programado',
    prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    descripcion TEXT NOT NULL,
    
    -- Fechas y tiempos
    fecha_programada TIMESTAMP NOT NULL,
    fecha_inicio TIMESTAMP NULL,
    fecha_finalizacion TIMESTAMP NULL,
    estimacion_duracion DECIMAL(4, 2) COMMENT 'Duración estimada en horas',
    duracion_real DECIMAL(4, 2) COMMENT 'Duración real en horas',
    
    -- Personal asignado
    tecnico_id INT,
    usuario_inicio_id INT,
    usuario_finalizacion_id INT,
    
    -- Ubicación
    latitud_inicio DECIMAL(10, 8),
    longitud_inicio DECIMAL(11, 8),
    latitud_finalizacion DECIMAL(10, 8),
    longitud_finalizacion DECIMAL(11, 8),
    
    -- Observaciones y resultados
    observaciones_inicio TEXT,
    observaciones_finales TEXT,
    condiciones_pre JSON,
    condiciones_post JSON,
    certificacion_calidad BOOLEAN DEFAULT FALSE,
    
    -- Checkpoints y control de calidad
    checkpoints JSON COMMENT 'Lista de checkpoints del mantenimiento',
    qr_code TEXT COMMENT 'Código QR para identificación',
    
    -- Costos
    costo DECIMAL(10, 2),
    repuestos_utilizados JSON,
    
    -- Metadata
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_inicio_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_finalizacion_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_mant_equipo (equipo_id),
    INDEX idx_mant_tipo (tipo),
    INDEX idx_mant_estado (estado),
    INDEX idx_mant_fecha_prog (fecha_programada),
    INDEX idx_mant_tecnico (tecnico_id),
    INDEX idx_mant_prioridad (prioridad)
);

-- Crear tabla de fotos de equipos
CREATE TABLE IF NOT EXISTS equipos_fotos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    mantenimiento_id INT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo ENUM('instalacion', 'estado', 'dano', 'reparacion', 'calibracion', 'limpieza', 'certificado') NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    
    -- Metadata de la foto
    tamano INT COMMENT 'Tamaño en bytes',
    formato VARCHAR(50),
    resolucion_ancho INT,
    resolucion_alto INT,
    calidad_compresion INT,
    nombre_original VARCHAR(255),
    
    -- Información contextual
    observaciones TEXT,
    tags JSON COMMENT 'Tags para categorización',
    es_publica BOOLEAN DEFAULT TRUE,
    
    -- Ubicación donde se tomó la foto
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    
    -- Usuario y fechas
    usuario_id INT NOT NULL,
    fecha_captura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Anotaciones en la imagen
    anotaciones JSON COMMENT 'Anotaciones y marcas en la imagen',
    
    -- Relaciones con versiones anteriores
    version_anterior_id INT NULL,
    
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (mantenimiento_id) REFERENCES equipos_mantenimientos(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (version_anterior_id) REFERENCES equipos_fotos(id) ON DELETE SET NULL,
    
    INDEX idx_foto_equipo (equipo_id),
    INDEX idx_foto_tipo (tipo),
    INDEX idx_foto_mantenimiento (mantenimiento_id),
    INDEX idx_foto_usuario (usuario_id),
    INDEX idx_foto_fecha (fecha_captura),
    INDEX idx_foto_publica (es_publica)
);

-- Crear tabla de alertas de equipos
CREATE TABLE IF NOT EXISTS equipos_alertas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    tipo ENUM('ubicacion', 'bateria', 'mantenimiento', 'falla', 'calibracion', 'garantia', 'operacion') NOT NULL,
    severidad ENUM('info', 'baja', 'media', 'alta', 'critica') DEFAULT 'media',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    
    -- Ubicación de la alerta (si aplica)
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    
    -- Estados y fechas
    activa BOOLEAN DEFAULT TRUE,
    requiere_accion BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP NULL,
    fecha_vencimiento TIMESTAMP NULL,
    
    -- Personal relacionado
    usuario_creacion_id INT,
    usuario_resolucion_id INT,
    
    -- Información adicional
    parametros_alerta JSON COMMENT 'Parámetros específicos de la alerta',
    acciones_tomadas TEXT,
    observaciones_resolucion TEXT,
    
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_resolucion_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_alerta_equipo (equipo_id),
    INDEX idx_alerta_tipo (tipo),
    INDEX idx_alerta_severidad (severidad),
    INDEX idx_alerta_activa (activa),
    INDEX idx_alerta_fecha (fecha_creacion),
    INDEX idx_alerta_vencimiento (fecha_vencimiento)
);

-- Crear tabla de métricas de equipos (para histórico)
CREATE TABLE IF NOT EXISTS equipos_metricas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    fecha_calculo DATE NOT NULL,
    
    -- Métricas de disponibilidad
    disponibilidad DECIMAL(5, 2) COMMENT 'Porcentaje de disponibilidad',
    mtbf DECIMAL(10, 2) COMMENT 'Mean Time Between Failures en horas',
    mttr DECIMAL(10, 2) COMMENT 'Mean Time To Repair en horas',
    
    -- Métricas de utilización
    horas_operacion_dia DECIMAL(4, 2),
    utilizacion_porcentaje DECIMAL(5, 2),
    eficiencia_porcentaje DECIMAL(5, 2),
    
    -- Métricas de costo
    costo_mantenimiento_mes DECIMAL(10, 2),
    costo_por_hora_operacion DECIMAL(8, 2),
    
    -- Contadores
    total_fallas INT DEFAULT 0,
    total_mantenimientos_preventivos INT DEFAULT 0,
    total_mantenimientos_correctivos INT DEFAULT 0,
    total_calibraciones INT DEFAULT 0,
    
    -- Tiempo de vida útil
    vida_util_restante_dias INT,
    depreciacion_acumulada DECIMAL(10, 2),
    
    UNIQUE KEY uk_equipo_fecha (equipo_id, fecha_calculo),
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    
    INDEX idx_metricas_equipo (equipo_id),
    INDEX idx_metricas_fecha (fecha_calculo),
    INDEX idx_metricas_disponibilidad (disponibilidad),
    INDEX idx_metricas_mtbf (mtbf)
);

-- Crear tabla de notificaciones de equipos
CREATE TABLE IF NOT EXISTS equipos_notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo ENUM('mantenimiento_vencido', 'alerta_critica', 'garantia_vencimiento', 'calibracion_requerida', 'falla_detectada') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- Estado de la notificación
    leida BOOLEAN DEFAULT FALSE,
    enviada BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP NULL,
    
    -- Canales de envío
    canal_push BOOLEAN DEFAULT TRUE,
    canal_email BOOLEAN DEFAULT FALSE,
    canal_sms BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    datos_adicionales JSON,
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_notif_equipo (equipo_id),
    INDEX idx_notif_usuario (usuario_id),
    INDEX idx_notif_tipo (tipo),
    INDEX idx_notif_leida (leida),
    INDEX idx_notif_fecha (fecha_creacion)
);

-- Crear tabla de configuración de equipos
CREATE TABLE IF NOT EXISTS equipos_configuracion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    
    -- Configuración de mantenimiento
    intervalo_mantenimiento_dias INT DEFAULT 90,
    horas_maximas_operacion_dia DECIMAL(4, 2) DEFAULT 24.00,
    
    -- Configuración de alertas
    alertas_ubicacion_activas BOOLEAN DEFAULT TRUE,
    radio_alerta_ubicacion INT DEFAULT 100 COMMENT 'Radio en metros',
    alertas_bateria_activas BOOLEAN DEFAULT TRUE,
    umbral_bateria_baja INT DEFAULT 20 COMMENT 'Porcentaje',
    
    -- Configuración de tracking
    intervalo_tracking_minutos INT DEFAULT 15,
    tracking_automatico BOOLEAN DEFAULT TRUE,
    
    -- Configuración de fotos
    calidad_fotos_automaticas INT DEFAULT 80,
    limite_fotos_por_mantenimiento INT DEFAULT 20,
    
    -- Parámetros específicos del equipo
    parametros_operacion JSON COMMENT 'Parámetros específicos según tipo de equipo',
    limites_operacion JSON COMMENT 'Límites operacionales del equipo',
    
    -- Configuración de reportes
    reportes_automaticos BOOLEAN DEFAULT TRUE,
    frecuencia_reportes ENUM('diario', 'semanal', 'mensual') DEFAULT 'semanal',
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_config_equipo (equipo_id),
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- Crear índices adicionales para optimización
CREATE INDEX idx_equipos_fecha_actualizacion ON equipos(fecha_actualizacion);
CREATE INDEX idx_tracking_equipo_fecha ON equipos_tracking(equipo_id, fecha_registro);
CREATE INDEX idx_mantenimientos_estado_fecha ON equipos_mantenimientos(estado, fecha_programada);
CREATE INDEX idx_fotos_equipo_tipo ON equipos_fotos(equipo_id, tipo);
CREATE INDEX idx_alertas_activa_severidad ON equipos_alertas(activa, severidad);

-- Crear triggers para actualizar fechas de modificación
DELIMITER //

CREATE TRIGGER tr_equipos_update_timestamp
    BEFORE UPDATE ON equipos
    FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
END //

CREATE TRIGGER tr_mantenimientos_update_timestamp
    BEFORE UPDATE ON equipos_mantenimientos
    FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
END //

CREATE TRIGGER tr_equipos_horas_operacion
    AFTER INSERT ON equipos_tracking
    FOR EACH ROW
BEGIN
    -- Incrementar horas de operación basado en el tiempo transcurrido
    UPDATE equipos 
    SET horas_operacion = horas_operacion + 0.25,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = NEW.equipo_id;
END //

CREATE TRIGGER tr_alerta_automatica_mantenimiento
    AFTER UPDATE ON equipos
    FOR EACH ROW
BEGIN
    -- Crear alerta automática si se acerca el mantenimiento
    IF NEW.proximo_mantenimiento IS NOT NULL 
       AND DATEDIFF(NEW.proximo_mantenimiento, CURDATE()) <= 7 
       AND DATEDIFF(NEW.proximo_mantenimiento, CURDATE()) > 0 THEN
        
        INSERT IGNORE INTO equipos_alertas (
            equipo_id, tipo, severidad, titulo, descripcion, 
            requiere_accion, fecha_creacion
        ) VALUES (
            NEW.id, 'mantenimiento', 'media',
            'Mantenimiento programado próximo',
            CONCAT('El equipo ', NEW.nombre, ' tiene un mantenimiento programado en ', 
                   DATEDIFF(NEW.proximo_mantenimiento, CURDATE()), ' días'),
            TRUE, CURRENT_TIMESTAMP
        );
    END IF;
    
    -- Crear alerta si el mantenimiento está vencido
    IF NEW.proximo_mantenimiento IS NOT NULL 
       AND NEW.proximo_mantenimiento < CURDATE() THEN
        
        INSERT IGNORE INTO equipos_alertas (
            equipo_id, tipo, severidad, titulo, descripcion, 
            requiere_accion, fecha_creacion
        ) VALUES (
            NEW.id, 'mantenimiento', 'alta',
            'Mantenimiento vencido',
            CONCAT('El equipo ', NEW.nombre, ' tiene un mantenimiento vencido desde hace ', 
                   DATEDIFF(CURDATE(), NEW.proximo_mantenimiento), ' días'),
            TRUE, CURRENT_TIMESTAMP
        );
    END IF;
END //

DELIMITER ;

-- Insertar datos de ejemplo para testing
INSERT INTO equipos (nombre, serie, tipo, marca, modelo, estado, ubicacion_actual, usuario_responsable_id, proximo_mantenimiento, fecha_adquisicion) VALUES
('Ventilador Draeger V500', 'VEN001', 'ventilador', 'Draeger', 'V500', 'operativo', 'UCI Adultos - Sala 3', 1, '2024-04-15', '2023-01-15'),
('Monitor Philips MX40', 'MON002', 'monitor', 'Philips', 'MX40', 'mantenimiento', 'UCI Pediátrica - Sala 1', 2, '2024-04-02', '2022-08-20'),
('Bomba Infusión Baxter', 'BOM003', 'bomba', 'Baxter', 'Colleague CX', 'fuera_servicio', 'Quirófano 4', 1, '2024-03-28', '2021-03-10'),
('Desfibrilador Zoll X-Series', 'DEF004', 'desfibrilador', 'Zoll', 'X-Series', 'operativo', 'Emergencias', 3, '2024-05-20', '2023-06-15');

-- Insertar zonas autorizadas de ejemplo
INSERT INTO equipos_zonas_autorizadas (equipo_id, nombre, descripcion, latitud, longitud, radio) VALUES
(1, 'UCI Adultos', 'Zona autorizada para ventilador en UCI Adultos', -34.6018000, -58.3845000, 200),
(2, 'UCI Pediátrica', 'Zona autorizada para monitor en UCI Pediátrica', -34.6025000, -58.3820000, 150),
(3, 'Quirófanos', 'Zona autorizada para bomba en quirófanos', -34.6015000, -58.3850000, 100),
(4, 'Emergencias', 'Zona autorizada para desfibrilador en emergencias', -34.6030000, -58.3815000, 300);

-- Insertar configuraciones por defecto
INSERT INTO equipos_configuracion (equipo_id, intervalo_mantenimiento_dias, alertas_ubicacion_activas, radio_alerta_ubicacion) VALUES
(1, 90, TRUE, 200),
(2, 60, TRUE, 150),
(3, 30, TRUE, 100),
(4, 180, TRUE, 300);

-- Insertar algunos registros de tracking de ejemplo
INSERT INTO equipos_tracking (equipo_id, latitud, longitud, direccion, precision_gps, dentro_zona_autorizada, usuario_id) VALUES
(1, -34.6018000, -58.3845000, 'UCI Adultos - Sala 3', 5.0, TRUE, 1),
(2, -34.6025000, -58.3820000, 'UCI Pediátrica - Sala 1', 3.2, TRUE, 2),
(3, -34.6050000, -58.3900000, 'Fuera del hospital', 8.1, FALSE, 1),
(4, -34.6030000, -58.3815000, 'Emergencias', 4.5, TRUE, 3);

-- Crear vista para dashboard de equipos
CREATE VIEW v_equipos_dashboard AS
SELECT 
    e.id,
    e.nombre,
    e.serie,
    e.tipo,
    e.estado,
    e.ubicacion_actual,
    e.proximo_mantenimiento,
    e.horas_operacion,
    
    -- Contar alertas activas
    COALESCE(alertas.total_alertas, 0) as alertas_activas,
    COALESCE(alertas.alertas_criticas, 0) as alertas_criticas,
    
    -- Último tracking
    t.fecha_registro as ultima_ubicacion_fecha,
    t.latitud as ultima_latitud,
    t.longitud as ultima_longitud,
    t.dentro_zona_autorizada,
    
    -- Próximo mantenimiento en días
    CASE 
        WHEN e.proximo_mantenimiento IS NULL THEN NULL
        ELSE DATEDIFF(e.proximo_mantenimiento, CURDATE())
    END as dias_proximo_mantenimiento,
    
    -- Estado de garantía
    CASE 
        WHEN e.fecha_vencimiento_garantia IS NULL THEN 'Sin información'
        WHEN e.fecha_vencimiento_garantia < CURDATE() THEN 'Vencida'
        WHEN DATEDIFF(e.fecha_vencimiento_garantia, CURDATE()) <= 30 THEN 'Por vencer'
        ELSE 'Vigente'
    END as estado_garantia,
    
    -- Métricas recientes
    m.disponibilidad,
    m.mtbf,
    m.mttr
    
FROM equipos e
LEFT JOIN (
    SELECT 
        equipo_id,
        COUNT(*) as total_alertas,
        SUM(CASE WHEN severidad = 'critica' THEN 1 ELSE 0 END) as alertas_criticas
    FROM equipos_alertas 
    WHERE activa = TRUE 
    GROUP BY equipo_id
) alertas ON e.id = alertas.equipo_id
LEFT JOIN (
    SELECT DISTINCT
        equipo_id,
        FIRST_VALUE(fecha_registro) OVER (PARTITION BY equipo_id ORDER BY fecha_registro DESC) as fecha_registro,
        FIRST_VALUE(latitud) OVER (PARTITION BY equipo_id ORDER BY fecha_registro DESC) as latitud,
        FIRST_VALUE(longitud) OVER (PARTITION BY equipo_id ORDER BY fecha_registro DESC) as longitud,
        FIRST_VALUE(dentro_zona_autorizada) OVER (PARTITION BY equipo_id ORDER BY fecha_registro DESC) as dentro_zona_autorizada
    FROM equipos_tracking
) t ON e.id = t.equipo_id
LEFT JOIN (
    SELECT DISTINCT
        equipo_id,
        FIRST_VALUE(disponibilidad) OVER (PARTITION BY equipo_id ORDER BY fecha_calculo DESC) as disponibilidad,
        FIRST_VALUE(mtbf) OVER (PARTITION BY equipo_id ORDER BY fecha_calculo DESC) as mtbf,
        FIRST_VALUE(mttr) OVER (PARTITION BY equipo_id ORDER BY fecha_calculo DESC) as mttr
    FROM equipos_metricas
) m ON e.id = m.equipo_id
WHERE e.activo = TRUE;

-- Comentarios finales
-- Esta migración crea la estructura completa para el sistema de tracking de equipos médicos
-- Incluye: GPS tracking, mantenimientos, fotos, alertas, métricas y notificaciones
-- Los triggers automatizan la creación de alertas y actualización de métricas
-- La vista v_equipos_dashboard facilita consultas del dashboard en tiempo real