-- Script para importar datos de ejemplo basados en el sistema original Ziriuz
USE ziriuzco_ziriuz;

-- Insertar servicios
INSERT INTO services (name, descripcion) VALUES 
('Instalación', 'Instalación de equipos médicos'),
('Diagnóstico', 'Diagnóstico de problemas en equipos'),
('Correctivo', 'Mantenimiento correctivo'),
('Preventivo', 'Mantenimiento preventivo programado'),
('Garantía', 'Servicios bajo garantía'),
('Calibración', 'Calibración de equipos de precisión'),
('Control de Calidad', 'Verificación y control de calidad');

-- Insertar marcas
INSERT INTO marcas (nombre, descripcion) VALUES 
('Sirona', 'Equipos dentales de alta tecnología'),
('Planmeca', 'Tecnología de imágenes dentales'),
('Tuttnauer', 'Autoclaves y esterilización'),
('Jun-Air', 'Compresores de aire médico'),
('Philips', 'Equipos médicos y de monitoreo'),
('GE Healthcare', 'Equipos de diagnóstico por imágenes'),
('Mindray', 'Monitores y equipos de cuidados intensivos'),
('Drager', 'Equipos de anestesia y ventilación');

-- Insertar clases de equipos
INSERT INTO clases (nombre, descripcion) VALUES 
('Equipos Dentales', 'Sillas dentales, rayos X, etc.'),
('Esterilización', 'Autoclaves y equipos de esterilización'),
('Compresores', 'Compresores de aire médico'),
('Monitoreo', 'Monitores de signos vitales'),
('Diagnóstico', 'Equipos de diagnóstico e imágenes'),
('Anestesia', 'Equipos de anestesia y sedación'),
('Rehabilitación', 'Equipos de terapia y rehabilitación');

-- Insertar modelos (relacionando marcas y clases)
INSERT INTO modelos (id_marca, id_clase, nombre, descripcion) VALUES 
(1, 1, 'C4+', 'Silla dental Sirona C4+ con luz LED'),
(2, 1, 'ProMax 3D', 'Sistema de rayos X digital 3D'),
(3, 2, '2540M', 'Autoclave de mesa 24 litros'),
(4, 3, 'OF302', 'Compresor silencioso libre de aceite'),
(5, 4, 'MP20', 'Monitor de signos vitales portátil'),
(6, 5, 'LOGIQ E10', 'Ecógrafo de alta resolución'),
(7, 4, 'BeneView T1', 'Monitor de transporte'),
(8, 6, 'Perseus A500', 'Estación de anestesia');

-- Insertar usuarios técnicos
INSERT INTO usuarios (nombre, email, password, telefono, rol) VALUES 
('Carlos Técnico', 'carlos.tecnico@ziriuz.com', '$2b$10$hashedpassword1', '+57 310 123 4567', 'tecnico'),
('María Ingeniera', 'maria.ingeniera@ziriuz.com', '$2b$10$hashedpassword2', '+57 311 234 5678', 'ingeniero'),
('Juan Administrador', 'juan.admin@ziriuz.com', '$2b$10$hashedpassword3', '+57 312 345 6789', 'administrador'),
('Ana Coordinadora', 'ana.coord@ziriuz.com', '$2b$10$hashedpassword4', '+57 313 456 7890', 'coordinador'),
('Luis Técnico Senior', 'luis.senior@ziriuz.com', '$2b$10$hashedpassword5', '+57 314 567 8901', 'tecnico_senior');

