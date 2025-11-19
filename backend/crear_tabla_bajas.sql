-- Migración simplificada para crear tabla de solicitudes de baja
-- Fecha: 2025-11-17

-- Crear tabla de solicitudes de baja
CREATE TABLE IF NOT EXISTS solicitudes_baja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_solicitud VARCHAR(50) UNIQUE NOT NULL,
    codigo_equipo VARCHAR(100) NOT NULL,
    nombre_equipo VARCHAR(255) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    ubicacion VARCHAR(255),
    responsable VARCHAR(255) NOT NULL,
    solicitante VARCHAR(255) NOT NULL,
    tipo_baja ENUM(
        'obsolescencia_tecnologica',
        'fin_vida_util',
        'dano_irreparable',
        'costo_mantenimiento_elevado',
        'falta_repuestos',
        'normativa_vigente',
        'reemplazo_tecnologico'
    ) NOT NULL,
    justificacion_tecnica TEXT NOT NULL,
    justificacion_economica TEXT,
    valor_recuperable DECIMAL(15,2),
    observaciones TEXT,
    estado ENUM('pendiente', 'aprobada', 'rechazada', 'ejecutada', 'en_proceso') DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL,
    fecha_ejecucion TIMESTAMP NULL,
    
    -- Datos de evaluacion tecnica
    evaluador VARCHAR(255),
    observaciones_evaluacion TEXT,
    recomendaciones TEXT,
    valor_recuperable_aprobado DECIMAL(15,2),
    
    -- Datos de ejecucion
    ejecutor VARCHAR(255),
    observaciones_ejecucion TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indices
    INDEX idx_codigo_solicitud (codigo_solicitud),
    INDEX idx_codigo_equipo (codigo_equipo),
    INDEX idx_estado (estado),
    INDEX idx_tipo_baja (tipo_baja),
    INDEX idx_fecha_solicitud (fecha_solicitud),
    INDEX idx_solicitante (solicitante)
);