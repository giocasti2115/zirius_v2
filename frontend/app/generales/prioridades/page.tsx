'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react'

export default function PrioridadesPage() {
  const prioridades = [
    { id: 1, nombre: 'Crítica', descripcion: 'Máxima prioridad, atención inmediata', color: 'destructive', nivel: 1, count: 15 },
    { id: 2, nombre: 'Alta', descripcion: 'Alta prioridad, resolver pronto', color: 'warning', nivel: 2, count: 43 },
    { id: 3, nombre: 'Media', descripcion: 'Prioridad estándar', color: 'default', nivel: 3, count: 127 },
    { id: 4, nombre: 'Baja', descripcion: 'Baja prioridad, resolver cuando sea posible', color: 'secondary', nivel: 4, count: 89 },
    { id: 5, nombre: 'Muy Baja', descripcion: 'Prioridad mínima', color: 'outline', nivel: 5, count: 23 },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Prioridades</h2>
          <p className="text-muted-foreground">
            Define los niveles de prioridad para solicitudes y órdenes de trabajo
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Prioridad
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prioridades.map((prioridad) => (
          <Card key={prioridad.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {prioridad.nombre}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {prioridad.descripcion}
              </CardDescription>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={prioridad.color as any}>
                  Nivel {prioridad.nivel}
                </Badge>
                <Badge variant="outline">
                  {prioridad.count} solicitudes
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {prioridad.id}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de Prioridades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Las prioridades determinan el orden de atención de las solicitudes y órdenes de trabajo. 
            Un nivel menor indica mayor prioridad.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Prioridades:</span> {prioridades.length}
            </div>
            <div>
              <span className="font-medium">Solicitudes Activas:</span> {prioridades.reduce((sum, p) => sum + p.count, 0)}
            </div>
            <div>
              <span className="font-medium">Urgentes:</span> {prioridades.filter(p => p.nivel <= 2).reduce((sum, p) => sum + p.count, 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}