'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit2, Trash2, Database, Tag } from 'lucide-react'

interface Modelo {
  id: number
  nombre: string
  marca_id: number
  marca_nombre: string
  tipo_equipo_id: number
  tipo_equipo_nombre: string
  descripcion: string
  especificaciones: string
  activo: boolean
  created_at: string
  updated_at: string
}

interface Marca {
  id: number
  nombre: string
}

interface TipoEquipo {
  id: number
  nombre: string
}

export default function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroMarca, setFiltroMarca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [newModelo, setNewModelo] = useState({
    nombre: '',
    marca_id: '',
    tipo_equipo_id: '',
    descripcion: '',
    especificaciones: ''
  })

  // Datos de ejemplo mientras se conecta con el backend
  useEffect(() => {
    const modelosEjemplo: Modelo[] = [
      {
        id: 1,
        nombre: 'Kavo Estetica E50',
        marca_id: 1,
        marca_nombre: 'Kavo',
        tipo_equipo_id: 1,
        tipo_equipo_nombre: 'Unidad Dental',
        descripcion: 'Unidad dental completa con sistema hidráulico',
        especificaciones: 'Motor eléctrico, 3 instrumentos, lámpara LED',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Sirona Intego Pro',
        marca_id: 2,
        marca_nombre: 'Sirona',
        tipo_equipo_id: 1,
        tipo_equipo_nombre: 'Unidad Dental',
        descripcion: 'Unidad dental de alta gama con tecnología avanzada',
        especificaciones: 'Sistema inalámbrico, pantalla táctil, 4 instrumentos',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 3,
        nombre: 'Schulz CSL-10',
        marca_id: 3,
        marca_nombre: 'Schulz',
        tipo_equipo_id: 2,
        tipo_equipo_nombre: 'Compresor',
        descripcion: 'Compresor de aire médico libre de aceite',
        especificaciones: '10 HP, tanque 270L, flujo 1400 L/min',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 4,
        nombre: 'Planmeca ProMax 3D',
        marca_id: 4,
        marca_nombre: 'Planmeca',
        tipo_equipo_id: 3,
        tipo_equipo_nombre: 'Rayos X',
        descripcion: 'Equipo de rayos X panorámico y 3D',
        especificaciones: 'CBCT, pantalla 19", resolución 75-600 micras',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 5,
        nombre: 'Dentsply Statim 5000S',
        marca_id: 5,
        marca_nombre: 'Dentsply',
        tipo_equipo_id: 4,
        tipo_equipo_nombre: 'Autoclave',
        descripcion: 'Autoclave de vapor para esterilización rápida',
        especificaciones: 'Cámara 5L, ciclo rápido 9 min, presión 2.1 bar',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ]

    const marcasEjemplo: Marca[] = [
      { id: 1, nombre: 'Kavo' },
      { id: 2, nombre: 'Sirona' },
      { id: 3, nombre: 'Schulz' },
      { id: 4, nombre: 'Planmeca' },
      { id: 5, nombre: 'Dentsply' }
    ]

    const tiposEjemplo: TipoEquipo[] = [
      { id: 1, nombre: 'Unidad Dental' },
      { id: 2, nombre: 'Compresor' },
      { id: 3, nombre: 'Rayos X' },
      { id: 4, nombre: 'Autoclave' },
      { id: 5, nombre: 'Lámpara de Fotocurado' }
    ]

    setModelos(modelosEjemplo)
    setMarcas(marcasEjemplo)
    setTiposEquipo(tiposEjemplo)
    setLoading(false)
  }, [])

  const modelosFiltrados = modelos.filter(modelo => {
    const matchSearch = modelo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       modelo.marca_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       modelo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchMarca = !filtroMarca || modelo.marca_id.toString() === filtroMarca
    const matchTipo = !filtroTipo || modelo.tipo_equipo_id.toString() === filtroTipo
    
    return matchSearch && matchMarca && matchTipo
  })

  const handleCreateModelo = () => {
    if (!newModelo.nombre || !newModelo.marca_id || !newModelo.tipo_equipo_id) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const marcaSeleccionada = marcas.find(m => m.id.toString() === newModelo.marca_id)
    const tipoSeleccionado = tiposEquipo.find(t => t.id.toString() === newModelo.tipo_equipo_id)

    const nuevoModelo: Modelo = {
      id: Math.max(...modelos.map(m => m.id)) + 1,
      nombre: newModelo.nombre,
      marca_id: parseInt(newModelo.marca_id),
      marca_nombre: marcaSeleccionada?.nombre || '',
      tipo_equipo_id: parseInt(newModelo.tipo_equipo_id),
      tipo_equipo_nombre: tipoSeleccionado?.nombre || '',
      descripcion: newModelo.descripcion,
      especificaciones: newModelo.especificaciones,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setModelos([...modelos, nuevoModelo])
    setNewModelo({
      nombre: '',
      marca_id: '',
      tipo_equipo_id: '',
      descripcion: '',
      especificaciones: ''
    })
    setIsCreateDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando modelos de equipos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Modelos de Equipos</h2>
          <p className="text-muted-foreground">
            Gestión del catálogo de modelos de equipos médicos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Modelo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Modelo *</Label>
                <Input
                  id="nombre"
                  value={newModelo.nombre}
                  onChange={(e) => setNewModelo({...newModelo, nombre: e.target.value})}
                  placeholder="Ej: Kavo Estetica E50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marca">Marca *</Label>
                  <Select
                    value={newModelo.marca_id}
                    onValueChange={(value) => setNewModelo({...newModelo, marca_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {marcas.map((marca) => (
                        <SelectItem key={marca.id} value={marca.id.toString()}>
                          {marca.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tipo">Tipo de Equipo *</Label>
                  <Select
                    value={newModelo.tipo_equipo_id}
                    onValueChange={(value) => setNewModelo({...newModelo, tipo_equipo_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEquipo.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={newModelo.descripcion}
                  onChange={(e) => setNewModelo({...newModelo, descripcion: e.target.value})}
                  placeholder="Descripción del modelo"
                />
              </div>
              
              <div>
                <Label htmlFor="especificaciones">Especificaciones Técnicas</Label>
                <Input
                  id="especificaciones"
                  value={newModelo.especificaciones}
                  onChange={(e) => setNewModelo({...newModelo, especificaciones: e.target.value})}
                  placeholder="Especificaciones técnicas"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateModelo}>
                  Crear Modelo
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
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{modelos.length}</p>
                <p className="text-sm text-gray-600">Total Modelos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Tag className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{marcas.length}</p>
                <p className="text-sm text-gray-600">Marcas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{tiposEquipo.length}</p>
                <p className="text-sm text-gray-600">Tipos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{modelos.filter(m => m.activo).length}</p>
                <p className="text-sm text-gray-600">Activos</p>
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
                  placeholder="Buscar modelos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filtroMarca} onValueChange={setFiltroMarca}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las marcas</SelectItem>
                {marcas.map((marca) => (
                  <SelectItem key={marca.id} value={marca.id.toString()}>
                    {marca.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                {tiposEquipo.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Modelos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modelosFiltrados.map((modelo) => (
          <Card key={modelo.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{modelo.nombre}</CardTitle>
                <Badge variant={modelo.activo ? "default" : "secondary"}>
                  {modelo.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {modelo.marca_nombre}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {modelo.tipo_equipo_nombre}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {modelo.descripcion && (
                  <p className="text-sm text-gray-600">{modelo.descripcion}</p>
                )}
                {modelo.especificaciones && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>Especificaciones:</strong> {modelo.especificaciones}
                  </p>
                )}
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

      {modelosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No se encontraron modelos</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filtroMarca || filtroTipo 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay modelos registrados en el sistema'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}