-- ================================================================
-- MIGRACIÓN: Tablas para Módulos de Configuración General
-- Fecha: 2024-12-20
-- Descripción: Tablas para tipos de equipos, marcas, estados, prioridades,
--              ciudades, departamentos, variables de sistema, respaldos, 
--              logs y notificaciones
-- ================================================================

-- Eliminar tablas si existen (para desarrollo)
-- DROP TABLE IF EXISTS notificaciones_enviadas;
-- DROP TABLE IF EXISTS configuraciones_notificacion;
-- DROP TABLE IF EXISTS plantillas_notificacion;
-- DROP TABLE IF EXISTS logs;
-- DROP TABLE IF EXISTS respaldos;
-- DROP TABLE IF EXISTS configuraciones_respaldo;
-- DROP TABLE IF EXISTS variables_sistema;
-- DROP TABLE IF EXISTS ciudades;
-- DROP TABLE IF EXISTS departamentos;
-- DROP TABLE IF EXISTS prioridades;
-- DROP TABLE IF EXISTS estados;
-- DROP TABLE IF EXISTS marcas;
-- DROP TABLE IF EXISTS tipos_equipos;

-- ====================== TIPOS DE EQUIPOS ======================
CREATE TABLE IF NOT EXISTS tipos_equipos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    clasificacion_riesgo ENUM('ALTO', 'MEDIO', 'BAJO') NOT NULL DEFAULT 'MEDIO',
    requiere_calibracion BOOLEAN DEFAULT FALSE,
    vida_util_anos INT,
    frecuencia_mantenimiento_meses INT,
    especificaciones_tecnicas JSON,
    normas_aplicables JSON,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    INDEX idx_categoria (categoria),
    INDEX idx_clasificacion (clasificacion_riesgo),
    INDEX idx_activo (activo),
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ====================== MARCAS ======================
CREATE TABLE IF NOT EXISTS marcas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    pais_origen VARCHAR(50),
    sitio_web VARCHAR(255),
    telefono_soporte VARCHAR(20),
    email_soporte VARCHAR(100),
    contacto_comercial VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    INDEX idx_nombre (nombre),
    INDEX idx_pais (pais_origen),
    INDEX idx_activo (activo),
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ====================== ESTADOS DEL SISTEMA ======================
CREATE TABLE IF NOT EXISTS estados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    modulo VARCHAR(30) NOT NULL, -- equipos, solicitudes, ordenes, visitas, etc.
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280', -- Color hex
    icono VARCHAR(30), -- Nombre del icono
    orden INT DEFAULT 0,
    es_final BOOLEAN DEFAULT FALSE, -- Si es un estado terminal
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_modulo (modulo),
    INDEX idx_orden (orden),
    INDEX idx_activo (activo),
    UNIQUE KEY unique_modulo_nombre (modulo, nombre)
);

-- ====================== PRIORIDADES ======================
CREATE TABLE IF NOT EXISTS prioridades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    nivel INT NOT NULL, -- 1=Muy Alta, 2=Alta, 3=Media, 4=Baja, 5=Muy Baja
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    tiempo_respuesta_horas INT DEFAULT 24,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nivel (nivel),
    INDEX idx_activo (activo)
);

-- ====================== DEPARTAMENTOS (COLOMBIA) ======================
CREATE TABLE IF NOT EXISTS departamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(5) NOT NULL UNIQUE, -- Código DANE
    region VARCHAR(30) NOT NULL, -- Caribe, Pacífico, Andina, Orinoquía, Amazonía, Insular
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_region (region),
    INDEX idx_activo (activo)
);

-- ====================== CIUDADES ======================
CREATE TABLE IF NOT EXISTS ciudades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    departamento_id INT NOT NULL,
    codigo_postal VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_departamento (departamento_id),
    INDEX idx_activo (activo),
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ciudad_departamento (nombre, departamento_id)
);

-- ====================== VARIABLES DE SISTEMA ======================
CREATE TABLE IF NOT EXISTS variables_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    tipo ENUM('string', 'number', 'boolean', 'json', 'email', 'url') DEFAULT 'string',
    categoria VARCHAR(50) NOT NULL,
    descripcion TEXT,
    es_editable BOOLEAN DEFAULT TRUE,
    valor_por_defecto TEXT,
    validacion_regex VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    INDEX idx_categoria (categoria),
    INDEX idx_tipo (tipo),
    INDEX idx_clave (clave),
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ====================== CONFIGURACIONES DE RESPALDO ======================
CREATE TABLE IF NOT EXISTS configuraciones_respaldo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    frecuencia ENUM('diario', 'semanal', 'mensual') NOT NULL,
    hora_ejecucion TIME NOT NULL,
    dias_semana JSON, -- [0,1,2,3,4,5,6] donde 0=domingo
    dia_mes INT, -- Para respaldos mensuales (1-31)
    retener_dias INT DEFAULT 30,
    compresion BOOLEAN DEFAULT TRUE,
    tablas_incluir ENUM('todas', 'seleccionadas') DEFAULT 'todas',
    tablas_seleccionadas JSON,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_respaldo TIMESTAMP NULL,
    proximo_respaldo TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_frecuencia (frecuencia),
    INDEX idx_activo (activo),
    INDEX idx_proximo (proximo_respaldo)
);

