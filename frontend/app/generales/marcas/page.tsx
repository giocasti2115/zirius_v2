'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, Plus, Edit, Trash2, Search } from 'lucide-react'
import { useState } from 'react'

export default function MarcasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const marcas = [
    { id: 1, nombre: 'Philips', descripcion: 'Equipos médicos Philips Healthcare', equipos: 45, activa: true },
    { id: 2, nombre: 'GE Healthcare', descripcion: 'General Electric Healthcare', equipos: 38, activa: true },
    { id: 3, nombre: 'Siemens', descripcion: 'Siemens Healthineers', equipos: 52, activa: true },
    { id: 4, nombre: 'Mindray', descripcion: 'Mindray Medical International', equipos: 29, activa: true },
    { id: 5, nombre: 'Drager', descripcion: 'Drägerwerk AG & Co.', equipos: 23, activa: true },
    { id: 6, nombre: 'Medtronic', descripcion: 'Medtronic Medical Devices', equipos: 31, activa: true },
    { id: 7, nombre: 'BPL Medical', descripcion: 'BPL Medical Technologies', equipos: 16, activa: false },
    { id: 8, nombre: 'Nihon Kohden', descripcion: 'Nihon Kohden Corporation', equipos: 19, activa: true },
  ]

  const filteredMarcas = marcas.filter(marca => 
    marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marca.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Marcas</h2>
          <p className="text-muted-foreground">
            Administra las marcas de equipos médicos registradas en el sistema
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Marca
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar marcas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMarcas.map((marca) => (
          <Card key={marca.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {marca.nombre}
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
                {marca.descripcion}
              </CardDescription>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={marca.activa ? 'default' : 'secondary'}>
                  {marca.equipos} equipos
                </Badge>
                <Badge variant={marca.activa ? 'default' : 'outline'}>
                  {marca.activa ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {marca.id}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMarcas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron marcas que coincidan con la búsqueda.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Marcas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Marcas:</span> {marcas.length}
            </div>
            <div>
              <span className="font-medium">Marcas Activas:</span> {marcas.filter(m => m.activa).length}
            </div>
            <div>
              <span className="font-medium">Total Equipos:</span> {marcas.reduce((sum, m) => sum + m.equipos, 0)}
            </div>
            <div>
              <span className="font-medium">Promedio por Marca:</span> {Math.round(marcas.reduce((sum, m) => sum + m.equipos, 0) / marcas.length)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}