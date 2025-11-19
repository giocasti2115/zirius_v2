# Documentación Técnica - Módulos de Configuración General

## Descripción General

Los módulos de configuración general de ZIRIUS V2 proporcionan las bases para la gestión centralizada de todos los aspectos configurables del sistema de gestión de equipos médicos.

## Arquitectura del Sistema

### Backend (API)

#### Controladores Principales

##### `GeneralesController.ts`
Maneja las operaciones CRUD para las entidades básicas de configuración:

- **Tipos de Equipos**: Categorización y clasificación de equipos médicos
- **Marcas**: Gestión de fabricantes y marcas de equipos
- **Estados**: Estados del sistema para diferentes procesos
- **Prioridades**: Niveles de prioridad para solicitudes y tareas
- **Ubicaciones**: Gestión de departamentos y ciudades
- **Variables del Sistema**: Configuraciones globales del sistema

##### `SistemaController.ts`
Gestiona las operaciones avanzadas del sistema:

- **Sistema de Respaldos**: Configuración y ejecución de respaldos automáticos
- **Sistema de Logs**: Monitoreo y análisis de eventos del sistema
- **Notificaciones**: Plantillas y configuraciones de notificaciones

#### Middleware de Seguridad

##### `generalesValidation.ts`
Implementa múltiples capas de validación y seguridad:

1. **Validación de Permisos**: `validateGeneralesPermissions()`
   - Verifica roles de usuario
   - Controla acceso granular por función
   - Registra intentos de acceso no autorizado

2. **Validación de Variables Críticas**: `validateSystemVariablePermissions()`
   - Protege variables críticas del sistema
   - Solo permite modificación por super administradores
   - Audita cambios en configuraciones sensibles

3. **Sanitización de Entrada**: `sanitizeGeneralesInput()`
   - Previene inyecciones XSS y SQL
   - Limpia caracteres de control
   - Mantiene campos con HTML permitido según contexto

4. **Rate Limiting**: `validateRateLimit()`
   - Implementa límites por usuario/IP
   - Diferentes límites según criticidad de operación
   - Headers informativos sobre límites restantes

5. **Validación de Integridad**: `validateDataIntegrity()`
   - Verifica que eliminaciones no rompan integridad referencial
   - Valida formatos específicos por tipo de dato
   - Asegura consistencia de datos críticos

6. **Auditoría**: `auditGeneralesChanges()`
   - Registra todas las modificaciones
   - Incluye contexto completo de cambios
   - Facilita trazabilidad y cumplimiento

#### Validaciones Específicas

##### `generalesValidations.ts`
Define reglas de validación específicas para cada entidad:

- **Tipos de Equipos**: Nombres únicos, categorías válidas, vida útil
- **Marcas**: URLs válidas, países de origen, información corporativa
- **Estados**: Códigos de color hexadecimales, tipos de estado, orden lógico
- **Prioridades**: Niveles numéricos, tiempos de respuesta, escalación
- **Variables de Sistema**: Tipos de datos, expresiones regulares, categorías
- **Configuraciones de Respaldo**: Horarios válidos, rutas de destino, retención
- **Plantillas de Notificación**: Contenido HTML/texto, variables dinámicas

#### Manejo de Errores

##### `errorHandler.ts` (actualizado)
Proporciona manejo centralizado de errores:

- **Errores de Validación**: Formato consistente con detalles específicos
- **Errores de Base de Datos**: Interpretación de códigos MySQL específicos
- **Logging Estructurado**: Contexto completo para debugging
- **Headers de Seguridad**: Protección contra vulnerabilidades comunes
- **Rate Limiting**: Respuestas informativas sobre límites excedidos

### Base de Datos

#### Esquema Principal (`002_configuracion_general.sql`)

```sql
-- Estructura principal de tablas
CREATE TABLE tipos_equipos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria ENUM('BIOMEDICO', 'INFORMATICO', 'MOBILIARIO', 'INFRAESTRUCTURA', 'OTRO'),
    requiere_calibracion BOOLEAN DEFAULT FALSE,
    vida_util_anos INT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices optimizados para consultas frecuentes
CREATE INDEX idx_tipos_equipos_categoria ON tipos_equipos(categoria);
CREATE INDEX idx_tipos_equipos_activo ON tipos_equipos(activo);
CREATE INDEX idx_tipos_equipos_nombre ON tipos_equipos(nombre);
```

#### Datos Geográficos (`003_ciudades_colombia.sql`)

- **33 Departamentos** de Colombia con códigos DANE
- **1,122 Municipios** con relaciones jerárquicas
- **Códigos postales** y datos administrativos
- **Optimización** para consultas geográficas frecuentes

### Frontend (React + TypeScript)

#### Componentes Principales

##### `/generales/tipos-equipos`
- **Lista Paginada**: DataTable con filtros avanzados
- **Formulario Modal**: Validación client-side y server-side
- **Filtros Dinámicos**: Por categoría, estado, búsqueda de texto
- **Exportación**: Excel/PDF con datos filtrados

