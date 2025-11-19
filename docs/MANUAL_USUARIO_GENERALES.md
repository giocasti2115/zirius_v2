# Manual de Usuario - Módulos de Configuración General

## Introducción

Los módulos de configuración general de ZIRIUS V2 le permiten personalizar y configurar todos los aspectos básicos del sistema de gestión de equipos médicos. Esta documentación le guiará paso a paso para aprovechar al máximo estas funcionalidades.

## Acceso al Sistema

### Ingreso a la Plataforma

1. **Abra su navegador web** y vaya a la URL de ZIRIUS V2
2. **Ingrese sus credenciales** (usuario y contraseña)
3. **Haga clic en "Iniciar Sesión"**
4. **Navegue al menú "Generales"** en la barra lateral izquierda

### Permisos Requeridos

Para acceder a los módulos de configuración general, su usuario debe tener uno de los siguientes roles:
- **Administrador**: Acceso completo a todas las funciones
- **Coordinador**: Acceso de lectura y escritura
- **Analista**: Acceso de solo lectura

## Gestión de Tipos de Equipos

### ¿Qué son los Tipos de Equipos?

Los tipos de equipos definen las categorías y características básicas de los equipos médicos que maneja su institución. Cada tipo incluye información como:

- **Nombre y descripción**
- **Categoría** (Biomédico, Informático, Mobiliario, etc.)
- **Requisitos de calibración**
- **Vida útil esperada**
- **Especificaciones técnicas**

### Consultar Tipos de Equipos

1. **Vaya a "Generales" → "Tipos de Equipos"**
2. **Use la barra de búsqueda** para encontrar tipos específicos
3. **Filtre por categoría** usando el selector desplegable
4. **Ordene la lista** haciendo clic en los encabezados de columna

### Crear un Nuevo Tipo de Equipo

1. **Haga clic en "Nuevo Tipo de Equipo"**
2. **Complete la información básica**:
   - **Nombre**: Descripción clara del tipo (ej: "Monitor de Signos Vitales")
   - **Descripción**: Detalles adicionales sobre el tipo
   - **Categoría**: Seleccione la categoría apropiada

3. **Configure las características técnicas**:
   - **Requiere Calibración**: Marque si los equipos de este tipo necesitan calibración
   - **Vida Útil**: Indique los años de vida útil esperados
   - **Frecuencia de Mantenimiento**: Establezca cada cuántos meses necesita mantenimiento

4. **Haga clic en "Guardar"**

### Editar un Tipo de Equipo

1. **Localice el tipo de equipo** en la lista
2. **Haga clic en el ícono de edición** (lápiz)
3. **Modifique los campos necesarios**
4. **Guarde los cambios**

> **💡 Consejo**: Si un tipo de equipo ya está siendo usado por equipos registrados, algunos campos no se podrán modificar para mantener la integridad de los datos.

## Gestión de Marcas

### ¿Para qué sirven las Marcas?

Las marcas le permiten mantener un registro organizado de todos los fabricantes de equipos médicos con los que trabaja su institución.

### Agregar una Nueva Marca

1. **Vaya a "Generales" → "Marcas"**
2. **Haga clic en "Nueva Marca"**
3. **Complete la información**:
   - **Nombre**: Nombre oficial de la marca
   - **País de Origen**: País donde se fabrica
   - **Sitio Web**: URL oficial (opcional)
   - **Descripción**: Información adicional sobre la marca

4. **Guarde los cambios**

### Gestionar Marcas Existentes

- **Para editar**: Haga clic en el ícono de lápiz junto a la marca
- **Para desactivar**: Use el interruptor de estado "Activo/Inactivo"
- **Para buscar**: Use la barra de búsqueda en la parte superior

## Sistema de Estados

### ¿Qué son los Estados?

Los estados definen las diferentes etapas por las que pueden pasar los equipos, solicitudes, órdenes de trabajo y otros elementos del sistema.

### Tipos de Estados Disponibles

- **Estados de Equipo**: Operativo, En Mantenimiento, Fuera de Servicio, etc.
- **Estados de Solicitud**: Pendiente, En Proceso, Aprobada, Rechazada
- **Estados de Orden**: Nueva, Asignada, En Ejecución, Completada
- **Estados de Mantenimiento**: Programado, En Curso, Finalizado
- **Estados de Calibración**: Pendiente, Ejecutada, Vencida

### Configurar Estados

1. **Vaya a "Generales" → "Estados"**
2. **Filtre por tipo** para ver solo los estados que necesita
3. **Para crear un nuevo estado**:
   - Haga clic en "Nuevo Estado"
   - Ingrese el nombre y descripción
   - **Seleccione un color** representativo (código hexadecimal)
   - **Elija el tipo** apropiado
   - Configure si es un **estado final** (no permite más cambios)
   - Defina si **permite edición** de registros en este estado

### Personalización de Colores

Los colores ayudan a identificar rápidamente el estado de los elementos:

