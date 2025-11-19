import { Router } from 'express'
import { OrdenServicioTrackingController } from '../controllers/OrdenServicioTrackingController'

const router = Router()

// **RUTAS TRACKING GPS**
// GET /api/ordenes/tracking - Obtener tracking de órdenes activas
router.get('/tracking', OrdenServicioTrackingController.obtenerTrackingOrdenes)

// POST /api/ordenes/:orden_id/tracking/ubicacion - Registrar ubicación GPS del técnico
router.post('/:orden_id/tracking/ubicacion', OrdenServicioTrackingController.registrarUbicacionTecnico)

// **RUTAS CHECK-IN/CHECK-OUT**
// POST /api/ordenes/:orden_id/checkin - Realizar check-in en orden
router.post('/:orden_id/checkin', OrdenServicioTrackingController.realizarCheckIn)

// POST /api/ordenes/:orden_id/checkout - Realizar check-out de orden
router.post('/:orden_id/checkout', OrdenServicioTrackingController.realizarCheckOut)

// **RUTAS GESTIÓN DE FOTOS**
// POST /api/ordenes/:orden_id/fotos - Subir foto de orden
router.post('/:orden_id/fotos', OrdenServicioTrackingController.subirFotoOrden)

// GET /api/ordenes/:orden_id/fotos - Obtener fotos de una orden
router.get('/:orden_id/fotos', OrdenServicioTrackingController.obtenerFotosOrden)

// **RUTAS DASHBOARD Y MÉTRICAS**
// GET /api/ordenes/dashboard/metricas - Obtener métricas del dashboard
router.get('/dashboard/metricas', OrdenServicioTrackingController.obtenerMetricasDashboard)

// GET /api/ordenes/dashboard/tendencias - Obtener tendencias operacionales
router.get('/dashboard/tendencias', OrdenServicioTrackingController.obtenerTendenciasOperacionales)

export default router