-- Script para agregar más datos de ejemplo y mejorar la visualización del dashboard

USE ziriuzco_ziriuz;

-- Agregar más equipos con diferentes estados
INSERT INTO equipos (nombre, modelo, marca, serie, estado, cliente_id, activo) VALUES
('Equipo Dental Advanced', 'ADV-2024', 'Dentsply', 'DS2024001', 'activo', 1, 1),
('Unidad Rayos X Premium', 'RX-P500', 'Sirona', 'SR500002', 'mantenimiento', 2, 1),
('Autoclave Pro', 'AC-P300', 'Tuttnauer', 'TT300003', 'activo', 3, 1),
('Compresor Industrial', 'CI-2024', 'Atlas Copco', 'AC2024004', 'inactivo', 1, 0);

-- Agregar más solicitudes con diferentes tipos y estados
INSERT INTO solicitudes (equipo_id, cliente_id, tipo_solicitud, descripcion, estado, prioridad, activo) VALUES
(6, 1, 'Inspección', 'Inspección anual de seguridad', 'aprobada', 'media', 1),
(7, 2, 'Instalación', 'Instalación de nueva unidad', 'despachada', 'alta', 1),
(8, 3, 'Actualización', 'Actualización de software', 'terminada', 'baja', 1),
(9, 1, 'Emergencia', 'Reparación urgente', 'pendiente', 'urgente', 1);

-- Agregar órdenes de trabajo
INSERT INTO ordenes (solicitud_id, numero_orden, descripcion, estado, tipo_orden, prioridad, fecha_programada, tecnico_asignado_id, tiempo_estimado, activo) VALUES
(6, 'ORD-2024-006', 'Inspección anual equipo dental', 'asignada', 'inspeccion', 'media', '2024-11-10 09:00:00', 2, 120, 1),
(7, 'ORD-2024-007', 'Instalación rayos X', 'en_proceso', 'instalacion', 'alta', '2024-11-08 08:00:00', 3, 240, 1),
(8, 'ORD-2024-008', 'Actualización software', 'completada', 'mantenimiento_preventivo', 'baja', '2024-11-05 10:00:00', 2, 60, 1);

-- Agregar visitas técnicas
INSERT INTO visitas (orden_id, fecha_programada, fecha_inicio, fecha_fin, estado, tipo_visita, tecnico_asignado_id, observaciones, calificacion_cliente, duracion_estimada, activo) VALUES
(6, '2024-11-10 09:00:00', NULL, NULL, 'programada', 'revision', 2, 'Revisión programada anual', NULL, 120, 1),
(7, '2024-11-08 08:00:00', '2024-11-08 08:15:00', NULL, 'en_curso', 'instalacion', 3, 'Instalación en progreso', NULL, 240, 1),
(8, '2024-11-05 10:00:00', '2024-11-05 10:00:00', '2024-11-05 11:00:00', 'completada', 'mantenimiento', 2, 'Actualización completada exitosamente', 5, 60, 1);

-- Agregar cotizaciones
INSERT INTO cotizaciones (solicitud_id, numero_cotizacion, descripcion, monto_total, estado, fecha_vencimiento, activo) VALUES
(6, 'COT-2024-006', 'Cotización inspección anual', 150000.00, 'enviada', '2024-11-15 23:59:59', 1),
(7, 'COT-2024-007', 'Cotización instalación rayos X', 2500000.00, 'aprobada', '2024-11-20 23:59:59', 1),
(8, 'COT-2024-008', 'Cotización actualización software', 80000.00, 'aprobada', '2024-11-12 23:59:59', 1),
(9, 'COT-2024-009', 'Cotización reparación urgente', 300000.00, 'borrador', '2024-11-18 23:59:59', 1);

-- Actualizar cliente_id en cotizaciones basado en solicitudes
UPDATE cotizaciones cot 
JOIN solicitudes sol ON cot.solicitud_id = sol.id 
SET cot.cliente_id = sol.cliente_id
WHERE cot.cliente_id IS NULL;

-- Verificar los datos insertados
SELECT 'RESUMEN DE DATOS INSERTADOS:' as RESULTADO;

SELECT 
  'equipos' as tabla,
  COUNT(*) as total_registros
FROM equipos
UNION ALL
SELECT 
  'solicitudes' as tabla,
  COUNT(*) as total_registros
FROM solicitudes
UNION ALL
SELECT 
  'ordenes' as tabla,
  COUNT(*) as total_registros
FROM ordenes
UNION ALL
SELECT 
  'visitas' as tabla,
  COUNT(*) as total_registros
FROM visitas
UNION ALL
SELECT 
  'cotizaciones' as tabla,
  COUNT(*) as total_registros
FROM cotizaciones
ORDER BY tabla;