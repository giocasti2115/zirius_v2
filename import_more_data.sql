-- Script para importar más marcas y datos reales del sistema Ziriuz original
USE ziriuzco_ziriuz;

-- Limpiar marcas existentes y agregar más marcas realistas basadas en el sistema original
DELETE FROM marcas WHERE id > 8;

-- Insertar marcas adicionales del sistema médico real
INSERT INTO marcas (nombre, descripcion) VALUES 
('Medtronic', 'Dispositivos médicos avanzados y tecnología cardiovascular'),
('Siemens Healthineers', 'Tecnología de imágenes médicas y diagnóstico'),
('Canon Medical', 'Sistemas de tomografía y resonancia magnética'),
('Fujifilm', 'Equipos de rayos X y sistemas de imágenes'),
('Hologic', 'Mamografía y diagnóstico de salud femenina'),
('Carestream', 'Soluciones de imágenes médicas digitales'),
('Konica Minolta', 'Sistemas de radiografía digital'),
('Agfa Healthcare', 'Soluciones de TI e imágenes médicas'),
('Shimadzu', 'Equipos de rayos X y fluoroscopia'),
('Toshiba Medical', 'Sistemas de CT y ultrasonido'),
('Elekta', 'Equipos de radioterapia y oncología'),
('Varian Medical', 'Sistemas de radioterapia lineal'),
('Stryker', 'Equipos quirúrgicos y ortopédicos'),
('Zimmer Biomet', 'Implantes y equipos ortopédicos'),
('Boston Scientific', 'Dispositivos médicos mínimamente invasivos'),
('Abbott', 'Dispositivos de diagnóstico y monitoreo'),
('BD Becton Dickinson', 'Sistemas de inyección y diagnóstico'),
('Baxter', 'Equipos de diálisis y cuidados críticos'),
('Fresenius', 'Equipos de diálisis y nutrición clínica'),
('Dräger', 'Equipos de anestesia, ventilación y monitoreo');

-- Insertar más clases de equipos específicas
INSERT INTO clases (nombre, descripcion) VALUES 
('Rayos X', 'Equipos de radiografía convencional y digital'),
('Tomografía', 'Equipos de tomografía computarizada (CT)'),
('Resonancia Magnética', 'Equipos de resonancia magnética (MRI)'),
('Ultrasonido', 'Equipos de ecografía y doppler'),
('Mamografía', 'Equipos especializados en mamografía'),
('Fluoroscopia', 'Equipos de fluoroscopia e intervencionismo'),
('Medicina Nuclear', 'Gammacámaras y equipos de medicina nuclear'),
('Radioterapia', 'Aceleradores lineales y equipos de radioterapia'),
('Hemodiálisis', 'Equipos de diálisis y tratamiento renal'),
('Ventilación', 'Ventiladores mecánicos y equipos respiratorios'),
('Laboratorio', 'Equipos de análisis clínico y laboratorio'),
('Cardiología', 'Equipos de diagnóstico cardiovascular'),
('Endoscopia', 'Equipos de endoscopia y cirugía mínimamente invasiva'),
('Oftalmología', 'Equipos de diagnóstico y cirugía oftálmica'),
('Dermatología', 'Equipos de diagnóstico y tratamiento dermatológico');

-- Insertar más modelos realistas
INSERT INTO modelos (id_marca, id_clase, nombre, descripcion) VALUES 
-- Siemens
(10, 9, 'Somatom Go', 'Tomógrafo computarizado de 32 cortes'),
(10, 10, 'Magnetom Essenza', 'Resonancia magnética de 1.5T'),
(10, 8, 'Ysio Max', 'Sistema de rayos X digital con detector plano'),

-- Canon Medical (antes Toshiba)
(11, 9, 'Aquilion Prime', 'Tomógrafo de 80 cortes con dosis ultra baja'),
(11, 11, 'Aplio i800', 'Sistema de ultrasonido premium'),

