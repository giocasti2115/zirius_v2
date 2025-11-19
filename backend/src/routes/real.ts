import { Router } from 'express'
import { ClienteControllerReal } from '../controllers/ClienteControllerReal'
import { SolicitudControllerReal } from '../controllers/SolicitudControllerReal'
import { OrdenControllerReal } from '../controllers/OrdenControllerReal'
import { EquipoControllerReal } from '../controllers/EquipoControllerReal'
import { VisitaControllerReal } from '../controllers/VisitaControllerReal'
import { VisitaControllerTest } from '../controllers/VisitaControllerTest'
import { DashboardControllerReal } from '../controllers/DashboardControllerReal'
// import darDeBajaRoutes from './real/dar-de-baja' // Temporalmente deshabilitado por errores TypeScript
import informesRoutes from './real/informes'
import generalesRoutes from './real/generales'
import solicitudesBodegaRoutes from './real/solicitudes-bodega'
import {
  getAllCotizaciones,
  getCotizacionById,
  cambiarEstadoCotizacion,
  getEstadisticasCotizaciones
} from '../controllers/CotizacionControllerRealDB'
import { 
  exportarCotizacionesCSV,
  exportarCotizacionesExcel
} from '../controllers/ExportController'
import { 
  exportarCotizacionesCSVSimple,
  exportarCotizacionesCSVCompleto
} from '../controllers/ExportSimpleController'
import { 
  loginReal
} from '../controllers/AuthRealController'
import { requireAuth } from '../middleware/auth'
import { createSolicitudValidation, changeEstadoValidation, idParamValidation } from '../validations/solicitudesValidation'
import { 
  createOrdenValidation, 
  cerrarOrdenValidation, 
  cambiarEstadoOrdenValidation, 
  listOrdenesValidation 
} from '../validations/ordenesValidation'
import { 
  validateCreateVisita, 
  validateUpdateVisita, 
  validateAprobarVisita, 
  validateRechazarVisita, 
  validateCerrarVisita, 
  validateFilterVisitas 
} from '../validations/visitasValidation'
import {
  validateCambiarEstado,
  validateFilterCotizaciones
} from '../validations/cotizacionesRealValidation'

const router = Router()

/**
 * @swagger
 * /api/v1/real/login:
 *   post:
 *     tags: [Real - Autenticación]
 *     summary: Login con base de datos real
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *               clave:
 *                 type: string
 *             required:
 *               - usuario
 *               - clave
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post('/login', loginReal)

// ============================================
// RUTAS DE DASHBOARD REAL
// ============================================
router.get('/dashboard/stats', requireAuth, DashboardControllerReal.getStats)

// ============================================
// RUTAS DE CLIENTES
// ============================================

/**
 * @swagger
 * /api/v1/real/clientes:
 *   get:
 *     summary: Obtener todos los clientes (BD Real)
 *     tags: [Clientes Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, documento o email
 *     responses:
 *       200:
 *         description: Lista de clientes con paginación
 */
router.get('/clientes', requireAuth, ClienteControllerReal.getAll)

/**
 * @swagger
 * /api/v1/real/clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del cliente
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/clientes/:id', requireAuth, ClienteControllerReal.getById)

/**
 * @swagger
 * /api/v1/real/clientes:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Clientes Real]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               documento:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 */
router.post('/clientes', requireAuth, ClienteControllerReal.create)

router.put('/clientes/:id', requireAuth, ClienteControllerReal.update)
router.delete('/clientes/:id', requireAuth, ClienteControllerReal.delete)
router.get('/clientes/:id/sedes', requireAuth, ClienteControllerReal.getSedes)
router.get('/clientes/stats/general', requireAuth, ClienteControllerReal.getStats)

// ============================================
// RUTAS DE SOLICITUDES
// ============================================

/**
 * @swagger
 * /api/v1/real/solicitudes:
 *   get:
 *     summary: Obtener todas las solicitudes (BD Real)
 *     tags: [Solicitudes Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: prioridad
 *         schema:
 *           type: string
 *           enum: [baja, media, alta, urgente]
 *       - in: query
 *         name: cliente
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de solicitudes con paginación
 */
router.get('/solicitudes', /* requireAuth, */ SolicitudControllerReal.getAll)

/**
 * @swagger
 * /api/v1/real/solicitudes/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de solicitudes
 *     tags: [Solicitudes Real]
 *     responses:
 *       200:
 *         description: Estadísticas de solicitudes
 */
