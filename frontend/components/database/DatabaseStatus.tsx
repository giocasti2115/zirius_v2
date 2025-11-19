'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, CheckCircle, XCircle, AlertCircle, Table, Server } from 'lucide-react';

interface DatabaseInfo {
  connected: boolean;
  database?: string;
  version?: string;
  tables?: string[];
  error?: string;
}

export function DatabaseStatus() {
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      // Test basic connection
      const response = await fetch('http://localhost:3002/api/v1/database/test');
      const data = await response.json();
      
      if (data.connected) {
        // If connected, also get tables
        try {
          const tablesResponse = await fetch('http://localhost:3002/api/v1/database/tables');
          const tablesData = await tablesResponse.json();
          
          setDatabaseInfo({
            connected: true,
            database: data.database,
            version: data.version,
            tables: tablesData.success ? tablesData.tables : []
          });
        } catch {
          setDatabaseInfo({
            connected: true,
            database: data.database,
            version: data.version,
            tables: []
          });
        }
      } else {
        setDatabaseInfo({
          connected: false,
          error: data.message || 'No se pudo conectar'
        });
      }
    } catch (error) {
      setDatabaseInfo({
        connected: false,
        error: 'Error al conectar con el backend'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de la Base de Datos
        </CardTitle>
        <CardDescription>
          Verificar la conexión con la base de datos de producción
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testDatabaseConnection}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
              Probando conexión...
            </>
          ) : (
            <>
              <Server className="mr-2 h-4 w-4" />
              Probar Conexión con Base de Datos
            </>
          )}
        </Button>

        {databaseInfo && (
          <div className="space-y-4">
            <Alert variant={databaseInfo.connected ? "default" : "destructive"}>
              {databaseInfo.connected ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {databaseInfo.connected ? 'Conexión Exitosa' : 'Conexión Fallida'}
              </AlertTitle>
              <AlertDescription>
                {databaseInfo.connected ? (
                  <>
                    Conectado exitosamente a la base de datos de producción.
                    {databaseInfo.database && (
                      <> Base de datos: <strong>{databaseInfo.database}</strong></>
                    )}
                    {databaseInfo.version && (
                      <> (MySQL {databaseInfo.version})</>
                    )}
                  </>
                ) : (
                  <>
                    {databaseInfo.error || 'No se pudo establecer conexión con la base de datos.'}
                    <br />
                    <strong>Actualmente usando datos de prueba (mock data).</strong>
                  </>
                )}
              </AlertDescription>
            </Alert>

            {databaseInfo.connected && databaseInfo.tables && databaseInfo.tables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Table className="h-4 w-4" />
                    Tablas Disponibles ({databaseInfo.tables.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {databaseInfo.tables.map((table) => (
                      <Badge key={table} variant="secondary">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!databaseInfo.connected && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    Configuración de Base de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Host:</strong> localhost</div>
                    <div><strong>Puerto:</strong> 3306</div>
                    <div><strong>Usuario:</strong> root</div>
                    <div><strong>Base de Datos:</strong> ziriuzco_ziriuz</div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-xs">
                      <strong>Para conectar con datos de producción:</strong><br />
                      1. Instalar MySQL Server<br />
                      2. Crear la base de datos 'ziriuzco_ziriuz'<br />
                      3. Configurar las credenciales en el archivo .env<br />
                      4. Reiniciar el servidor backend
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}