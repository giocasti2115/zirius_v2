import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
// import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { setupSwagger } from './swagger/config';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002; // Forzar puerto 3002 como fallback

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Setup Swagger documentation
setupSwagger(app);
console.log('📚 Swagger documentation available at http://localhost:3002/api-docs');

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('📊 Health check requested');
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
    console.log('✅ Health check response sent');
  } catch (error) {
    console.error('❌ Health check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'ERROR', error: errorMessage });
  }
});

// API Routes
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Import routes - módulos esenciales para Visitas y Órdenes de Servicio
import authRoutes from './routes/auth';
import clienteRoutes from './routes/clientesReal';
import visitaRoutes from './routes/visitas';
import visitaTrackingRoutes from './routes/visitaTracking'; // ✅ Tracking GPS/Fotos Visitas
import ordenesServicioRoutes from './routes/ordenesServicio'; // ✅ NUEVO: Órdenes de Servicio
import cotizacionesRoutes from './routes/cotizaciones'; // ✅ NUEVO: Cotizaciones
import solicitudesRoutes from './routes/solicitudes'; // ✅ NUEVO: Solicitudes
import darDeBajaRoutes from './routes/darDeBajaSimple'; // ✅ NUEVO: Dar de Baja
import dashboardRoutes from './routes/dashboard';

// Temporalmente deshabilitados para compilación
// import sedeRoutes from './routes/sedes';
// import equipoRoutes from './routes/equipos';
// import ordenRoutes from './routes/ordenes';
// import databaseRoutes from './routes/database';
import realRoutes from './routes/real';

// Use routes - módulos activos: Visitas y Órdenes de Servicio
console.log('🔧 Setting up API routes...');
try {
  app.use(`${API_PREFIX}/auth`, authRoutes);
  console.log('✅ Auth routes configured');
  app.use(`${API_PREFIX}/clientes`, clienteRoutes);
  console.log('✅ Cliente routes configured');
  app.use(`${API_PREFIX}/visitas`, visitaRoutes);
  console.log('✅ Visita routes configured');
  app.use(`${API_PREFIX}/visitas`, visitaTrackingRoutes); // ✅ GPS tracking, fotos, check-in/out Visitas
  console.log('✅ Visita tracking routes configured');
  app.use(`${API_PREFIX}/ordenes`, ordenesServicioRoutes); // ✅ NUEVO: Órdenes de Servicio completas
  console.log('✅ Órdenes de Servicio routes configured');
  app.use(`${API_PREFIX}/cotizaciones`, cotizacionesRoutes); // ✅ NUEVO: Cotizaciones
  console.log('✅ Cotizaciones routes configured');
  app.use(`${API_PREFIX}/solicitudes`, solicitudesRoutes); // ✅ NUEVO: Solicitudes
  console.log('✅ Solicitudes routes configured');
  app.use(`${API_PREFIX}/dar-de-baja`, darDeBajaRoutes); // ✅ NUEVO: Dar de Baja
  console.log('✅ Dar de Baja routes configured');
  app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
  console.log('✅ Dashboard routes configured');
  
  // Temporalmente deshabilitados para compilación
  // app.use(`${API_PREFIX}/sedes`, sedeRoutes);
  // app.use(`${API_PREFIX}/equipos`, equipoRoutes);
  // app.use(`${API_PREFIX}/database`, databaseRoutes);
  app.use(`${API_PREFIX}/real`, realRoutes);
  console.log('✅ Informes routes configured');
  console.log('✅ Sistema configurado: Visitas (100%) + Órdenes de Servicio (100%) + Dar de Baja (100%) + Informes (activado)');
} catch (error) {
  console.error('❌ Error setting up routes:', error);
}

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
// app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;