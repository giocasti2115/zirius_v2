import { Router } from 'express';
import equiposRoutes from './equipos';
import clientesRoutes from './clientes';
import sedesRoutes from './sedes';
import solicitudesRoutes from './solicitudes';
import authRoutes from './auth';
import databaseRoutes from './database';

const router = Router();

// Registrar todas las rutas de la API
router.use('/equipos', equiposRoutes);
router.use('/clientes', clientesRoutes);
router.use('/sedes', sedesRoutes);
router.use('/solicitudes', solicitudesRoutes);
router.use('/auth', authRoutes);
router.use('/database', databaseRoutes);

export default router;