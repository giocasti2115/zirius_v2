-- Datos iniciales para ZIRIUZ v2
-- Fecha: 2025-11-02

-- Insertar usuarios iniciales
INSERT INTO users (username, email, password, role, nombre) VALUES
('admin', 'admin@ziriuz.com', '$2b$10$XOV.zRF8aIIvOzRg4mV6.eJ8Kj8XG1y9L8F8XG1y9L8F8XG1y9L8F8', 'admin', 'Administrador del Sistema'),
('tecnico1', 'tecnico1@ziriuz.com', '$2b$10$XOV.zRF8aIIvOzRg4mV6.eJ8Kj8XG1y9L8F8XG1y9L8F8XG1y9L8F8', 'tecnico', 'Juan Carlos Técnico'),
('analista1', 'analista1@ziriuz.com', '$2b$10$XOV.zRF8aIIvOzRg4mV6.eJ8Kj8XG1y9L8F8XG1y9L8F8XG1y9L8F8', 'analista', 'María Elena Analista'),
('coordinador1', 'coordinador1@ziriuz.com', '$2b$10$XOV.zRF8aIIvOzRg4mV6.eJ8Kj8XG1y9L8F8XG1y9L8F8XG1y9L8F8', 'coordinador', 'Pedro Coordinador'),
('comercial1', 'comercial1@ziriuz.com', '$2b$10$XOV.zRF8aIIvOzRg4mV6.eJ8Kj8XG1y9L8F8XG1y9L8F8XG1y9L8F8', 'comercial', 'Ana Comercial');

-- Insertar tipos de equipos
INSERT INTO tipos_equipos (nombre, descripcion) VALUES
('Unidad Odontológica', 'Equipos principales de consulta odontológica'),
('Compresor', 'Equipos de suministro de aire comprimido'),
('Autoclave', 'Equipos de esterilización'),
('Rayos X', 'Equipos de radiología dental'),
('Micromotor', 'Equipos de precisión para procedimientos'),
('Lámpara de Fotocurado', 'Equipos de polimerización'),
('Amalgamador', 'Equipos para mezcla de materiales'),
('Ultrasonido', 'Equipos de limpieza ultrasónica');

-- Insertar marcas de equipos
INSERT INTO marcas_equipos (nombre, descripcion) VALUES
('Kavo', 'Marca alemana de equipos odontológicos de alta calidad'),
('Sirona', 'Líder mundial en tecnología dental'),
('Planmeca', 'Fabricante finlandés de equipos dentales'),
('Dentsply', 'Empresa global de productos dentales'),
('NSK', 'Fabricante japonés de instrumentos dentales'),
('Woodpecker', 'Marca china de equipos dentales'),
('Gnatus', 'Fabricante brasileño de equipos odontológicos'),
('Dental Ez', 'Fabricante americano de unidades dentales');

-- Insertar modelos de equipos (algunos ejemplos)
INSERT INTO modelos_equipos (marca_id, tipo_id, nombre, descripcion, especificaciones) VALUES
(1, 1, 'Kavo Estetica E50', 'Unidad odontológica premium con tecnología avanzada', '{"voltaje": "220V", "consumo": "1500W", "peso": "280kg"}'),
(2, 1, 'Sirona Intego Pro', 'Unidad compacta con diseño ergonómico', '{"voltaje": "220V", "consumo": "1200W", "peso": "250kg"}'),
(3, 4, 'Planmeca ProMax 3D', 'Equipo de rayos X panorámico y 3D', '{"voltaje": "220V", "consumo": "3000W", "peso": "180kg"}'),
(4, 3, 'Dentsply Statim 5000S', 'Autoclave de cassette rápido', '{"voltaje": "220V", "consumo": "1800W", "peso": "28kg"}'),
(5, 5, 'NSK Ti-Max X95L', 'Micromotor con LED integrado', '{"voltaje": "24V", "velocidad": "40000rpm", "peso": "0.5kg"}');

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, documento, telefono, email, direccion) VALUES
('Clínica Dental San José', '900123456-1', '+57 1 234-5678', 'contacto@clinicasanjose.com', 'Carrera 15 #85-32, Bogotá'),
('Odontología Integral Medellín', '900234567-2', '+57 4 456-7890', 'info@odontologiaintegral.com', 'Calle 70 #45-67, Medellín'),
('Centro Odontológico Cali', '900345678-3', '+57 2 678-9012', 'gerencia@centroocali.com', 'Avenida 6N #28-45, Cali'),
('Dental Care Barranquilla', '900456789-4', '+57 5 890-1234', 'admin@dentalcare.com', 'Carrera 52 #76-89, Barranquilla'),
('Sonrisas Perfectas', '900567890-5', '+57 1 012-3456', 'contacto@sonrisasperfectas.com', 'Calle 127 #19A-28, Bogotá');

