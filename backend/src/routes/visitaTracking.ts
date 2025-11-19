import { Router } from 'express'
import { VisitaTrackingController } from '../controllers/VisitaTrackingController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Aplicar autenticación a todas las rutas
router.use(authenticateToken)

// Rutas de tracking GPS
router.post('/tracking/evento', VisitaTrackingController.registrarEvento)
router.get('/tracking/:visita_id/historial', VisitaTrackingController.getHistorialTracking)

// Rutas de check-in/check-out
router.post('/checkin', VisitaTrackingController.checkIn)
router.post('/checkout', VisitaTrackingController.checkOut)

// Rutas de fotos
router.post('/:visita_id/fotos', VisitaTrackingController.subirFotos)
router.get('/:visita_id/fotos', VisitaTrackingController.getFotosVisita)

// Rutas de dashboard y monitoreo
router.get('/dashboard/stats', VisitaTrackingController.getDashboardStats)
router.get('/tracking/tecnicos', VisitaTrackingController.getTecnicosEnCampo)

export default router