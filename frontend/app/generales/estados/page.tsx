'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Plus, Edit, Trash2 } from 'lucide-react'

export default function EstadosPage() {
  const estados = [
    { id: 1, nombre: 'Activo', descripcion: 'Estado activo del sistema', color: 'success', count: 245 },
    { id: 2, nombre: 'Inactivo', descripcion: 'Estado inactivo', color: 'secondary', count: 12 },
    { id: 3, nombre: 'Pendiente', descripcion: 'En proceso de revisión', color: 'warning', count: 34 },
    { id: 4, nombre: 'Completado', descripcion: 'Proceso finalizado', color: 'default', count: 156 },
    { id: 5, nombre: 'Cancelado', descripcion: 'Proceso cancelado', color: 'destructive', count: 8 },
    { id: 6, nombre: 'En Proceso', descripcion: 'Actualmente en ejecución', color: 'default', count: 67 },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Estados</h2>
          <p className="text-muted-foreground">
            Administra los estados disponibles en el sistema
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Estado
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {estados.map((estado) => (
          <Card key={estado.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {estado.nombre}
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
                {estado.descripcion}
              </CardDescription>
              <div className="flex items-center justify-between">
                <Badge variant={estado.color as any}>
                  {estado.count} registros
                </Badge>
                <Badge variant="outline">
                  ID: {estado.id}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de Estados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Los estados son utilizados para categorizar el estatus de diferentes elementos en el sistema como solicitudes, órdenes, equipos, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}