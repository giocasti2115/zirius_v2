-- Script para analizar la estructura de la BD de producción
-- Ejecutar este script en tu BD de producción actual para obtener la estructura

-- 1. Listar todas las tablas
SELECT 'TABLAS EXISTENTES:' as ANALISIS;
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
ORDER BY TABLE_NAME;

-- 2. Obtener estructura de cada tabla principal
SELECT 'ESTRUCTURA DE USUARIOS:' as ANALISIS;
DESCRIBE usuarios;

SELECT 'ESTRUCTURA DE CLIENTES:' as ANALISIS;
DESCRIBE clientes;

SELECT 'ESTRUCTURA DE EQUIPOS:' as ANALISIS;
DESCRIBE equipos;

SELECT 'ESTRUCTURA DE SOLICITUDES/SERVICIOS:' as ANALISIS;
DESCRIBE solicitudes;

SELECT 'ESTRUCTURA DE ORDENES:' as ANALISIS;
DESCRIBE ordenes;

SELECT 'ESTRUCTURA DE VISITAS:' as ANALISIS;
DESCRIBE visitas;

SELECT 'ESTRUCTURA DE COTIZACIONES:' as ANALISIS;
DESCRIBE cotizaciones;

-- 3. Contar registros en cada tabla
SELECT 'CANTIDAD DE REGISTROS:' as ANALISIS;

SELECT 
  'usuarios' as tabla,
  COUNT(*) as total_registros
FROM usuarios
UNION ALL
SELECT 
  'clientes' as tabla,
  COUNT(*) as total_registros
FROM clientes
UNION ALL
SELECT 
  'equipos' as tabla,
  COUNT(*) as total_registros
FROM equipos
UNION ALL
SELECT 
  'solicitudes' as tabla,
  COUNT(*) as total_registros
FROM solicitudes
ORDER BY tabla;

-- 4. Verificar relaciones importantes
SELECT 'RELACIONES FOREIGN KEYS:' as ANALISIS;
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() 
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;