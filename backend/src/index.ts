import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';

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

// Import routes
import authRoutes from './routes/auth';
import clienteRoutes from './routes/clientes';
import sedeRoutes from './routes/sedes';
import equipoRoutes from './routes/equipos';
import solicitudRoutes from './routes/solicitudes';
import ordenRoutes from './routes/ordenes';
import visitaRoutes from './routes/visitas';
import cotizacionRoutes from './routes/cotizaciones';
import dashboardRoutes from './routes/dashboard';
import databaseRoutes from './routes/database';

// Use routes - commented temporarily for debugging
console.log('🔧 Setting up API routes...');
try {
  app.use(`${API_PREFIX}/auth`, authRoutes);
  console.log('✅ Auth routes configured');
  app.use(`${API_PREFIX}/clientes`, clienteRoutes);
  console.log('✅ Cliente routes configured');
  app.use(`${API_PREFIX}/sedes`, sedeRoutes);
  console.log('✅ Sede routes configured');
  app.use(`${API_PREFIX}/equipos`, equipoRoutes);
  console.log('✅ Equipo routes configured');
  app.use(`${API_PREFIX}/solicitudes`, solicitudRoutes);
  console.log('✅ Solicitud routes configured');
  app.use(`${API_PREFIX}/ordenes`, ordenRoutes);
  console.log('✅ Orden routes configured');
  app.use(`${API_PREFIX}/visitas`, visitaRoutes);
  console.log('✅ Visita routes configured');
  app.use(`${API_PREFIX}/cotizaciones`, cotizacionRoutes);
  console.log('✅ Cotizacion routes configured');
  app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
  console.log('✅ Dashboard routes configured');
  app.use(`${API_PREFIX}/database`, databaseRoutes);
  console.log('✅ Database routes configured');
} catch (error) {
  console.error('❌ Error setting up routes:', error);
}

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

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