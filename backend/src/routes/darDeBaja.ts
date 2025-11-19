import { Router } from 'express';
import { DarDeBajaController } from '../controllers/DarDeBajaController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/dar-de-baja/stats:
 *   get:
 *     summary: Obtener estadísticas de solicitudes de baja
 *     tags: [Dar de Baja]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/stats', async (req, res) => {
  try {
    await DarDeBajaController.obtenerEstadisticas(req, res);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: err.message 
    });
  }
});

/**
 * @swagger
 * /api/dar-de-baja/public:
 *   get:
 *     summary: Obtener lista de solicitudes de baja (público para testing)
 *     tags: [Dar de Baja]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Solicitudes obtenidas exitosamente
 */
router.get('/public', async (req, res) => {
  try {
    await DarDeBajaController.listar(req, res);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: err.message 
    });
  }
});

/**
 * @swagger
 * /api/dar-de-baja/public/{id}:
 *   get:
 *     summary: Obtener solicitud específica (público para testing)
 *     tags: [Dar de Baja]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/public/:id', async (req, res) => {
  try {
    await DarDeBajaController.obtenerPorId(req, res);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: err.message 
    });
  }
});

// Rutas protegidas con autenticación
router.use(authenticate); // Aplicar middleware de autenticación para las siguientes rutas

/**
 * @swagger
 * /api/dar-de-baja:
 *   get:
 *     summary: Obtener lista de solicitudes de baja
 *     tags: [Dar de Baja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitudes obtenidas exitosamente
 */
router.get('/', async (req, res) => {
  try {
    await DarDeBajaController.listar(req, res);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: err.message 
    });
  }
});

/**
 * @swagger
 * /api/dar-de-baja:
 *   post:
 *     summary: Crear nueva solicitud de baja
 *     tags: [Dar de Baja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 */
router.post('/', async (req, res) => {
  try {
    await DarDeBajaController.crear(req, res);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: err.message 
    });
  }
});

/**
 * @swagger
 * /api/dar-de-baja/{id}:
 *   get:
 *     summary: Obtener solicitud específica
 *     tags: [Dar de Baja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    await DarDeBajaController.obtenerPorId(req, res);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: err.message 
    });
  }
});

/**
 * @swagger
 * /api/dar-de-baja/{id}/aprobar:
 *   post:
 *     summary: Aprobar solicitud de baja
 *     tags: [Dar de Baja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitud aprobada exitosamente
 */
router.post('/:id/aprobar', async (req, res) => {
  try {
    await DarDeBajaController.aprobar(req, res);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: err.message 
    });
  }
});

export default router;