# 📚 API Documentation - Módulo Informes

## 🔗 Base URL
```
http://localhost:3002/api/v1/real/informes
```

## 🛡️ Autenticación
Todos los endpoints requieren autenticación mediante JWT token en el header:
```
Authorization: Bearer <jwt-token>
```

## 📊 Endpoints

### 1. Test de Conectividad

#### `GET /test`
Endpoint de prueba para verificar la conectividad con la base de datos.

**Respuesta:**
```json
{
  "success": true,
  "message": "Informes funcionando correctamente",
  "data": {
    "mensaje": "Informes funcionando!",
    "fecha": "2025-11-18T06:51:30.000Z"
  },
  "timestamp": "2025-11-18T01:51:30.474Z"
}
```

---

### 2. Correctivos por Equipo

#### `GET /correctivos-equipo`
Obtiene un reporte detallado de mantenimientos correctivos agrupados por equipo.

**Parámetros de Query:**
| Parámetro | Tipo | Descripción | Opcional |
|-----------|------|-------------|----------|
| `cliente_id` | number | ID del cliente para filtrar | ✅ |
| `fecha_inicio` | string | Fecha de inicio (YYYY-MM-DD) | ✅ |
| `fecha_fin` | string | Fecha de fin (YYYY-MM-DD) | ✅ |
| `limit` | number | Límite de resultados (default: 50) | ✅ |

**Ejemplo de Request:**
```bash
GET /correctivos-equipo?cliente_id=3&fecha_inicio=2025-01-01&limit=25
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Reporte de correctivos por equipo obtenido exitosamente",
  "data": {
    "equipos": [
      {
        "equipo_id": 3,
        "equipo_nombre": "Unidad Dental Secundaria",
        "marca": "Sirona",
        "modelo": "Sirona Intego Pro", 
        "cliente_nombre": "Odontología Integral Medellín",
        "total_correctivos": 1,
        "ultimo_correctivo": "2025-11-17T10:13:16.000Z"
      }
    ],
    "filtros": {
      "cliente_id": "3",
      "fecha_inicio": "2025-01-01",
      "fecha_fin": null,
      "limit": 25
    },
    "total_equipos": 1,
    "timestamp": "2025-11-18T02:05:46.248Z"
  }
}
```

---

### 3. Repuestos Instalados

#### `GET /repuestos-instalados`
Obtiene el historial de repuestos instalados en equipos.

**Parámetros de Query:**
| Parámetro | Tipo | Descripción | Opcional |
|-----------|------|-------------|----------|
| `equipo_id` | number | ID del equipo específico | ✅ |
| `fecha_inicio` | string | Fecha de inicio (YYYY-MM-DD) | ✅ |
| `fecha_fin` | string | Fecha de fin (YYYY-MM-DD) | ✅ |
| `repuesto_id` | number | ID del repuesto específico | ✅ |
| `limit` | number | Límite de resultados (default: 50) | ✅ |

**Ejemplo de Request:**
```bash
GET /repuestos-instalados?equipo_id=3&limit=20
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Reporte de repuestos instalados obtenido exitosamente",
  "data": {
    "repuestos_instalados": [
      {
        "orden_id": 1,
        "numero_orden": "ORD-001",
        "descripcion_orden": "Instalación de filtro principal",
        "estado_orden": "completada",
        "fecha_creacion": "2025-11-17T10:13:16.000Z",
        "equipo_nombre": "Unidad Dental Principal",
        "equipo_marca": "Sirona",
        "cliente_nombre": "Clínica Dental Norte"
      }
    ],
    "filtros": {
      "equipo_id": "3",
      "limit": "20"
    },
    "total_registros": 1,
    "timestamp": "2025-11-18T02:15:30.123Z"
  }
}
```

---

### 4. Análisis de Fallos

#### `GET /fallos-equipos`
Obtiene análisis de fallos y averías por equipo con métricas de resolución.

**Parámetros de Query:**
| Parámetro | Tipo | Descripción | Opcional |
|-----------|------|-------------|----------|
| `equipo_id` | number | ID del equipo específico | ✅ |
| `cliente_id` | number | ID del cliente para filtrar | ✅ |
| `fecha_inicio` | string | Fecha de inicio (YYYY-MM-DD) | ✅ |
| `fecha_fin` | string | Fecha de fin (YYYY-MM-DD) | ✅ |
| `limit` | number | Límite de resultados (default: 50) | ✅ |

