'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit2, Trash2, MapPin, Building2 } from 'lucide-react'

interface Ciudad {
  id: number
  nombre: string
  departamento_id: number
  departamento_nombre: string
  codigo_dane: string
  poblacion: number
  altitud: number
  activo: boolean
  created_at: string
  updated_at: string
}

interface Departamento {
  id: number
  nombre: string
  codigo_dane: string
}

export default function CiudadesPage() {
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [newCiudad, setNewCiudad] = useState({
    nombre: '',
    departamento_id: '',
    codigo_dane: '',
    poblacion: '',
    altitud: ''
  })

  // Datos de ejemplo de ciudades de Colombia
  useEffect(() => {
    const departamentosEjemplo: Departamento[] = [
      { id: 1, nombre: 'Antioquia', codigo_dane: '05' },
      { id: 2, nombre: 'Cundinamarca', codigo_dane: '25' },
      { id: 3, nombre: 'Valle del Cauca', codigo_dane: '76' },
      { id: 4, nombre: 'Atlántico', codigo_dane: '08' },
      { id: 5, nombre: 'Santander', codigo_dane: '68' }
    ]

    const ciudadesEjemplo: Ciudad[] = [
      {
        id: 1,
        nombre: 'Medellín',
        departamento_id: 1,
        departamento_nombre: 'Antioquia',
        codigo_dane: '05001',
        poblacion: 2533424,
        altitud: 1495,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Bogotá D.C.',
        departamento_id: 2,
        departamento_nombre: 'Cundinamarca',
        codigo_dane: '11001',
        poblacion: 7413000,
        altitud: 2640,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 3,
        nombre: 'Cali',
        departamento_id: 3,
        departamento_nombre: 'Valle del Cauca',
        codigo_dane: '76001',
        poblacion: 2228381,
        altitud: 1018,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 4,
        nombre: 'Barranquilla',
        departamento_id: 4,
        departamento_nombre: 'Atlántico',
        codigo_dane: '08001',
        poblacion: 1274250,
        altitud: 18,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 5,
        nombre: 'Bucaramanga',
        departamento_id: 5,
        departamento_nombre: 'Santander',
        codigo_dane: '68001',
        poblacion: 613000,
        altitud: 959,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 6,
        nombre: 'Bello',
        departamento_id: 1,
        departamento_nombre: 'Antioquia',
        codigo_dane: '05088',
        poblacion: 493553,
        altitud: 1327,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 7,
        nombre: 'Envigado',
        departamento_id: 1,
        departamento_nombre: 'Antioquia',
        codigo_dane: '05266',
        poblacion: 238883,
        altitud: 1575,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ]

    setCiudades(ciudadesEjemplo)
    setDepartamentos(departamentosEjemplo)
    setLoading(false)
  }, [])

  const ciudadesFiltradas = ciudades.filter(ciudad => {
    const matchSearch = ciudad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ciudad.departamento_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ciudad.codigo_dane.includes(searchTerm)
    const matchDepartamento = !filtroDepartamento || ciudad.departamento_id.toString() === filtroDepartamento
    
    return matchSearch && matchDepartamento
  })

  const handleCreateCiudad = () => {
    if (!newCiudad.nombre || !newCiudad.departamento_id || !newCiudad.codigo_dane) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const departamentoSeleccionado = departamentos.find(d => d.id.toString() === newCiudad.departamento_id)

    const nuevaCiudad: Ciudad = {
      id: Math.max(...ciudades.map(c => c.id)) + 1,
      nombre: newCiudad.nombre,
      departamento_id: parseInt(newCiudad.departamento_id),
      departamento_nombre: departamentoSeleccionado?.nombre || '',
      codigo_dane: newCiudad.codigo_dane,
      poblacion: parseInt(newCiudad.poblacion) || 0,
      altitud: parseInt(newCiudad.altitud) || 0,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setCiudades([...ciudades, nuevaCiudad])
    setNewCiudad({
      nombre: '',
      departamento_id: '',
      codigo_dane: '',
      poblacion: '',
      altitud: ''
    })
    setIsCreateDialogOpen(false)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-CO')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ciudades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ciudades</h2>
          <p className="text-muted-foreground">
            Gestión del catálogo de ciudades de Colombia
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Ciudad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Ciudad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Ciudad *</Label>
                <Input
                  id="nombre"
                  value={newCiudad.nombre}
                  onChange={(e) => setNewCiudad({...newCiudad, nombre: e.target.value})}
                  placeholder="Ej: Medellín"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departamento">Departamento *</Label>
                  <Select
                    value={newCiudad.departamento_id}
                    onValueChange={(value) => setNewCiudad({...newCiudad, departamento_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="codigo_dane">Código DANE *</Label>
                  <Input
                    id="codigo_dane"
                    value={newCiudad.codigo_dane}
                    onChange={(e) => setNewCiudad({...newCiudad, codigo_dane: e.target.value})}
                    placeholder="Ej: 05001"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="poblacion">Población</Label>
                  <Input
                    id="poblacion"
                    type="number"
                    value={newCiudad.poblacion}
                    onChange={(e) => setNewCiudad({...newCiudad, poblacion: e.target.value})}
                    placeholder="Ej: 2533424"
                  />
                </div>
                
                <div>
                  <Label htmlFor="altitud">Altitud (msnm)</Label>
                  <Input
                    id="altitud"
                    type="number"
                    value={newCiudad.altitud}
                    onChange={(e) => setNewCiudad({...newCiudad, altitud: e.target.value})}
                    placeholder="Ej: 1495"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCiudad}>
                  Crear Ciudad
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{ciudades.length}</p>
                <p className="text-sm text-gray-600">Total Ciudades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{departamentos.length}</p>
                <p className="text-sm text-gray-600">Departamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{ciudades.filter(c => c.activo).length}</p>
                <p className="text-sm text-gray-600">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(ciudades.reduce((sum, c) => sum + c.poblacion, 0))}
                </p>
                <p className="text-sm text-gray-600">Población Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ciudades por nombre, departamento o código DANE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los departamentos</SelectItem>
                {departamentos.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ciudades */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ciudadesFiltradas.map((ciudad) => (
          <Card key={ciudad.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{ciudad.nombre}</CardTitle>
                <Badge variant={ciudad.activo ? "default" : "secondary"}>
                  {ciudad.activo ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {ciudad.departamento_nombre}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  DANE: {ciudad.codigo_dane}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Población:</span>
                    <p className="text-gray-900">{formatNumber(ciudad.poblacion)} hab.</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Altitud:</span>
                    <p className="text-gray-900">{formatNumber(ciudad.altitud)} msnm</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ciudadesFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No se encontraron ciudades</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filtroDepartamento 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay ciudades registradas en el sistema'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}