-- Migración para crear tabla de solicitudes de baja
-- Fecha: 2025-11-16

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
        'daño_irreparable',
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
    
    -- Datos de evaluación técnica
    evaluador VARCHAR(255),
    observaciones_evaluacion TEXT,
    recomendaciones TEXT,
    valor_recuperable_aprobado DECIMAL(15,2),
    
    -- Datos de ejecución
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

-- Crear tabla para documentos de baja (opcional, para futuras versiones)
CREATE TABLE IF NOT EXISTS solicitudes_baja_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_baja_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(50),
    tamaño_archivo INT,
    ruta_archivo VARCHAR(500),
    tipo_documento ENUM('soporte', 'final') DEFAULT 'soporte',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (solicitud_baja_id) REFERENCES solicitudes_baja(id) ON DELETE CASCADE,
    INDEX idx_solicitud_baja (solicitud_baja_id),
    INDEX idx_tipo_documento (tipo_documento)
);

-- Crear tabla para repuestos recuperables (opcional, para futuras versiones)
CREATE TABLE IF NOT EXISTS solicitudes_baja_repuestos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_baja_id INT NOT NULL,
    nombre_repuesto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado_repuesto ENUM('funcional', 'requiere_reparacion', 'no_funcional') NOT NULL,
    valor_estimado DECIMAL(15,2) NOT NULL,
    valor_real DECIMAL(15,2),
    fecha_recuperacion TIMESTAMP NULL,
    
    FOREIGN KEY (solicitud_baja_id) REFERENCES solicitudes_baja(id) ON DELETE CASCADE,
    INDEX idx_solicitud_baja (solicitud_baja_id),
    INDEX idx_estado_repuesto (estado_repuesto)
);

-- Insertar datos de ejemplo para testing
INSERT INTO solicitudes_baja (
    codigo_solicitud, codigo_equipo, nombre_equipo, marca, modelo, numero_serie,
    ubicacion, responsable, solicitante, tipo_baja, justificacion_tecnica,
    justificacion_economica, valor_recuperable, observaciones, estado
) VALUES 
(
    'SB-2024-001',
    'EQ-2021-456',
    'Monitor de Signos Vitales Phillips MP20',
    'Phillips',
    'MP20',
    'PH-MP20-2021-456',
    'UCI - Cama 3',
    'Dr. García Martinez',
    'Ing. Ana López',
    'obsolescencia_tecnologica',
    'El equipo presenta obsolescencia tecnológica avanzada. Los repuestos ya no están disponibles en el mercado y la tecnología ha sido reemplazada por modelos más eficientes.',
    'El costo de mantenimiento anual ($2,500 USD) supera el 60% del valor actual del equipo. La inversión en reparaciones no es rentable.',
    1500.00,
    'Equipo funcional pero con tecnología obsoleta. Requiere reemplazo urgente.',
    'pendiente'
),
(
    'SB-2024-002',
    'EQ-2020-789',
    'Ventilador Mecánico Dräger V500',
    'Dräger',
    'V500',
    'DR-V500-2020-789',
    'UCI - Cama 5',
    'Dr. Carlos Ruiz',
    'Ing. Pedro Morales',
    'daño_irreparable',
    'El equipo sufrió daños irreparables en el sistema de control principal debido a una sobretensión eléctrica. La reparación requiere reemplazo completo de la placa madre.',
    'El costo de reparación ($8,500 USD) supera el 80% del valor de un equipo nuevo similar.',
    3200.00,
    'Equipo dañado por sobretensión. Algunos componentes pueden ser recuperados.',
    'aprobada'
),
(
    'SB-2024-003',
    'EQ-2019-234',
    'Bomba de Infusión Baxter AS50',
    'Baxter',
    'AS50',
    'BX-AS50-2019-234',
    'Hospitalización - Piso 2',
    'Enfermera Jefe María Santos',
    'Ing. Luis Fernández',
    'costo_mantenimiento_elevado',
    'Los costos de mantenimiento preventivo y correctivo han aumentado significativamente. El equipo requiere calibración mensual y reemplazo frecuente de sensores.',
    'Costo anual de mantenimiento: $1,800 USD. Disponibilidad de repuestos limitada con precios incrementados en 40%.',
    800.00,
    'Equipo funcional pero con altos costos operativos.',
    'ejecutada'
),
(
    'SB-2024-004',
    'EQ-2022-567',
    'Electrocardiógrafo Nihon Kohden ECG-1350',
    'Nihon Kohden',
    'ECG-1350',
    'NK-ECG-1350-2022-567',
    'Cardiología - Consultorio 1',
    'Dr. Andrea Vásquez',
    'Ing. Miguel Torres',
    'reemplazo_tecnologico',
    'Se ha adquirido nueva tecnología que reemplaza completamente las funciones de este equipo. El nuevo sistema ofrece mejores características diagnósticas.',
    'La nueva tecnología reduce tiempos de diagnóstico en 50% y mejora la precisión. Mantener ambos equipos genera costos innecesarios.',
    2800.00,
    'Equipo en perfecto estado pero reemplazado por tecnología superior.',
    'rechazada'
),
(
    'SB-2024-005',
    'EQ-2018-890',
    'Desfibrilador Physio-Control LIFEPAK 15',
    'Physio-Control',
    'LIFEPAK 15',
    'PC-LP15-2018-890',
    'Urgencias - Trauma 1',
    'Dr. Roberto Mendoza',
    'Ing. Carolina Silva',
    'normativa_vigente',
    'El equipo no cumple con las nuevas normativas IEC 60601-2-4:2023 para desfibriladores. Requiere actualización de software y hardware que no está disponible.',
    'El costo de actualización para cumplir normativa ($4,200 USD) representa el 70% del valor de un equipo nuevo certificado.',
    2200.00,
    'Equipo funcional pero no cumple normativas actuales de seguridad.',
    'en_proceso'
);

