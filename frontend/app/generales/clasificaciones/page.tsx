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
import { Search, Plus, Edit2, Trash2, Tag, BookOpen, AlertCircle, Shield } from 'lucide-react'

interface Clasificacion {
  id: number
  nombre: string
  codigo: string
  tipo: 'riesgo' | 'criticidad' | 'prioridad' | 'categoria' | 'nivel' | 'grupo'
  descripcion: string
  color: string
  icono?: string
  nivel: number
  peso: number
  activo: boolean
  aplicable_a: string[]
  criterios?: string[]
  acciones_automaticas?: string[]
  parent_id?: number
  created_at: string
  updated_at: string
}

export default function ClasificacionesPage() {
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingClasificacion, setEditingClasificacion] = useState<Clasificacion | null>(null)

  const [newClasificacion, setNewClasificacion] = useState({
    nombre: '',
    codigo: '',
    tipo: 'categoria' as const,
    descripcion: '',
    color: '#3B82F6',
    icono: '',
    nivel: 1,
    peso: 1,
    aplicable_a: [''],
    criterios: [''],
    acciones_automaticas: ['']
  })

  const tipos = [
    { value: 'riesgo', label: 'Clasificación de Riesgo', icon: AlertCircle },
    { value: 'criticidad', label: 'Nivel de Criticidad', icon: Shield },
    { value: 'prioridad', label: 'Prioridad', icon: BookOpen },
    { value: 'categoria', label: 'Categoría', icon: Tag },
    { value: 'nivel', label: 'Nivel', icon: BookOpen },
    { value: 'grupo', label: 'Grupo', icon: Tag }
  ]

  const coloresDisponibles = [
    { value: '#EF4444', label: 'Rojo', class: 'bg-red-500' },
    { value: '#F97316', label: 'Naranja', class: 'bg-orange-500' },
    { value: '#EAB308', label: 'Amarillo', class: 'bg-yellow-500' },
    { value: '#22C55E', label: 'Verde', class: 'bg-green-500' },
    { value: '#3B82F6', label: 'Azul', class: 'bg-blue-500' },
    { value: '#8B5CF6', label: 'Púrpura', class: 'bg-purple-500' },
    { value: '#EC4899', label: 'Rosa', class: 'bg-pink-500' },
    { value: '#6B7280', label: 'Gris', class: 'bg-gray-500' }
  ]

  const aplicabilidad = [
    'Equipos Médicos',
    'Servicios',
    'Mantenimiento',
    'Solicitudes',
    'Usuarios',
    'Proveedores',
    'Procesos',
    'Documentos',
    'Incidentes'
  ]

  // Datos de ejemplo de clasificaciones
  useEffect(() => {
    const clasificacionesEjemplo: Clasificacion[] = [
      {
        id: 1,
        nombre: 'Crítico',
        codigo: 'CRIT',
        tipo: 'criticidad',
        descripcion: 'Equipos críticos para la vida del paciente que requieren mantenimiento inmediato',
        color: '#EF4444',
        icono: 'shield',
        nivel: 1,
        peso: 100,
        activo: true,
        aplicable_a: ['Equipos Médicos', 'Mantenimiento'],
        criterios: ['Soporte vital', 'Terapia crítica', 'Diagnóstico de emergencia'],
        acciones_automaticas: ['Notificación inmediata', 'Asignación automática', 'Escalamiento directo'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Alto',
        codigo: 'HIGH',
        tipo: 'criticidad',
        descripcion: 'Equipos importantes que afectan directamente la atención médica',
        color: '#F97316',
        nivel: 2,
        peso: 80,
        activo: true,
        aplicable_a: ['Equipos Médicos', 'Mantenimiento'],
        criterios: ['Atención directa al paciente', 'Diagnósticos especializados'],
        acciones_automaticas: ['Notificación prioritaria', 'SLA reducido'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 3,
        nombre: 'Medio',
        codigo: 'MED',
        tipo: 'criticidad',
        descripcion: 'Equipos de importancia moderada para las operaciones hospitalarias',
        color: '#EAB308',
        nivel: 3,
        peso: 60,
        activo: true,
        aplicable_a: ['Equipos Médicos', 'Mantenimiento'],
        criterios: ['Apoyo a procedimientos', 'Confort del paciente'],
        acciones_automaticas: ['Notificación estándar'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 4,
        nombre: 'Bajo',
        codigo: 'LOW',
        tipo: 'criticidad',
        descripción: 'Equipos de apoyo que no afectan directamente la atención médica',
        color: '#22C55E',
        nivel: 4,
        peso: 40,
        activo: true,
        aplicable_a: ['Equipos Médicos', 'Mantenimiento'],
        criterios: ['Funciones administrativas', 'Equipos de oficina'],
        acciones_automaticas: ['Notificación diferida'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 5,
        nombre: 'Urgente',
        codigo: 'URG',
        tipo: 'prioridad',
        descripcion: 'Requiere atención inmediata dentro de las próximas 2 horas',
        color: '#EF4444',
        nivel: 1,
        peso: 95,
        activo: true,
        aplicable_a: ['Solicitudes', 'Servicios', 'Mantenimiento'],
        criterios: ['Impacto crítico', 'Pacientes en riesgo', 'Servicios interrumpidos'],
        acciones_automaticas: ['Escalamiento automático', 'Notificación SMS', 'Llamada directa'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 6,
        nombre: 'Alta',
        codigo: 'HIGH_PRIO',
        tipo: 'prioridad',
        descripcion: 'Debe resolverse el mismo día',
        color: '#F97316',
        nivel: 2,
        peso: 75,
        activo: true,
        aplicable_a: ['Solicitudes', 'Servicios'],
        criterios: ['Afecta múltiples usuarios', 'Servicios importantes'],
        acciones_automaticas: ['Notificación prioritaria', 'Asignación supervisada'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 7,
        nombre: 'Media',
        codigo: 'MED_PRIO',
        tipo: 'prioridad',
        descripcion: 'Debe resolverse dentro de 3 días hábiles',
        color: '#EAB308',
        nivel: 3,
        peso: 50,
        activo: true,
        aplicable_a: ['Solicitudes', 'Servicios'],
        criterios: ['Afecta usuarios específicos', 'Funcionalidad no crítica'],
        acciones_automaticas: ['Notificación estándar'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 8,
        nombre: 'Baja',
        codigo: 'LOW_PRIO',
        tipo: 'prioridad',
        descripcion: 'Puede resolverse dentro de una semana',
        color: '#22C55E',
        nivel: 4,
        peso: 25,
        activo: true,
        aplicable_a: ['Solicitudes', 'Servicios'],
        criterios: ['Mejoras', 'Solicitudes informativas'],
        acciones_automaticas: ['Asignación normal'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 9,
        nombre: 'Riesgo Alto',
        codigo: 'RISK_HIGH',
        tipo: 'riesgo',
        descripcion: 'Situaciones que pueden causar daño grave o muerte',
        color: '#EF4444',
        nivel: 1,
        peso: 90,
        activo: true,
        aplicable_a: ['Equipos Médicos', 'Incidentes', 'Procesos'],
        criterios: ['Falla de soporte vital', 'Exposición a radiación', 'Contaminación'],
        acciones_automaticas: ['Alerta inmediata', 'Protocolo de emergencia', 'Reporte obligatorio'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 10,
        nombre: 'Diagnóstico',
        codigo: 'DIAG',
        tipo: 'categoria',
        descripcion: 'Equipos utilizados para diagnóstico médico',
        color: '#3B82F6',
        nivel: 1,
        peso: 70,
        activo: true,
        aplicable_a: ['Equipos Médicos'],
        criterios: ['Imagenología', 'Laboratorio', 'Monitoreo'],
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ]

    setClasificaciones(clasificacionesEjemplo)
    setLoading(false)
  }, [])

  const clasificacionesFiltradas = clasificaciones.filter(clasificacion => {
    const matchSearch = clasificacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       clasificacion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       clasificacion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = !filtroTipo || clasificacion.tipo === filtroTipo
    
    return matchSearch && matchTipo
  })

  const handleCreateClasificacion = () => {
    if (!newClasificacion.nombre || !newClasificacion.codigo) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const nuevaClasificacion: Clasificacion = {
      id: Math.max(...clasificaciones.map(c => c.id)) + 1,
      nombre: newClasificacion.nombre,
      codigo: newClasificacion.codigo.toUpperCase(),
      tipo: newClasificacion.tipo,
      descripcion: newClasificacion.descripcion,
      color: newClasificacion.color,
      icono: newClasificacion.icono || undefined,
      nivel: newClasificacion.nivel,
      peso: newClasificacion.peso,
      activo: true,
      aplicable_a: newClasificacion.aplicable_a.filter(a => a.trim()),
      criterios: newClasificacion.criterios.filter(c => c.trim()),
      acciones_automaticas: newClasificacion.acciones_automaticas.filter(a => a.trim()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setClasificaciones([...clasificaciones, nuevaClasificacion])
    setNewClasificacion({
      nombre: '',
      codigo: '',
      tipo: 'categoria',
      descripcion: '',
      color: '#3B82F6',
      icono: '',
      nivel: 1,
      peso: 1,
      aplicable_a: [''],
      criterios: [''],
      acciones_automaticas: ['']
    })
    setIsCreateDialogOpen(false)
  }

  const getTipoLabel = (tipo: string) => {
    return tipos.find(t => t.value === tipo)?.label || tipo
  }

  const getTipoIcon = (tipo: string) => {
    const tipoObj = tipos.find(t => t.value === tipo)
    return tipoObj?.icon || Tag
  }

  const addArrayItem = (field: 'aplicable_a' | 'criterios' | 'acciones_automaticas') => {
    setNewClasificacion({
      ...newClasificacion,
      [field]: [...newClasificacion[field], '']
    })
  }

  const removeArrayItem = (field: 'aplicable_a' | 'criterios' | 'acciones_automaticas', index: number) => {
    const newArray = newClasificacion[field].filter((_, i) => i !== index)
    setNewClasificacion({
      ...newClasificacion,
      [field]: newArray.length > 0 ? newArray : ['']
    })
  }

  const updateArrayItem = (field: 'aplicable_a' | 'criterios' | 'acciones_automaticas', index: number, value: string) => {
    const newArray = [...newClasificacion[field]]
    newArray[index] = value
    setNewClasificacion({
      ...newClasificacion,
      [field]: newArray
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando clasificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clasificaciones</h2>
          <p className="text-muted-foreground">
            Gestión de clasificaciones, niveles de riesgo, criticidad y categorías del sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Clasificación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Clasificación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={newClasificacion.nombre}
                    onChange={(e) => setNewClasificacion({...newClasificacion, nombre: e.target.value})}
                    placeholder="Ej: Crítico, Alto Riesgo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={newClasificacion.codigo}
                    onChange={(e) => setNewClasificacion({...newClasificacion, codigo: e.target.value.toUpperCase()})}
                    placeholder="Ej: CRIT, HIGH_RISK"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Clasificación *</Label>
                  <Select
                    value={newClasificacion.tipo}
                    onValueChange={(value: any) => setNewClasificacion({...newClasificacion, tipo: value})}
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
                  <Label htmlFor="nivel">Nivel</Label>
                  <Input
                    id="nivel"
                    type="number"
                    min="1"
                    max="10"
                    value={newClasificacion.nivel}
                    onChange={(e) => setNewClasificacion({...newClasificacion, nivel: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="peso">Peso</Label>
                  <Input
                    id="peso"
                    type="number"
                    min="1"
                    max="100"
                    value={newClasificacion.peso}
                    onChange={(e) => setNewClasificacion({...newClasificacion, peso: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${color.class} ${
                        newClasificacion.color === color.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      onClick={() => setNewClasificacion({...newClasificacion, color: color.value})}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newClasificacion.descripcion}
                  onChange={(e) => setNewClasificacion({...newClasificacion, descripcion: e.target.value})}
                  placeholder="Describa la clasificación"
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Aplicable a</Label>
                <div className="space-y-2">
                  {newClasificacion.aplicable_a.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Select
                        value={item}
                        onValueChange={(value) => updateArrayItem('aplicable_a', index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar aplicabilidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {aplicabilidad.map((app) => (
                            <SelectItem key={app} value={app}>
                              {app}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('aplicable_a', index)}
                        disabled={newClasificacion.aplicable_a.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addArrayItem('aplicable_a')}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Aplicabilidad
                </Button>
              </div>
              
              <div>
                <Label>Criterios</Label>
                <div className="space-y-2">
                  {newClasificacion.criterios.map((criterio, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={criterio}
                        onChange={(e) => updateArrayItem('criterios', index, e.target.value)}
                        placeholder={`Criterio ${index + 1}`}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('criterios', index)}
                        disabled={newClasificacion.criterios.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addArrayItem('criterios')}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Criterio
                </Button>
              </div>
              
              <div>
                <Label>Acciones Automáticas</Label>
                <div className="space-y-2">
                  {newClasificacion.acciones_automaticas.map((accion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={accion}
                        onChange={(e) => updateArrayItem('acciones_automaticas', index, e.target.value)}
                        placeholder={`Acción ${index + 1}`}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('acciones_automaticas', index)}
                        disabled={newClasificacion.acciones_automaticas.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addArrayItem('acciones_automaticas')}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Acción
                </Button>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateClasificacion}>
                  Crear Clasificación
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
              <Tag className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{clasificaciones.length}</p>
                <p className="text-sm text-gray-600">Total Clasificaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{clasificaciones.filter(c => c.tipo === 'riesgo').length}</p>
                <p className="text-sm text-gray-600">Riesgos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{clasificaciones.filter(c => c.tipo === 'criticidad').length}</p>
                <p className="text-sm text-gray-600">Criticidad</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{clasificaciones.filter(c => c.tipo === 'prioridad').length}</p>
                <p className="text-sm text-gray-600">Prioridades</p>
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
                  placeholder="Buscar clasificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[200px]">
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

      {/* Lista de Clasificaciones */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clasificacionesFiltradas.map((clasificacion) => {
          const IconComponent = getTipoIcon(clasificacion.tipo)
          return (
            <Card key={clasificacion.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: clasificacion.color }}
                    />
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{clasificacion.nombre}</h3>
                      <p className="text-sm text-gray-600">{clasificacion.codigo}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {getTipoLabel(clasificacion.tipo)}
                    </Badge>
                    <p className="text-sm text-gray-700">{clasificacion.descripcion}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nivel:</span> {clasificacion.nivel}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Peso:</span> {clasificacion.peso}
                    </div>
                  </div>
                  
                  {clasificacion.aplicable_a && clasificacion.aplicable_a.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600 text-sm">Aplicable a:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {clasificacion.aplicable_a.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {clasificacion.aplicable_a.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{clasificacion.aplicable_a.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {clasificacion.criterios && clasificacion.criterios.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600 text-sm">Criterios:</span>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {clasificacion.criterios.slice(0, 2).map((criterio, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                            {criterio}
                          </li>
                        ))}
                        {clasificacion.criterios.length > 2 && (
                          <li className="text-gray-500">+{clasificacion.criterios.length - 2} más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {clasificacionesFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No se encontraron clasificaciones</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filtroTipo 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay clasificaciones configuradas en el sistema'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}