**Ejemplo de Request:**
```bash
GET /fallos-equipos?cliente_id=2&fecha_inicio=2025-10-01
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Análisis de fallos por equipo obtenido exitosamente",
  "data": {
    "fallos_equipos": [
      {
        "equipo_id": 2,
        "equipo_nombre": "Equipo Rayos X Portátil",
        "marca": "Philips",
        "modelo": "MobileView X100",
        "cliente_nombre": "Hospital General",
        "total_fallos": 3,
        "descripcion_fallos": "Fallo en sensor; Error de calibración; Problema eléctrico",
        "ultimo_fallo": "2025-11-15T14:30:00.000Z",
        "promedio_dias_reparacion": 2.5
      }
    ],
    "filtros": {
      "cliente_id": "2",
      "fecha_inicio": "2025-10-01",
      "limit": "50"
    },
    "total_equipos_con_fallos": 1,
    "timestamp": "2025-11-18T02:20:15.456Z"
  }
}
```

---

### 5. Indicadores KPIs

#### `GET /indicadores-kpis`
Obtiene indicadores de rendimiento y métricas clave del sistema.

**Parámetros de Query:**
| Parámetro | Tipo | Descripción | Opcional |
|-----------|------|-------------|----------|
| `fecha_inicio` | string | Fecha de inicio (YYYY-MM-DD) | ✅ |
| `fecha_fin` | string | Fecha de fin (YYYY-MM-DD) | ✅ |

**Ejemplo de Request:**
```bash
GET /indicadores-kpis?fecha_inicio=2025-10-01&fecha_fin=2025-11-18
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Indicadores KPIs obtenidos exitosamente",
  "data": {
    "periodo": {
      "fecha_inicio": "2025-10-01",
      "fecha_fin": "2025-11-18"
    },
    "kpis": {
      "solicitudes": {
        "total_solicitudes": 45,
        "correctivos": 28,
        "preventivos": 17,
        "completadas": 38,
        "pendientes": 7,
        "promedio_resolucion_dias": 3.2,
        "eficiencia_porcentaje": "84.44"
      },
      "ordenes": {
        "total_ordenes": 42,
        "ordenes_completadas": 36,
        "ordenes_en_proceso": 6,
        "promedio_duracion_dias": 2.8,
        "eficiencia_porcentaje": "85.71"
      },
      "equipos": {
        "total_equipos_activos": 125,
        "total_clientes_activos": 18,
        "equipos_con_solicitudes": 34
      },
      "visitas": {
        "total_visitas": 52,
        "visitas_completadas": 47,
        "mantenimientos": 29,
        "eficiencia_porcentaje": "90.38"
      }
    },
    "resumen": {
      "total_actividad": 139,            
      "promedio_resolucion_general": 3,
      "equipos_utilizacion_porcentaje": "27.20"
    },
    "timestamp": "2025-11-18T02:25:45.789Z"
  }
}
```

---

### 6. Exportación de Reportes

#### `POST /exportar`
Exporta reportes en diferentes formatos (Excel, PDF, CSV).

**Body Parameters:**
```json
{
  "tipo_reporte": "correctivos-equipo" | "repuestos-instalados" | "fallos-equipos" | "indicadores-kpis",
  "formato": "excel" | "pdf" | "csv",
  "filtros": {
    "cliente_id": 3,
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-11-18"
  }
}
```

**Ejemplo de Request:**
```bash
POST /exportar
Content-Type: application/json

{
  "tipo_reporte": "correctivos-equipo",
  "formato": "excel",
  "filtros": {
    "cliente_id": 3,
    "limit": 100
  }
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Reporte Correctivos por Equipo exportado exitosamente",
  "data": {
    "tipo_reporte": "correctivos-equipo",
    "formato": "excel",
    "nombre_archivo": "correctivos-equipo_2025-11-18T02-15-26-609Z.excel",
    "total_registros": 1,
    "url_descarga": "/api/v1/real/informes/descargar/correctivos-equipo_2025-11-18T02-15-26-609Z.excel",
    "filtros_aplicados": {
      "cliente_id": 3,
      "limit": 100
    },
    "preview_datos": [
      {
        "equipo_id": 3,
        "equipo_nombre": "Unidad Dental Secundaria",
        "marca": "Sirona",
        "modelo": "Sirona Intego Pro",
        "cliente_nombre": "Odontología Integral Medellín",
        "total_correctivos": 1,
        "ultimo_correctivo": "2025-11-17T10:13:16.000Z"
      }
    ],
    "fecha_generacion": "2025-11-18T02:15:26.609Z"
  }
}
```