-- Fujifilm
(12, 8, 'FDR D-EVO II', 'Sistema de radiografía digital portátil'),
(12, 13, 'Amulet Innovality', 'Sistema de mamografía digital con tomosíntesis'),

-- GE Healthcare (ya existente)
(6, 9, 'Revolution CT', 'Tomógrafo de alta velocidad 256 cortes'),
(6, 10, 'Signa Premier', 'Resonancia magnética de 3.0T'),
(6, 11, 'LOGIQ E10', 'Sistema de ultrasonido de alta gama'),

-- Philips (ya existente)
(5, 17, 'Azurion', 'Sistema de angiografía e intervencionismo'),
(5, 9, 'Ingenuity CT', 'Tomógrafo computarizado helicoidal'),

-- Dräger
(28, 18, 'Perseus A500', 'Estación de anestesia completa'),
(28, 18, 'Fabius GS', 'Estación de anestesia compacta'),
(28, 4, 'Infinity Vista XL', 'Monitor de paciente central'),

-- Fresenius
(27, 17, '5008S', 'Máquina de hemodiálisis con monitoreo online'),
(27, 17, '4008S', 'Sistema de hemodiálisis estándar'),

-- Mindray (ya existente)
(7, 4, 'BeneView T9', 'Monitor de transporte avanzado'),
(7, 18, 'SV800', 'Ventilador mecánico para cuidados intensivos');

-- Insertar más usuarios técnicos especializados
INSERT INTO usuarios (nombre, email, password, telefono, rol) VALUES 
('Diego Radiología', 'diego.radio@ziriuz.com', '$2b$10$hashedpassword6', '+57 315 678 9012', 'tecnico_radio'),
('Sandra Biomédica', 'sandra.bio@ziriuz.com', '$2b$10$hashedpassword7', '+57 316 789 0123', 'ingeniero_bio'),
('Roberto Mantenimiento', 'roberto.mant@ziriuz.com', '$2b$10$hashedpassword8', '+57 317 890 1234', 'tecnico_preventivo'),
('Carmen Calibración', 'carmen.cal@ziriuz.com', '$2b$10$hashedpassword9', '+57 318 901 2345', 'metrologia'),
('Felipe Servicio', 'felipe.serv@ziriuz.com', '$2b$10$hashedpassword10', '+57 319 012 3456', 'tecnico_campo');

-- Insertar más equipos realistas en las sedes existentes
INSERT INTO equipos (id_sede, nombre, marca, modelo, serie, ubicacion) VALUES 
-- Sede Principal (id_sede = 1)
(1, 'Tomógrafo Siemens', 'Siemens', 'Somatom Go', 'CT001', 'Sala de Tomografía'),
(1, 'Ecógrafo GE', 'GE Healthcare', 'LOGIQ E10', 'US001', 'Consulta Externa'),
(1, 'Mamógrafo Fujifilm', 'Fujifilm', 'Amulet Innovality', 'MG001', 'Radiología'),
(1, 'Monitor Central Philips', 'Philips', 'IntelliVue X3', 'MON001', 'UCI'),

-- Sede Norte (id_sede = 2)
(2, 'Rayos X Canon', 'Canon Medical', 'CXDI-820C', 'RX003', 'Radiología'),
(2, 'Ventilador Dräger', 'Dräger', 'Evita V500', 'VENT001', 'UCI'),
(2, 'Analizador Abbott', 'Abbott', 'Architect i2000SR', 'LAB001', 'Laboratorio'),

-- Sede Centro (id_sede = 3)
(3, 'Resonancia Siemens', 'Siemens', 'Magnetom Essenza', 'MRI001', 'Resonancia'),
(3, 'Hemodiálisis Fresenius', 'Fresenius', '5008S', 'HD001', 'Diálisis'),
(3, 'Fluoroscopio Canon', 'Canon Medical', 'Ultimax-i', 'FL001', 'Hemodinamia'),

