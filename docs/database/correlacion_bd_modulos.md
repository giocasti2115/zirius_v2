# Correlación BD Real vs Módulos PHP - ZIRIUZ

## 📊 Análisis Completo
- **Total tablas BD**: 62
- **Total módulos PHP**: 8 menús principales + 57+ submódulos
- **Estado**: ✅ Correlación 100% mapeada

## 🎯 Correlación Tablas ↔ Módulos

### 📋 **Solicitudes de Servicio** (6 submódulos)
**Tablas relacionadas:**
- `solicitudes` - Tabla principal
- `solicitudes_estados` - Estados (pendientes, aprobadas, rechazadas)

**Submódulos:**
- ✅ Nueva Solicitud de Servicio
- ✅ Solicitudes
- ✅ Solicitudes Pendientes Preventivo
- ✅ Solicitudes Pendientes CIG
- ✅ Solicitudes Aprobadas  
- ✅ Solicitudes Rechazadas

### 🔧 **Órdenes de Servicio** (5 submódulos)
**Tablas relacionadas:**
- `ordenes` - Tabla principal
- `ordenes_estados` - Estados de órdenes
- `ordenes_sub_estados` - Sub-estados detallados
- `ordenes_adjuntos` - Archivos adjuntos
- `ordenes_cambios` - Historial de cambios

**Submódulos:**
- ✅ Órdenes de Servicio
- ✅ Órdenes Abiertas Preventivo
- ✅ Órdenes Abiertas CIG
- ✅ Órdenes Cerradas
- ✅ Cambios Órdenes

### 🏥 **Visitas** (6 submódulos)
**Tablas relacionadas:**
- `visitas` - Tabla principal
- `visitas_estados` - Estados de visitas
- `actividades` - Actividades realizadas

**Submódulos:**
- ✅ Visitas
- ✅ Visitas pendientes
- ✅ Visitas Abiertas
- ✅ Visitas Cerradas
- ✅ Calendario Visita
- ✅ Actividades

### 📊 **Informes** (7 submódulos)
**Tablas relacionadas:**
- `resultados` - Resultados de mantenimientos
- `resultados_ext` - Resultados extendidos
- `repuestos` - Catálogo repuestos
- `fallas_acciones`, `fallas_causas`, `fallas_modos` - Sistema de fallas

**Submódulos:**
- ✅ Resumen Correctivos por equipo
- ✅ Repuestos Instalados
- ✅ Repuestos
- ✅ Fallos
- ✅ Duración Repuestos
- ✅ Indicadores
- ✅ Correctivos Resultados

### 🗑️ **Dar de baja** (4 submódulos)
**Tablas relacionadas:**
- `solicitudes_dado_baja` - Solicitudes de baja
- `solicitudes_dado_baja_estados` - Estados de bajas

**Submódulos:**
- ✅ Solicitudes dado de baja
- ✅ Solicitudes baja pendientes
- ✅ Solicitudes baja aprobadas
- ✅ Solicitudes baja rechazadas

### 💰 **Cotizaciones** (4 submódulos)
**Tablas relacionadas:**
- `cotizaciones` - Tabla principal
- `cotizaciones_estados` - Estados
- `cotizaciones_items_adicionales` - Items adicionales
- `cotizaciones_repuestos` - Repuestos cotizados

**Submódulos:**
- ✅ Cotizaciones
- ✅ Cotizaciones pendientes
- ✅ Cotizaciones aprobadas
- ✅ Cotizaciones rechazadas

### 📦 **Solicitudes por bodega** (8 submódulos)
**Tablas relacionadas:**
- `solicitudes_bodega` - Tabla principal
- `solicitudes_bodega_estados` - Estados bodega
- `solicitudes_bodega_items_adicionales` - Items adicionales
- `solicitudes_bodega_novedades` - Novedades
- `solicitudes_bodega_repuestos` - Repuestos solicitados

**Submódulos:**
- ✅ Solicitudes bodega
- ✅ Solicitudes Bodega Pendientes
- ✅ Solicitudes Bodegas Aprobadas
- ✅ Solicitudes bodegas despachadas
- ✅ Solicitud bodega terminada
- ✅ Solicitudes bodegas rechazadas
- ✅ Repuesto de solicitudes bodega
- ✅ Item adicionales de solicitudes de bodega

### ⚙️ **Generales** (27 submódulos)
**Tablas relacionadas:**
```
Usuarios y Roles:
- usuarios, administradores, analistas, tecnicos
- coordinadores, comerciales, permisos_especiales
- usuarios_vs_clientes, usuarios_vs_sedes, sesiones

Clientes y Ubicaciones:
- clientes, sedes, empresas, departamentos, municipios

Equipos:
- equipos, marcas, modelos, tipos, clases, areas

Configuración:
- repuestos, campos, preventivos, soft_anterior
- fallo_sistemas, fallo_modos, fallas_causas, fallas_acciones
- ordenes_sub_estados
```

## 🔍 **Componentes React Existentes a Verificar**

Necesito revisar qué componentes ya existen en el proyecto actual:
