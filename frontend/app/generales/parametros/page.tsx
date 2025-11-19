'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Search, Plus, Edit2, Trash2, Settings, Sliders, Check, X } from 'lucide-react'

interface Parametro {
  id: number
  nombre: string
  codigo: string
  valor: string
  valor_minimo?: string
  valor_maximo?: string
  unidad_medida?: string
  tipo: 'numerico' | 'texto' | 'booleano' | 'lista' | 'fecha'
  categoria: string
  opciones?: string[]
  descripcion: string
  requerido: boolean
  activo: boolean
  created_at: string
  updated_at: string
}

export default function ParametrosPage() {
  const [parametros, setParametros] = useState<Parametro[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingParametro, setEditingParametro] = useState<Parametro | null>(null)

  const [newParametro, setNewParametro] = useState({
    nombre: '',
    codigo: '',
    valor: '',
    valor_minimo: '',
    valor_maximo: '',
    unidad_medida: '',
    tipo: 'texto' as const,
    categoria: '',
    opciones: [''],
    descripcion: '',
    requerido: false
  })

  const categorias = [
    'Sistema',
    'Equipos',
    'Servicios',
    'Mantenimiento',
    'Calidad',
    'Seguridad',
    'Procesos',
    'Configuración',
    'Límites'
  ]

  const tipos = [
    { value: 'numerico', label: 'Numérico' },
    { value: 'texto', label: 'Texto' },
    { value: 'booleano', label: 'Verdadero/Falso' },
    { value: 'lista', label: 'Lista de Opciones' },
    { value: 'fecha', label: 'Fecha' }
  ]

  // Datos de ejemplo de parámetros del sistema
  useEffect(() => {
    const parametrosEjemplo: Parametro[] = [
      {
        id: 1,
        nombre: 'Tiempo Máximo de Respuesta',
        codigo: 'MAX_RESPONSE_TIME',
        valor: '24',
        valor_minimo: '1',
        valor_maximo: '72',
        unidad_medida: 'horas',
        tipo: 'numerico',
        categoria: 'Servicios',
        descripcion: 'Tiempo máximo permitido para responder a una solicitud de servicio',
        requerido: true,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Frecuencia de Mantenimiento Preventivo',
        codigo: 'PREVENTIVE_FREQUENCY',
        valor: '6',
        valor_minimo: '1',
        valor_maximo: '12',
        unidad_medida: 'meses',
        tipo: 'numerico',
        categoria: 'Mantenimiento',
        descripcion: 'Frecuencia recomendada para mantenimientos preventivos',
        requerido: true,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 3,
        nombre: 'Nivel de Prioridad por Defecto',
        codigo: 'DEFAULT_PRIORITY',
        valor: 'Media',
        tipo: 'lista',
        categoria: 'Sistema',
        opciones: ['Baja', 'Media', 'Alta', 'Crítica'],
        descripcion: 'Prioridad asignada automáticamente a nuevas solicitudes',
        requerido: true,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 4,
        nombre: 'Notificaciones Automáticas Activas',
        codigo: 'AUTO_NOTIFICATIONS',
        valor: 'true',
        tipo: 'booleano',
        categoria: 'Sistema',
        descripcion: 'Habilita el envío automático de notificaciones',
        requerido: false,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 5,
        nombre: 'Temperatura Máxima Operación',
        codigo: 'MAX_OPERATING_TEMP',
        valor: '45',
        valor_minimo: '20',
        valor_maximo: '60',
        unidad_medida: '°C',
        tipo: 'numerico',
        categoria: 'Equipos',
        descripcion: 'Temperatura máxima de operación para equipos médicos',
        requerido: true,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 6,
        nombre: 'Código de Área Telefónica',
        codigo: 'PHONE_AREA_CODE',
        valor: '+57',
        tipo: 'texto',
        categoria: 'Configuración',
        descripcion: 'Código de área telefónica por defecto para el país',
        requerido: false,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 7,
        nombre: 'Porcentaje Mínimo de Disponibilidad',
        codigo: 'MIN_AVAILABILITY_PERCENT',
        valor: '95',
        valor_minimo: '80',
        valor_maximo: '100',
        unidad_medida: '%',
        tipo: 'numerico',
        categoria: 'Calidad',
        descripcion: 'Porcentaje mínimo de disponibilidad requerido para equipos críticos',
        requerido: true,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 8,
        nombre: 'Estado por Defecto de Equipos',
        codigo: 'DEFAULT_EQUIPMENT_STATUS',
        valor: 'Activo',
        tipo: 'lista',
        categoria: 'Equipos',
        opciones: ['Activo', 'Inactivo', 'Mantenimiento', 'Fuera de Servicio'],
        descripcion: 'Estado inicial asignado a equipos recién registrados',
        requerido: true,
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ]

    setParametros(parametrosEjemplo)
    setLoading(false)
  }, [])

  const parametrosFiltrados = parametros.filter(parametro => {
    const matchSearch = parametro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       parametro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       parametro.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = !filtroCategoria || parametro.categoria === filtroCategoria
    const matchTipo = !filtroTipo || parametro.tipo === filtroTipo
    
    return matchSearch && matchCategoria && matchTipo
  })

  const handleCreateParametro = () => {
    if (!newParametro.nombre || !newParametro.codigo) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const nuevoParametro: Parametro = {
      id: Math.max(...parametros.map(p => p.id)) + 1,
      nombre: newParametro.nombre,
      codigo: newParametro.codigo.toUpperCase(),
      valor: newParametro.valor,
      valor_minimo: newParametro.valor_minimo || undefined,
      valor_maximo: newParametro.valor_maximo || undefined,
      unidad_medida: newParametro.unidad_medida || undefined,
      tipo: newParametro.tipo,
      categoria: newParametro.categoria,
      opciones: newParametro.tipo === 'lista' ? newParametro.opciones.filter(o => o.trim()) : undefined,
      descripcion: newParametro.descripcion,
      requerido: newParametro.requerido,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setParametros([...parametros, nuevoParametro])
    setNewParametro({
      nombre: '',
      codigo: '',
      valor: '',
      valor_minimo: '',
      valor_maximo: '',
      unidad_medida: '',
      tipo: 'texto',
      categoria: '',
      opciones: [''],
      descripcion: '',
      requerido: false
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditParametro = (parametro: Parametro) => {
    setEditingParametro(parametro)
  }

  const handleUpdateParametro = () => {
    if (!editingParametro) return

    setParametros(parametros.map(p => 
      p.id === editingParametro.id 
        ? { ...editingParametro, updated_at: new Date().toISOString() }
        : p
    ))
    setEditingParametro(null)
  }

  const formatValue = (parametro: Parametro) => {
    if (parametro.tipo === 'booleano') {
      return parametro.valor === 'true' ? 'Verdadero' : 'Falso'
    }
    if (parametro.unidad_medida) {
      return `${parametro.valor} ${parametro.unidad_medida}`
    }
    return parametro.valor
  }

  const getTipoLabel = (tipo: string) => {
    return tipos.find(t => t.value === tipo)?.label || tipo
  }

  const getCategoriaColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Sistema': 'bg-blue-100 text-blue-800',
      'Equipos': 'bg-green-100 text-green-800',
      'Servicios': 'bg-yellow-100 text-yellow-800',
      'Mantenimiento': 'bg-purple-100 text-purple-800',
      'Calidad': 'bg-pink-100 text-pink-800',
      'Seguridad': 'bg-red-100 text-red-800',
      'Procesos': 'bg-indigo-100 text-indigo-800',
      'Configuración': 'bg-orange-100 text-orange-800',
      'Límites': 'bg-gray-100 text-gray-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  const addOpcion = () => {
    setNewParametro({
      ...newParametro,
      opciones: [...newParametro.opciones, '']
    })
  }

  const removeOpcion = (index: number) => {
    const newOpciones = newParametro.opciones.filter((_, i) => i !== index)
    setNewParametro({
      ...newParametro,
      opciones: newOpciones.length > 0 ? newOpciones : ['']
    })
  }

  const updateOpcion = (index: number, value: string) => {
    const newOpciones = [...newParametro.opciones]
    newOpciones[index] = value
    setNewParametro({
      ...newParametro,
      opciones: newOpciones
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando parámetros del sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parámetros del Sistema</h2>
          <p className="text-muted-foreground">
            Configuración de parámetros operacionales y límites del sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Parámetro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Parámetro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Parámetro *</Label>
                  <Input
                    id="nombre"
                    value={newParametro.nombre}
                    onChange={(e) => setNewParametro({...newParametro, nombre: e.target.value})}
                    placeholder="Ej: Tiempo Máximo de Respuesta"
                  />
                </div>
                
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={newParametro.codigo}
                    onChange={(e) => setNewParametro({...newParametro, codigo: e.target.value.toUpperCase()})}
                    placeholder="Ej: MAX_RESPONSE_TIME"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Dato *</Label>
                  <Select
                    value={newParametro.tipo}
                    onValueChange={(value: any) => setNewParametro({...newParametro, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={newParametro.categoria}
                    onValueChange={(value) => setNewParametro({...newParametro, categoria: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="unidad">Unidad de Medida</Label>
                  <Input
                    id="unidad"
                    value={newParametro.unidad_medida}
                    onChange={(e) => setNewParametro({...newParametro, unidad_medida: e.target.value})}
                    placeholder="Ej: horas, %, °C"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="valor">Valor {newParametro.tipo === 'booleano' ? '(true/false)' : ''}</Label>
                <Input
                  id="valor"
                  value={newParametro.valor}
                  onChange={(e) => setNewParametro({...newParametro, valor: e.target.value})}
                  placeholder={newParametro.tipo === 'booleano' ? 'true o false' : 'Valor del parámetro'}
                />
              </div>
              
              {newParametro.tipo === 'numerico' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min">Valor Mínimo</Label>
                    <Input
                      id="min"
                      type="number"
                      value={newParametro.valor_minimo}
                      onChange={(e) => setNewParametro({...newParametro, valor_minimo: e.target.value})}
                      placeholder="Valor mínimo permitido"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max">Valor Máximo</Label>
                    <Input
                      id="max"
                      type="number"
                      value={newParametro.valor_maximo}
                      onChange={(e) => setNewParametro({...newParametro, valor_maximo: e.target.value})}
                      placeholder="Valor máximo permitido"
                    />
                  </div>
                </div>
              )}
              
              {newParametro.tipo === 'lista' && (
                <div>
                  <Label>Opciones de la Lista</Label>
                  <div className="space-y-2">
                    {newParametro.opciones.map((opcion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={opcion}
                          onChange={(e) => updateOpcion(index, e.target.value)}
                          placeholder={`Opción ${index + 1}`}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeOpcion(index)}
                          disabled={newParametro.opciones.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addOpcion}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Opción
                  </Button>
                </div>
              )}
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newParametro.descripcion}
                  onChange={(e) => setNewParametro({...newParametro, descripcion: e.target.value})}
                  placeholder="Descripción del parámetro"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requerido"
                  checked={newParametro.requerido}
                  onCheckedChange={(checked) => setNewParametro({...newParametro, requerido: checked})}
                />
                <Label htmlFor="requerido">Parámetro requerido</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateParametro}>
                  Crear Parámetro
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
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{parametros.length}</p>
                <p className="text-sm text-gray-600">Total Parámetros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Sliders className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{parametros.filter(p => p.requerido).length}</p>
                <p className="text-sm text-gray-600">Requeridos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Check className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{parametros.filter(p => p.activo).length}</p>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{categorias.length}</p>
                <p className="text-sm text-gray-600">Categorías</p>
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
                  placeholder="Buscar parámetros por nombre, código o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Parámetros */}
      <div className="space-y-4">
        {parametrosFiltrados.map((parametro) => (
          <Card key={parametro.id} className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{parametro.nombre}</h3>
                    <Badge variant="outline" className={getCategoriaColor(parametro.categoria)}>
                      {parametro.categoria}
                    </Badge>
                    <Badge variant="secondary">
                      {getTipoLabel(parametro.tipo)}
                    </Badge>
                    {parametro.requerido && (
                      <Badge variant="destructive" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                    {!parametro.activo && (
                      <Badge variant="outline" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium text-gray-600">Código:</span>
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                        {parametro.codigo}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Valor:</span>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatValue(parametro)}
                      </p>
                    </div>
                    
                    {(parametro.valor_minimo || parametro.valor_maximo) && (
                      <div>
                        <span className="font-medium text-gray-600">Rango:</span>
                        <p className="text-sm">
                          {parametro.valor_minimo || '∞'} - {parametro.valor_maximo || '∞'}
                          {parametro.unidad_medida && ` ${parametro.unidad_medida}`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {parametro.opciones && parametro.opciones.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Opciones:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parametro.opciones.map((opcion, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {opcion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {parametro.descripcion && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Descripción:</span>
                      <p className="text-sm text-gray-700">{parametro.descripcion}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => handleEditParametro(parametro)}>
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

      {parametrosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No se encontraron parámetros</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filtroCategoria || filtroTipo 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay parámetros configurados en el sistema'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}