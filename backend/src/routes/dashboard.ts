import { Router } from 'express'
import { dashboardController } from '../controllers/dashboard'

const router = Router()

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     description: Retorna las estadísticas principales del sistema incluyendo conteos de órdenes, clientes, equipos, etc.
 *     tags: [Dashboard]
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', dashboardController.getStats)

/**
 * @swagger
 * /dashboard/kpi-metrics:
 *   get:
 *     summary: Obtener métricas KPI
 *     description: Retorna indicadores clave de rendimiento del sistema
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Métricas KPI obtenidas exitosamente
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
 *                     eficiencia_ordenes:
 *                       type: number
 *                       description: Porcentaje de órdenes completadas a tiempo
 *                     tiempo_promedio_resolucion:
 *                       type: number
 *                       description: Tiempo promedio en horas para resolver órdenes
 *                     satisfaccion_cliente:
 *                       type: number
 *                       description: Índice de satisfacción del cliente (0-100)
 *                     costo_promedio_mantenimiento:
 *                       type: number
 *                       description: Costo promedio por mantenimiento
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/kpi-metrics', dashboardController.getKPIMetrics)

/**
 * @swagger
 * /dashboard/activity:
 *   get:
 *     summary: Obtener actividad reciente
 *     description: Retorna las actividades más recientes del sistema
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número máximo de actividades a retornar
 *     responses:
 *       200:
 *         description: Actividades obtenidas exitosamente
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       tipo:
 *                         type: string
 *                         enum: [orden_creada, orden_completada, cliente_registrado, equipo_agregado]
 *                       descripcion:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                       usuario:
 *                         type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/activity', dashboardController.getRecentActivity)

export default router