router.get('/solicitudes/estadisticas', /* requireAuth, */ SolicitudControllerReal.getStats)

/**
 * @swagger
 * /api/v1/real/solicitudes/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     tags: [Solicitudes Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la solicitud
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/solicitudes/:id', /* requireAuth, */ idParamValidation, SolicitudControllerReal.getById)

router.post('/solicitudes', requireAuth, createSolicitudValidation, SolicitudControllerReal.create)
router.put('/solicitudes/:id/estado', requireAuth, idParamValidation, changeEstadoValidation, SolicitudControllerReal.cambiarEstado)

// ============================================
// RUTAS DE EQUIPOS
// ============================================

/**
 * @swagger
 * /api/v1/real/equipos:
 *   get:
 *     summary: Obtener todos los equipos (BD Real)
 *     tags: [Equipos Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: id_sede
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de equipos con paginación
 */
router.get('/equipos', requireAuth, EquipoControllerReal.getAll)

/**
 * @swagger
 * /api/v1/real/equipos/{id}:
 *   get:
 *     summary: Obtener equipo por ID
 *     tags: [Equipos Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del equipo
 *       404:
 *         description: Equipo no encontrado
 */
router.get('/equipos/:id', requireAuth, idParamValidation, EquipoControllerReal.getById)

/**
 * @swagger
 * /api/v1/real/equipos/stats/general:
 *   get:
 *     summary: Obtener estadísticas de equipos
 *     tags: [Equipos Real]
 *     responses:
 *       200:
 *         description: Estadísticas de equipos
 */
router.get('/equipos/stats/general', requireAuth, EquipoControllerReal.getStats)

// ============================================
// RUTAS DE ÓRDENES
// ============================================

/**
 * @swagger
 * /api/v1/real/ordenes:
 *   get:
 *     summary: Obtener todas las órdenes (BD Real)
 *     tags: [Órdenes Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: tecnico
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de órdenes con paginación
 */
// ============================================
// RUTAS DE ÓRDENES
// ============================================

/**
 * @swagger
 * /api/v1/real/ordenes:
 *   get:
 *     summary: Obtener todas las órdenes (BD Real)
 *     tags: [Órdenes Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *       - in: query
 *         name: solicitud_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: creador_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de órdenes con paginación
 */
router.get('/ordenes', /* requireAuth, */ listOrdenesValidation, OrdenControllerReal.getAll)

/**
 * @swagger
 * /api/v1/real/ordenes/{id}:
 *   get:
 *     summary: Obtener orden por ID
 *     tags: [Órdenes Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la orden
 *       404:
 *         description: Orden no encontrada
 */
router.get('/ordenes/:id', requireAuth, idParamValidation, OrdenControllerReal.getById)

/**
 * @swagger
 * /api/v1/real/ordenes:
 *   post:
 *     summary: Crear nueva orden
 *     tags: [Órdenes Real]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_solicitud
 *               - nombre_recibe
 *               - cedula_recibe
 *             properties:
 *               id_solicitud:
 *                 type: integer
 *               nombre_recibe:
 *                 type: string
 *               cedula_recibe:
 *                 type: string
 *               observaciones_cierre:
 *                 type: string
 *               total:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 */
router.post('/ordenes', requireAuth, createOrdenValidation, OrdenControllerReal.create)

/**
 * @swagger
 * /api/v1/real/ordenes/{id}/cerrar:
 *   put:
 *     summary: Cerrar orden con observaciones
 *     tags: [Órdenes Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - observaciones_cierre
 *             properties:
 *               observaciones_cierre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Orden cerrada exitosamente
 */
router.put('/ordenes/:id/cerrar', requireAuth, idParamValidation, cerrarOrdenValidation, OrdenControllerReal.cerrar)

/**
 * @swagger
 * /api/v1/real/ordenes/{id}/cambios:
 *   post:
 *     summary: Agregar cambio/comentario a la orden
 *     tags: [Órdenes Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comentario
 *             properties:
 *               comentario:
 *                 type: string
 *               id_sub_estado:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Cambio agregado exitosamente
 */
router.post('/ordenes/:id/cambios', requireAuth, idParamValidation, cambiarEstadoOrdenValidation, OrdenControllerReal.agregarCambio)

router.get('/ordenes/stats/general', /* requireAuth, */ OrdenControllerReal.getStats)
router.get('/ordenes/meta/estados', requireAuth, OrdenControllerReal.getEstados)

// ============================================
// RUTAS DE VISITAS
// ============================================