-- ====================== RESPALDOS ======================
CREATE TABLE IF NOT EXISTS respaldos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('automatico', 'manual') NOT NULL,
    estado ENUM('completado', 'en_progreso', 'error', 'cancelado') DEFAULT 'en_progreso',
    tamaño_mb DECIMAL(10,2) DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio TIMESTAMP NULL,
    fecha_fin TIMESTAMP NULL,
    duracion_segundos INT,
    archivo_path VARCHAR(500) NOT NULL,
    descripcion TEXT,
    tablas_incluidas JSON NOT NULL,
    compresion BOOLEAN DEFAULT TRUE,
    created_by INT,
    error_mensaje TEXT,
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion),
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ====================== LOGS DEL SISTEMA ======================
CREATE TABLE IF NOT EXISTS logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nivel ENUM('info', 'warning', 'error', 'debug', 'success') NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    usuario VARCHAR(100),
    ip_address VARCHAR(45),
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    detalles JSON,
    request_id VARCHAR(50),
    duracion_ms INT,
    INDEX idx_timestamp (timestamp),
    INDEX idx_nivel (nivel),
    INDEX idx_modulo (modulo),
    INDEX idx_usuario (usuario),
    INDEX idx_accion (accion),
    INDEX idx_request_id (request_id)
);

-- ====================== PLANTILLAS DE NOTIFICACIÓN ======================
CREATE TABLE IF NOT EXISTS plantillas_notificacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('email', 'sms', 'push', 'sistema') NOT NULL,
    evento VARCHAR(50) NOT NULL,
    asunto VARCHAR(200), -- Para emails
    contenido TEXT NOT NULL,
    variables_disponibles JSON,
    activa BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_evento (evento),
    INDEX idx_activa (activa),
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_nombre_tipo (nombre, tipo)
);

-- ====================== CONFIGURACIONES DE NOTIFICACIÓN ======================
CREATE TABLE IF NOT EXISTS configuraciones_notificacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    usuario_email VARCHAR(100),
    evento VARCHAR(50) NOT NULL,
    canales JSON NOT NULL, -- ['email', 'sms', 'push', 'sistema']
    activo BOOLEAN DEFAULT TRUE,
    horario_inicio TIME,
    horario_fin TIME,
    dias_semana JSON, -- [0,1,2,3,4,5,6]
    frecuencia_maxima INT, -- Minutos entre notificaciones del mismo tipo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id),
    INDEX idx_email (usuario_email),
    INDEX idx_evento (evento),
    INDEX idx_activo (activo),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ====================== HISTORIAL DE NOTIFICACIONES ENVIADAS ======================
CREATE TABLE IF NOT EXISTS notificaciones_enviadas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    plantilla_id INT NOT NULL,
    destinatario VARCHAR(200) NOT NULL,
    canal ENUM('email', 'sms', 'push', 'sistema') NOT NULL,
    estado ENUM('enviado', 'pendiente', 'error', 'leido') DEFAULT 'pendiente',
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_leido TIMESTAMP NULL,
    error_mensaje TEXT,
    datos_contexto JSON,
    INDEX idx_plantilla (plantilla_id),
    INDEX idx_canal (canal),
    INDEX idx_estado (estado),
    INDEX idx_fecha_envio (fecha_envio),
    INDEX idx_destinatario (destinatario),
    FOREIGN KEY (plantilla_id) REFERENCES plantillas_notificacion(id) ON DELETE CASCADE
);

-- ================================================================
-- DATOS INICIALES
-- ================================================================