---

### 7. Descarga de Archivos

#### `GET /descargar/:archivo`
Descarga el archivo de reporte generado previamente.

**Parámetros de Ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `archivo` | string | Nombre del archivo generado |

**Ejemplo de Request:**
```bash
GET /descargar/correctivos-equipo_2025-11-18T02-15-26-609Z.excel
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Descarga simulada exitosamente",
  "data": {
    "archivo": "correctivos-equipo_2025-11-18T02-15-26-609Z.excel",
    "mensaje": "En implementación real, aquí se descargaría el archivo",
    "tipo_contenido": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

---

### 8. Exploración de Base de Datos (Utilidades)

#### `GET /explore-tables`
Lista todas las tablas disponibles en la base de datos.

**Respuesta:**
```json
{
  "success": true,
  "message": "Tablas encontradas en la base de datos",
  "data": {
    "database": "ziriuzco_ziriuz_dev",
    "tables": [
      {"Tables_in_ziriuzco_ziriuz_dev": "clientes"},
      {"Tables_in_ziriuzco_ziriuz_dev": "equipos"},
      {"Tables_in_ziriuzco_ziriuz_dev": "ordenes"},
      {"Tables_in_ziriuzco_ziriuz_dev": "solicitudes"},
      {"Tables_in_ziriuzco_ziriuz_dev": "visitas"}
    ],
    "total_tables": 16
  }
}
```

#### `GET /explore-table/:tableName`  
Obtiene la estructura de una tabla específica.

**Ejemplo:**
```bash
GET /explore-table/solicitudes
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Estructura de la tabla solicitudes",
  "data": {
    "table": "solicitudes",
    "columns": [
      {
        "Field": "id",
        "Type": "int",
        "Null": "NO",
        "Key": "PRI",
        "Default": null,
        "Extra": "auto_increment"
      },
      {
        "Field": "equipo_id",
        "Type": "int",
        "Null": "YES",
        "Key": "MUL",
        "Default": null,
        "Extra": ""
      }
    ],
    "total_columns": 11
  }
}
```

---

## ❌ Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 400 | Bad Request - Parámetros inválidos |
| 401 | Unauthorized - Token inválido o ausente |
| 404 | Not Found - Endpoint no encontrado |
| 500 | Internal Server Error - Error del servidor |

### Formato de Respuesta de Error

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos del error (solo en desarrollo)"
}
```

### Errores Comunes

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Tipo de reporte y formato son requeridos"
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "Incorrect arguments to mysqld_stmt_execute"
}
```

---

## 🔧 Configuración del Cliente

### Headers Requeridos
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
}
```

### Ejemplo de Cliente JavaScript
```javascript
class InformesAPI {
  constructor(baseUrl = 'http://localhost:3002/api/v1/real/informes') {
    this.baseUrl = baseUrl;
  }

  async obtenerCorrectivosPorEquipo(filtros = {}) {
    const queryString = new URLSearchParams(filtros).toString();
    const url = `${this.baseUrl}/correctivos-equipo${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async exportarReporte(tipoReporte, formato, filtros = {}) {
    const response = await fetch(`${this.baseUrl}/exportar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({
        tipo_reporte: tipoReporte,
        formato,
        filtros
      })
    });

    return await response.json();
  }

  getToken() {
    return localStorage.getItem('jwt_token');
  }
}
```

---

## 📝 Notas de Implementación

### Cache
- TTL de 5 minutos para consultas repetidas
- Cache en memoria del servidor (Map)
- Invalidación automática por tiempo

### Paginación
- Límite por defecto: 50 registros
- Límite máximo recomendado: 200 registros
- No hay paginación por offset (usar limit únicamente)

### Performance
- Consultas optimizadas con JOINs eficientes
- Índices recomendados en columnas de filtro
- Timeout de consulta: 30 segundos

### Logging
- Todas las solicitudes se registran con level INFO
- Errores se registran con level ERROR
- Logs incluyen timestamp, endpoint y parámetros

---

**Documentación generada**: 18 de Noviembre de 2025
**Versión API**: v1.0.0
**Estado**: Producción ✅