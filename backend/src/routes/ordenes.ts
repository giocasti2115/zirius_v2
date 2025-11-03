import { Router } from 'express';
import { OrdenController } from '../controllers/OrdenController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación (comentado temporalmente para desarrollo)
// router.use(authenticate);

// GET /ordenes - Obtener todas las órdenes con filtros
router.get('/', OrdenController.getAll);

// GET /ordenes/stats - Obtener estadísticas de órdenes
router.get('/stats', OrdenController.getStats);

// GET /ordenes/:id - Obtener orden por ID
router.get('/:id', OrdenController.getById);

// POST /ordenes - Crear nueva orden
router.post('/', OrdenController.create);

// PUT /ordenes/:id - Actualizar orden
router.put('/:id', OrdenController.update);

export default router;