-- Script final para completar la base de datos con datos geográficos y casos de uso reales
USE ziriuzco_ziriuz;

-- Crear tabla de departamentos y ciudades de Colombia
CREATE TABLE IF NOT EXISTS departamentos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(10) NOT NULL,
  activo TINYINT DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ciudades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_departamento INT UNSIGNED,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(10),
  activo TINYINT DEFAULT 1,
  PRIMARY KEY (id),
  FOREIGN KEY (id_departamento) REFERENCES departamentos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar departamentos principales de Colombia
INSERT INTO departamentos (nombre, codigo) VALUES 
('Bogotá D.C.', 'BOG'),
('Antioquia', 'ANT'),
('Valle del Cauca', 'VAL'),
('Atlántico', 'ATL'),
('Santander', 'SAN'),
('Cundinamarca', 'CUN'),
('Bolívar', 'BOL'),
('Norte de Santander', 'NDS'),
('Córdoba', 'COR'),
('Tolima', 'TOL');

-- Insertar ciudades principales
INSERT INTO ciudades (id_departamento, nombre, codigo) VALUES 
-- Bogotá D.C.
(1, 'Bogotá', 'BOG01'),
-- Antioquia
(2, 'Medellín', 'MED01'),
(2, 'Bello', 'BEL01'),
(2, 'Itagüí', 'ITA01'),
(2, 'Envigado', 'ENV01'),
-- Valle del Cauca
(3, 'Cali', 'CAL01'),
(3, 'Palmira', 'PAL01'),
(3, 'Buenaventura', 'BUE01'),
-- Atlántico
(4, 'Barranquilla', 'BAR01'),
(4, 'Soledad', 'SOL01'),
-- Santander
(5, 'Bucaramanga', 'BUC01'),
(5, 'Floridablanca', 'FLO01');

-- Actualizar clientes con ciudades específicas
UPDATE clientes SET direccion = 'Calle 123 #45-67, Bogotá D.C.', telefono = '+57 (1) 234-5678' WHERE id = 1;
UPDATE clientes SET direccion = 'Carrera 89 #12-34, Medellín, Antioquia', telefono = '+57 (4) 567-8901' WHERE id = 2;
UPDATE clientes SET direccion = 'Avenida 56 #78-90, Cali, Valle del Cauca', telefono = '+57 (2) 890-1234' WHERE id = 3;

-- Actualizar sedes con información más detallada
UPDATE sedes SET direccion = 'Calle 123 #45-67, Chapinero, Bogotá D.C.', telefono = '+57 (1) 234-5678 Ext. 101' WHERE id = 1;
UPDATE sedes SET direccion = 'Calle 234 #56-78, Zona Rosa, Bogotá D.C.', telefono = '+57 (1) 234-5678 Ext. 102' WHERE id = 2;
UPDATE sedes SET direccion = 'Carrera 89 #12-34, El Poblado, Medellín', telefono = '+57 (4) 567-8901 Ext. 201' WHERE id = 3;
UPDATE sedes SET direccion = 'Avenida 56 #78-90, San Fernando, Cali', telefono = '+57 (2) 890-1234 Ext. 301' WHERE id = 4;

-- Insertar más clientes realistas del sector salud colombiano
INSERT INTO clientes (nombre, email, telefono, direccion) VALUES 
('Fundación Cardiovascular de Colombia', 'info@fcv.org', '+57 (7) 639-9999', 'Calle 155A #23-58, Floridablanca, Santander'),
('Hospital Universitario San Ignacio', 'contacto@husi.org.co', '+57 (1) 594-6161', 'Carrera 7 #40-62, Bogotá D.C.'),
('Clínica Las Américas', 'info@lasamericas.com.co', '+57 (4) 342-1010', 'Diagonal 75B #2A-80, Medellín, Antioquia'),
('Hospital Universitario del Valle', 'info@huv.gov.co', '+57 (2) 620-2020', 'Calle 5 #36-08, Cali, Valle del Cauca'),
('Clínica de la Costa', 'atencion@clinicadelacosta.co', '+57 (5) 336-8888', 'Calle 78B #57-141, Barranquilla, Atlántico'),
('Centro Médico Imbanaco', 'info@imbanaco.com.co', '+57 (2) 554-0000', 'Carrera 38A #5A-100, Cali, Valle del Cauca'),
('Hospital Pablo Tobón Uribe', 'info@hptu.org.co', '+57 (4) 445-9000', 'Calle 78B #69-240, Medellín, Antioquia');