- **Verde (#28a745)**: Estados positivos (Operativo, Aprobado)
- **Amarillo (#ffc107)**: Estados de transición (En Proceso, Pendiente)
- **Rojo (#dc3545)**: Estados críticos (Fuera de Servicio, Rechazado)
- **Azul (#007bff)**: Estados informativos (En Revisión, Programado)

## Gestión de Prioridades

### ¿Por qué son importantes las Prioridades?

Las prioridades ayudan a clasificar y organizar el trabajo según su urgencia e importancia, asegurando que los casos críticos se atiendan primero.

### Configurar Niveles de Prioridad

1. **Vaya a "Generales" → "Prioridades"**
2. **Defina sus niveles** (generalmente de 1 a 5 o 1 a 10):
   - **Nivel 1**: Crítica/Urgente
   - **Nivel 2**: Alta
   - **Nivel 3**: Media/Normal
   - **Nivel 4**: Baja
   - **Nivel 5**: Muy Baja

3. **Para cada prioridad configure**:
   - **Nombre descriptivo**
   - **Color identificativo**
   - **Tiempo de respuesta esperado** (en horas)
   - **Descripción** de cuándo usar esta prioridad

### Ejemplo de Configuración

| Prioridad | Nivel | Color | Tiempo Respuesta | Uso |
|-----------|-------|--------|------------------|-----|
| Crítica | 1 | Rojo | 2 horas | Equipos de soporte vital |
| Alta | 2 | Naranja | 8 horas | Equipos de diagnóstico principal |
| Media | 3 | Amarillo | 24 horas | Equipos de uso rutinario |
| Baja | 4 | Verde | 72 horas | Equipos de apoyo |

## Configuración de Ubicaciones

### Gestión Geográfica

ZIRIUS V2 incluye la información completa de departamentos y ciudades de Colombia para facilitar la gestión de ubicaciones.

### Consultar Ubicaciones

1. **Vaya a "Generales" → "Ubicaciones"**
2. **Seleccione "Departamentos"** para ver la lista completa
3. **Seleccione un departamento** para ver sus ciudades
4. **Use estas ubicaciones** al registrar equipos, proveedores o sedes

### Uso en Otros Módulos

Las ubicaciones configuradas aquí se utilizan automáticamente en:
- **Registro de equipos** (ubicación física)
- **Gestión de proveedores** (dirección)
- **Órdenes de trabajo** (lugar de ejecución)
- **Reportes geográficos** (análisis por región)

## Sistema de Variables de Configuración

### ¿Qué son las Variables del Sistema?

Las variables del sistema son parámetros configurables que controlan el comportamiento de diferentes funciones de ZIRIUS V2.

### Categorías de Variables

#### Variables de Sistema
- `sistema.nombre_institucion`: Nombre de su institución
- `sistema.version`: Versión actual del sistema
- `sistema.mantenimiento`: Modo de mantenimiento (true/false)

#### Variables de Email
- `email.servidor_smtp`: Servidor de correo saliente
- `email.puerto`: Puerto de conexión
- `email.usuario`: Usuario para autenticación
- `email.remitente_default`: Dirección remitente por defecto

#### Variables de Respaldos
- `respaldos.auto_enabled`: Respaldos automáticos activados
- `respaldos.hora_ejecucion`: Hora diaria de ejecución
- `respaldos.retencion_dias`: Días de retención de respaldos

### Modificar Variables

1. **Vaya a "Generales" → "Variables del Sistema"**
2. **Filtre por categoría** para encontrar la variable deseada
3. **Haga clic en "Editar"** junto a la variable
4. **Modifique el valor** respetando el tipo de dato
5. **Guarde los cambios**

> **⚠️ Importante**: Algunas variables críticas solo pueden ser modificadas por Super Administradores y requieren reinicio del sistema.

## Sistema de Respaldos

### Configuración Automática

1. **Vaya a "Generales" → "Sistema" → "Respaldos"**
2. **Active los respaldos automáticos**
3. **Configure la programación**:
   - **Frecuencia**: Diaria, Semanal o Mensual
   - **Hora de ejecución**: Preferiblemente en horarios de bajo uso
   - **Días de la semana**: Solo para frecuencia semanal
   - **Día del mes**: Solo para frecuencia mensual

4. **Establezca la retención**: Número de días para conservar respaldos
5. **Active la compresión** para ahorrar espacio

### Respaldos Manuales

1. **En la sección de respaldos**, haga clic en "Generar Respaldo Manual"
2. **Agregue una descripción** del respaldo
3. **Espere la confirmación** de completado
4. **Verifique en el historial** que se ejecutó correctamente

### Restauración

> **⚠️ Proceso Crítico**: La restauración debe ser realizada por personal técnico calificado.

1. **Contacte al administrador del sistema**
2. **Identifique el respaldo** a restaurar en el historial
3. **Programe la restauración** en un horario de mantenimiento
4. **Realice pruebas** después de la restauración

## Sistema de Logs y Monitoreo

### Consulta de Eventos

1. **Vaya a "Generales" → "Sistema" → "Logs"**
2. **Use los filtros disponibles**:
   - **Nivel**: Error, Advertencia, Información, Debug
   - **Módulo**: Equipos, Mantenimiento, Calibración, etc.
   - **Usuario**: Ver eventos de usuario específico
   - **Rango de fechas**: Período de consulta

3. **Analice los resultados** para identificar patrones o problemas

### Niveles de Log

- **Error (Rojo)**: Problemas que requieren atención inmediata
- **Advertencia (Amarillo)**: Situaciones que podrían convertirse en problemas
- **Información (Azul)**: Eventos normales del sistema
- **Debug (Gris)**: Información técnica detallada

### Análisis de Tendencias

El sistema proporciona gráficos automáticos que muestran:
- **Distribución de eventos por nivel**
- **Actividad por módulo**
- **Patrones temporales** de uso
- **Usuarios más activos**

## Sistema de Notificaciones

### Plantillas de Notificación

Las plantillas permiten personalizar los mensajes que envía el sistema automáticamente.

### Tipos de Plantillas

1. **Mantenimiento Vencido**: Notifica cuando un equipo necesita mantenimiento
2. **Calibración Vencida**: Alerta sobre calibraciones pendientes
3. **Equipo Fuera de Servicio**: Informa sobre equipos no operativos
4. **Solicitud Pendiente**: Recuerda sobre solicitudes sin procesar
5. **Respaldo Fallido**: Alerta sobre problemas en respaldos
6. **Error del Sistema**: Notifica problemas técnicos

### Personalizar Plantillas

1. **Vaya a "Generales" → "Sistema" → "Notificaciones"**
2. **Seleccione la plantilla** a modificar
3. **Edite el contenido**:
   - **Asunto**: Línea de asunto del email/mensaje
   - **Contenido**: Cuerpo del mensaje
   - **Variables dinámicas**: Use {{variable}} para datos automáticos

4. **Pruebe la plantilla** antes de activarla

### Variables Disponibles

Las plantillas pueden incluir variables que se reemplazan automáticamente:

- `{{usuario_nombre}}`: Nombre del usuario destinatario
- `{{equipo_codigo}}`: Código del equipo involucrado
- `{{fecha_vencimiento}}`: Fecha de vencimiento
- `{{institucion_nombre}}`: Nombre de la institución
- `{{fecha_actual}}`: Fecha actual del sistema

## Mejores Prácticas

### Organización de Datos

1. **Use nombres descriptivos** para tipos, marcas y estados
2. **Mantenga la consistencia** en nomenclatura
3. **Revise periódicamente** y actualice información obsoleta
4. **Documente cambios importantes** en las descripciones

### Seguridad

1. **Cambie credenciales** periódicamente
2. **Revise los logs** regularmente para detectar anomalías
3. **Configure respaldos automáticos** y verifique su ejecución
4. **Mantenga actualizada** la información de contacto para notificaciones

### Rendimiento

1. **Use filtros** en lugar de desplazarse por listas largas
2. **Desactive elementos** no utilizados en lugar de eliminarlos
3. **Programe respaldos** en horarios de bajo uso
4. **Limite el rango de fechas** en consultas de logs

## Solución de Problemas Comunes

### No puedo modificar una configuración

**Posibles causas:**
- Su usuario no tiene permisos suficientes
- La configuración está siendo utilizada por otros elementos
- Es una variable crítica del sistema

**Solución:**
1. Contacte al administrador para verificar permisos
2. Revise si hay dependencias antes de modificar
3. Para variables críticas, contacte soporte técnico

### Los respaldos no se ejecutan automáticamente

**Verificaciones:**
1. Confirme que la configuración automática está activa
2. Revise que la hora programada sea correcta
3. Verifique que hay espacio suficiente en el destino
4. Consulte los logs para ver mensajes de error

### No recibo notificaciones del sistema

**Pasos a seguir:**
1. Verifique su dirección de email en el perfil
2. Revise la carpeta de spam/correo no deseado
3. Confirme que las plantillas están activas
4. Contacte al administrador para verificar configuración SMTP

### La búsqueda no encuentra resultados

**Consejos:**
1. Use términos más generales
2. Verifique que no hay filtros activos
3. Confirme que los elementos buscados están activos
4. Pruebe con diferentes criterios de búsqueda

## Contacto y Soporte

Para asistencia adicional con los módulos de configuración general:

- **Email de soporte**: soporte@zirius.com
- **Teléfono**: +57 1 234-5678
- **Horario de atención**: Lunes a Viernes, 8:00 AM - 6:00 PM
- **Documentación online**: https://docs.zirius.com

### Información Requerida para Soporte

Cuando contacte soporte, por favor incluya:
1. **Descripción detallada** del problema
2. **Pasos realizados** antes del problema
3. **Mensajes de error** (capturas de pantalla si es posible)
4. **Usuario y rol** con el que experimenta el problema
5. **Navegador y versión** utilizada