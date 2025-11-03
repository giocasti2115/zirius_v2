'use client'

import { useState } from 'react'
import { DataTable } from '@/components/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Download } from 'lucide-react'

interface WarehouseRequestsProps {
  title: string
  filterStatus?: string
}

export function WarehouseRequests({ title, filterStatus }: WarehouseRequestsProps) {
  const [selectedRequests, setSelectedRequests] = useState<any[]>([])

  const handleRowClick = (row: any) => {
    console.log('Fila clickeada:', row)
  }

  const handleEdit = (row: any) => {
    console.log('Editar solicitud:', row)
  }

  const handleView = (row: any) => {
    console.log('Ver solicitud:', row)
  }

  const handleBulkActions = () => {
    console.log('Acciones en lote para:', selectedRequests)
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Solicitud
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Gestiona las solicitudes de bodega y repuestos del sistema. 
            Puedes ver detalles, aprobar, rechazar y hacer seguimiento a cada solicitud.
          </div>
        </CardContent>
      </Card>

      {/* Tabla de datos */}
      <DataTable
        title={title}
        type="warehouse"
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onView={handleView}
      />

      {/* Información adicional */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Estados de Solicitud</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <span className="text-yellow-600">Pendiente</span>: Esperando aprobación</li>
                <li>• <span className="text-green-600">Aprobada</span>: Lista para despacho</li>
                <li>• <span className="text-blue-600">Despachada</span>: Enviada a destino</li>
                <li>• <span className="text-gray-600">Terminada</span>: Proceso completado</li>
                <li>• <span className="text-red-600">Rechazada</span>: No aprobada</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Acciones Disponibles</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Ver detalles completos de la solicitud</li>
                <li>• Editar información de repuestos</li>
                <li>• Aprobar o rechazar solicitudes</li>
                <li>• Exportar datos a Excel/PDF</li>
                <li>• Filtrar por múltiples criterios</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Información Importante</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Las solicitudes pendientes requieren aprobación</li>
                <li>• Los cambios quedan registrados en el historial</li>
                <li>• Se pueden agregar items adicionales</li>
                <li>• Cada solicitud tiene una orden relacionada</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}