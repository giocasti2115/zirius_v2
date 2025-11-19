-- Tabla para tracking GPS de visitas
CREATE TABLE IF NOT EXISTS visitas_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id INT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    precision_gps FLOAT DEFAULT 0,
    direccion VARCHAR(500),
    timestamp DATETIME NOT NULL,
    evento_tipo ENUM('check_in', 'check_out', 'ubicacion', 'foto_subida', 'actividad') NOT NULL,
    descripcion TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_visita_tracking (visita_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_evento_tipo (evento_tipo),
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE
);

-- Tabla para check-in/check-out de visitas
CREATE TABLE IF NOT EXISTS visitas_checkin_checkout (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id INT NOT NULL,
    tecnico_id INT NOT NULL,
    tipo ENUM('check_in', 'check_out') NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    precision_gps FLOAT DEFAULT 0,
    direccion VARCHAR(500),
    fecha_hora DATETIME NOT NULL,
    observaciones TEXT,
    qr_codigo VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_visita_checkin (visita_id),
    INDEX idx_tecnico_checkin (tecnico_id),
    INDEX idx_tipo_checkin (tipo),
    INDEX idx_fecha_checkin (fecha_hora),
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
);

-- Tabla para fotos de visitas con metadata completa
CREATE TABLE IF NOT EXISTS visitas_fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    miniatura VARCHAR(500),
    tamaño INT DEFAULT 0,
    descripcion TEXT,
    etiquetas JSON, -- ["antes", "durante", "despues", "problema", "solucion"]
    ubicacion_lat DECIMAL(10, 8),
    ubicacion_lng DECIMAL(11, 8),
    metadata JSON, -- {ancho, alto, formato, camara, etc}
    tipo_evento ENUM('check_in', 'check_out', 'progreso', 'evidencia', 'problema') DEFAULT 'evidencia',
    favorita BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_visita_fotos (visita_id),
    INDEX idx_tipo_evento (tipo_evento),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE
);

-- Tabla para comentarios en fotos (sistema de colaboración)
CREATE TABLE IF NOT EXISTS visitas_fotos_comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    foto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    tipo ENUM('comentario', 'aprobacion', 'rechazo') DEFAULT 'comentario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_foto_comentarios (foto_id),
    INDEX idx_usuario_comentarios (usuario_id),
    FOREIGN KEY (foto_id) REFERENCES visitas_fotos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Agregar campos adicionales a tabla visitas para tracking
ALTER TABLE visitas 
ADD COLUMN IF NOT EXISTS ubicacion_actual_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS ubicacion_actual_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS tecnico_actual_id INT,
ADD COLUMN IF NOT EXISTS fecha_inicio_real DATETIME,
ADD COLUMN IF NOT EXISTS fecha_fin_real DATETIME,
ADD COLUMN IF NOT EXISTS duracion_minutos INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Índices adicionales para optimización
CREATE INDEX IF NOT EXISTS idx_visitas_ubicacion ON visitas(ubicacion_actual_lat, ubicacion_actual_lng);
CREATE INDEX IF NOT EXISTS idx_visitas_tecnico_actual ON visitas(tecnico_actual_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha_real ON visitas(fecha_inicio_real, fecha_fin_real);
CREATE INDEX IF NOT EXISTS idx_visitas_ultima_actualizacion ON visitas(ultima_actualizacion);

-- Agregar campo telefono a tecnicos si no existe (para dashboard)
ALTER TABLE tecnicos 
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

-- Crear vista para estadísticas rápidas de dashboard
CREATE OR REPLACE VIEW vista_estadisticas_diarias AS
SELECT 
    DATE(fecha_programada) as fecha,
    COUNT(*) as total_visitas,
    SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas,
    SUM(CASE WHEN estado = 'en_curso' THEN 1 ELSE 0 END) as en_curso,
    SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
    SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
    AVG(CASE WHEN duracion_minutos > 0 THEN duracion_minutos ELSE NULL END) as tiempo_promedio,
    COUNT(DISTINCT tecnico_id) as tecnicos_activos
FROM visitas 
WHERE activo = 1
GROUP BY DATE(fecha_programada);

-- Crear vista para técnicos con ubicación actual
CREATE OR REPLACE VIEW vista_tecnicos_ubicacion AS
SELECT 
    t.id,
    t.nombre,
    t.telefono,
    t.activo,
    v.id as visita_actual_id,
    v.numero_visita,
    v.cliente_nombre,
    v.estado as estado_visita,
    vt.latitud as ultima_latitud,
    vt.longitud as ultima_longitud,
    vt.direccion as ultima_direccion,
    vt.timestamp as ultima_ubicacion,
    TIMESTAMPDIFF(MINUTE, vt.timestamp, NOW()) as minutos_desde_ultima_ubicacion
FROM tecnicos t
LEFT JOIN visitas v ON t.id = v.tecnico_id 
    AND v.estado IN ('programada', 'en_curso') 
    AND DATE(v.fecha_programada) = CURDATE()
LEFT JOIN visitas_tracking vt ON v.id = vt.visita_id 
    AND vt.id = (
        SELECT MAX(id) FROM visitas_tracking vt2 
        WHERE vt2.visita_id = v.id
    )
WHERE t.activo = 1;