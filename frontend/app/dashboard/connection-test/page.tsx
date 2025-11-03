import { DatabaseStatus } from '../../../components/database/DatabaseStatus';

export default function ConnectionTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Prueba de Conexión
        </h1>
        <p className="text-muted-foreground">
          Verificar el estado de la conexión con la base de datos de producción
        </p>
      </div>

      <div className="flex justify-center">
        <DatabaseStatus />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Estado Actual</h2>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Frontend:</span>
              <span className="text-green-600">✓ Corriendo (Puerto 3001)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Backend:</span>
              <span className="text-green-600">✓ Corriendo (Puerto 3002)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Base de Datos:</span>
              <span className="text-amber-600">⚠ Datos de prueba</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Configuración de Producción</h2>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="text-sm space-y-1">
              <p><strong>Host:</strong> localhost</p>
              <p><strong>Puerto:</strong> 3306</p>
              <p><strong>Base de Datos:</strong> ziriuzco_ziriuz</p>
              <p><strong>Usuario:</strong> root</p>
            </div>
            <div className="mt-4 p-3 bg-muted rounded text-xs">
              Para conectar con datos reales, asegúrate de que MySQL esté instalado
              y ejecutándose con la base de datos configurada.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}