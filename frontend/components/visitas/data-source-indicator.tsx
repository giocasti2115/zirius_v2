'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Database, Server } from "lucide-react";

interface DataSourceIndicatorProps {
  isUsingMockData: boolean;
  totalRecords: number;
  apiStatus?: 'connected' | 'error' | 'loading';
}

export function DataSourceIndicator({ 
  isUsingMockData, 
  totalRecords, 
  apiStatus = 'loading' 
}: DataSourceIndicatorProps) {
  return (
    <div className="mb-4 space-y-2">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Estado de datos:</span>
              {isUsingMockData ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Datos de demostración
                </Badge>
              ) : (
                <Badge variant="default" className="flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  Datos reales de BD
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {totalRecords.toLocaleString()} registros
            </div>
          </div>
          
          {isUsingMockData && (
            <div className="mt-2 text-xs text-muted-foreground">
              La tabla está mostrando datos de demostración porque el API backend no está disponible.
              La base de datos real contiene 337,374 visitas técnicas.
            </div>
          )}
          
          {!isUsingMockData && (
            <div className="mt-2 text-xs text-muted-foreground">
              Conectado a la base de datos real. Los datos mostrados corresponden a visitas técnicas reales.
            </div>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
        <strong>Formato de tabla:</strong> Esta tabla utiliza los componentes shadcn/ui (Table, Card, Badge) 
        con diseño responsive, scrolling vertical (max-height: 500px), headers fijos, 
        y paginación integrada para mantener consistencia con otros módulos del sistema.
      </div>
    </div>
  );
}