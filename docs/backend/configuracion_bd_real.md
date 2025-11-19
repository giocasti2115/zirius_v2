# Configuración Base de Datos Real - ZIRIUZ

## 🔧 Variables de Entorno Actualizadas

### Docker Compose - BD Real
```yaml
backend:
  environment:
    - DB_NAME=ziriuzco_ziriuz_real  # Cambio principal
    - DB_USER=root
    - DB_PASSWORD=rootpassword
    - DB_HOST=database
    - DB_PORT=3306
```

### Configuración de Conexión
```typescript
// config/database.ts
export const databaseConfig = {
  production: {
    host: process.env.DB_HOST || 'database',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: 'ziriuzco_ziriuz_real', // BD Real
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  }
}
```

## 📊 Tablas Principales Identificadas

### Core Business Entities
1. **usuarios** - Sistema de usuarios y autenticación
2. **clientes** - Base de clientes
3. **sedes** - Sedes/sucursales de clientes  
4. **equipos** - Inventario de equipos
5. **solicitudes** - Solicitudes de servicio
6. **ordenes** - Órdenes de trabajo
7. **visitas** - Visitas técnicas
8. **cotizaciones** - Cotizaciones generadas

### Support Tables
- **solicitudes_estados**, **ordenes_estados**, **visitas_estados**
- **marcas**, **modelos**, **tipos**, **clases**, **areas**
- **repuestos**, **servicios**, **actividades**
- **fallas_***, **preventivos**, **protocolos**

## 🎯 Prioridad de Implementación

### Fase 2A - Core (INMEDIATO)
- ✅ usuarios (ya funciona)
- 🔄 clientes 
- 🔄 sedes
- 🔄 equipos
- 🔄 solicitudes

### Fase 2B - Business Logic
- 🔄 ordenes + ordenes_estados
- 🔄 visitas + visitas_estados  
- 🔄 cotizaciones + cotizaciones_estados

### Fase 2C - Advanced Features
- 🔄 Módulo bodega (solicitudes_bodega_*)
- 🔄 Sistema de fallas (fallas_*)
- 🔄 Informes y reportes