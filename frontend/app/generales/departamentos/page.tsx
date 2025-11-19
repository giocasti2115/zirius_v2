'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Edit2, Trash2, MapPin, Building2, Users } from 'lucide-react'

interface Departamento {
  id: number
  nombre: string
  codigo_dane: string
  region: string
  capital: string
  superficie: number
  poblacion: number
  ciudades_count: number
  activo: boolean
  created_at: string
  updated_at: string
}

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroRegion, setFiltroRegion] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [newDepartamento, setNewDepartamento] = useState({
    nombre: '',
    codigo_dane: '',
    region: '',
    capital: '',
    superficie: '',
    poblacion: ''
  })

  const regiones = [
    'Región Andina',
    'Región Caribe',
    'Región Pacífica',
    'Región Orinoquía',
    'Región Amazonía',
    'Región Insular'
  ]

  // Datos de ejemplo de departamentos de Colombia
  useEffect(() => {
    const departamentosEjemplo: Departamento[] = [
      {
        id: 1,
        nombre: 'Antioquia',
        codigo_dane: '05',
        region: 'Región Andina',
        capital: 'Medellín',
        superficie: 63612,
        poblacion: 6677930,
        ciudades_count: 125,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Cundinamarca',
        codigo_dane: '25',
        region: 'Región Andina',
        capital: 'Bogotá D.C.',
        superficie: 24210,
        poblacion: 2919060,
        ciudades_count: 116,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 3,
        nombre: 'Valle del Cauca',
        codigo_dane: '76',
        region: 'Región Pacífica',
        capital: 'Cali',
        superficie: 22140,
        poblacion: 4613684,
        ciudades_count: 42,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 4,
        nombre: 'Atlántico',
        codigo_dane: '08',
        region: 'Región Caribe',
        capital: 'Barranquilla',
        superficie: 3388,
        poblacion: 2535517,
        ciudades_count: 23,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 5,
        nombre: 'Santander',
        codigo_dane: '68',
        region: 'Región Andina',
        capital: 'Bucaramanga',
        superficie: 30537,
        poblacion: 2184837,
        ciudades_count: 87,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 6,
        nombre: 'Bolívar',
        codigo_dane: '13',
        region: 'Región Caribe',
        capital: 'Cartagena',
        superficie: 25978,
        poblacion: 2097162,
        ciudades_count: 46,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 7,
        nombre: 'Nariño',
        codigo_dane: '52',
        region: 'Región Pacífica',
        capital: 'Pasto',
        superficie: 33268,
        poblacion: 1744275,
        ciudades_count: 64,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 8,
        nombre: 'Córdoba',
        codigo_dane: '23',
        region: 'Región Caribe',
        capital: 'Montería',
        superficie: 25020,
        poblacion: 1828947,
        ciudades_count: 30,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ]

    setDepartamentos(departamentosEjemplo)
    setLoading(false)
  }, [])

  const departamentosFiltrados = departamentos.filter(departamento => {
    const matchSearch = departamento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       departamento.capital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       departamento.codigo_dane.includes(searchTerm)
    const matchRegion = !filtroRegion || departamento.region === filtroRegion
    
    return matchSearch && matchRegion
  })

  const handleCreateDepartamento = () => {
    if (!newDepartamento.nombre || !newDepartamento.codigo_dane || !newDepartamento.capital) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const nuevoDepartamento: Departamento = {
      id: Math.max(...departamentos.map(d => d.id)) + 1,
      nombre: newDepartamento.nombre,
      codigo_dane: newDepartamento.codigo_dane,
      region: newDepartamento.region,
      capital: newDepartamento.capital,
      superficie: parseInt(newDepartamento.superficie) || 0,
      poblacion: parseInt(newDepartamento.poblacion) || 0,
      ciudades_count: 0,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setDepartamentos([...departamentos, nuevoDepartamento])
    setNewDepartamento({
      nombre: '',
      codigo_dane: '',
      region: '',
      capital: '',
      superficie: '',
      poblacion: ''
    })
    setIsCreateDialogOpen(false)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-CO')
  }

  const getRegionColor = (region: string) => {
    const colors: { [key: string]: string } = {
      'Región Andina': 'bg-blue-100 text-blue-800',
      'Región Caribe': 'bg-yellow-100 text-yellow-800',
      'Región Pacífica': 'bg-green-100 text-green-800',
      'Región Orinoquía': 'bg-orange-100 text-orange-800',
      'Región Amazonía': 'bg-purple-100 text-purple-800',
      'Región Insular': 'bg-cyan-100 text-cyan-800'
    }
    return colors[region] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando departamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departamentos</h2>
          <p className="text-muted-foreground">
            Gestión de departamentos y regiones de Colombia
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Departamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Departamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Departamento *</Label>
                <Input
                  id="nombre"
                  value={newDepartamento.nombre}
                  onChange={(e) => setNewDepartamento({...newDepartamento, nombre: e.target.value})}
                  placeholder="Ej: Antioquia"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo_dane">Código DANE *</Label>
                  <Input
                    id="codigo_dane"
                    value={newDepartamento.codigo_dane}
                    onChange={(e) => setNewDepartamento({...newDepartamento, codigo_dane: e.target.value})}
                    placeholder="Ej: 05"
                  />
                </div>
                
                <div>
                  <Label htmlFor="capital">Capital *</Label>
                  <Input
                    id="capital"
                    value={newDepartamento.capital}
                    onChange={(e) => setNewDepartamento({...newDepartamento, capital: e.target.value})}
                    placeholder="Ej: Medellín"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="region">Región</Label>
                <select
                  id="region"
                  value={newDepartamento.region}
                  onChange={(e) => setNewDepartamento({...newDepartamento, region: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar región</option>
                  {regiones.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="superficie">Superficie (km²)</Label>
                  <Input
                    id="superficie"
                    type="number"
                    value={newDepartamento.superficie}
                    onChange={(e) => setNewDepartamento({...newDepartamento, superficie: e.target.value})}
                    placeholder="Ej: 63612"
                  />
                </div>
                
                <div>
                  <Label htmlFor="poblacion">Población</Label>
                  <Input
                    id="poblacion"
                    type="number"
                    value={newDepartamento.poblacion}
                    onChange={(e) => setNewDepartamento({...newDepartamento, poblacion: e.target.value})}
                    placeholder="Ej: 6677930"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateDepartamento}>
                  Crear Departamento
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
              <Building2 className="w-8 h-8 text-blue-600" />
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
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {departamentos.reduce((sum, d) => sum + d.ciudades_count, 0)}
                </p>
                <p className="text-sm text-gray-600">Ciudades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(departamentos.reduce((sum, d) => sum + d.poblacion, 0))}
                </p>
                <p className="text-sm text-gray-600">Población</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(departamentos.reduce((sum, d) => sum + d.superficie, 0))}
                </p>
                <p className="text-sm text-gray-600">km² Total</p>
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
                  placeholder="Buscar departamentos por nombre, capital o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <select
              value={filtroRegion}
              onChange={(e) => setFiltroRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las regiones</option>
              {regiones.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Departamentos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departamentosFiltrados.map((departamento) => (
          <Card key={departamento.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{departamento.nombre}</CardTitle>
                <Badge variant={departamento.activo ? "default" : "secondary"}>
                  {departamento.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className={`px-2 py-1 rounded-full text-xs ${getRegionColor(departamento.region)}`}>
                  {departamento.region}
                </span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                  DANE: {departamento.codigo_dane}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Capital:</span>
                  <p className="text-gray-900">{departamento.capital}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Población:</span>
                    <p className="text-gray-900">{formatNumber(departamento.poblacion)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Superficie:</span>
                    <p className="text-gray-900">{formatNumber(departamento.superficie)} km²</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Ciudades:</span>
                  <p className="text-gray-900">{departamento.ciudades_count} municipios</p>
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

      {departamentosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No se encontraron departamentos</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filtroRegion 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay departamentos registrados en el sistema'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}