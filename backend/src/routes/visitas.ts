import { Router } from 'express';
import { VisitaController } from '../controllers/VisitaController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación (comentado temporalmente para desarrollo)
// router.use(authenticate);

// GET /visitas - Obtener todas las visitas con filtros
router.get('/', VisitaController.getAll);

// GET /visitas/stats - Obtener estadísticas de visitas
router.get('/stats', VisitaController.getStats);

// GET /visitas/:id - Obtener visita por ID
router.get('/:id', VisitaController.getById);

// POST /visitas - Crear nueva visita
router.post('/', VisitaController.create);

// PUT /visitas/:id - Actualizar visita
router.put('/:id', VisitaController.update);

export default router;