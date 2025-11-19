'use client'

import { useState, useEffect } from 'react'
import { equipoApi, Equipo, CreateEquipoData, equipmentCatalogApi, ModeloEquipo, MarcaEquipo, TipoEquipo } from '@/lib/api/equipos'
import { sedeApi, Sede } from '@/lib/api/sedes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search, Edit, Trash2, Monitor, Building, MapPin, Calendar, Settings, ArrowLeft } from 'lucide-react'

interface EquiposTableProps {
  onEquipoSelect?: (equipo: Equipo) => void
}

export function EquiposTable({ onEquipoSelect }: EquiposTableProps) {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [modelos, setModelos] = useState<ModeloEquipo[]>([])
  const [marcas, setMarcas] = useState<MarcaEquipo[]>([])
  const [tipos, setTipos] = useState<TipoEquipo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSedes, setLoadingSedes] = useState(false)
  const [loadingModelos, setLoadingModelos] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null)

  // Form state - Updated to match backend schema
  const [formData, setFormData] = useState<CreateEquipoData>({
    sede_id: 0,
    numero_serie: '',
    referencia: '',
    ubicacion: '',
    estado: 'activo',
    fecha_instalacion: '',
    observaciones: '',
    marca_id: 0,
    clase_id: 0
  })

  const resetForm = () => {
    setFormData({
      sede_id: 0,
      numero_serie: '',
      referencia: '',
      ubicacion: '',
      estado: 'activo',
      fecha_instalacion: '',
      observaciones: '',
      marca_id: 0,
      clase_id: 0
    })
  }

  const fetchSedes = async () => {
    try {
      setLoadingSedes(true)
      const response = await sedeApi.getAll({ limit: 100 })
      if (response.success && response.data) {
        setSedes(response.data.sedes)
      }
    } catch (error) {
      console.error('Error fetching sedes:', error)
    } finally {
      setLoadingSedes(false)
    }
  }

  const fetchCatalogData = async () => {
    try {
      const [clasesRes, marcasRes] = await Promise.all([
        equipmentCatalogApi.getClases(),
        equipmentCatalogApi.getMarcas()
      ])

      if (clasesRes.success && clasesRes.data) setTipos(clasesRes.data)
      if (marcasRes.success && marcasRes.data) setMarcas(marcasRes.data)
      // Skip modelos for now since we don't have that endpoint
      setModelos([])
    } catch (error) {
      console.error('Error fetching catalog data:', error)
    }
  }

  const fetchEquipos = async () => {
    try {
      setLoading(true)
      console.log('🔄 Cargando equipos...', { currentPage, searchTerm });
      
      const response = await equipoApi.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      })
      
      console.log('📦 Respuesta de equipos:', response);
      
      if (response.success && response.data) {
        console.log('✅ Equipos cargados:', response.data);
        setEquipos(response.data.data) // Updated to use new response structure
        setTotalPages(response.data.pagination.total_pages) // Updated field name
      } else {
        console.log('❌ Error en respuesta:', response.message);
        toast.error('Error al cargar equipos: ' + (response.message || 'Error desconocido'))
      }
    } catch (error) {
      console.error('❌ Error fetching equipos:', error)
      toast.error('Error de conexión al cargar equipos')
      
      // Datos mock para testing
      console.log('🔧 Usando datos mock para debugging...');
      setEquipos([
        {
          id: 1,
          sede_id: 1,
          numero_serie: 'TEST-001',
          referencia: 'REF-001',
          ubicacion: 'Sala 1',
          estado: 'activo' as const,
          fecha_instalacion: '2024-01-01',
          fecha_creacion: '2024-01-01',
          fecha_actualizacion: '2024-01-01',
          sede_nombre: 'Sede Test',
          cliente_nombre: 'Cliente Test'
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipos()
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchSedes()
    fetchCatalogData()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.sede_id === 0) {
      toast.error('Debe seleccionar una sede')
      return
    }

    if (!formData.referencia) {
      toast.error('Debe ingresar una referencia del equipo')
      return
    }

    try {
      const response = await equipoApi.create(formData)
      if (response.success) {
        toast.success('Equipo creado exitosamente')
        setIsCreateDialogOpen(false)
        resetForm()
        fetchEquipos()
      } else {
        toast.error(response.error?.message || 'Error al crear equipo')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error creating equipo:', error)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEquipo) return

    if (formData.sede_id === 0) {
      toast.error('Debe seleccionar una sede')
      return
    }

    if (!formData.referencia) {
      toast.error('Debe ingresar una referencia del equipo')
      return
    }

    try {
      const response = await equipoApi.update(selectedEquipo.id, formData)
      if (response.success) {
        toast.success('Equipo actualizado exitosamente')
        setIsEditDialogOpen(false)
        resetForm()
        setSelectedEquipo(null)
        fetchEquipos()
      } else {
        toast.error(response.error?.message || 'Error al actualizar equipo')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error updating equipo:', error)
    }
  }

  const handleDelete = async (equipo: Equipo) => {
    if (!confirm(`¿Estás seguro de eliminar el equipo "${equipo.nombre}"?`)) return

    try {
      const response = await equipoApi.delete(equipo.id)
      if (response.success) {
        toast.success('Equipo eliminado exitosamente')
        fetchEquipos()
      } else {
        toast.error(response.error?.message || 'Error al eliminar equipo')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error deleting equipo:', error)
    }
  }

  const openEditDialog = (equipo: Equipo) => {
    setSelectedEquipo(equipo)
    setFormData({
      sede_id: equipo.sede_id,
      numero_serie: equipo.numero_serie || '',
      referencia: equipo.referencia || '',
      ubicacion: equipo.ubicacion || '',
      estado: equipo.estado,
      fecha_instalacion: equipo.fecha_instalacion || '',
      observaciones: equipo.observaciones || '',
      marca_id: equipo.marca_id || 0,
      clase_id: equipo.clase_id || 0
    })
    setIsEditDialogOpen(true)
  }

  const getSedeName = (sedeId: number) => {
    const sede = sedes.find(s => s.id === sedeId)
    return sede?.nombre || `Sede #${sedeId}`
  }

  const getMarcaName = (marcaId?: number) => {
    if (!marcaId) return 'Sin marca'
    const marca = marcas.find(m => m.id === marcaId)
    return marca?.nombre || `Marca #${marcaId}`
  }

  const getClaseName = (claseId?: number) => {
    if (!claseId) return 'Sin clase'
    const clase = tipos.find(t => t.id === claseId)
    return clase?.nombre || `Clase #${claseId}`
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activo': return 'default'
      case 'mantenimiento': return 'destructive'
      case 'inactivo': return 'secondary'
      case 'dado_baja': return 'outline'
      default: return 'secondary'
    }
  }

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'activo': return 'Activo'
      case 'mantenimiento': return 'Mantenimiento'
      case 'inactivo': return 'Inactivo'
      case 'dado_baja': return 'Dado de Baja'
      default: return estado
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Equipos</h1>
          <p className="text-muted-foreground">
            Administra los equipos odontológicos de tus clientes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Equipo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Equipo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sede">Sede *</Label>
                  <Select 
                    value={formData.sede_id.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, sede_id: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSedes ? (
                        <SelectItem value="0" disabled>Cargando sedes...</SelectItem>
                      ) : (
                        sedes.map((sede) => (
                          <SelectItem key={sede.id} value={sede.id.toString()}>
                            {sede.nombre} - {sede.cliente_nombre || `Cliente #${sede.cliente_id}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo de Equipo *</Label>
                  <Select 
                    value={formData.marca_id ? formData.marca_id.toString() : ""} 
                    onValueChange={(value) => setFormData({ ...formData, marca_id: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingModelos ? (
                        <SelectItem value="0" disabled>Cargando modelos...</SelectItem>
                      ) : (
                        modelos.map((modelo) => (
                          <SelectItem key={modelo.id} value={modelo.id.toString()}>
                            {modelo.marca_nombre} - {modelo.nombre} ({modelo.tipo_nombre})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Equipo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo_interno">Código Interno</Label>
                  <Input
                    id="codigo_interno"
                    value={formData.codigo_interno}
                    onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serie">Número de Serie</Label>
                  <Input
                    id="serie"
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_instalacion">Fecha Instalación</Label>
                  <Input
                    id="fecha_instalacion"
                    type="date"
                    value={formData.fecha_instalacion}
                    onChange={(e) => setFormData({ ...formData, fecha_instalacion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_garantia">Fecha Garantía</Label>
                  <Input
                    id="fecha_garantia"
                    type="date"
                    value={formData.fecha_garantia}
                    onChange={(e) => setFormData({ ...formData, fecha_garantia: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select 
                    value={formData.estado} 
                    onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="dado_baja">Dado de Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Equipo</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Lista de Equipos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referencia/Serie</TableHead>
                    <TableHead>Marca/Clase</TableHead>
                    <TableHead>Sede/Cliente</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipos.map((equipo) => (
                    <TableRow 
                      key={equipo.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onEquipoSelect?.(equipo)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{equipo.referencia || 'Sin referencia'}</div>
                          {equipo.numero_serie && (
                            <div className="text-sm text-muted-foreground">
                              Serie: {equipo.numero_serie}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {equipo.marca_nombre && (
                            <div className="font-medium">{equipo.marca_nombre}</div>
                          )}
                          {equipo.clase_nombre && (
                            <div className="text-sm text-muted-foreground">{equipo.clase_nombre}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {getSedeName(equipo.sede_id)}
                          </div>
                          {equipo.cliente_nombre && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building className="h-3 w-3" />
                              {equipo.cliente_nombre}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {equipo.ubicacion || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadgeVariant(equipo.estado)}>
                          {getEstadoLabel(equipo.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditDialog(equipo)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(equipo)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {equipos.length === 0 && !loading && (
                <div className="text-center py-10">
                  <Monitor className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay equipos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza creando un nuevo equipo.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - Similar to Create Dialog but with edit form */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Similar form structure as create, but with edit prefix on IDs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sede">Sede *</Label>
                <Select 
                  value={formData.sede_id.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, sede_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sede" />
                  </SelectTrigger>
                  <SelectContent>
                    {sedes.map((sede) => (
                      <SelectItem key={sede.id} value={sede.id.toString()}>
                        {sede.nombre} - {sede.cliente_nombre || `Cliente #${sede.cliente_id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-modelo">Modelo de Equipo *</Label>
                <Select 
                  value={formData.marca_id ? formData.marca_id.toString() : ""} 
                  onValueChange={(value) => setFormData({ ...formData, marca_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelos.map((modelo) => (
                      <SelectItem key={modelo.id} value={modelo.id.toString()}>
                        {modelo.marca_nombre} - {modelo.nombre} ({modelo.tipo_nombre})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre del Equipo *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-codigo_interno">Código Interno</Label>
                <Input
                  id="edit-codigo_interno"
                  value={formData.codigo_interno}
                  onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-serie">Número de Serie</Label>
                <Input
                  id="edit-serie"
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fecha_instalacion">Fecha Instalación</Label>
                <Input
                  id="edit-fecha_instalacion"
                  type="date"
                  value={formData.fecha_instalacion}
                  onChange={(e) => setFormData({ ...formData, fecha_instalacion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fecha_garantia">Fecha Garantía</Label>
                <Input
                  id="edit-fecha_garantia"
                  type="date"
                  value={formData.fecha_garantia}
                  onChange={(e) => setFormData({ ...formData, fecha_garantia: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-estado">Estado</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="dado_baja">Dado de Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ubicacion">Ubicación</Label>
                <Input
                  id="edit-ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-observaciones">Observaciones</Label>
              <Textarea
                id="edit-observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false)
                  resetForm()
                  setSelectedEquipo(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Actualizar Equipo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}