-- Insertar sedes para los nuevos clientes
INSERT INTO sedes (id_cliente, nombre, direccion, telefono) VALUES 
-- Fundación Cardiovascular
(4, 'Sede Principal FCV', 'Calle 155A #23-58, Floridablanca, Santander', '+57 (7) 639-9999'),
(4, 'Sede Bucaramanga', 'Carrera 33 #28-126, Bucaramanga, Santander', '+57 (7) 696-0000'),
-- HUSI
(5, 'Sede Principal', 'Carrera 7 #40-62, Bogotá D.C.', '+57 (1) 594-6161'),
(5, 'Centro Ambulatorio', 'Calle 163 #13B-60, Bogotá D.C.', '+57 (1) 667-0200'),
-- Clínica Las Américas
(6, 'Sede Poblado', 'Diagonal 75B #2A-80, Medellín, Antioquia', '+57 (4) 342-1010'),
(6, 'Sede Rionegro', 'Calle 44 #55-30, Rionegro, Antioquia', '+57 (4) 569-5000'),
-- HUV
(7, 'Sede Evaristo García', 'Calle 5 #36-08, Cali, Valle del Cauca', '+57 (2) 620-2020'),
-- Clínica de la Costa
(8, 'Sede Principal', 'Calle 78B #57-141, Barranquilla, Atlántico', '+57 (5) 336-8888'),
-- Imbanaco
(9, 'Sede Principal', 'Carrera 38A #5A-100, Cali, Valle del Cauca', '+57 (2) 554-0000'),
-- HPTU
(10, 'Sede Principal', 'Calle 78B #69-240, Medellín, Antioquia', '+57 (4) 445-9000');

-- Insertar equipos de alta complejidad para las nuevas sedes
INSERT INTO equipos (id_sede, nombre, marca, modelo, serie, ubicacion) VALUES 
-- FCV Floridablanca (sede 5)
(5, 'Cateterismo Cardíaco', 'Philips', 'Azurion 7 C20', 'CV001', 'Hemodinamia 1'),
(5, 'Ecocardiograma 4D', 'GE Healthcare', 'Vivid E95', 'ECO001', 'Ecocardiografía'),
(5, 'Holter 24h', 'Mindray', 'Holter H12+', 'HOL001', 'Cardiología'),

-- FCV Bucaramanga (sede 6)
(6, 'Monitor Cardíaco', 'Philips', 'IntelliVue MP70', 'MON002', 'UCI Cardiovascular'),
(6, 'Desfibrilador', 'Philips', 'HeartStart MRx', 'DEF002', 'Urgencias'),

-- HUSI Principal (sede 7)
(7, 'Resonancia 3T', 'Siemens', 'Magnetom Vida', 'MRI002', 'Imágenes Diagnósticas'),
(7, 'PET-CT', 'GE Healthcare', 'Discovery MI', 'PET001', 'Medicina Nuclear'),
(7, 'Acelerador Lineal', 'Varian', 'TrueBeam STx', 'AL001', 'Radioterapia'),

-- HUSI Ambulatorio (sede 8)
(8, 'Mamógrafo Digital', 'Hologic', 'Selenia Dimensions', 'MG002', 'Radiología Mujer'),
(8, 'Densitómetro Óseo', 'Hologic', 'Horizon DXA', 'DX001', 'Densitometría'),

-- Las Américas Poblado (sede 9)
(9, 'Angiografía', 'Siemens', 'Artis Q.zen', 'ANG001', 'Hemodinamia'),
(9, 'Gamma Cámara', 'GE Healthcare', 'NM830', 'GC001', 'Medicina Nuclear'),

