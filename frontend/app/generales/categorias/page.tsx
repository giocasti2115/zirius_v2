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
import { Search, Plus, Edit2, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'

interface Categoria {
  id: number
  nombre: string
  codigo: string
  descripcion: string
  color: string
  icono?: string
  parent_id?: number
  nivel: number
  orden: number
  activo: boolean
  visible: boolean
  permite_subcategorias: boolean
  modulo: string
  metadata?: Record<string, any>
  subcategorias?: Categoria[]
  created_at: string
  updated_at: string
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  const [newCategoria, setNewCategoria] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    color: '#3B82F6',
    icono: '',
    parent_id: '',
    orden: 1,
    visible: true,
    permite_subcategorias: true,
    modulo: '',
    metadata: {}
  })

  const modulos = [
    'Equipos',
    'Mantenimiento',
    'Servicios',
    'Solicitudes',
    'Inventario',
    'Proveedores',
    'Usuarios',
    'Documentos',
    'Reportes',
    'Configuración'
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

  // Datos de ejemplo de categorías
  useEffect(() => {
    const categoriasEjemplo: Categoria[] = [
      {
        id: 1,
        nombre: 'Equipos Médicos',
        codigo: 'EQUIP_MED',
        descripcion: 'Categoría principal para todos los equipos médicos',
        color: '#3B82F6',
        icono: 'medical',
        nivel: 1,
        orden: 1,
        activo: true,
        visible: true,
        permite_subcategorias: true,
        modulo: 'Equipos',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Diagnóstico por Imágenes',
        codigo: 'DIAG_IMG',
        descripcion: 'Equipos para diagnóstico por imágenes médicas',
        color: '#22C55E',
        parent_id: 1,
        nivel: 2,
        orden: 1,
        activo: true,
        visible: true,
        permite_subcategorias: true,
        modulo: 'Equipos',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 3,
        nombre: 'Rayos X',
        codigo: 'RAYOS_X',
        descripcion: 'Equipos de radiografía y rayos X',
        color: '#EAB308',
        parent_id: 2,
        nivel: 3,
        orden: 1,
        activo: true,
        visible: true,
        permite_subcategorias: false,
        modulo: 'Equipos',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 4,
        nombre: 'Tomografía',
        codigo: 'TOMO',
        descripcion: 'Equipos de tomografía computarizada',
        color: '#F97316',
        parent_id: 2,
        nivel: 3,
        orden: 2,
        activo: true,
        visible: true,
        permite_subcategorias: false,
        modulo: 'Equipos',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 5,
        nombre: 'Laboratorio',
        codigo: 'LAB',
        descripcion: 'Equipos de laboratorio clínico',
        color: '#8B5CF6',
        parent_id: 1,
        nivel: 2,
        orden: 2,
        activo: true,
        visible: true,
        permite_subcategorias: true,
        modulo: 'Equipos',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 6,
        nombre: 'Hematología',
        codigo: 'HEMAT',
        descripcion: 'Equipos de análisis hematológicos',
        color: '#EC4899',
        parent_id: 5,
        nivel: 3,
        orden: 1,
        activo: true,
        visible: true,
        permite_subcategorias: false,
        modulo: 'Equipos',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 7,
        nombre: 'Mantenimiento Preventivo',
        codigo: 'MANT_PREV',
        descripcion: 'Actividades de mantenimiento preventivo programado',
        color: '#22C55E',
        nivel: 1,
        orden: 1,
        activo: true,
        visible: true,
        permite_subcategorias: true,
        modulo: 'Mantenimiento',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 8,
        nombre: 'Mantenimiento Correctivo',
        codigo: 'MANT_CORR',
        descripcion: 'Reparaciones y mantenimiento correctivo',
        color: '#EF4444',
        nivel: 1,
        orden: 2,
        activo: true,
        visible: true,
        permite_subcategorias: true,
        modulo: 'Mantenimiento',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 9,
        nombre: 'Calibración',
        codigo: 'CALIB',
        descripcion: 'Servicios de calibración y verificación',
        color: '#F97316',
        parent_id: 7,
        nivel: 2,
        orden: 1,
        activo: true,
        visible: true,
        permite_subcategorias: false,
        modulo: 'Mantenimiento',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 10,
        nombre: 'Limpieza y Desinfección',
        codigo: 'LIMP_DESINF',
        descripcion: 'Procedimientos de limpieza y desinfección',
        color: '#3B82F6',
        parent_id: 7,
        nivel: 2,
        orden: 2,
        activo: true,
        visible: true,
        permite_subcategorias: false,
        modulo: 'Mantenimiento',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 11,
        nombre: 'Solicitudes de Servicio',
        codigo: 'SOL_SERV',
        descripcion: 'Solicitudes de servicios técnicos',
        color: '#8B5CF6',
        nivel: 1,
        orden: 1,
        activo: true,
        visible: true,
        permite_subcategorias: true,
        modulo: 'Solicitudes',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 12,
        nombre: 'Repuestos y Consumibles',
        codigo: 'REP_CONS',
        descripcion: 'Solicitudes de repuestos y materiales consumibles',
        color: '#EC4899',
        nivel: 1,
        orden: 2,
        activo: true,
        visible: true,
        permite_subcategorias: true,
        modulo: 'Solicitudes',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ]

    // Crear estructura jerárquica
    const categoriasConSubcategorias = categoriasEjemplo.map(categoria => ({
      ...categoria,
      subcategorias: categoriasEjemplo.filter(sub => sub.parent_id === categoria.id)
    }))

    setCategorias(categoriasConSubcategorias)
    setLoading(false)
  }, [])

  const categoriasFiltradas = categorias.filter(categoria => {
    const matchSearch = categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       categoria.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchModulo = !filtroModulo || categoria.modulo === filtroModulo
    const matchNivel = !filtroNivel || categoria.nivel.toString() === filtroNivel
    
    return matchSearch && matchModulo && matchNivel
  })

  const handleCreateCategoria = () => {
    if (!newCategoria.nombre || !newCategoria.codigo) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const parentId = newCategoria.parent_id ? parseInt(newCategoria.parent_id) : undefined
    const parentCategoria = parentId ? categorias.find(c => c.id === parentId) : null
    const nivel = parentCategoria ? parentCategoria.nivel + 1 : 1

    const nuevaCategoria: Categoria = {
      id: Math.max(...categorias.map(c => c.id)) + 1,
      nombre: newCategoria.nombre,
      codigo: newCategoria.codigo.toUpperCase(),
      descripcion: newCategoria.descripcion,
      color: newCategoria.color,
      icono: newCategoria.icono || undefined,
      parent_id: parentId,
      nivel: nivel,
      orden: newCategoria.orden,
      activo: true,
      visible: newCategoria.visible,
      permite_subcategorias: newCategoria.permite_subcategorias,
      modulo: newCategoria.modulo,
      metadata: newCategoria.metadata,
      subcategorias: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setCategorias([...categorias, nuevaCategoria])
    setNewCategoria({
      nombre: '',
      codigo: '',
      descripcion: '',
      color: '#3B82F6',
      icono: '',
      parent_id: '',
      orden: 1,
      visible: true,
      permite_subcategorias: true,
      modulo: '',
      metadata: {}
    })
    setIsCreateDialogOpen(false)
  }

  const toggleExpanded = (categoriaId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoriaId)) {
      newExpanded.delete(categoriaId)
    } else {
      newExpanded.add(categoriaId)
    }
    setExpandedCategories(newExpanded)
  }

  const renderCategoriaCard = (categoria: Categoria, level: number = 0) => {
    const hasSubcategorias = categoria.subcategorias && categoria.subcategorias.length > 0
    const isExpanded = expandedCategories.has(categoria.id)
    const indentClass = level > 0 ? `ml-${level * 6}` : ''

    return (
      <div key={categoria.id} className={`${indentClass}`}>
        <Card className="hover:shadow-md transition-all duration-200 mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {hasSubcategorias && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpanded(categoria.id)}
                    className="p-1 h-6 w-6"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                {!hasSubcategorias && <div className="w-6" />}
                
                <div 
                  className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: categoria.color }}
                />
                
                {hasSubcategorias ? (
                  <FolderOpen className="w-5 h-5 text-gray-600 flex-shrink-0" />
                ) : (
                  <Folder className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{categoria.nombre}</h3>
                    <Badge variant="outline" className="text-xs">
                      {categoria.codigo}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Nivel {categoria.nivel}
                    </Badge>
                    {!categoria.activo && (
                      <Badge variant="destructive" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>Módulo: {categoria.modulo}</span>
                    <span>Orden: {categoria.orden}</span>
                    {categoria.permite_subcategorias && (
                      <Badge variant="outline" className="text-xs">
                        Permite subcategorías
                      </Badge>
                    )}
                  </div>
                  
                  {categoria.descripcion && (
                    <p className="text-xs text-gray-700 mt-1 truncate">
                      {categoria.descripcion}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-1 ml-2">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Renderizar subcategorías */}
        {hasSubcategorias && isExpanded && (
          <div className="ml-4">
            {categoria.subcategorias!.map(subcategoria => 
              renderCategoriaCard(subcategoria, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  const categoriasRaiz = categoriasFiltradas.filter(categoria => !categoria.parent_id)
  const categoriasDisponibles = categorias.filter(c => c.permite_subcategorias && c.activo)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
          <p className="text-muted-foreground">
            Gestión jerárquica de categorías para organización del sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={newCategoria.nombre}
                    onChange={(e) => setNewCategoria({...newCategoria, nombre: e.target.value})}
                    placeholder="Ej: Equipos Médicos"
                  />
                </div>
                
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={newCategoria.codigo}
                    onChange={(e) => setNewCategoria({...newCategoria, codigo: e.target.value.toUpperCase()})}
                    placeholder="Ej: EQUIP_MED"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="modulo">Módulo *</Label>
                  <Select
                    value={newCategoria.modulo}
                    onValueChange={(value) => setNewCategoria({...newCategoria, modulo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modulos.map((modulo) => (
                        <SelectItem key={modulo} value={modulo}>
                          {modulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="parent">Categoría Padre</Label>
                  <Select
                    value={newCategoria.parent_id}
                    onValueChange={(value) => setNewCategoria({...newCategoria, parent_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin categoría padre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin categoría padre</SelectItem>
                      {categoriasDisponibles.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id.toString()}>
                          {categoria.nombre} ({categoria.codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="orden">Orden</Label>
                  <Input
                    id="orden"
                    type="number"
                    min="1"
                    value={newCategoria.orden}
                    onChange={(e) => setNewCategoria({...newCategoria, orden: parseInt(e.target.value) || 1})}
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
                      className={`w-8 h-8 rounded border-2 ${color.class} ${
                        newCategoria.color === color.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      onClick={() => setNewCategoria({...newCategoria, color: color.value})}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newCategoria.descripcion}
                  onChange={(e) => setNewCategoria({...newCategoria, descripcion: e.target.value})}
                  placeholder="Descripción de la categoría"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visible"
                    checked={newCategoria.visible}
                    onCheckedChange={(checked) => setNewCategoria({...newCategoria, visible: checked})}
                  />
                  <Label htmlFor="visible">Visible en interfaces</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="subcategorias"
                    checked={newCategoria.permite_subcategorias}
                    onCheckedChange={(checked) => setNewCategoria({...newCategoria, permite_subcategorias: checked})}
                  />
                  <Label htmlFor="subcategorias">Permite subcategorías</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCategoria}>
                  Crear Categoría
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
              <Folder className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{categorias.length}</p>
                <p className="text-sm text-gray-600">Total Categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{categoriasRaiz.length}</p>
                <p className="text-sm text-gray-600">Categorías Raíz</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Folder className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{categorias.filter(c => c.parent_id).length}</p>
                <p className="text-sm text-gray-600">Subcategorías</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Folder className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{modulos.length}</p>
                <p className="text-sm text-gray-600">Módulos</p>
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
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filtroModulo} onValueChange={setFiltroModulo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los módulos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los módulos</SelectItem>
                {modulos.map((modulo) => (
                  <SelectItem key={modulo} value={modulo}>
                    {modulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filtroNivel} onValueChange={setFiltroNivel}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="1">Nivel 1</SelectItem>
                <SelectItem value="2">Nivel 2</SelectItem>
                <SelectItem value="3">Nivel 3</SelectItem>
                <SelectItem value="4">Nivel 4</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setExpandedCategories(new Set(categorias.map(c => c.id)))}
            >
              Expandir Todo
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setExpandedCategories(new Set())}
            >
              Contraer Todo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Categorías */}
      <div className="space-y-2">
        {categoriasRaiz.map(categoria => renderCategoriaCard(categoria))}
      </div>

      {categoriasFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No se encontraron categorías</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filtroModulo || filtroNivel 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay categorías configuradas en el sistema'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}