-- Departamentos de Colombia
INSERT IGNORE INTO departamentos (nombre, codigo, region) VALUES
('Amazonas', '91', 'Amazonía'),
('Antioquia', '05', 'Andina'),
('Arauca', '81', 'Orinoquía'),
('Atlántico', '08', 'Caribe'),
('Bolívar', '13', 'Caribe'),
('Boyacá', '15', 'Andina'),
('Caldas', '17', 'Andina'),
('Caquetá', '18', 'Amazonía'),
('Casanare', '85', 'Orinoquía'),
('Cauca', '19', 'Pacífico'),
('Cesar', '20', 'Caribe'),
('Chocó', '27', 'Pacífico'),
('Córdoba', '23', 'Caribe'),
('Cundinamarca', '25', 'Andina'),
('Guainía', '94', 'Amazonía'),
('Guaviare', '95', 'Amazonía'),
('Huila', '41', 'Andina'),
('La Guajira', '44', 'Caribe'),
('Magdalena', '47', 'Caribe'),
('Meta', '50', 'Orinoquía'),
('Nariño', '52', 'Pacífico'),
('Norte de Santander', '54', 'Andina'),
('Putumayo', '86', 'Amazonía'),
('Quindío', '63', 'Andina'),
('Risaralda', '66', 'Andina'),
('San Andrés y Providencia', '88', 'Insular'),
('Santander', '68', 'Andina'),
('Sucre', '70', 'Caribe'),
('Tolima', '73', 'Andina'),
('Valle del Cauca', '76', 'Pacífico'),
('Vaupés', '97', 'Amazonía'),
('Vichada', '99', 'Orinoquía'),
('Bogotá D.C.', '11', 'Andina');

-- Estados iniciales
INSERT IGNORE INTO estados (nombre, descripcion, modulo, color, orden, es_final) VALUES
-- Estados para Equipos
('Activo', 'Equipo en funcionamiento normal', 'equipos', '#10B981', 1, FALSE),
('Inactivo', 'Equipo fuera de servicio', 'equipos', '#EF4444', 2, FALSE),
('Mantenimiento', 'Equipo en proceso de mantenimiento', 'equipos', '#F59E0B', 3, FALSE),
('Dado de Baja', 'Equipo retirado definitivamente', 'equipos', '#6B7280', 4, TRUE),

-- Estados para Solicitudes
('Pendiente', 'Solicitud creada, pendiente de revisión', 'solicitudes', '#F59E0B', 1, FALSE),
('Aprobada', 'Solicitud aprobada para procesamiento', 'solicitudes', '#10B981', 2, FALSE),
('Rechazada', 'Solicitud rechazada', 'solicitudes', '#EF4444', 3, TRUE),
('En Proceso', 'Solicitud siendo procesada', 'solicitudes', '#3B82F6', 4, FALSE),
('Completada', 'Solicitud completada exitosamente', 'solicitudes', '#059669', 5, TRUE),

-- Estados para Órdenes
('Abierta', 'Orden creada y asignada', 'ordenes', '#3B82F6', 1, FALSE),
('En Progreso', 'Orden siendo ejecutada', 'ordenes', '#F59E0B', 2, FALSE),
('Pausada', 'Orden temporalmente pausada', 'ordenes', '#6B7280', 3, FALSE),
('Cerrada', 'Orden completada y cerrada', 'ordenes', '#10B981', 4, TRUE);

-- Prioridades
INSERT IGNORE INTO prioridades (nombre, descripcion, nivel, color, tiempo_respuesta_horas) VALUES
('Crítica', 'Requiere atención inmediata', 1, '#DC2626', 2),
('Alta', 'Requiere atención prioritaria', 2, '#EA580C', 8),
('Media', 'Prioridad normal', 3, '#D97706', 24),
('Baja', 'Puede esperar', 4, '#65A30D', 72),
('Muy Baja', 'No urgente', 5, '#059669', 168);

-- Variables de sistema iniciales
INSERT IGNORE INTO variables_sistema (clave, valor, tipo, categoria, descripcion, es_editable) VALUES
('sistema.nombre', 'ZIRIUZ V2', 'string', 'General', 'Nombre del sistema', TRUE),
('sistema.version', '2.0.0', 'string', 'General', 'Versión actual del sistema', FALSE),
('respaldos.auto_enabled', 'true', 'boolean', 'Respaldos', 'Habilitar respaldos automáticos', TRUE),
('respaldos.max_file_size_mb', '1024', 'number', 'Respaldos', 'Tamaño máximo de archivo de respaldo en MB', TRUE),
('notificaciones.email_enabled', 'true', 'boolean', 'Notificaciones', 'Habilitar notificaciones por email', TRUE),
('notificaciones.sms_enabled', 'false', 'boolean', 'Notificaciones', 'Habilitar notificaciones por SMS', TRUE),
('logs.retention_days', '90', 'number', 'Logs', 'Días de retención de logs', TRUE),
('logs.max_level', 'info', 'string', 'Logs', 'Nivel máximo de logs a registrar', TRUE);

-- Commit de la transacción
COMMIT;