-- Las Américas Rionegro (sede 10)
(10, 'TAC 128 Cortes', 'Canon Medical', 'Aquilion Prime SP', 'CT002', 'Tomografía'),
(10, 'Quirófano Híbrido', 'Philips', 'Azurion 7 M20', 'QH001', 'Cirugía Cardiovascular'),

-- HUV (sede 11)
(11, 'Ventilador ECMO', 'Maquet', 'Cardiohelp', 'ECMO001', 'UCI Cardiovascular'),
(11, 'Monitor Fetal', 'Philips', 'Avalon FM50', 'FM001', 'Obstetricia'),

-- Clínica Costa (sede 12)
(12, 'Litotriptor', 'Siemens', 'Modularis Variostar', 'LIT001', 'Urología'),
(12, 'Endoscopio', 'Olympus', 'EVIS EXERA III', 'END001', 'Gastroenterología'),

-- Imbanaco (sede 13)
(13, 'Robot Quirúrgico', 'Intuitive Surgical', 'da Vinci Xi', 'ROB001', 'Cirugía Robótica'),
(13, 'Braquiterapia', 'Elekta', 'MicroSelectron Digital', 'BQ001', 'Radioterapia'),

-- HPTU (sede 14)
(14, 'Bypass Cardiopulmonar', 'Maquet', 'HLM Advanced', 'BCP001', 'Cirugía Cardíaca'),
(14, 'Neuronavegador', 'Medtronic', 'StealthStation S8', 'NAV001', 'Neurocirugía');

-- Insertar más repuestos especializados
INSERT INTO repuestos (codigo, nombre, descripcion, categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES 
('CATETER001', 'Catéter Angioplastia', 'Catéter balón para angioplastia coronaria', 'Cardiología', 850000, 1200000, 8, 3),
('STENT002', 'Stent Coronario', 'Stent farmacológico liberador de medicamento', 'Cardiología', 2800000, 3500000, 12, 5),
('ELEC013', 'Electrodo Marcapasos', 'Electrodo endocárdico para marcapasos', 'Cardiología', 1200000, 1800000, 6, 2),
('CONT014', 'Contraste Cardiaco', 'Contraste yodado para cateterismo', 'Contrastes', 180000, 250000, 15, 8),
('GUIDE015', 'Guía Coronaria', 'Guía metálica para procedimientos coronarios', 'Cardiología', 65000, 95000, 25, 10),
('TUBE016', 'Tubo PET-CT', 'Tubo de rayos X para PET-CT', 'Medicina Nuclear', 4500000, 5800000, 1, 1),
('COIL017', 'Bobina Cardíaca', 'Bobina específica para resonancia cardíaca', 'Resonancia', 950000, 1400000, 2, 1),
('FILT018', 'Filtro Radioprotección', 'Filtro de plomo para protección radiológica', 'Protección', 320000, 450000, 8, 3);

-- Insertar solicitudes de equipos de alta complejidad
INSERT INTO solicitudes (id_cliente, id_sede, id_equipo, tipo_solicitud, estado, prioridad, descripcion, id_usuario_solicita) VALUES 
(4, 5, 19, 'bodega', 'urgente', 'urgente', 'Stent coronario para procedimiento de emergencia', 1),
(5, 7, 21, 'bodega', 'aprobada', 'alta', 'Contraste para PET-CT urgente', 2),
(6, 9, 24, 'bodega', 'pendiente', 'media', 'Catéter de angioplastia para hemodinamia', 3),
(7, 11, 28, 'decommission', 'pendiente', 'baja', 'Monitor fetal obsoleto para dar de baja', 1),
(8, 12, 29, 'bodega', 'despachada', 'alta', 'Filtro de radioprotección urgente', 4),
(9, 13, 31, 'bodega', 'pendiente', 'media', 'Repuestos para robot quirúrgico da Vinci', 2),
(10, 14, 33, 'bodega', 'aprobada', 'alta', 'Electrodo para neuronavegador', 5);