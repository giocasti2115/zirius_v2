import express from 'express'
import {
  getReporteGeneral,
  getMetricasRendimiento,
  getReporteActividad,
  exportarDatos
} from '../controllers/ReportesController'

const router = express.Router()

/**
 * @route GET /api/reportes/general
 * @description Obtener reporte general del sistema
 * @access Private
 */
router.get('/general', getReporteGeneral)

/**
 * @route GET /api/reportes/metricas
 * @description Obtener métricas de rendimiento
 * @access Private
 */
router.get('/metricas', getMetricasRendimiento)

/**
 * @route GET /api/reportes/actividad
 * @description Obtener reporte de actividad por período
 * @access Private
 */
router.get('/actividad', getReporteActividad)

/**
 * @route GET /api/reportes/exportar
 * @description Exportar datos en CSV o JSON
 * @access Private
 */
router.get('/exportar', exportarDatos)

export default router