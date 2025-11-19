import { Router } from 'express';
import db from '../config/database';

const router = Router();

// Test database connection
router.get('/test', async (req, res): Promise<void> => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      res.status(503).json({
        success: false,
        message: 'No se pudo conectar a la base de datos',
        connected: false
      });
      return;
    }

    // Get database info
    const dbInfo = await db.query('SELECT DATABASE() as current_db, VERSION() as version');
    const currentDb = dbInfo[0]?.current_db;
    const version = dbInfo[0]?.version;

    console.log(`✅ Connected to database: ${currentDb} (MySQL ${version})`);

    res.status(200).json({
      success: true,
      message: 'Conexión exitosa a la base de datos',
      connected: true,
      database: currentDb,
      version: version
    });

  } catch (error) {
    console.error('❌ Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al probar la conexión',
      connected: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Get available tables
router.get('/tables', async (req, res): Promise<void> => {
  try {
    console.log('📋 Getting database tables...');
    
    const tables = await db.query('SHOW TABLES');
    const tableNames = tables.map((row: any) => Object.values(row)[0]);
    
    console.log(`📊 Found ${tableNames.length} tables`);

    res.status(200).json({
      success: true,
      message: `Se encontraron ${tableNames.length} tablas`,
      tables: tableNames
    });

  } catch (error) {
    console.error('❌ Error getting tables:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tablas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Get table structure
router.get('/tables/:tableName/structure', async (req, res): Promise<void> => {
  try {
    const { tableName } = req.params;
    console.log(`🔍 Getting structure for table: ${tableName}`);
    
    const structure = await db.query(`DESCRIBE ${tableName}`);
    const count = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    
    console.log(`📊 Table ${tableName} has ${structure.length} columns and ${count[0].count} rows`);

    res.status(200).json({
      success: true,
      message: `Estructura de la tabla ${tableName}`,
      table: tableName,
      columns: structure,
      rowCount: count[0].count
    });

  } catch (error) {
    console.error(`❌ Error getting structure for ${req.params.tableName}:`, error);
    res.status(500).json({
      success: false,
      message: `Error al obtener la estructura de la tabla ${req.params.tableName}`,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Get sample data from a table
router.get('/tables/:tableName/sample', async (req, res): Promise<void> => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Validar que limit sea un número válido
    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: 'El parámetro limit debe ser un número entre 1 y 100'
      });
      return;
    }

    // Validar nombre de tabla para prevenir SQL injection
    const validTables = ['users', 'clientes', 'equipos', 'solicitudes', 'ordenes', 'visitas', 'cotizaciones'];
    if (!validTables.includes(tableName)) {
      res.status(400).json({
        success: false,
        message: 'Tabla no válida'
      });
      return;
    }
    
    console.log(`📋 Getting sample data from table: ${tableName} (limit: ${limit})`);
    
    // Usar query directo sin parámetros prepared para LIMIT
    const sampleData = await db.query(`SELECT * FROM ${tableName} LIMIT ${limit}`);
    
    console.log(`📊 Retrieved ${Array.isArray(sampleData) ? sampleData.length : 0} sample records from ${tableName}`);

    res.status(200).json({
      success: true,
      message: `Datos de muestra de la tabla ${tableName}`,
      table: tableName,
      sampleData: sampleData,
      count: Array.isArray(sampleData) ? sampleData.length : 0
    });

  } catch (error) {
    console.error(`❌ Error getting sample data from ${req.params.tableName}:`, error);
    res.status(500).json({
      success: false,
      message: `Error al obtener datos de muestra de la tabla ${req.params.tableName}`,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;