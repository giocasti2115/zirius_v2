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
import { Search, Plus, Edit2, Trash2, Database, Settings, Eye, EyeOff } from 'lucide-react'

interface Variable {
  id: number
  nombre: string
  clave: string
  valor: string
  tipo: 'string' | 'number' | 'boolean' | 'json' | 'password'
  categoria: string
  descripcion: string
  editable: boolean
  visible: boolean
  valor_defecto: string
  activo: boolean
  created_at: string
  updated_at: string
}

export default function VariablesPage() {
  const [variables, setVariables] = useState<Variable[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})

  const [newVariable, setNewVariable] = useState({
    nombre: '',
    clave: '',
    valor: '',
    tipo: 'string' as const,
    categoria: '',
    descripcion: '',
    editable: true,
    visible: true
  })

  const categorias = [
    'Sistema',
    'Base de Datos',
    'Autenticación',
    'API Externa',
    'Notificaciones',
    'Archivos',
    'Seguridad',
    'Rendimiento',
    'Funcionalidades'
  ]

  const tipos = [
    { value: 'string', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'boolean', label: 'Verdadero/Falso' },
    { value: 'json', label: 'JSON' },
    { value: 'password', label: 'Contraseña' }
  ]

  // Datos de ejemplo de variables del sistema
  useEffect(() => {
    const variablesEjemplo: Variable[] = [
      {
        id: 1,
        nombre: 'Nombre del Sistema',
        clave: 'SYSTEM_NAME',
        valor: 'ZIRIUZ - Sistema de Gestión Técnica',
        tipo: 'string',
        categoria: 'Sistema',
        descripcion: 'Nombre oficial del sistema mostrado en interfaces',
        editable: true,
        visible: true,
        valor_defecto: 'ZIRIUZ',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Versión del Sistema',
        clave: 'SYSTEM_VERSION',
        valor: '2.0.0',
        tipo: 'string',
        categoria: 'Sistema',
        descripcion: 'Versión actual del sistema',
        editable: false,
        visible: true,
        valor_defecto: '1.0.0',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 3,
        nombre: 'Timeout de Sesión',
        clave: 'SESSION_TIMEOUT',
        valor: '3600',
        tipo: 'number',
        categoria: 'Autenticación',
        descripcion: 'Tiempo de inactividad en segundos antes de cerrar sesión',
        editable: true,
        visible: true,
        valor_defecto: '1800',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 4,
        nombre: 'Contraseña de Base de Datos',
        clave: 'DB_PASSWORD',
        valor: 'super_secret_password_123',
        tipo: 'password',
        categoria: 'Base de Datos',
        descripcion: 'Contraseña para conexión a la base de datos principal',
        editable: true,
        visible: false,
        valor_defecto: '',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 5,
        nombre: 'Notificaciones Activas',
        clave: 'NOTIFICATIONS_ENABLED',
        valor: 'true',
        tipo: 'boolean',
        categoria: 'Notificaciones',
        descripcion: 'Habilita o deshabilita el sistema de notificaciones',
        editable: true,
        visible: true,
        valor_defecto: 'false',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 6,
        nombre: 'Configuración de Email',
        clave: 'EMAIL_CONFIG',
        valor: '{"host":"smtp.gmail.com","port":587,"secure":false}',
        tipo: 'json',
        categoria: 'Notificaciones',
        descripcion: 'Configuración del servidor SMTP para envío de emails',
        editable: true,
        visible: true,
        valor_defecto: '{}',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 7,
        nombre: 'Tamaño Máximo de Archivo',
        clave: 'MAX_FILE_SIZE',
        valor: '52428800',
        tipo: 'number',
        categoria: 'Archivos',
        descripcion: 'Tamaño máximo permitido para subida de archivos en bytes (50MB)',
        editable: true,
        visible: true,
        valor_defecto: '10485760',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 8,
        nombre: 'Modo Mantenimiento',
        clave: 'MAINTENANCE_MODE',
        valor: 'false',
        tipo: 'boolean',
        categoria: 'Sistema',
        descripcion: 'Activa el modo mantenimiento del sistema',
        editable: true,
        visible: true,
        valor_defecto: 'false',
        activo: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ]

    setVariables(variablesEjemplo)
    setLoading(false)
  }, [])

  const variablesFiltradas = variables.filter(variable => {
    const matchSearch = variable.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       variable.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       variable.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = !filtroCategoria || variable.categoria === filtroCategoria
    const matchTipo = !filtroTipo || variable.tipo === filtroTipo
    
    return matchSearch && matchCategoria && matchTipo
  })

  const handleCreateVariable = () => {
    if (!newVariable.nombre || !newVariable.clave) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const nuevaVariable: Variable = {
      id: Math.max(...variables.map(v => v.id)) + 1,
      nombre: newVariable.nombre,
      clave: newVariable.clave.toUpperCase(),
      valor: newVariable.valor,
      tipo: newVariable.tipo,
      categoria: newVariable.categoria,
      descripcion: newVariable.descripcion,
      editable: newVariable.editable,
      visible: newVariable.visible,
      valor_defecto: newVariable.valor,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setVariables([...variables, nuevaVariable])
    setNewVariable({
      nombre: '',
      clave: '',
      valor: '',
      tipo: 'string',
      categoria: '',
      descripcion: '',
      editable: true,
      visible: true
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditVariable = (variable: Variable) => {
    setEditingVariable(variable)
  }

  const handleUpdateVariable = () => {
    if (!editingVariable) return

    setVariables(variables.map(v => 
      v.id === editingVariable.id 
        ? { ...editingVariable, updated_at: new Date().toISOString() }
        : v
    ))
    setEditingVariable(null)
  }

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const formatValue = (variable: Variable) => {
    if (variable.tipo === 'password') {
      return showPasswords[variable.id] ? variable.valor : '••••••••'
    }
    if (variable.tipo === 'boolean') {
      return variable.valor === 'true' ? 'Verdadero' : 'Falso'
    }
    if (variable.tipo === 'json') {
      try {
        return JSON.stringify(JSON.parse(variable.valor), null, 2)
      } catch {
        return variable.valor
      }
    }
    return variable.valor
  }

  const getTipoLabel = (tipo: string) => {
    return tipos.find(t => t.value === tipo)?.label || tipo
  }

  const getCategoriaColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Sistema': 'bg-blue-100 text-blue-800',
      'Base de Datos': 'bg-green-100 text-green-800',
      'Autenticación': 'bg-yellow-100 text-yellow-800',
      'API Externa': 'bg-purple-100 text-purple-800',
      'Notificaciones': 'bg-pink-100 text-pink-800',
      'Archivos': 'bg-orange-100 text-orange-800',
      'Seguridad': 'bg-red-100 text-red-800',
      'Rendimiento': 'bg-indigo-100 text-indigo-800',
      'Funcionalidades': 'bg-gray-100 text-gray-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando variables del sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Variables del Sistema</h2>
          <p className="text-muted-foreground">
            Configuración y parámetros del sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Variable
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Variable</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Variable *</Label>
                  <Input
                    id="nombre"
                    value={newVariable.nombre}
                    onChange={(e) => setNewVariable({...newVariable, nombre: e.target.value})}
                    placeholder="Ej: Timeout de Sesión"
                  />
                </div>
                
                <div>
                  <Label htmlFor="clave">Clave *</Label>
                  <Input
                    id="clave"
                    value={newVariable.clave}
                    onChange={(e) => setNewVariable({...newVariable, clave: e.target.value.toUpperCase()})}
                    placeholder="Ej: SESSION_TIMEOUT"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Dato *</Label>
                  <Select
                    value={newVariable.tipo}
                    onValueChange={(value: any) => setNewVariable({...newVariable, tipo: value})}
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
                    value={newVariable.categoria}
                    onValueChange={(value) => setNewVariable({...newVariable, categoria: value})}
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
              </div>
              
              <div>
                <Label htmlFor="valor">Valor</Label>
                {newVariable.tipo === 'json' ? (
                  <Textarea
                    id="valor"
                    value={newVariable.valor}
                    onChange={(e) => setNewVariable({...newVariable, valor: e.target.value})}
                    placeholder='{"key": "value"}'
                    rows={3}
                  />
                ) : (
                  <Input
                    id="valor"
                    type={newVariable.tipo === 'password' ? 'password' : 'text'}
                    value={newVariable.valor}
                    onChange={(e) => setNewVariable({...newVariable, valor: e.target.value})}
                    placeholder="Valor de la variable"
                  />
                )}
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newVariable.descripcion}
                  onChange={(e) => setNewVariable({...newVariable, descripcion: e.target.value})}
                  placeholder="Descripción de la variable"
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editable"
                    checked={newVariable.editable}
                    onChange={(e) => setNewVariable({...newVariable, editable: e.target.checked})}
                  />
                  <Label htmlFor="editable">Editable</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={newVariable.visible}
                    onChange={(e) => setNewVariable({...newVariable, visible: e.target.checked})}
                  />
                  <Label htmlFor="visible">Visible</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateVariable}>
                  Crear Variable
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
                <p className="text-2xl font-bold text-gray-900">{variables.length}</p>
                <p className="text-sm text-gray-600">Total Variables</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{variables.filter(v => v.editable).length}</p>
                <p className="text-sm text-gray-600">Editables</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{variables.filter(v => v.visible).length}</p>
                <p className="text-sm text-gray-600">Visibles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-orange-600" />
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
                  placeholder="Buscar variables por nombre, clave o descripción..."
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

      {/* Lista de Variables */}
      <div className="space-y-4">
        {variablesFiltradas.map((variable) => (
          <Card key={variable.id} className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{variable.nombre}</h3>
                    <Badge variant="outline" className={getCategoriaColor(variable.categoria)}>
                      {variable.categoria}
                    </Badge>
                    <Badge variant="secondary">
                      {getTipoLabel(variable.tipo)}
                    </Badge>
                    {!variable.editable && (
                      <Badge variant="destructive" className="text-xs">
                        Solo lectura
                      </Badge>
                    )}
                    {!variable.visible && (
                      <Badge variant="outline" className="text-xs">
                        Oculta
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium text-gray-600">Clave:</span>
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                        {variable.clave}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600">Valor:</span>
                        {variable.tipo === 'password' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePasswordVisibility(variable.id)}
                          >
                            {showPasswords[variable.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                      <div className="bg-gray-50 p-2 rounded border">
                        {variable.tipo === 'json' ? (
                          <pre className="text-xs overflow-x-auto">
                            {formatValue(variable)}
                          </pre>
                        ) : (
                          <p className="text-sm font-mono break-all">
                            {formatValue(variable)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {variable.descripcion && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Descripción:</span>
                      <p className="text-sm text-gray-700">{variable.descripcion}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {variable.editable && (
                    <Button size="sm" variant="outline" onClick={() => handleEditVariable(variable)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edición */}
      {editingVariable && (
        <Dialog open={!!editingVariable} onOpenChange={() => setEditingVariable(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Variable: {editingVariable.nombre}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-valor">Valor</Label>
                {editingVariable.tipo === 'json' ? (
                  <Textarea
                    id="edit-valor"
                    value={editingVariable.valor}
                    onChange={(e) => setEditingVariable({...editingVariable, valor: e.target.value})}
                    rows={5}
                  />
                ) : (
                  <Input
                    id="edit-valor"
                    type={editingVariable.tipo === 'password' ? 'password' : 'text'}
                    value={editingVariable.valor}
                    onChange={(e) => setEditingVariable({...editingVariable, valor: e.target.value})}
                  />
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingVariable(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateVariable}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {variablesFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No se encontraron variables</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filtroCategoria || filtroTipo 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay variables configuradas en el sistema'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}