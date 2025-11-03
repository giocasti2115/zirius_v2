import fs from 'fs';
import path from 'path';
import Database from '../config/database';

interface Migration {
  file: string;
  sql: string;
}

class MigrationRunner {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = path.join(__dirname, '..', '..', 'migrations');
  }

  async runMigrations(): Promise<void> {
    try {
      console.log('🚀 Iniciando migración de base de datos...');
      
      // Test database connection
      const isConnected = await Database.testConnection();
      if (!isConnected) {
        throw new Error('No se pudo conectar a la base de datos');
      }

      // Get all migration files
      const migrations = await this.getMigrationFiles();
      
      if (migrations.length === 0) {
        console.log('ℹ️  No se encontraron archivos de migración');
        return;
      }

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Run each migration
      for (const migration of migrations) {
        await this.runSingleMigration(migration);
      }

      console.log('✅ Todas las migraciones se ejecutaron exitosamente');
      
    } catch (error) {
      console.error('❌ Error ejecutando migraciones:', error);
      throw error;
    }
  }

  private async getMigrationFiles(): Promise<Migration[]> {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      const migrations: Migration[] = [];

      for (const file of files) {
        const filePath = path.join(this.migrationsPath, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        migrations.push({ file, sql });
      }

      return migrations;
    } catch (error) {
      console.error('Error leyendo archivos de migración:', error);
      return [];
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await Database.query(sql);
    console.log('📋 Tabla de migraciones verificada');
  }

  private async runSingleMigration(migration: Migration): Promise<void> {
    try {
      // Check if migration already executed
      const existingMigration = await Database.query(
        'SELECT * FROM migrations WHERE filename = ?',
        [migration.file]
      );

      if (existingMigration.length > 0) {
        console.log(`⏭️  Migración ${migration.file} ya fue ejecutada`);
        return;
      }

      console.log(`▶️  Ejecutando migración: ${migration.file}`);

      // Split SQL into individual statements
      const statements = this.splitSqlStatements(migration.sql);

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          await Database.query(statement);
        }
      }

      // Mark migration as executed
      await Database.query(
        'INSERT INTO migrations (filename) VALUES (?)',
        [migration.file]
      );

      console.log(`✅ Migración ${migration.file} ejecutada exitosamente`);

    } catch (error) {
      console.error(`❌ Error ejecutando migración ${migration.file}:`, error);
      throw error;
    }
  }

  private splitSqlStatements(sql: string): string[] {
    // Remove comments and split by semicolon
    const cleaned = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    return cleaned
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
  }

  async rollbackLastMigration(): Promise<void> {
    try {
      const lastMigration = await Database.query(
        'SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 1'
      );

      if (lastMigration.length === 0) {
        console.log('ℹ️  No hay migraciones para hacer rollback');
        return;
      }

      const migration = lastMigration[0];
      console.log(`🔄 Haciendo rollback de: ${migration.filename}`);

      // For this example, we'll just remove the migration record
      // In a real scenario, you'd have rollback SQL files
      await Database.query(
        'DELETE FROM migrations WHERE filename = ?',
        [migration.filename]
      );

      console.log(`✅ Rollback de ${migration.filename} completado`);

    } catch (error) {
      console.error('❌ Error haciendo rollback:', error);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<void> {
    try {
      const migrations = await Database.query(
        'SELECT * FROM migrations ORDER BY executed_at ASC'
      );

      console.log('\n📊 Estado de Migraciones:');
      console.log('========================');
      
      if (migrations.length === 0) {
        console.log('ℹ️  No se han ejecutado migraciones');
        return;
      }

      migrations.forEach((migration: any, index: number) => {
        console.log(`${index + 1}. ${migration.filename} - ${migration.executed_at}`);
      });

    } catch (error) {
      console.error('❌ Error obteniendo estado de migraciones:', error);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const runner = new MigrationRunner();
  const command = process.argv[2];

  switch (command) {
    case 'run':
      runner.runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    
    case 'rollback':
      runner.rollbackLastMigration()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    
    case 'status':
      runner.getMigrationStatus()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    
    default:
      console.log('Uso: npm run migrate [run|rollback|status]');
      console.log('  run      - Ejecutar migraciones pendientes');
      console.log('  rollback - Hacer rollback de la última migración');
      console.log('  status   - Ver estado de migraciones');
      process.exit(1);
  }
}

export default MigrationRunner;