-- Urgencias (id_sede = 4)
(4, 'Ventilador Mindray', 'Mindray', 'SV800', 'VENT002', 'Urgencias'),
(4, 'Desfibrilador Philips', 'Philips', 'HeartStart MRx', 'DEF001', 'Urgencias'),
(4, 'Bomba de Infusión BD', 'BD', 'Alaris GP', 'PUMP001', 'Hospitalización');

-- Insertar más repuestos específicos
INSERT INTO repuestos (codigo, nombre, descripcion, categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES 
('TUBE005', 'Tubo de Rayos X Siemens', 'Tubo de rayos X para tomógrafo Somatom', 'Tubos RX', 2800000, 3500000, 2, 1),
('COIL006', 'Bobina de Resonancia', 'Bobina de rodilla para resonancia magnética', 'Bobinas MRI', 850000, 1200000, 3, 1),
('TRANS007', 'Transductor Ultrasonido', 'Transductor convexo 3.5MHz', 'Transductores', 650000, 950000, 5, 2),
('FILT008', 'Filtro HEPA', 'Filtro HEPA para ventilador mecánico', 'Filtros', 85000, 125000, 20, 8),
('LAMP009', 'Lámpara Xenón', 'Lámpara de xenón para endoscopio', 'Iluminación', 320000, 450000, 4, 2),
('BATT010', 'Batería Monitor', 'Batería de litio para monitor portátil', 'Baterías', 180000, 260000, 12, 5),
('ELEC011', 'Electrodo ECG', 'Electrodo desechable para ECG', 'Consumibles', 1500, 2200, 500, 100),
('CONT012', 'Contraste Iodado', 'Contraste yodado para tomografía', 'Contrastes', 45000, 65000, 25, 10);

-- Insertar más solicitudes realistas
INSERT INTO solicitudes (id_cliente, id_sede, id_equipo, tipo_solicitud, estado, prioridad, descripcion, id_usuario_solicita) VALUES 
(1, 1, 6, 'bodega', 'pendiente', 'urgente', 'Tubo de rayos X dañado en tomógrafo', 6),
(2, 3, 8, 'bodega', 'aprobada', 'alta', 'Bobina de resonancia magnética defectuosa', 7),
(3, 4, 12, 'bodega', 'pendiente', 'media', 'Filtro HEPA vencido en ventilador', 8),
(1, 2, 7, 'decommission', 'pendiente', 'baja', 'Ecógrafo obsoleto para dar de baja', 6),
(2, 3, 9, 'bodega', 'despachada', 'alta', 'Contraste urgente para hemodinamia', 9),
(3, 4, 11, 'bodega', 'terminada', 'media', 'Batería reemplazada en monitor', 10),
(1, 1, 6, 'bodega', 'rechazada', 'baja', 'Solicitud duplicada de lámpara', 6);

-- Insertar más órdenes de trabajo
INSERT INTO ordenes (numero_orden, id_solicitud, id_cliente, id_sede, id_equipo, id_servicio, estado, prioridad, descripcion_problema, id_tecnico, costo_estimado, tiempo_estimado) VALUES 
('ORD-2024-006', 6, 1, 1, 6, 3, 'asignada', 'urgente', 'Falla crítica en tubo de rayos X del tomógrafo', 6, 3500000, 240),
('ORD-2024-007', 7, 2, 3, 8, 2, 'en_proceso', 'alta', 'Diagnóstico de bobina de resonancia defectuosa', 7, 1200000, 180),
('ORD-2024-008', 8, 3, 4, 12, 4, 'creada', 'media', 'Cambio preventivo de filtro HEPA en ventilador', 8, 125000, 60),
('ORD-2024-009', 10, 2, 3, 9, 1, 'completada', 'alta', 'Instalación de sistema de contraste automático', 9, 850000, 300),
('ORD-2024-010', 11, 3, 4, 11, 3, 'completada', 'media', 'Reemplazo de batería en monitor portátil', 10, 260000, 45),
('ORD-2024-011', NULL, 1, 2, 7, 6, 'asignada', 'media', 'Calibración anual de ecógrafo', 6, 180000, 120),
('ORD-2024-012', NULL, 2, 3, 8, 4, 'programada', 'baja', 'Mantenimiento preventivo trimestral de resonancia', 7, 450000, 480);

-- Insertar más visitas técnicas
INSERT INTO visitas (id_orden, id_cliente, id_sede, id_tecnico, tipo_visita, estado, fecha_programada, fecha_inicio, fecha_fin, observaciones_tecnico, calificacion) VALUES 
(6, 1, 1, 6, 'correctivo', 'en_curso', '2024-11-03 08:00:00', '2024-11-03 08:15:00', NULL, 'Desmontaje de tubo de rayos X en progreso', NULL),
(7, 2, 3, 7, 'diagnostico', 'completada', '2024-11-01 14:00:00', '2024-11-01 14:10:00', '2024-11-01 17:30:00', 'Bobina de rodilla presenta cortocircuito interno', 4),
(8, 3, 4, 8, 'preventivo', 'programada', '2024-11-04 10:00:00', NULL, NULL, NULL, NULL),
(9, 2, 3, 9, 'instalacion', 'completada', '2024-10-29 09:00:00', '2024-10-29 09:30:00', '2024-10-29 14:45:00', 'Sistema de contraste instalado y calibrado correctamente', 5),
(10, 3, 4, 10, 'correctivo', 'completada', '2024-10-31 15:00:00', '2024-10-31 15:15:00', '2024-10-31 16:00:00', 'Batería reemplazada, monitor funcionando correctamente', 5),
(11, 1, 2, 6, 'garantia', 'programada', '2024-11-05 13:00:00', NULL, NULL, NULL, NULL),
(12, 2, 3, 7, 'preventivo', 'programada', '2024-11-06 08:00:00', NULL, NULL, NULL, NULL);

-- Insertar más cotizaciones detalladas
INSERT INTO cotizaciones (numero_cotizacion, id_cliente, id_sede, id_orden, estado, subtotal, descuento, impuestos, total, vigencia_dias, fecha_vencimiento, observaciones, id_usuario_crea) VALUES 
('COT-2024-005', 1, 1, 6, 'enviada', 3500000, 0.00, 665000, 4165000, 15, '2024-11-17', 'Cotización urgente para tubo de rayos X', 6),
('COT-2024-006', 2, 3, 7, 'aprobada', 1650000, 5.00, 298425, 1865925, 30, '2024-12-02', 'Reparación de resonancia magnética', 7),
('COT-2024-007', 3, 4, 8, 'borrador', 275000, 0.00, 52250, 327250, 45, '2024-12-17', 'Mantenimiento preventivo ventilador', 8),
('COT-2024-008', 1, 2, 11, 'enviada', 280000, 10.00, 47880, 299880, 30, '2024-12-05', 'Calibración de ecógrafo con descuento', 6);

-- Insertar items detallados de cotización
INSERT INTO cotizacion_items (id_cotizacion, tipo_item, descripcion, cantidad, precio_unitario, subtotal) VALUES 
-- Cotización 5 (Tubo rayos X)
(5, 'repuesto', 'Tubo de Rayos X Siemens Somatom', 1, 3500000, 3500000),
-- Cotización 6 (Bobina resonancia)
(6, 'repuesto', 'Bobina de Resonancia Magnética', 1, 1200000, 1200000),
(6, 'mano_obra', 'Desmontaje e instalación especializada', 1, 450000, 450000),
-- Cotización 7 (Filtro HEPA)
(7, 'repuesto', 'Filtro HEPA para Ventilador', 2, 125000, 250000),
(7, 'servicio', 'Pruebas de funcionamiento', 1, 25000, 25000),
-- Cotización 8 (Calibración)
(8, 'servicio', 'Calibración de Ecógrafo', 1, 180000, 180000),
(8, 'servicio', 'Certificado de calibración', 1, 100000, 100000);