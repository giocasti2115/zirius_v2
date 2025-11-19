'use client'

import { useState, useEffect } from 'react'
import { solicitudApi, Solicitud, CreateSolicitudData } from '@/lib/api/solicitudes'
import { sedeApi, Sede } from '@/lib/api/sedes'
import { AdvancedFilters, FilterState } from '@/components/filters/AdvancedFilters'
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
import { Plus, Search, Eye, Edit, FileText, Clock, AlertTriangle, CheckCircle, XCircle, Building, MapPin, User, Calendar } from 'lucide-react'

interface SolicitudesTableProps {
  onSolicitudSelect?: (solicitud: Solicitud) => void
}

export function SolicitudesTable({ onSolicitudSelect }: SolicitudesTableProps) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSedes, setLoadingSedes] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Advanced Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    cliente_id: '',
    sede_id: '',
    estado: '',
    prioridad: '',
    tipo_solicitud: '',
    fecha_desde: undefined,
    fecha_hasta: undefined,
    sort_by: 'fecha_solicitud',
    sort_order: 'desc'
  })

  // Form state
  const [formData, setFormData] = useState<CreateSolicitudData>({
    cliente_id: 0,
    sede_id: 0,
    tipo_solicitud: 'mantenimiento_correctivo',
    prioridad: 'media',
    descripcion: '',
    contacto_nombre: '',
    contacto_telefono: '',
    contacto_email: ''
  })

  const resetForm = () => {
    setFormData({
      cliente_id: 0,
      sede_id: 0,
      tipo_solicitud: 'mantenimiento_correctivo',
      prioridad: 'media',
      descripcion: '',
      contacto_nombre: '',
      contacto_telefono: '',
      contacto_email: ''
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

  const fetchSolicitudes = async () => {
    try {
      setLoading(true)
      const response = await solicitudApi.getAll({
        page: currentPage,
        limit: 10,
        search: filters.search || undefined,
        cliente_id: filters.cliente_id ? parseInt(filters.cliente_id) : undefined,
        sede_id: filters.sede_id ? parseInt(filters.sede_id) : undefined,
        estado: filters.estado || undefined,
        prioridad: filters.prioridad || undefined,
        tipo_solicitud: filters.tipo_solicitud || undefined,
        fecha_desde: filters.fecha_desde?.toISOString().split('T')[0],
        fecha_hasta: filters.fecha_hasta?.toISOString().split('T')[0],
        sort_by: filters.sort_by,
        sort_order: filters.sort_order
      })
      
      if (response.success && response.data) {
        setSolicitudes(response.data.data)
        setTotalPages(response.data.pagination.total_pages)
      } else {
        toast.error('Error al cargar solicitudes')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error fetching solicitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitudes()
  }, [currentPage, filters])

  useEffect(() => {
    fetchSedes()
  }, [])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleExport = async () => {
    try {
      // Placeholder for export functionality
      toast.info('Función de exportación en desarrollo')
    } catch (error) {
      toast.error('Error al exportar datos')
    }
  }

  const handleRefresh = () => {
    fetchSolicitudes()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.cliente_id === 0) {
      toast.error('Debe seleccionar un cliente')
      return
    }

    if (formData.sede_id === 0) {
      toast.error('Debe seleccionar una sede')
      return
    }

    if (!formData.descripcion.trim()) {
      toast.error('Debe proporcionar una descripción')
      return
    }

    try {
      const response = await solicitudApi.create(formData)
      if (response.success) {
        toast.success('Solicitud creada exitosamente')
        setIsCreateDialogOpen(false)
        resetForm()
        fetchSolicitudes()
      } else {
        toast.error('Error al crear solicitud')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error creating solicitud:', error)
    }
  }

  const getPrioridadBadgeVariant = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'destructive'
      case 'alta': return 'destructive'
      case 'media': return 'default'
      case 'baja': return 'secondary'
      default: return 'secondary'
    }
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'secondary'
      case 'asignada': return 'default'
      case 'en_proceso': return 'default'
      case 'completada': return 'outline'
      case 'cancelada': return 'destructive'
      default: return 'secondary'
    }
  }

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'alta': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'media': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'baja': return <Clock className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completada': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelada': return <XCircle className="h-4 w-4 text-red-500" />
      case 'en_proceso': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTipoSolicitudLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'mantenimiento_preventivo': 'Mantenimiento Preventivo',
      'mantenimiento_correctivo': 'Mantenimiento Correctivo',
      'calibracion': 'Calibración',
      'instalacion': 'Instalación',
      'capacitacion': 'Capacitación',
      'consulta_tecnica': 'Consulta Técnica'
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Servicio</h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de mantenimiento y servicio técnico
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Solicitud</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sede">Sede *</Label>
                  <Select 
                    value={formData.sede_id.toString()} 
                    onValueChange={(value) => {
                      const sede = sedes.find(s => s.id.toString() === value)
                      setFormData({ 
                        ...formData, 
                        sede_id: parseInt(value),
                        cliente_id: sede?.cliente_id || 0
                      })
                    }}
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
                  <Label htmlFor="tipo_solicitud">Tipo de Solicitud *</Label>
                  <Select 
                    value={formData.tipo_solicitud} 
                    onValueChange={(value: any) => setFormData({ ...formData, tipo_solicitud: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mantenimiento_preventivo">Mantenimiento Preventivo</SelectItem>
                      <SelectItem value="mantenimiento_correctivo">Mantenimiento Correctivo</SelectItem>
                      <SelectItem value="calibracion">Calibración</SelectItem>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="capacitacion">Capacitación</SelectItem>
                      <SelectItem value="consulta_tecnica">Consulta Técnica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select 
                  value={formData.prioridad} 
                  onValueChange={(value: any) => setFormData({ ...formData, prioridad: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Problema *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={4}
                  placeholder="Describe detalladamente el problema o requerimiento..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contacto_nombre">Contacto</Label>
                  <Input
                    id="contacto_nombre"
                    value={formData.contacto_nombre || ''}
                    onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_telefono">Teléfono</Label>
                  <Input
                    id="contacto_telefono"
                    value={formData.contacto_telefono || ''}
                    onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                    placeholder="Teléfono de contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_email">Email</Label>
                  <Input
                    id="contacto_email"
                    type="email"
                    value={formData.contacto_email || ''}
                    onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
                    placeholder="email@contacto.com"
                  />
                </div>
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
                <Button type="submit">Crear Solicitud</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        module="solicitudes"
        showEstado={true}
        showPrioridad={true}
        showTipoSolicitud={true}
        showDateRange={true}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Solicitudes
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
                    <TableHead>Solicitud</TableHead>
                    <TableHead>Cliente/Sede</TableHead>
                    <TableHead>Tipo/Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudes.map((solicitud) => (
                    <TableRow 
                      key={solicitud.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSolicitudSelect?.(solicitud)}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">#{solicitud.id}</div>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {solicitud.descripcion}
                          </div>
                          {solicitud.equipo_referencia && (
                            <div className="text-xs text-muted-foreground">
                              Equipo: {solicitud.equipo_referencia}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Building className="h-3 w-3" />
                            {solicitud.cliente_nombre}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {solicitud.sede_nombre}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            {getTipoSolicitudLabel(solicitud.tipo_solicitud)}
                          </div>
                          <div className="flex items-center gap-1">
                            {getPrioridadIcon(solicitud.prioridad)}
                            <Badge variant={getPrioridadBadgeVariant(solicitud.prioridad)}>
                              {solicitud.prioridad.charAt(0).toUpperCase() + solicitud.prioridad.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getEstadoIcon(solicitud.estado)}
                          <Badge variant={getEstadoBadgeVariant(solicitud.estado)}>
                            {solicitud.estado.replace('_', ' ').charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(solicitud.fecha_solicitud)}
                          </div>
                          {solicitud.fecha_requerida && (
                            <div className="text-xs text-muted-foreground">
                              Requerida: {formatDate(solicitud.fecha_requerida)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {solicitud.contacto_nombre && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3" />
                              {solicitud.contacto_nombre}
                            </div>
                            {solicitud.contacto_telefono && (
                              <div className="text-xs text-muted-foreground">
                                {solicitud.contacto_telefono}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSolicitudSelect?.(solicitud)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {solicitudes.length === 0 && !loading && (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza creando una nueva solicitud de servicio.
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
    </div>
  )
}