-- Insertar sedes para los clientes
INSERT INTO sedes (cliente_id, nombre, direccion, telefono, email, contacto_principal, ciudad, departamento) VALUES
(1, 'Sede Principal San José', 'Carrera 15 #85-32, Chapinero', '+57 1 234-5678', 'principal@clinicasanjose.com', 'Dr. Carlos Mendoza', 'Bogotá', 'Cundinamarca'),
(1, 'Sede Norte San José', 'Calle 170 #54-12, Usaquén', '+57 1 234-5679', 'norte@clinicasanjose.com', 'Dra. Ana López', 'Bogotá', 'Cundinamarca'),
(2, 'Sede El Poblado', 'Calle 70 #45-67, El Poblado', '+57 4 456-7890', 'poblado@odontologiaintegral.com', 'Dr. Luis Ramírez', 'Medellín', 'Antioquia'),
(3, 'Sede Granada', 'Avenida 6N #28-45, Granada', '+57 2 678-9012', 'granada@centroocali.com', 'Dr. Miguel Torres', 'Cali', 'Valle del Cauca'),
(4, 'Sede Centro', 'Carrera 52 #76-89, Centro', '+57 5 890-1234', 'centro@dentalcare.com', 'Dra. Patricia Silva', 'Barranquilla', 'Atlántico'),
(5, 'Sede Zona Rosa', 'Calle 127 #19A-28, Zona Rosa', '+57 1 012-3456', 'zonarosa@sonrisasperfectas.com', 'Dr. Roberto Gómez', 'Bogotá', 'Cundinamarca');

-- Insertar equipos de ejemplo
INSERT INTO equipos (sede_id, modelo_id, nombre, serie, codigo_interno, fecha_instalacion, fecha_garantia, estado, ubicacion, observaciones) VALUES
(1, 1, 'Unidad 1 - Consulta Principal', 'KV2024001', 'EQ-SJ-001', '2024-01-15', '2026-01-15', 'activo', 'Consultorio 1', 'Equipo principal en excelente estado'),
(1, 1, 'Unidad 2 - Consulta Secundaria', 'KV2024002', 'EQ-SJ-002', '2024-01-20', '2026-01-20', 'activo', 'Consultorio 2', 'Segundo equipo instalado'),
(1, 3, 'Rayos X Panorámico', 'PM2024001', 'EQ-SJ-003', '2024-02-01', '2027-02-01', 'activo', 'Sala de Rayos X', 'Equipo de imagenología'),
(2, 2, 'Unidad Principal Norte', 'SR2024001', 'EQ-SJ-004', '2024-03-10', '2026-03-10', 'activo', 'Consultorio Principal', 'Unidad nueva sede norte'),
(3, 1, 'Unidad Poblado 1', 'KV2024003', 'EQ-OI-001', '2023-12-15', '2025-12-15', 'activo', 'Consultorio A', 'Equipo sede Poblado'),
(3, 2, 'Unidad Poblado 2', 'SR2024002', 'EQ-OI-002', '2024-01-08', '2026-01-08', 'activo', 'Consultorio B', 'Segunda unidad Poblado'),
(4, 1, 'Unidad Granada Principal', 'KV2024004', 'EQ-CO-001', '2024-02-20', '2026-02-20', 'activo', 'Consulta 1', 'Unidad principal Cali'),
(5, 2, 'Unidad Centro Barranquilla', 'SR2024003', 'EQ-DC-001', '2024-01-25', '2026-01-25', 'activo', 'Consultorio Principal', 'Unidad Barranquilla'),
(6, 1, 'Unidad Zona Rosa 1', 'KV2024005', 'EQ-SP-001', '2023-11-30', '2025-11-30', 'activo', 'Consultorio 1', 'Primera unidad zona rosa'),
(6, 1, 'Unidad Zona Rosa 2', 'KV2024006', 'EQ-SP-002', '2024-01-12', '2026-01-12', 'activo', 'Consultorio 2', 'Segunda unidad zona rosa');

-- Insertar repuestos de ejemplo
INSERT INTO repuestos (codigo, nombre, descripcion, marca, modelo, precio, stock, stock_minimo) VALUES
('RP-001', 'Kit de Turbina NSK', 'Kit completo de turbina para micromotor', 'NSK', 'Ti-Max', 850000.00, 25, 5),
('RP-002', 'Manguera de Aire Kavo', 'Manguera de suministro de aire para unidades Kavo', 'Kavo', 'Universal', 125000.00, 15, 3),
('RP-003', 'Lámpara LED Sirona', 'Lámpara de luz LED para unidades Sirona', 'Sirona', 'Intego', 320000.00, 8, 2),
('RP-004', 'Filtro de Agua', 'Filtro de agua para sistema de unidades dentales', 'Universal', 'Estándar', 45000.00, 50, 10),
('RP-005', 'Motor de Compresor', 'Motor de repuesto para compresor dental', 'Schulz', 'CSL-10', 1200000.00, 3, 1),
('RP-006', 'Sensor Rayos X', 'Sensor digital para equipos de rayos X', 'Planmeca', 'ProSensor', 2500000.00, 2, 1),
('RP-007', 'Resistencia Autoclave', 'Resistencia de calentamiento para autoclave', 'Dentsply', 'Statim', 180000.00, 10, 2),
('RP-008', 'Bomba de Vacío', 'Bomba de aspiración para unidades dentales', 'Cattani', 'Turbo-Smart', 950000.00, 5, 1);