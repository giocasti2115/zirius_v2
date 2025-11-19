import { Router } from 'express';
import { ClientesController } from '../controllers/ClientesControllerReal';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/clientes/stats:
 *   get:
 *     summary: Obtener estadísticas básicas de clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/stats', ClientesController.obtenerEstadisticas);

/**
 * @swagger
 * /api/clientes/public:
 *   get:
 *     summary: Obtener clientes (sin auth para testing)
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Clientes obtenidos exitosamente
 */
// Rutas públicas para desarrollo/testing
router.get('/public', async (req, res) => {
  try {
    const result = await ClientesController.listar(req, res);
    return result;
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
 * /clientes/public/{id}:
 *   get:
 *     summary: Obtener cliente específico (público para testing)
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/public/:id', async (req, res) => {
  try {
    const result = await ClientesController.obtenerPorId(req, res);
    return result;
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
 * /api/clientes/public/{id}:
 *   get:
 *     summary: Obtener cliente por ID (sin auth para testing)
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente obtenido exitosamente
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/public/:id', ClientesController.obtenerPorId);

// Aplicar autenticación a todas las demás rutas
router.use(authenticate);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener todos los clientes con paginación y búsqueda
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, documento, email)
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
 */
router.get('/', ClientesController.listar);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente obtenido exitosamente
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', ClientesController.obtenerPorId);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del cliente
 *               documento:
 *                 type: string
 *                 description: Documento de identidad
 *               telefono:
 *                 type: string
 *                 description: Teléfono de contacto
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de contacto
 *               direccion:
 *                 type: string
 *                 description: Dirección física
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', ClientesController.crear);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del cliente
 *               documento:
 *                 type: string
 *                 description: Documento de identidad
 *               telefono:
 *                 type: string
 *                 description: Teléfono de contacto
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de contacto
 *               direccion:
 *                 type: string
 *                 description: Dirección física
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', ClientesController.actualizar);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Eliminar cliente (soft delete)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *       404:
 *         description: Cliente no encontrado
 */
router.delete('/:id', ClientesController.eliminar);

export default router;