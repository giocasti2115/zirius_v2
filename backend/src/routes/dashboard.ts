import { Router } from 'express'
import { dashboardController } from '../controllers/dashboard'

const router = Router()

// GET /api/v1/dashboard/stats - Obtener estadísticas generales
router.get('/stats', dashboardController.getStats)

// GET /api/v1/dashboard/kpi-metrics - Obtener métricas KPI
router.get('/kpi-metrics', dashboardController.getKPIMetrics)

// GET /api/v1/dashboard/activity - Obtener actividad reciente
router.get('/activity', dashboardController.getRecentActivity)

export default router