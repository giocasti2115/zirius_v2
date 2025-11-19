'use client'

import { useState } from 'react'
import { SedesTable } from '@/components/sedes/SedesTable'
import { Sede } from '@/lib/api/sedes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, User, Calendar, ArrowLeft, Building } from 'lucide-react'

export default function SedesPage() {
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null)

  const handleSedeSelect = (sede: Sede) => {
    setSelectedSede(sede)
  }

  if (selectedSede) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedSede(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedSede.nombre}
            </h1>
            <p className="text-muted-foreground">
              Información detallada de la sede
            </p>
          </div>
        </div>

        {/* Sede Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de la Sede
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre de la Sede
                </label>
                <p className="font-medium">{selectedSede.nombre}</p>
              </div>
              
              {selectedSede.direccion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Dirección
                  </label>
                  <p className="font-medium">{selectedSede.direccion}</p>
                </div>
              )}

              {(selectedSede.ciudad || selectedSede.departamento) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ubicación
                  </label>
                  <p className="font-medium">
                    {selectedSede.ciudad && selectedSede.departamento 
                      ? `${selectedSede.ciudad}, ${selectedSede.departamento}`
                      : selectedSede.ciudad || selectedSede.departamento
                    }
                  </p>
                </div>
              )}

              {selectedSede.codigo_postal && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Código Postal
                  </label>
                  <p className="font-medium">{selectedSede.codigo_postal}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Estado
                </label>
                <div className="mt-1">
                  <Badge variant={selectedSede.activo ? 'default' : 'secondary'}>
                    {selectedSede.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de registro
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {new Date(selectedSede.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSede.contacto_principal && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Contacto Principal
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedSede.contacto_principal}</p>
                  </div>
                </div>
              )}

              {selectedSede.telefono && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Teléfono
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedSede.telefono}</p>
                  </div>
                </div>
              )}

              {selectedSede.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedSede.email}</p>
                  </div>
                </div>
              )}

              {selectedSede.cliente_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Cliente
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedSede.cliente_nombre}</p>
                  </div>
                </div>
              )}

              {!selectedSede.contacto_principal && !selectedSede.telefono && !selectedSede.email && (
                <p className="text-muted-foreground text-sm">
                  No hay información de contacto disponible
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional sections */}
        <div className="grid grid-cols-1 gap-6">
          {/* Equipos de la sede */}
          <Card>
            <CardHeader>
              <CardTitle>Equipos de la Sede</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Lista de equipos instalados en esta sede
              </p>
            </CardContent>
          </Card>

          {/* Historial de servicios */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Historial de servicios realizados en esta sede
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <SedesTable onSedeSelect={handleSedeSelect} />
    </div>
  )
}