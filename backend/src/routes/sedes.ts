import { Router } from 'express';
import { SedeController } from '../controllers/SedeController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /sedes - Obtener todas las sedes con paginación y búsqueda
router.get('/', SedeController.getAll);

// GET /sedes/:id - Obtener sede por ID
router.get('/:id', SedeController.getById);

// POST /sedes - Crear nueva sede
router.post('/', SedeController.create);

// PUT /sedes/:id - Actualizar sede
router.put('/:id', SedeController.update);

// DELETE /sedes/:id - Eliminar sede (soft delete)
router.delete('/:id', SedeController.delete);

// GET /sedes/:id/equipos - Obtener equipos de una sede
router.get('/:id/equipos', SedeController.getEquipos);

export default router;