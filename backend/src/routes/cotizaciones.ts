import express from 'express'
import { CotizacionController } from '../controllers/CotizacionController'

const router = express.Router()

/**
 * @route GET /api/cotizaciones
 * @description Obtener todas las cotizaciones con paginación
 * @access Private
 */
router.get('/', CotizacionController.getAll)

/**
 * @route GET /api/cotizaciones/stats
 * @description Obtener estadísticas de cotizaciones
 * @access Private
 */
router.get('/stats', CotizacionController.getStats)

/**
 * @route GET /api/cotizaciones/export
 * @description Exportar cotizaciones
 * @access Private
 */
router.get('/export', CotizacionController.exportToExcel)

export default router