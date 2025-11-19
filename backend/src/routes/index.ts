import { Router } from 'express';
import equiposRoutes from './equipos';
import clientesRoutes from './clientes';
import sedesRoutes from './sedes';
import solicitudesRoutes from './solicitudes';
import ordenesRoutes from './ordenes';
import visitasRoutes from './visitas';
// import cotizacionesRoutes from './cotizaciones'; // Temporalmente deshabilitado
import dashboardRoutes from './dashboard';
import authRoutes from './auth';
import databaseRoutes from './database';
import realRoutes from './real'; // ✅ NUEVO: Rutas BD Real
// import generalesRoutes from './generales'; // Temporalmente deshabilitado
// import sistemaRoutes from './sistema'; // Temporalmente deshabilitado

const router = Router();

// Registrar todas las rutas de la API
router.use('/equipos', equiposRoutes);
router.use('/clientes', clientesRoutes);
router.use('/sedes', sedesRoutes);
router.use('/solicitudes', solicitudesRoutes);
router.use('/ordenes', ordenesRoutes);
router.use('/visitas', visitasRoutes);
// router.use('/cotizaciones', cotizacionesRoutes); // Temporalmente deshabilitado
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
router.use('/database', databaseRoutes);
router.use('/real', realRoutes); // ✅ NUEVO: BD Real endpoints
// router.use('/generales', generalesRoutes); // Temporalmente deshabilitado
// router.use('/sistema', sistemaRoutes); // Temporalmente deshabilitado

export default router;