-- Insertar algunos documentos de ejemplo
INSERT INTO solicitudes_baja_documentos (
    solicitud_baja_id, nombre_archivo, tipo_archivo, tamaño_archivo, tipo_documento
) VALUES 
(1, 'informe_tecnico_MP20.pdf', 'pdf', 1024000, 'soporte'),
(1, 'cotizacion_repuestos.pdf', 'pdf', 512000, 'soporte'),
(2, 'reporte_daños_V500.pdf', 'pdf', 2048000, 'soporte'),
(2, 'fotos_equipo_dañado.jpg', 'jpg', 3072000, 'soporte'),
(3, 'historial_mantenimiento_AS50.xlsx', 'xlsx', 256000, 'soporte');

-- Insertar algunos repuestos de ejemplo
INSERT INTO solicitudes_baja_repuestos (
    solicitud_baja_id, nombre_repuesto, descripcion, estado_repuesto, valor_estimado
) VALUES 
(1, 'Sensor de SpO2', 'Sensor de oximetría funcional', 'funcional', 150.00),
(1, 'Cables de ECG', 'Set completo de cables para electrocardiograma', 'funcional', 80.00),
(2, 'Válvula de presión', 'Válvula principal del sistema de presión', 'requiere_reparacion', 320.00),
(2, 'Display LCD', 'Pantalla principal del ventilador', 'funcional', 450.00),
(3, 'Bomba peristáltica', 'Mecanismo de bomba principal', 'funcional', 280.00);

-- Actualizar algunas solicitudes con datos de evaluación
UPDATE solicitudes_baja 
SET evaluador = 'Ing. Senior José Ramírez',
    observaciones_evaluacion = 'Solicitud aprobada. El análisis técnico y económico justifica la baja del equipo.',
    recomendaciones = 'Proceder con la recuperación de repuestos funcionales antes de la disposición final.',
    valor_recuperable_aprobado = 1200.00,
    fecha_aprobacion = DATE_SUB(NOW(), INTERVAL 5 DAY)
WHERE id = 2;

UPDATE solicitudes_baja 
SET evaluador = 'Ing. Senior María González',
    observaciones_evaluacion = 'Baja ejecutada exitosamente. Repuestos recuperados según inventario.',
    ejecutor = 'Téc. Juan Pérez',
    observaciones_ejecucion = 'Equipo dado de baja físicamente. Repuestos funcionales trasladados al almacén. Componentes no funcionales enviados a disposición final autorizada.',
    fecha_aprobacion = DATE_SUB(NOW(), INTERVAL 15 DAY),
    fecha_ejecucion = DATE_SUB(NOW(), INTERVAL 8 DAY)
WHERE id = 3;

-- Comentarios para el administrador
-- Esta migración crea la estructura completa para el módulo de dar de baja
-- Incluye tablas principales y de soporte, datos de ejemplo y relaciones
-- Ejecutar después de verificar que no existan conflictos con esquemas existentes