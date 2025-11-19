-- Script para corregir todas las inconsistencias de esquema en las tablas restantes

USE ziriuzco_ziriuz;

-- 1. Corregir tabla cotizaciones
-- Agregar columna 'total' como alias/copia de 'monto_total' para compatibilidad
ALTER TABLE cotizaciones ADD COLUMN total DECIMAL(10,2) GENERATED ALWAYS AS (monto_total) STORED;

-- Agregar columna cliente_id para facilitar consultas directas
ALTER TABLE cotizaciones ADD COLUMN cliente_id INT;

-- Actualizar cliente_id basado en la solicitud
UPDATE cotizaciones cot 
JOIN solicitudes sol ON cot.solicitud_id = sol.id 
SET cot.cliente_id = sol.cliente_id;

-- Agregar columna activo
ALTER TABLE cotizaciones ADD COLUMN activo TINYINT(1) DEFAULT 1;
UPDATE cotizaciones SET activo = 1;

-- 2. Corregir tabla ordenes
-- Agregar columna activo
ALTER TABLE ordenes ADD COLUMN activo TINYINT(1) DEFAULT 1;
UPDATE ordenes SET activo = 1;

-- 3. Corregir tabla visitas
-- Agregar columna activo
ALTER TABLE visitas ADD COLUMN activo TINYINT(1) DEFAULT 1;
UPDATE visitas SET activo = 1;

-- Verificar las estructuras actualizadas
SELECT 'COTIZACIONES' as TABLA;
DESCRIBE cotizaciones;

SELECT 'ORDENES' as TABLA;
DESCRIBE ordenes;

SELECT 'VISITAS' as TABLA;
DESCRIBE visitas;