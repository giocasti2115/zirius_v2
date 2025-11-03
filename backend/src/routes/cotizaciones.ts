import { Router } from 'express';
import { CotizacionController } from '../controllers/CotizacionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación (comentado temporalmente para desarrollo)
// router.use(authenticate);

// GET /cotizaciones - Obtener todas las cotizaciones con filtros
router.get('/', CotizacionController.getAll);

// GET /cotizaciones/stats - Obtener estadísticas de cotizaciones
router.get('/stats', CotizacionController.getStats);

// GET /cotizaciones/:id - Obtener cotización por ID con items
router.get('/:id', CotizacionController.getById);

// POST /cotizaciones - Crear nueva cotización
router.post('/', CotizacionController.create);

// PUT /cotizaciones/:id - Actualizar cotización
router.put('/:id', CotizacionController.update);

export default router;