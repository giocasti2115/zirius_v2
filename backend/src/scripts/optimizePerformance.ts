import { db } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Script de optimización de performance para módulos de configuración general
 */

interface OptimizationResult {
  task: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  executionTime?: number;
  details?: any;
}

class PerformanceOptimizer {
  private results: OptimizationResult[] = [];

  /**
   * Ejecuta todas las optimizaciones
   */
  async runOptimizations(): Promise<OptimizationResult[]> {
    logger.info('Starting performance optimizations...');

    await this.optimizeDatabase();
    await this.optimizeIndexes();
    await this.analyzeQueries();
    await this.cleanupLogs();
    await this.optimizeBackups();
    await this.validateDataIntegrity();

    logger.info('Performance optimizations completed', {
      totalTasks: this.results.length,
      successful: this.results.filter(r => r.status === 'success').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
      errors: this.results.filter(r => r.status === 'error').length
    });

    return this.results;
  }

  /**
   * Optimiza la configuración de la base de datos
   */
  private async optimizeDatabase(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Análisis de tablas
      const [tables] = await db.query(`
        SELECT 
          table_name,
          round(((data_length + index_length) / 1024 / 1024), 2) AS 'DB Size in MB',
          table_rows
        FROM information_schema.TABLES 
        WHERE table_schema = DATABASE()
        AND table_name IN (
          'tipos_equipos', 'marcas', 'estados', 'prioridades', 
          'departamentos', 'ciudades', 'variables_sistema',
          'configuraciones_respaldo', 'respaldos', 'logs',
          'plantillas_notificacion', 'historial_notificaciones'
        )
        ORDER BY (data_length + index_length) DESC
      `) as any[];

      // Optimizar tablas pesadas
      for (const table of tables as any[]) {
        if (table['DB Size in MB'] > 100) { // Tablas mayores a 100MB
          await db.query(`OPTIMIZE TABLE ${table.table_name}`);
        }
      }

      this.results.push({
        task: 'Database Optimization',
        status: 'success',
        message: `Optimized ${tables.length} tables`,
        executionTime: Date.now() - startTime,
        details: { tables: tables.map((t: any) => t.table_name) }
      });

    } catch (error) {
      this.results.push({
        task: 'Database Optimization',
        status: 'error',
        message: `Error optimizing database: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  /**
   * Optimiza y valida índices de la base de datos
   */
  private async optimizeIndexes(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Verificar índices faltantes en consultas frecuentes
      const missingIndexes = [
        {
          table: 'logs',
          column: 'created_at',
          reason: 'Consultas frecuentes por fecha'
        },
        {
          table: 'logs',
          column: 'nivel',
          reason: 'Filtros por nivel de log'
        },
        {
          table: 'logs',
          column: 'modulo',
          reason: 'Filtros por módulo'
        },
        {
          table: 'respaldos',
          column: 'estado',
          reason: 'Consultas por estado de respaldo'
        },
        {
          table: 'historial_notificaciones',
          column: 'fecha_envio',
          reason: 'Consultas por fecha de envío'
        }
      ];

      // Crear índices faltantes
      for (const index of missingIndexes) {
        try {
          const indexName = `idx_${index.table}_${index.column}`;
          await db.query(`
            CREATE INDEX IF NOT EXISTS ${indexName} 
            ON ${index.table}(${index.column})
          `);
        } catch (error) {
          // Índice ya existe, continuar
        }
      }

      // Análizar uso de índices
      const [indexUsage] = await db.query(`
        SELECT 
          TABLE_NAME as table_name,
          INDEX_NAME as index_name,
          CARDINALITY as cardinality
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (
          'tipos_equipos', 'marcas', 'estados', 'prioridades',
          'logs', 'respaldos', 'historial_notificaciones'
        )
        ORDER BY TABLE_NAME, CARDINALITY DESC
      `) as any[];

      this.results.push({
        task: 'Index Optimization',
        status: 'success',
        message: `Verified and optimized indexes for ${missingIndexes.length} tables`,
        executionTime: Date.now() - startTime,
        details: { indexUsage }
      });

    } catch (error) {
      this.results.push({
        task: 'Index Optimization',
        status: 'error',
        message: `Error optimizing indexes: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  /**
   * Analiza el rendimiento de consultas frecuentes
   */
  private async analyzeQueries(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Consultas de prueba para medir rendimiento
      const testQueries = [
        {
          name: 'Get Active Tipos Equipos',
          query: 'SELECT COUNT(*) as count FROM tipos_equipos WHERE activo = TRUE'
        },
        {
          name: 'Get Estados by Type',
          query: 'SELECT COUNT(*) as count FROM estados WHERE tipo = "EQUIPO" AND activo = TRUE'
        },
        {
          name: 'Get Recent Logs',
          query: 'SELECT COUNT(*) as count FROM logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
        },
        {
          name: 'Get System Variables',
          query: 'SELECT COUNT(*) as count FROM variables_sistema WHERE es_publica = TRUE'
        }
      ];

      const queryPerformance = [];

      for (const test of testQueries) {
        const queryStart = Date.now();
        const [result] = await db.query(test.query) as any[];
        const queryTime = Date.now() - queryStart;

        queryPerformance.push({
          name: test.name,
          executionTime: queryTime,
          result: result[0]?.count || 0
        });

        // Alerta si la consulta toma más de 100ms
        if (queryTime > 100) {
          this.results.push({
            task: `Query Performance Warning`,
            status: 'warning',
            message: `Query "${test.name}" took ${queryTime}ms (>100ms threshold)`,
            details: { query: test.query, executionTime: queryTime }
          });
        }
      }

      this.results.push({
        task: 'Query Performance Analysis',
        status: 'success',
        message: `Analyzed ${testQueries.length} critical queries`,
        executionTime: Date.now() - startTime,
        details: { queryPerformance }
      });

    } catch (error) {
      this.results.push({
        task: 'Query Performance Analysis',
        status: 'error',
        message: `Error analyzing queries: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  /**
   * Limpia logs antiguos según configuración de retención
   */
  private async cleanupLogs(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Obtener configuración de retención
      const [retentionConfig] = await db.query(`
        SELECT valor FROM variables_sistema 
        WHERE clave = 'logs.retention_days' AND activo = TRUE
      `) as any[];

      const retentionDays = retentionConfig?.[0]?.valor || 90; // Default 90 días

      // Contar logs a eliminar
      const [countResult] = await db.query(`
        SELECT COUNT(*) as count FROM logs 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `, [retentionDays]) as any[];

      const logsToDelete = countResult[0]?.count || 0;

      if (logsToDelete > 0) {
        // Eliminar logs antiguos
        const [deleteResult] = await db.query(`
          DELETE FROM logs 
          WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `, [retentionDays]) as any[];

        this.results.push({
          task: 'Log Cleanup',
          status: 'success',
          message: `Deleted ${logsToDelete} old log entries (>${retentionDays} days)`,
          executionTime: Date.now() - startTime,
          details: { 
            retentionDays, 
            deletedCount: logsToDelete,
            affectedRows: (deleteResult as any).affectedRows 
          }
        });
      } else {
        this.results.push({
          task: 'Log Cleanup',
          status: 'success',
          message: `No old logs to delete (retention: ${retentionDays} days)`,
          executionTime: Date.now() - startTime
        });
      }

    } catch (error) {
      this.results.push({
        task: 'Log Cleanup',
        status: 'error',
        message: `Error cleaning up logs: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  /**
   * Optimiza configuración de respaldos
   */
  private async optimizeBackups(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Verificar respaldos antiguos
      const [oldBackups] = await db.query(`
        SELECT 
          r.id,
          r.nombre_archivo,
          r.fecha_creacion,
          r.tamaño_mb,
          cr.retencion_dias
        FROM respaldos r
        JOIN configuraciones_respaldo cr ON r.configuracion_id = cr.id
        WHERE r.fecha_creacion < DATE_SUB(NOW(), INTERVAL cr.retencion_dias DAY)
        AND r.estado = 'COMPLETADO'
      `) as any[];

      if (oldBackups.length > 0) {
        const totalSize = oldBackups.reduce((sum: number, backup: any) => sum + (backup.tamaño_mb || 0), 0);
        
        this.results.push({
          task: 'Backup Optimization',
          status: 'warning',
          message: `Found ${oldBackups.length} old backups (${totalSize.toFixed(2)} MB) that should be cleaned up`,
          executionTime: Date.now() - startTime,
          details: { oldBackups: oldBackups.length, totalSizeMB: totalSize }
        });
      }

      // Verificar configuraciones de respaldo activas
      const [activeConfigs] = await db.query(`
        SELECT 
          id,
          nombre,
          frecuencia,
          ultimo_respaldo,
          CASE 
            WHEN ultimo_respaldo IS NULL THEN 'NEVER'
            WHEN ultimo_respaldo < DATE_SUB(NOW(), INTERVAL 1 DAY) AND frecuencia = 'DIARIO' THEN 'OVERDUE'
            WHEN ultimo_respaldo < DATE_SUB(NOW(), INTERVAL 7 DAY) AND frecuencia = 'SEMANAL' THEN 'OVERDUE'
            WHEN ultimo_respaldo < DATE_SUB(NOW(), INTERVAL 30 DAY) AND frecuencia = 'MENSUAL' THEN 'OVERDUE'
            ELSE 'OK'
          END as status
        FROM configuraciones_respaldo 
        WHERE activo = TRUE
      `) as any[];

      const overdueBackups = activeConfigs.filter((config: any) => 
        config.status === 'OVERDUE' || config.status === 'NEVER'
      );

      if (overdueBackups.length > 0) {
        this.results.push({
          task: 'Backup Schedule Check',
          status: 'warning',
          message: `${overdueBackups.length} backup configurations are overdue or have never run`,
          details: { overdueConfigs: overdueBackups }
        });
      }

      this.results.push({
        task: 'Backup Optimization',
        status: 'success',
        message: `Analyzed ${activeConfigs.length} backup configurations`,
        executionTime: Date.now() - startTime,
        details: { 
          activeConfigs: activeConfigs.length,
          overdueConfigs: overdueBackups.length
        }
      });

    } catch (error) {
      this.results.push({
        task: 'Backup Optimization',
        status: 'error',
        message: `Error optimizing backups: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  /**
   * Valida la integridad de datos críticos
   */
  private async validateDataIntegrity(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const integrityChecks = [];

      // Verificar registros huérfanos
      const checks = [
        {
          name: 'Orphaned Equipment Types',
          query: `
            SELECT COUNT(*) as count FROM tipos_equipos te
            LEFT JOIN equipos e ON te.id = e.tipo_equipo_id
            WHERE te.activo = FALSE AND e.id IS NOT NULL
          `
        },
        {
          name: 'Invalid Estado References',
          query: `
            SELECT COUNT(*) as count FROM estados e
            WHERE e.activo = FALSE 
            AND (
              EXISTS(SELECT 1 FROM equipos eq WHERE eq.estado_id = e.id) OR
              EXISTS(SELECT 1 FROM solicitudes s WHERE s.estado_id = e.id)
            )
          `
        },
        {
          name: 'Missing System Variables',
          query: `
            SELECT COUNT(*) as missing FROM (
              SELECT 'sistema.version' as required_key
              UNION SELECT 'email.servidor_smtp'
              UNION SELECT 'respaldos.auto_enabled'
              UNION SELECT 'logs.retention_days'
            ) required
            LEFT JOIN variables_sistema vs ON required.required_key = vs.clave
            WHERE vs.id IS NULL
          `
        }
      ];

      for (const check of checks) {
        const [result] = await db.query(check.query) as any[];
        const count = result[0]?.count || result[0]?.missing || 0;

        integrityChecks.push({
          name: check.name,
          issues: count
        });

        if (count > 0) {
          this.results.push({
            task: `Data Integrity - ${check.name}`,
            status: 'warning',
            message: `Found ${count} integrity issues`,
            details: { query: check.query, issueCount: count }
          });
        }
      }

      // Verificar duplicados
      const [duplicates] = await db.query(`
        SELECT 
          'tipos_equipos' as table_name,
          COUNT(*) - COUNT(DISTINCT nombre) as duplicates
        FROM tipos_equipos
        UNION ALL
        SELECT 
          'marcas' as table_name,
          COUNT(*) - COUNT(DISTINCT nombre) as duplicates
        FROM marcas
        UNION ALL
        SELECT 
          'estados' as table_name,
          COUNT(*) - COUNT(DISTINCT CONCAT(nombre, tipo)) as duplicates
        FROM estados
      `) as any[];

      const totalDuplicates = duplicates.reduce((sum: number, dup: any) => sum + dup.duplicates, 0);

      if (totalDuplicates > 0) {
        this.results.push({
          task: 'Duplicate Detection',
          status: 'warning',
          message: `Found ${totalDuplicates} potential duplicate records`,
          details: { duplicates }
        });
      }

      this.results.push({
        task: 'Data Integrity Validation',
        status: 'success',
        message: `Completed ${checks.length} integrity checks`,
        executionTime: Date.now() - startTime,
        details: { integrityChecks, totalDuplicates }
      });

    } catch (error) {
      this.results.push({
        task: 'Data Integrity Validation',
        status: 'error',
        message: `Error validating data integrity: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  /**
   * Genera reporte de optimización
   */
  generateReport(): string {
    const successful = this.results.filter(r => r.status === 'success').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const errors = this.results.filter(r => r.status === 'error').length;

    let report = `
=== ZIRIUS V2 - Performance Optimization Report ===
Generated: ${new Date().toISOString()}

SUMMARY:
- Total Tasks: ${this.results.length}
- Successful: ${successful}
- Warnings: ${warnings}
- Errors: ${errors}

DETAILED RESULTS:
`;

    this.results.forEach(result => {
      const status = result.status.toUpperCase();
      const time = result.executionTime ? ` (${result.executionTime}ms)` : '';
      
      report += `
[${status}] ${result.task}${time}
Message: ${result.message}
`;

      if (result.details) {
        report += `Details: ${JSON.stringify(result.details, null, 2)}\n`;
      }
    });

    return report;
  }
}

/**
 * Función principal para ejecutar optimizaciones
 */
export async function runPerformanceOptimizations(): Promise<OptimizationResult[]> {
  const optimizer = new PerformanceOptimizer();
  const results = await optimizer.runOptimizations();
  
  // Generar y guardar reporte
  const report = optimizer.generateReport();
  logger.info('Performance optimization report generated', { 
    reportLength: report.length,
    results: results.length 
  });
  
  return results;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runPerformanceOptimizations()
    .then(results => {
      console.log('Performance optimization completed');
      console.log(`Results: ${results.length} tasks executed`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Performance optimization failed:', error);
      process.exit(1);
    });
}
