import { Router } from 'express';
import { SolicitudController } from '../controllers/SolicitudController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación (comentado temporalmente para desarrollo)
// router.use(authenticate);

// GET /solicitudes - Obtener todas las solicitudes con filtros
router.get('/', SolicitudController.getAll);

// GET /solicitudes/stats - Obtener estadísticas de solicitudes
router.get('/stats', SolicitudController.getStats);

// GET /solicitudes/:id - Obtener solicitud por ID
router.get('/:id', SolicitudController.getById);

// POST /solicitudes - Crear nueva solicitud
router.post('/', SolicitudController.create);

// PUT /solicitudes/:id - Actualizar solicitud
router.put('/:id', SolicitudController.update);

export default router;