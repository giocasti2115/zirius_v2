import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'ziriuzco_ziriuz_real'
};

let db: mysql.Connection;

// Conectar a la base de datos
const connectDB = async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
    process.exit(1);
  }
};

// Health check
app.get('/health', (req, res) => {
  console.log('📊 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Dar de Baja Server is running',
    timestamp: new Date().toISOString()
  });
  console.log('✅ Health check response sent');
});

// Estadísticas de Dar de Baja
app.get('/api/v1/dar-de-baja/stats', async (req, res) => {
  try {
    console.log('📊 [Dar de Baja] Obteniendo estadísticas');

    const estadisticasQuery = `
      SELECT 
        COUNT(*) as total_solicitudes,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as solicitudes_pendientes,
        SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as solicitudes_aprobadas,
        SUM(CASE WHEN estado = 'ejecutada' THEN 1 ELSE 0 END) as solicitudes_ejecutadas,
        SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as solicitudes_rechazadas,
        SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as solicitudes_en_proceso,
        SUM(CASE WHEN valor_recuperable_aprobado IS NOT NULL THEN valor_recuperable_aprobado ELSE 0 END) as valor_total_recuperable
      FROM solicitudes_baja
    `;

    const [rows] = await db.execute(estadisticasQuery);
    const stats = (rows as any[])[0];

    console.log('✅ [Dar de Baja] Estadísticas obtenidas:', stats);

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        totalSolicitudes: parseInt(stats.total_solicitudes) || 0,
        solicitudesPendientes: parseInt(stats.solicitudes_pendientes) || 0,
        solicitudesAprobadas: parseInt(stats.solicitudes_aprobadas) || 0,
        solicitudesEjecutadas: parseInt(stats.solicitudes_ejecutadas) || 0,
        solicitudesRechazadas: parseInt(stats.solicitudes_rechazadas) || 0,
        solicitudesEnProceso: parseInt(stats.solicitudes_en_proceso) || 0,
        valorTotalRecuperable: parseFloat(stats.valor_total_recuperable) || 0
      }
    });

  } catch (error) {
    console.error('❌ [Dar de Baja] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Lista de solicitudes de baja
app.get('/api/v1/dar-de-baja/public', async (req, res) => {
  try {
    console.log('🔍 [Dar de Baja] Obteniendo solicitudes de baja de la BD');
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const offset = (page - 1) * limit;

    // Construir condiciones WHERE
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    // Filtro por estado
    if (req.query.estado) {
      whereConditions.push('sb.estado = ?');
      queryParams.push(req.query.estado);
    }

    // Filtro por código de solicitud
    if (req.query.search) {
      whereConditions.push('(sb.codigo_solicitud LIKE ? OR sb.codigo_equipo LIKE ? OR sb.nombre_equipo LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Construir WHERE clause
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Query principal
    const solicitudesQuery = `
      SELECT 
        sb.*
      FROM solicitudes_baja sb
      ${whereClause}
      ORDER BY sb.fecha_solicitud DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM solicitudes_baja sb
      ${whereClause}
    `;

    console.log('📊 [Dar de Baja] Query principal:', solicitudesQuery);
    console.log('📊 [Dar de Baja] Parámetros:', queryParams);

    // Ejecutar ambas queries
    const [solicitudes] = await db.execute(solicitudesQuery, queryParams);
    const [countResult] = await db.execute(countQuery, queryParams);

    const total = (countResult as any[])[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    console.log(`✅ [Dar de Baja] Obtenidas: ${(solicitudes as any[]).length} de ${total} total`);

    // Formatear fechas
    const solicitudesFormateadas = (solicitudes as any[]).map(solicitud => ({
      ...solicitud,
      fecha_solicitud: new Date(solicitud.fecha_solicitud).toISOString(),
      fecha_aprobacion: solicitud.fecha_aprobacion ? 
        new Date(solicitud.fecha_aprobacion).toISOString() : null,
      fecha_ejecucion: solicitud.fecha_ejecucion ? 
        new Date(solicitud.fecha_ejecucion).toISOString() : null
    }));

    res.json({
      success: true,
      message: 'Solicitudes de baja obtenidas exitosamente',
      data: {
        solicitudes: solicitudesFormateadas,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('❌ [Dar de Baja] Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Obtener solicitud específica
app.get('/api/v1/dar-de-baja/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [Dar de Baja] Obteniendo solicitud ID: ${id}`);

    const solicitudQuery = `
      SELECT sb.*
      FROM solicitudes_baja sb
      WHERE sb.id = ?
    `;

    const [rows] = await db.execute(solicitudQuery, [id]);
    const solicitudes = rows as any[];

    if (!solicitudes || solicitudes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de baja no encontrada'
      });
    }

    const solicitud = solicitudes[0];

    console.log(`✅ [Dar de Baja] Solicitud obtenida: ${id}`);

    return res.json({
      success: true,
      message: 'Solicitud obtenida exitosamente',
      data: {
        ...solicitud,
        fecha_solicitud: new Date(solicitud.fecha_solicitud).toISOString(),
        fecha_aprobacion: solicitud.fecha_aprobacion ? 
          new Date(solicitud.fecha_aprobacion).toISOString() : null,
        fecha_ejecucion: solicitud.fecha_ejecucion ? 
          new Date(solicitud.fecha_ejecucion).toISOString() : null
      }
    });

  } catch (error) {
    console.error(`❌ [Dar de Baja] Error obteniendo solicitud ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Crear nueva solicitud de baja
app.post('/api/v1/dar-de-baja/public', async (req, res) => {
  try {
    console.log('📝 [Dar de Baja] Creando nueva solicitud');
    
    const {
      codigo_equipo,
      nombre_equipo,
      tipo_equipo,
      marca,
      modelo,
      numero_serie,
      ubicacion_actual,
      estado_fisico,
      tipo_baja,
      motivo_baja,
      valor_libros,
      valor_recuperable_estimado,
      usuario_solicitante,
      observaciones
    } = req.body;

    // Generar código de solicitud único
    const timestamp = Date.now();
    const codigo_solicitud = `SOL-BAJA-${timestamp}`;

    const insertQuery = `
      INSERT INTO solicitudes_baja (
        codigo_solicitud, codigo_equipo, nombre_equipo, tipo_equipo, marca, modelo,
        numero_serie, ubicacion_actual, estado_fisico, tipo_baja, motivo_baja,
        valor_libros, valor_recuperable_estimado, usuario_solicitante, observaciones,
        estado, fecha_solicitud
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())
    `;

    const [result] = await db.execute(insertQuery, [
      codigo_solicitud, codigo_equipo, nombre_equipo, tipo_equipo, marca, modelo,
      numero_serie, ubicacion_actual, estado_fisico, tipo_baja, motivo_baja,
      valor_libros, valor_recuperable_estimado, usuario_solicitante, observaciones
    ]);

    const insertId = (result as any).insertId;

    console.log(`✅ [Dar de Baja] Solicitud creada con ID: ${insertId}`);

    return res.status(201).json({
      success: true,
      message: 'Solicitud de baja creada exitosamente',
      data: {
        id: insertId,
        codigo_solicitud,
        estado: 'pendiente',
        fecha_solicitud: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [Dar de Baja] Error creando solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Inicializar servidor
const start = async () => {
  try {
    console.log('🔄 Iniciando servidor...');
    await connectDB();
    
    const server = app.listen(parseInt(PORT.toString()), () => {
      console.log('🚀 Dar de Baja Server running on port', PORT);
      console.log('🌐 Health check: http://localhost:' + PORT + '/health');
      console.log('📊 Stats endpoint: http://localhost:' + PORT + '/api/v1/dar-de-baja/stats');
      console.log('📋 Public list: http://localhost:' + PORT + '/api/v1/dar-de-baja/public');
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

console.log('📱 Configuración actual:');
console.log('- Puerto:', process.env.PORT || 3003);
console.log('- Base de datos:', process.env.DB_NAME || 'ziriuzco_ziriuz_real');
console.log('- Host DB:', process.env.DB_HOST || 'localhost');

start();