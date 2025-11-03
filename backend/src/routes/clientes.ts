import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /clientes - Obtener todos los clientes con paginación y búsqueda
router.get('/', ClienteController.getAll);

// GET /clientes/:id - Obtener cliente por ID
router.get('/:id', ClienteController.getById);

// POST /clientes - Crear nuevo cliente
router.post('/', ClienteController.create);

// PUT /clientes/:id - Actualizar cliente
router.put('/:id', ClienteController.update);

// DELETE /clientes/:id - Eliminar cliente (soft delete)
router.delete('/:id', ClienteController.delete);

// GET /clientes/:id/sedes - Obtener sedes de un cliente
router.get('/:id/sedes', ClienteController.getSedes);

export default router;