import { Router } from 'express';
import { EquipoController } from '../controllers/EquipoController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /equipos - Obtener todos los equipos con paginación y búsqueda
router.get('/', EquipoController.getAll);

// GET /equipos/:id - Obtener equipo por ID
router.get('/:id', EquipoController.getById);

// POST /equipos - Crear nuevo equipo
router.post('/', EquipoController.create);

// PUT /equipos/:id - Actualizar equipo
router.put('/:id', EquipoController.update);

// DELETE /equipos/:id - Eliminar equipo (soft delete)
router.delete('/:id', EquipoController.delete);

export default router;