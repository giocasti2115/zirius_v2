'use client'

import { useState } from 'react'
import { EquiposTable } from '@/components/equipos/EquiposTable'
import { Equipo } from '@/lib/api/equipos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Monitor, Calendar, ArrowLeft, Building, MapPin, Settings, Wrench, AlertTriangle } from 'lucide-react'

export default function EquiposPage() {
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null)

  const handleEquipoSelect = (equipo: Equipo) => {
    setSelectedEquipo(equipo)
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activo': return 'default'
      case 'mantenimiento': return 'destructive'
      case 'inactivo': return 'secondary'
      case 'dado_baja': return 'outline'
      default: return 'secondary'
    }
  }

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'activo': return 'Activo'
      case 'mantenimiento': return 'Mantenimiento'
      case 'inactivo': return 'Inactivo'
      case 'dado_baja': return 'Dado de Baja'
      default: return estado
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (selectedEquipo) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedEquipo(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedEquipo.nombre}
            </h1>
            <p className="text-muted-foreground">
              Información detallada del equipo
            </p>
          </div>
        </div>

        {/* Equipment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Equipment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Información del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre del Equipo
                </label>
                <p className="font-medium">{selectedEquipo.nombre}</p>
              </div>
              
              {selectedEquipo.codigo_interno && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Código Interno
                  </label>
                  <p className="font-medium">{selectedEquipo.codigo_interno}</p>
                </div>
              )}

              {selectedEquipo.serie && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Número de Serie
                  </label>
                  <p className="font-medium">{selectedEquipo.serie}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Estado Actual
                </label>
                <div className="mt-1">
                  <Badge variant={getEstadoBadgeVariant(selectedEquipo.estado)}>
                    {getEstadoLabel(selectedEquipo.estado)}
                  </Badge>
                </div>
              </div>

              {selectedEquipo.ubicacion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ubicación
                  </label>
                  <p className="font-medium">{selectedEquipo.ubicacion}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de registro
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {formatDate(selectedEquipo.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Especificaciones Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEquipo.modelo_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Modelo
                  </label>
                  <p className="font-medium">{selectedEquipo.modelo_nombre}</p>
                </div>
              )}

              {selectedEquipo.marca_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Marca
                  </label>
                  <p className="font-medium">{selectedEquipo.marca_nombre}</p>
                </div>
              )}

              {selectedEquipo.tipo_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de Equipo
                  </label>
                  <p className="font-medium">{selectedEquipo.tipo_nombre}</p>
                </div>
              )}

              {selectedEquipo.fecha_instalacion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de Instalación
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {formatDate(selectedEquipo.fecha_instalacion)}
                    </p>
                  </div>
                </div>
              )}

              {selectedEquipo.fecha_garantia && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Vencimiento de Garantía
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {formatDate(selectedEquipo.fecha_garantia)}
                    </p>
                    {selectedEquipo.fecha_garantia && new Date(selectedEquipo.fecha_garantia) < new Date() && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Vencida
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Información de Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedEquipo.sede_nombre && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Sede
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{selectedEquipo.sede_nombre}</p>
                </div>
              </div>
            )}

            {selectedEquipo.cliente_nombre && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Cliente
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{selectedEquipo.cliente_nombre}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observations */}
        {selectedEquipo.observaciones && (
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{selectedEquipo.observaciones}</p>
            </CardContent>
          </Card>
        )}

        {/* Additional sections */}
        <div className="grid grid-cols-1 gap-6">
          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Historial de Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Historial completo de mantenimientos y servicios realizados
              </p>
            </CardContent>
          </Card>

          {/* Service Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Lista de solicitudes de servicio para este equipo
              </p>
            </CardContent>
          </Card>

          {/* Spare Parts */}
          <Card>
            <CardHeader>
              <CardTitle>Repuestos Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Historial de repuestos instalados en este equipo
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <EquiposTable onEquipoSelect={handleEquipoSelect} />
    </div>
  )
}