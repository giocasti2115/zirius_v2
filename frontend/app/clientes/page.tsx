'use client'

import { useState } from 'react'
import { ClientesTable } from '@/components/clientes/ClientesTable'
import { Cliente } from '@/lib/api/clientes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building, Phone, Mail, MapPin, Calendar, ArrowLeft } from 'lucide-react'

export default function ClientesPage() {
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)

  const handleClienteSelect = (cliente: Cliente) => {
    setSelectedCliente(cliente)
  }

  if (selectedCliente) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedCliente(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedCliente.nombre}
            </h1>
            <p className="text-muted-foreground">
              Información detallada del cliente
            </p>
          </div>
        </div>

        {/* Client Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre
                </label>
                <p className="font-medium">{selectedCliente.nombre}</p>
              </div>
              
              {selectedCliente.documento && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Documento
                  </label>
                  <p className="font-medium">{selectedCliente.documento}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Estado
                </label>
                <div className="mt-1">
                  <Badge variant={selectedCliente.activo ? 'default' : 'secondary'}>
                    {selectedCliente.activo ? 'Activo' : 'Inactivo'}
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
                    {new Date(selectedCliente.created_at).toLocaleDateString('es-ES', {
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
              {selectedCliente.telefono && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Teléfono
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedCliente.telefono}</p>
                  </div>
                </div>
              )}

              {selectedCliente.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedCliente.email}</p>
                  </div>
                </div>
              )}

              {selectedCliente.direccion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Dirección
                  </label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="font-medium">{selectedCliente.direccion}</p>
                  </div>
                </div>
              )}

              {!selectedCliente.telefono && !selectedCliente.email && !selectedCliente.direccion && (
                <p className="text-muted-foreground text-sm">
                  No hay información de contacto disponible
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional sections can be added here */}
        <div className="grid grid-cols-1 gap-6">
          {/* Sedes del cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Sedes del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Lista de sedes asociadas a este cliente
              </p>
            </CardContent>
          </Card>

          {/* Equipos del cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Equipos del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Lista de equipos asociados a este cliente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <ClientesTable onClienteSelect={handleClienteSelect} />
    </div>
  )
}