/**
 * @swagger
 * /api/v1/real/visitas:
 *   get:
 *     summary: Obtener todas las visitas (BD Real)
 *     tags: [Visitas Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4]
 *       - in: query
 *         name: responsable_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: orden_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: ejecutar_sede
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de visitas con paginación
 */
router.get('/visitas/test', VisitaControllerTest.getAll)
router.get('/visitas', /* requireAuth, */ validateFilterVisitas, VisitaControllerReal.getAll)

/**
 * @swagger
 * /api/v1/real/visitas/stats:
 *   get:
 *     summary: Obtener estadísticas de visitas
 *     tags: [Visitas Real]
 *     responses:
 *       200:
 *         description: Estadísticas de visitas
 */
router.get('/visitas/stats', /* requireAuth, */ VisitaControllerReal.getStats)

/**
 * @swagger
 * /api/v1/real/visitas/estados:
 *   get:
 *     summary: Obtener estados disponibles para visitas
 *     tags: [Visitas Real]
 *     responses:
 *       200:
 *         description: Lista de estados disponibles
 */
router.get('/visitas/estados', requireAuth, VisitaControllerReal.getEstados)

/**
 * @swagger
 * /api/v1/real/visitas/calendario:
 *   get:
 *     summary: Obtener visitas para calendario
 *     tags: [Visitas Real]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Visitas para el rango de fechas
 */
router.get('/visitas/calendario', requireAuth, VisitaControllerReal.getCalendario)

/**
 * @swagger
 * /api/v1/real/visitas/{id}:
 *   get:
 *     summary: Obtener visita por ID
 *     tags: [Visitas Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la visita
 *       404:
 *         description: Visita no encontrada
 */
router.get('/visitas/:id', requireAuth, idParamValidation, VisitaControllerReal.getById)

/**
 * @swagger
 * /api/v1/real/visitas:
 *   post:
 *     summary: Crear nueva visita
 *     tags: [Visitas Real]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_orden
 *               - fecha_inicio
 *             properties:
 *               id_orden:
 *                 type: integer
 *               id_responsable:
 *                 type: integer
 *               fecha_inicio:
 *                 type: string
 *                 format: datetime
 *               ejecutar_sede:
 *                 type: boolean
 *               duracion:
 *                 type: integer
 *               actividades:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visita creada exitosamente
 */
router.post('/visitas', requireAuth, validateCreateVisita, VisitaControllerReal.create)

/**
 * @swagger
 * /api/v1/real/visitas/{id}:
 *   put:
 *     summary: Actualizar visita (solo pendientes)
 *     tags: [Visitas Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_responsable:
 *                 type: integer
 *               fecha_inicio:
 *                 type: string
 *                 format: datetime
 *               ejecutar_sede:
 *                 type: boolean
 *               duracion:
 *                 type: integer
 *               actividades:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visita actualizada exitosamente
 */
router.put('/visitas/:id', requireAuth, idParamValidation, validateUpdateVisita, VisitaControllerReal.update)

/**
 * @swagger
 * /api/v1/real/visitas/{id}/aprobar:
 *   put:
 *     summary: Aprobar visita pendiente
 *     tags: [Visitas Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observacion_aprobacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visita aprobada exitosamente
 */
router.put('/visitas/:id/aprobar', requireAuth, idParamValidation, validateAprobarVisita, VisitaControllerReal.aprobar)

/**
 * @swagger
 * /api/v1/real/visitas/{id}/rechazar:
 *   put:
 *     summary: Rechazar visita pendiente
 *     tags: [Visitas Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - observacion_aprobacion
 *             properties:
 *               observacion_aprobacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visita rechazada
 */
router.put('/visitas/:id/rechazar', requireAuth, idParamValidation, validateRechazarVisita, VisitaControllerReal.rechazar)

/**
 * @swagger
 * /api/v1/real/visitas/{id}/cerrar:
 *   put:
 *     summary: Cerrar visita abierta
 *     tags: [Visitas Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - actividades
 *             properties:
 *               actividades:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visita cerrada exitosamente
 */
router.put('/visitas/:id/cerrar', requireAuth, idParamValidation, validateCerrarVisita, VisitaControllerReal.cerrar)

// ============================================
// RUTAS DE COTIZACIONES
// ============================================

/**
 * @swagger
 * /api/v1/real/cotizaciones:
 *   get:
 *     summary: Obtener todas las cotizaciones (BD Real)
 *     tags: [Cotizaciones Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: id_estado
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de cotizaciones con paginación
 */
