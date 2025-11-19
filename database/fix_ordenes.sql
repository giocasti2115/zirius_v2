-- Completar esquema de la tabla ordenes

USE ziriuzco_ziriuz;

-- Agregar todas las columnas faltantes en ordenes
ALTER TABLE ordenes ADD COLUMN tiempo_estimado INT DEFAULT NULL;

-- Verificar estructura final
DESCRIBE ordenes;