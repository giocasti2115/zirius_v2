-- ================================================================
-- MIGRACIÓN: Ciudades principales de Colombia
-- Fecha: 2024-12-20
-- Descripción: Insertar ciudades principales por departamento
-- ================================================================

-- Ciudades principales de Colombia
INSERT IGNORE INTO ciudades (nombre, departamento_id, codigo_postal) VALUES
-- Bogotá D.C.
('Bogotá', (SELECT id FROM departamentos WHERE codigo = '11'), '110111'),

-- Antioquia
('Medellín', (SELECT id FROM departamentos WHERE codigo = '05'), '050001'),
('Bello', (SELECT id FROM departamentos WHERE codigo = '05'), '050088'),
('Itagüí', (SELECT id FROM departamentos WHERE codigo = '05'), '050360'),
('Envigado', (SELECT id FROM departamentos WHERE codigo = '05'), '050266'),

-- Valle del Cauca
('Cali', (SELECT id FROM departamentos WHERE codigo = '76'), '760001'),
('Palmira', (SELECT id FROM departamentos WHERE codigo = '76'), '760001'),
('Buenaventura', (SELECT id FROM departamentos WHERE codigo = '76'), '760020'),
('Tuluá', (SELECT id FROM departamentos WHERE codigo = '76'), '760834'),

-- Atlántico
('Barranquilla', (SELECT id FROM departamentos WHERE codigo = '08'), '080001'),
('Soledad', (SELECT id FROM departamentos WHERE codigo = '08'), '080758'),
('Malambo', (SELECT id FROM departamentos WHERE codigo = '08'), '080459'),

-- Santander
('Bucaramanga', (SELECT id FROM departamentos WHERE codigo = '68'), '680001'),
('Floridablanca', (SELECT id FROM departamentos WHERE codigo = '68'), '680275'),
('Girón', (SELECT id FROM departamentos WHERE codigo = '68'), '680307'),
('Piedecuesta', (SELECT id FROM departamentos WHERE codigo = '68'), '680547'),

-- Bolívar
('Cartagena', (SELECT id FROM departamentos WHERE codigo = '13'), '130001'),
('Magangué', (SELECT id FROM departamentos WHERE código = '13'), '130001'),

-- Norte de Santander
('Cúcuta', (SELECT id FROM departamentos WHERE codigo = '54'), '540001'),
('Villa del Rosario', (SELECT id FROM departamentos WHERE codigo = '54'), '540874'),

-- Cundinamarca
('Soacha', (SELECT id FROM departamentos WHERE codigo = '25'), '250754'),
('Chía', (SELECT id FROM departamentos WHERE codigo = '25'), '250175'),
('Zipaquirá', (SELECT id FROM departamentos WHERE codigo = '25'), '250899'),
('Facatativá', (SELECT id FROM departamentos WHERE codigo = '25'), '250269'),

-- Risaralda
('Pereira', (SELECT id FROM departamentos WHERE codigo = '66'), '660001'),
('Dosquebradas', (SELECT id FROM departamentos WHERE codigo = '66'), '660001'),

-- Caldas
('Manizales', (SELECT id FROM departamentos WHERE codigo = '17'), '170001'),
('Villamaría', (SELECT id FROM departamentos WHERE codigo = '17'), '170873'),

-- Quindío
('Armenia', (SELECT id FROM departamentos WHERE codigo = '63'), '630001'),
('Calarcá', (SELECT id FROM departamentos WHERE codigo = '63'), '630150'),

-- Tolima
('Ibagué', (SELECT id FROM departamentos WHERE codigo = '73'), '730001'),
('Espinal', (SELECT id FROM departamentos WHERE codigo = '73'), '730240'),

-- Huila
('Neiva', (SELECT id FROM departamentos WHERE codigo = '41'), '410001'),
('Pitalito', (SELECT id FROM departamentos WHERE codigo = '41'), '411548'),

-- Meta
('Villavicencio', (SELECT id FROM departamentos WHERE codigo = '50'), '500001'),
('Acacías', (SELECT id FROM departamentos WHERE codigo = '50'), '500006'),

-- Córdoba
('Montería', (SELECT id FROM departamentos WHERE codigo = '23'), '230001'),
('Cereté', (SELECT id FROM departamentos WHERE codigo = '23'), '230162'),

-- Sucre
('Sincelejo', (SELECT id FROM departamentos WHERE codigo = '70'), '700001'),
('Corozal', (SELECT id FROM departamentos WHERE codigo = '70'), '700215'),

-- Magdalena
('Santa Marta', (SELECT id FROM departamentos WHERE codigo = '47'), '470001'),
('Ciénaga', (SELECT id FROM departamentos WHERE codigo = '47'), '470175'),

-- Cesar
('Valledupar', (SELECT id FROM departamentos WHERE codigo = '20'), '200001'),
('Aguachica', (SELECT id FROM departamentos WHERE codigo = '20'), '200011'),

-- La Guajira
('Riohacha', (SELECT id FROM departamentos WHERE codigo = '44'), '440001'),
('Maicao', (SELECT id FROM departamentos WHERE codigo = '44'), '440436'),

-- Cauca
('Popayán', (SELECT id FROM departamentos WHERE codigo = '19'), '190001'),
('Santander de Quilichao', (SELECT id FROM departamentos WHERE codigo = '19'), '190693'),

-- Nariño
('Pasto', (SELECT id FROM departamentos WHERE codigo = '52'), '520001'),
('Tumaco', (SELECT id FROM departamentos WHERE codigo = '52'), '520834'),

-- Boyacá
('Tunja', (SELECT id FROM departamentos WHERE codigo = '15'), '150001'),
('Duitama', (SELECT id FROM departamentos WHERE codigo = '15'), '150238'),
('Sogamoso', (SELECT id FROM departamentos WHERE codigo = '15'), '150760'),

-- Casanare
('Yopal', (SELECT id FROM departamentos WHERE codigo = '85'), '850001'),
('Aguazul', (SELECT id FROM departamentos WHERE codigo = '85'), '850014'),

-- Arauca
('Arauca', (SELECT id FROM departamentos WHERE codigo = '81'), '810001'),
('Tame', (SELECT id FROM departamentos WHERE codigo = '81'), '810794'),

-- Chocó
('Quibdó', (SELECT id FROM departamentos WHERE codigo = '27'), '270001'),
('Istmina', (SELECT id FROM departamentos WHERE codigo = '27'), '270372'),

-- Caquetá
('Florencia', (SELECT id FROM departamentos WHERE codigo = '18'), '180001'),
('San Vicente del Caguán', (SELECT id FROM departamentos WHERE codigo = '18'), '180753'),

-- Putumayo
('Mocoa', (SELECT id FROM departamentos WHERE codigo = '86'), '860001'),
('Puerto Asís', (SELECT id FROM departamentos WHERE codigo = '86'), '860568'),

-- San Andrés y Providencia
('San Andrés', (SELECT id FROM departamentos WHERE codigo = '88'), '880001'),
('Providencia', (SELECT id FROM departamentos WHERE codigo = '88'), '880002'),

-- Vichada
('Puerto Carreño', (SELECT id FROM departamentos WHERE codigo = '99'), '990001'),

-- Guainía
('Inírida', (SELECT id FROM departamentos WHERE codigo = '94'), '940001'),

-- Guaviare
('San José del Guaviare', (SELECT id FROM departamentos WHERE codigo = '95'), '950001'),

-- Vaupés
('Mitú', (SELECT id FROM departamentos WHERE codigo = '97'), '970001'),

-- Amazonas
('Leticia', (SELECT id FROM departamentos WHERE codigo = '91'), '910001');

COMMIT;