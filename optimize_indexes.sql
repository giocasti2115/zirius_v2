-- Índices para optimizar consultas de cotizaciones

-- Índice en fecha de creación para ordenamiento y filtros por fecha
CREATE INDEX idx_cotizaciones_creacion ON cotizaciones(creacion);

-- Índice compuesto para filtros comunes: estado + fecha de creación
CREATE INDEX idx_cotizaciones_estado_fecha ON cotizaciones(id_estado, creacion);

-- Índice compuesto para filtros por cliente + fecha
CREATE INDEX idx_cotizaciones_cliente_fecha ON cotizaciones(id_cliente, creacion);

-- Índice para búsquedas de texto en mensaje
CREATE INDEX idx_cotizaciones_mensaje ON cotizaciones(mensaje(100));

-- Verificar índices creados
SHOW INDEX FROM cotizaciones WHERE Column_name IN ('creacion', 'mensaje');