##### `/generales/respaldos`
- **Dashboard**: Estado actual de respaldos automáticos
- **Configuración**: Asistente paso a paso para configurar respaldos
- **Historial**: Visualización de respaldos ejecutados con estados
- **Restauración**: Interface para restaurar desde respaldos específicos

##### `/generales/logs`
- **Visualización en Tiempo Real**: Stream de eventos del sistema
- **Filtros Avanzados**: Por nivel, módulo, usuario, fechas
- **Análisis**: Gráficos de tendencias y estadísticas
- **Exportación**: Logs en múltiples formatos

#### Hooks Personalizados

```typescript
// useGenerales.ts - Hook principal para gestión de estado
export const useGenerales = (entity: string) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Métodos CRUD optimizados
  const create = useCallback(async (payload) => {
    // Implementación con validación y manejo de errores
  }, []);
  
  return { data, loading, error, create, update, delete: remove };
};
```

## Integración con Otros Módulos

### `IntegracionGeneralesService.ts`

Proporciona conectores entre los módulos de configuración y el resto del sistema:

#### Funciones Principales

1. **`actualizarEstadoEquipo(equipoId, estadoId)`**
   - Actualiza estado de equipos médicos
   - Registra eventos de cambio de estado
   - Notifica a usuarios relevantes

2. **`registrarEvento(nivel, modulo, evento, descripcion, usuario, metadata)`**
   - Sistema centralizado de logging
   - Clasificación automática de eventos
   - Almacenamiento optimizado para consultas

3. **`getEstadisticasEstados(tipo, fechaInicio, fechaFin)`**
   - Análisis de distribución de estados
   - Métricas de rendimiento por estado
   - Datos para dashboards ejecutivos

4. **`validarUbicacion(departamentoId, ciudadId)`**
   - Validación de ubicaciones geográficas
   - Verificación de relaciones jerárquicas
   - Datos para formularios dependientes

## Seguridad y Rendimiento

### Medidas de Seguridad Implementadas

1. **Autenticación y Autorización**
   - JWT tokens con expiración configurable
   - Roles granulares con permisos específicos
   - Validación de sesión en cada request

2. **Prevención de Ataques**
   - Sanitización completa de entrada
   - Rate limiting por endpoint y usuario
   - Headers de seguridad HTTP
   - Validación CSRF para formularios

3. **Auditoría y Monitoring**
   - Logging estructurado de todas las operaciones
   - Detección de patrones anómalos
   - Alertas automáticas por intentos de acceso no autorizado

4. **Integridad de Datos**
   - Validaciones de referencia antes de eliminaciones
   - Transacciones atómicas para operaciones críticas
   - Respaldos automáticos con verificación de integridad

### Optimizaciones de Rendimiento

1. **Base de Datos**
   - Índices optimizados para consultas frecuentes
   - Paginación server-side para grandes volúmenes
   - Queries optimizadas con EXPLAIN PLAN

2. **API**
   - Compresión de respuestas grandes
   - Cache de configuraciones estáticas
   - Pooling de conexiones de base de datos

3. **Frontend**
   - Lazy loading de componentes
   - Virtualización de listas grandes
   - Debouncing en campos de búsqueda
   - Cache local con React Query

## Configuración y Despliegue

### Variables de Entorno

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zirius_v2
DB_USER=zirius_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
LOG_FORMAT=json

# Respaldos
BACKUP_PATH=/var/backups/zirius
BACKUP_RETENTION_DAYS=30
```

### Scripts de Despliegue

```bash
# Instalación de dependencias
npm install

# Ejecución de migraciones
npm run migrate

# Población de datos iniciales
npm run seed

# Compilación para producción
npm run build

# Inicio del servidor
npm run start:prod
```

## Monitoreo y Mantenimiento

### Métricas Clave

1. **Performance**
   - Tiempo de respuesta por endpoint
   - Throughput de requests por minuto
   - Utilización de memoria y CPU

2. **Errores**
   - Tasa de errores por endpoint
   - Errores de validación más frecuentes
   - Fallos en operaciones críticas

3. **Seguridad**
   - Intentos de acceso no autorizado
   - Rate limiting activado
   - Patrones de acceso anómalos

### Mantenimiento Rutinario

1. **Diario**
   - Verificación de respaldos automáticos
   - Revisión de logs de error
   - Monitoreo de performance

2. **Semanal**
   - Análisis de métricas de seguridad
   - Limpieza de logs antiguos
   - Verificación de integridad de datos

3. **Mensual**
   - Actualización de dependencias
   - Revisión de configuraciones de seguridad
   - Optimización de consultas de base de datos

## Roadmap de Desarrollo

### Fase 1 (Actual)
- ✅ Implementación completa de CRUD básico
- ✅ Sistema de validaciones y seguridad
- ✅ Integración con otros módulos
- ✅ Documentación técnica

### Fase 2 (Próxima)
- 🔄 Testing automatizado (unit, integration, e2e)
- 🔄 Optimización de performance
- 🔄 Documentación de usuario
- 🔄 Dashboard administrativo avanzado

### Fase 3 (Futuro)
- ⏳ API GraphQL para consultas complejas
- ⏳ Microservicios para módulos específicos
- ⏳ Machine Learning para predicciones
- ⏳ App móvil para gestión remota