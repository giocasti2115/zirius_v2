-- Crear base de datos de desarrollo separada
CREATE DATABASE IF NOT EXISTS ziriuzco_ziriuz_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos de desarrollo
USE ziriuzco_ziriuz_dev;

-- Crear usuario para desarrollo
CREATE USER IF NOT EXISTS 'zirius_dev'@'%' IDENTIFIED BY 'zirius_dev_password';
GRANT ALL PRIVILEGES ON ziriuzco_ziriuz_dev.* TO 'zirius_dev'@'%';
FLUSH PRIVILEGES;