-- Insertar repuestos básicos
INSERT INTO repuestos (codigo, nombre, descripcion, categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES 
('LED001', 'Lámpara LED Dental', 'Lámpara LED de repuesto para sillas dentales', 'Iluminación', 125000, 180000, 15, 5),
('FILT002', 'Filtro Autoclave', 'Filtro de agua para autoclave', 'Filtros', 35000, 50000, 25, 10),
('SENS003', 'Sensor de Presión', 'Sensor de presión para monitor de signos vitales', 'Sensores', 85000, 120000, 8, 3),
('TUBE004', 'Tubo de Rayos X', 'Tubo de rayos X dental', 'Componentes', 450000, 650000, 3, 1),
('PUMP005', 'Bomba de Vacío', 'Bomba de vacío para compresor', 'Mecánicos', 220000, 320000, 6, 2);

-- Insertar solicitudes de ejemplo
INSERT INTO solicitudes (id_cliente, id_sede, id_equipo, tipo_solicitud, estado, prioridad, descripcion, id_usuario_solicita) VALUES 
(1, 1, 1, 'bodega', 'pendiente', 'media', 'Solicitud de lámpara LED para silla dental', 1),
(1, 1, 2, 'bodega', 'aprobada', 'alta', 'Filtro de autoclave urgente', 2),
(2, 3, 3, 'decommission', 'pendiente', 'baja', 'Dar de baja autoclave obsoleto', 1),
(3, 4, 5, 'bodega', 'despachada', 'alta', 'Sensor de presión para monitor UCI', 3),
(1, 2, 1, 'bodega', 'terminada', 'media', 'Repuesto instalado correctamente', 2);

-- Insertar órdenes de trabajo
INSERT INTO ordenes (numero_orden, id_solicitud, id_cliente, id_sede, id_equipo, id_servicio, estado, prioridad, descripcion_problema, id_tecnico, costo_estimado, tiempo_estimado) VALUES 
('ORD-2024-001', 1, 1, 1, 1, 3, 'asignada', 'media', 'Falla en la iluminación de la silla dental', 1, 180000, 120),
('ORD-2024-002', 2, 1, 1, 2, 4, 'en_proceso', 'alta', 'Mantenimiento preventivo del autoclave', 2, 85000, 90),
('ORD-2024-003', 4, 3, 4, 5, 2, 'completada', 'alta', 'Diagnóstico de sensor defectuoso', 3, 120000, 60),
('ORD-2024-004', NULL, 2, 3, 3, 1, 'creada', 'baja', 'Instalación de nuevo compresor', 1, 350000, 180),
('ORD-2024-005', 5, 1, 2, 1, 6, 'completada', 'media', 'Calibración anual de equipo', 5, 95000, 45);

-- Insertar visitas técnicas
INSERT INTO visitas (id_orden, id_cliente, id_sede, id_tecnico, tipo_visita, estado, fecha_programada, observaciones_tecnico, calificacion) VALUES 
(1, 1, 1, 1, 'correctivo', 'completada', '2024-11-01 09:00:00', 'Lámpara LED reemplazada exitosamente', 5),
(2, 1, 1, 2, 'preventivo', 'en_curso', '2024-11-02 14:00:00', 'Mantenimiento en progreso', NULL),
(3, 3, 4, 3, 'diagnostico', 'completada', '2024-10-30 10:30:00', 'Sensor reemplazado, equipo funcionando correctamente', 4),
(4, 2, 3, 1, 'instalacion', 'programada', '2024-11-05 08:00:00', NULL, NULL),
(5, 1, 2, 5, 'garantia', 'completada', '2024-10-28 16:00:00', 'Calibración realizada dentro de parámetros', 5);

-- Insertar cotizaciones
INSERT INTO cotizaciones (numero_cotizacion, id_cliente, id_sede, id_orden, estado, subtotal, descuento, impuestos, total, vigencia_dias, fecha_vencimiento, observaciones, id_usuario_crea) VALUES 
('COT-2024-001', 1, 1, 1, 'aprobada', 180000, 5.00, 34200, 205200, 30, '2024-12-01', 'Cotización para reemplazo de lámpara LED', 1),
('COT-2024-002', 2, 3, 4, 'enviada', 350000, 0.00, 66500, 416500, 45, '2024-12-15', 'Instalación de compresor nuevo', 2),
('COT-2024-003', 3, 4, 3, 'aprobada', 120000, 10.00, 20520, 128520, 30, '2024-11-30', 'Diagnóstico y reparación de monitor', 3),
('COT-2024-004', 1, 2, 5, 'borrador', 95000, 0.00, 18050, 113050, 30, '2024-12-02', 'Servicio de calibración anual', 1);

-- Insertar items de cotización
INSERT INTO cotizacion_items (id_cotizacion, tipo_item, descripcion, cantidad, precio_unitario, subtotal) VALUES 
(1, 'repuesto', 'Lámpara LED Dental', 1, 180000, 180000),
(2, 'repuesto', 'Compresor Jun-Air OF302', 1, 280000, 280000),
(2, 'mano_obra', 'Instalación y configuración', 1, 70000, 70000),
(3, 'repuesto', 'Sensor de Presión', 1, 120000, 120000),
(4, 'servicio', 'Calibración de equipo médico', 1, 95000, 95000);