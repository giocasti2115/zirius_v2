import { Router } from 'express';
import { SolicitudesController } from '../controllers/SolicitudesControllerSimple';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Solicitud:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la solicitud
 *         numero_solicitud:
 *           type: string
 *           description: Número identificador de la solicitud
 *         id_cliente:
 *           type: integer
 *           description: ID del cliente que realiza la solicitud
 *         descripcion:
 *           type: string
 *           description: Descripción de la solicitud
 *         fecha_solicitud:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la solicitud
 *         estado:
 *           type: integer
 *           enum: [1, 2, 3]
 *           description: Estado de la solicitud (1=Pendiente, 2=Aprobada, 3=Rechazada)
 *         prioridad:
 *           type: string
 *           enum: [baja, media, alta, critica]
 *           description: Prioridad de la solicitud
 *         id_usuario_asignado:
 *           type: integer
 *           description: ID del usuario asignado
 *         fecha_limite:
 *           type: string
 *           format: date-time
 *           description: Fecha límite para completar la solicitud
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/solicitudes/stats:
 *   get:
 *     summary: Obtener estadísticas básicas de solicitudes (sin auth para testing)
 *     tags: [Solicitudes]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/stats', SolicitudesController.obtenerEstadisticas);

/**
 * @swagger
 * /api/solicitudes/public:
 *   get:
 *     summary: Obtener solicitudes (sin auth para testing)
 *     tags: [Solicitudes]
 *     responses:
 *       200:
 *         description: Solicitudes obtenidas exitosamente
 */
router.get('/public', SolicitudesController.listar);

// Aplicar autenticación a todas las demás rutas
router.use(authenticate);

/**
 * @swagger
 * /api/solicitudes:
 *   get:
 *     summary: Obtener lista de solicitudes con filtros y paginación
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
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
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         description: Filtrar por estado
 *       - in: query
 *         name: prioridad
 *         schema:
 *           type: string
 *           enum: [baja, media, alta, critica]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: integer
 *         description: Filtrar por cliente
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Solicitud'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', SolicitudesController.listar);

/**
 * @swagger
 * /api/solicitudes/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de solicitudes
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pendientes:
 *                       type: integer
 *                     aprobadas:
 *                       type: integer
 *                     rechazadas:
 *                       type: integer
 *                     porcentajes:
 *                       type: object
 *                       properties:
 *                         pendientes:
 *                           type: number
 *                         aprobadas:
 *                           type: number
 *                         rechazadas:
 *                           type: number
 */
router.get('/estadisticas', SolicitudesController.obtenerEstadisticas);

/**
 * @swagger
 * /api/solicitudes/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Solicitud'
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:id', SolicitudesController.obtenerPorId);

/**
 * @swagger
 * /api/solicitudes:
 *   post:
 *     summary: Crear nueva solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_cliente
 *               - descripcion
 *               - prioridad
 *             properties:
 *               id_cliente:
 *                 type: integer
 *                 description: ID del cliente
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la solicitud
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta, critica]
 *                 description: Prioridad de la solicitud
 *               id_usuario_asignado:
 *                 type: integer
 *                 description: ID del usuario asignado (opcional)
 *               fecha_limite:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha límite (opcional)
 *               observaciones:
 *                 type: string
 *                 description: Observaciones adicionales (opcional)
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
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
 *                   $ref: '#/components/schemas/Solicitud'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', SolicitudesController.crear);

/**
 * @swagger
 * /api/solicitudes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de una solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
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
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Nuevo estado (1=Pendiente, 2=Aprobada, 3=Rechazada)
 *               observaciones:
 *                 type: string
 *                 description: Observaciones del cambio de estado
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
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
 *                   $ref: '#/components/schemas/Solicitud'
 *       404:
 *         description: Solicitud no encontrada
 */
router.patch('/:id/estado', SolicitudesController.cambiarEstado);

export default router;