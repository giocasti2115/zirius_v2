-- Correcciones para que la base de datos coincida con el código del backend

-- Primero, vamos a actualizar la tabla solicitudes
USE ziriuzco_ziriuz;

-- 1. Cambiar nombre de columna 'tipo' a 'tipo_solicitud'
ALTER TABLE solicitudes CHANGE COLUMN tipo tipo_solicitud VARCHAR(100);

-- 2. Agregar columna 'activo'
ALTER TABLE solicitudes ADD COLUMN activo TINYINT(1) DEFAULT 1;

-- 3. Actualizar los valores actuales para marcarlos como activos
UPDATE solicitudes SET activo = 1;

-- 4. Actualizar los estados para que coincidan con el código
-- El enum actual tiene: 'pendiente','en_proceso','completada','cancelada'
-- El código espera: 'pendiente','aprobada','despachada','terminada','rechazada'
ALTER TABLE solicitudes MODIFY COLUMN estado ENUM('pendiente','aprobada','despachada','en_proceso','terminada','completada','rechazada','cancelada') DEFAULT 'pendiente';

-- Verificar otros problemas potenciales
-- Agregar columnas que podrían faltar en otras tablas

-- Verificar estructura de clientes
-- ALTER TABLE clientes ADD COLUMN activo TINYINT(1) DEFAULT 1;

-- Verificar estructura de equipos  
-- ALTER TABLE equipos ADD COLUMN activo TINYINT(1) DEFAULT 1;

-- Mostrar estructura actualizada
DESCRIBE solicitudes;