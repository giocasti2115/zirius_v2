import { Router } from 'express'
import { SolicitudBodegaControllerReal } from '../../controllers/SolicitudBodegaControllerReal'
import { requireAuth } from '../../middleware/auth'

const router = Router()

/**
 * @swagger
 * /api/v1/real/solicitudes-bodega/stats:
 *   get:
 *     summary: Obtener estadísticas de solicitudes de bodega
 *     tags: [Solicitudes Bodega Real]
 *     responses:
 *       200:
 *         description: Estadísticas de solicitudes de bodega
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSolicitudes:
 *                       type: number
 *                     solicitudesPendientes:
 *                       type: number
 *                     solicitudesAprobadas:
 *                       type: number
 *                     solicitudesDespachadas:
 *                       type: number
 *                     solicitudesTerminadas:
 *                       type: number
 *                     solicitudesRechazadas:
 *                       type: number
 *                     valorTotalAprobado:
 *                       type: number
 *                     promedioDiasResolucion:
 *                       type: number
 */
router.get('/stats', /* requireAuth, */ SolicitudBodegaControllerReal.obtenerEstadisticas)

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
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Elementos por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aprobada, despachada, terminada, rechazada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: aviso
 *         schema:
 *           type: string
 *         description: Filtrar por número de aviso
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *         description: Filtrar por cliente
 *       - in: query
 *         name: id_creador
 *         schema:
 *           type: integer
 *         description: Filtrar por creador
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda general (aviso, observaciones, cliente, creador)
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de solicitudes de bodega con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     solicitudes:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 */
router.get('/', /* requireAuth, */ SolicitudBodegaControllerReal.listar)

/**
 * @swagger
 * /api/v1/real/solicitudes-bodega/{id}:
 *   get:
 *     summary: Obtener solicitud de bodega por ID
 *     tags: [Solicitudes Bodega Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud de bodega
 *     responses:
 *       200:
 *         description: Detalles completos de la solicitud de bodega
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: Solicitud completa con cliente, sede, equipo, repuestos, items y cambios
 *       404:
 *         description: Solicitud de bodega no encontrada
 */
router.get('/:id', /* requireAuth, */ SolicitudBodegaControllerReal.obtenerPorId)

/**
 * @swagger
 * /api/v1/real/solicitudes-bodega:
 *   post:
 *     summary: Crear nueva solicitud de bodega
 *     tags: [Solicitudes Bodega Real]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aviso
 *               - id_cliente
 *             properties:
 *               aviso:
 *                 type: string
 *                 description: Número de aviso
 *               id_cliente:
 *                 type: integer
 *                 description: ID del cliente
 *               id_sede:
 *                 type: integer
 *                 description: ID de la sede
 *               id_equipo:
 *                 type: integer
 *                 description: ID del equipo
 *               id_orden:
 *                 type: integer
 *                 description: ID de la orden relacionada
 *               tipo_servicio:
 *                 type: string
 *                 enum: [correctivo, preventivo, garantia]
 *                 default: correctivo
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta, urgente]
 *                 default: media
 *               observaciones:
 *                 type: string
 *                 description: Observaciones de la solicitud
 *               ubicacion_equipo:
 *                 type: string
 *                 description: Ubicación del equipo
 *               contacto_sede:
 *                 type: string
 *                 description: Persona de contacto en la sede
 *               telefono_contacto:
 *                 type: string
 *                 description: Teléfono de contacto
 *               repuestos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_repuesto:
 *                       type: integer
 *                     cantidad:
 *                       type: number
 *                     precio_unitario:
 *                       type: number
 *                     observaciones:
 *                       type: string
 *               itemsAdicionales:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descripcion:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *                     precio_unitario:
 *                       type: number
 *                     observaciones:
 *                       type: string
 *     responses:
 *       201:
 *         description: Solicitud de bodega creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', /* requireAuth, */ SolicitudBodegaControllerReal.crear)

/**
 * @swagger
 * /api/v1/real/solicitudes-bodega/{id}/estado:
 *   put:
 *     summary: Cambiar estado de solicitud de bodega
 *     tags: [Solicitudes Bodega Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud de bodega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aprobada, despachada, terminada, rechazada]
 *                 description: Nuevo estado de la solicitud
 *               observaciones:
 *                 type: string
 *                 description: Observaciones del cambio de estado
 *     responses:
 *       200:
 *         description: Estado cambiado exitosamente
 *       400:
 *         description: Estado no válido
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:id/estado', /* requireAuth, */ SolicitudBodegaControllerReal.cambiarEstado)

/**
 * @swagger
 * /api/v1/real/solicitudes-bodega/{id}/aprobar:
 *   put:
 *     summary: Aprobar solicitud de bodega
 *     tags: [Solicitudes Bodega Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud de bodega
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones:
 *                 type: string
 *                 description: Observaciones de la aprobación
 *     responses:
 *       200:
 *         description: Solicitud aprobada exitosamente
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:id/aprobar', /* requireAuth, */ SolicitudBodegaControllerReal.aprobar)

/**
 * @swagger
 * /api/v1/real/solicitudes-bodega/{id}/rechazar:
 *   put:
 *     summary: Rechazar solicitud de bodega
 *     tags: [Solicitudes Bodega Real]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud de bodega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - observaciones
 *             properties:
 *               observaciones:
 *                 type: string
 *                 description: Motivo del rechazo (requerido)
 *     responses:
 *       200:
 *         description: Solicitud rechazada exitosamente
 *       400:
 *         description: Observaciones requeridas
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:id/rechazar', /* requireAuth, */ SolicitudBodegaControllerReal.rechazar)

export default router