router.get('/cotizaciones', requireAuth, validateFilterCotizaciones, getAllCotizaciones)

/**
 * @swagger
 * /api/v1/real/cotizaciones/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de cotizaciones
 *     tags: [Cotizaciones Real]
 *     responses:
 *       200:
 *         description: Estadísticas de cotizaciones
 */
router.get('/cotizaciones/estadisticas', /* requireAuth, */ getEstadisticasCotizaciones)

/**
 * @swagger
 * /api/v1/real/cotizaciones/{id}:
 *   get:
 *     summary: Obtener cotización por ID con repuestos e items
 *     tags: [Cotizaciones Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la cotización
 *       404:
 *         description: Cotización no encontrada
 */
router.get('/cotizaciones/:id', requireAuth, idParamValidation, getCotizacionById)

/**
 * @swagger
 * /api/v1/real/cotizaciones/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de una cotización
 *     tags: [Cotizaciones Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_estado
 *             properties:
 *               id_estado:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: "1: Pendiente, 2: Aprobada, 3: Rechazada"
 *               observacion:
 *                 type: string
 *                 maxLength: 600
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 */
router.patch('/cotizaciones/:id/estado', /* requireAuth, */ idParamValidation, validateCambiarEstado, cambiarEstadoCotizacion)

/**
 * @swagger
 * /api/v1/real/cotizaciones/export/csv:
 *   get:
 *     tags: [Real - Cotizaciones]
 *     summary: Exportar cotizaciones a CSV
 *     description: Exporta todas las cotizaciones filtradas a formato CSV
 *     parameters:
 *       - in: query
 *         name: id_estado
 *         schema:
 *           type: integer
 *         description: Filtrar por estado
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *         description: Filtrar por cliente
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar en mensaje y observaciones
 *     responses:
 *       200:
 *         description: Archivo CSV descargado
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/cotizaciones/export/csv', /* requireAuth, */ exportarCotizacionesCSVCompleto)

// Endpoint simple para testing
router.get('/cotizaciones/export/csv-simple', /* requireAuth, */ exportarCotizacionesCSVSimple)

/**
 * @swagger
 * /api/v1/real/cotizaciones/export/excel:
 *   get:
 *     tags: [Real - Cotizaciones]
 *     summary: Exportar cotizaciones a Excel
 *     description: Exporta todas las cotizaciones filtradas a formato Excel
 *     parameters:
 *       - in: query
 *         name: id_estado
 *         schema:
 *           type: integer
 *         description: Filtrar por estado
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *         description: Filtrar por cliente
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar en mensaje y observaciones
 *     responses:
 *       200:
 *         description: Archivo Excel descargado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/cotizaciones/export/excel', /* requireAuth, */ exportarCotizacionesExcel)

// ============================================
// RUTAS DE DAR DE BAJA
// ============================================

// ============================================
// RUTAS DE SOLICITUDES DE BODEGA
// ============================================

/**
 * @swagger
 * /api/v1/real/solicitudes-bodega:
 *   get:
 *     summary: Obtener todas las solicitudes de bodega (BD Real)
 *     tags: [Solicitudes Bodega Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aprobada, despachada, terminada, rechazada]
 *       - in: query
 *         name: aviso
 *         schema:
 *           type: string
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de solicitudes de bodega con paginación
 */
router.use('/solicitudes-bodega', solicitudesBodegaRoutes)

// ============================================
// RUTAS DE DAR DE BAJA
// ============================================

/**
 * @swagger
 * /api/v1/real/dar-de-baja:
 *   get:
 *     summary: Obtener todas las solicitudes de baja (BD Real)
 *     tags: [Dar de Baja Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aprobada, rechazada, ejecutada, en_proceso]
 *       - in: query
 *         name: tipo_baja
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de solicitudes de baja con paginación
 */
// router.use('/dar-de-baja', darDeBajaRoutes) // Temporalmente deshabilitado

// ============================================
// RUTAS DE INFORMES
// ============================================

/**
 * @swagger
 * /api/v1/real/informes/correctivos-equipo:
 *   get:
 *     summary: Obtener resumen de correctivos por equipo
 *     tags: [Informes Real]
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Resumen de correctivos por equipo
 */
router.use('/informes', informesRoutes)

// ============================================
// RUTAS DE GENERALES
// ============================================

/**
 * @swagger
 * /api/v1/real/generales/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios del sistema
 *     tags: [Generales Real]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios del sistema
 */
router.use('/generales', generalesRoutes)

export default router