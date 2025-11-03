'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { sedeApi, Sede } from '@/lib/api/sedes'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Filter, X, Search, Download, RefreshCw } from 'lucide-react'

export interface FilterState {
  search: string
  cliente_id: string
  sede_id: string
  estado: string
  prioridad: string
  tipo_solicitud: string
  fecha_desde: Date | undefined
  fecha_hasta: Date | undefined
  sort_by: string
  sort_order: 'asc' | 'desc'
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onExport?: () => void
  onRefresh?: () => void
  showEstado?: boolean
  showPrioridad?: boolean
  showTipoSolicitud?: boolean
  showDateRange?: boolean
  module?: 'equipos' | 'solicitudes' | 'ordenes' | 'visitas' | 'cotizaciones'
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onExport,
  onRefresh,
  showEstado = true,
  showPrioridad = true,
  showTipoSolicitud = true,
  showDateRange = true,
  module = 'solicitudes'
}: AdvancedFiltersProps) {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [clientes, setClientes] = useState<Array<{id: number, nombre: string}>>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    fetchSedes()
  }, [])

  useEffect(() => {
    // Count active filters
    let count = 0
    if (filters.search) count++
    if (filters.cliente_id) count++
    if (filters.sede_id) count++
    if (filters.estado) count++
    if (filters.prioridad) count++
    if (filters.tipo_solicitud) count++
    if (filters.fecha_desde) count++
    if (filters.fecha_hasta) count++
    setActiveFiltersCount(count)
  }, [filters])

  const fetchSedes = async () => {
    try {
      const response = await sedeApi.getAll({ limit: 100 })
      if (response.success && response.data) {
        setSedes(response.data.sedes)
        
        // Extract unique clients
        const uniqueClientes = response.data.sedes.reduce((acc, sede) => {
          if (sede.cliente_id && sede.cliente_nombre) {
            const existing = acc.find(c => c.id === sede.cliente_id)
            if (!existing) {
              acc.push({
                id: sede.cliente_id,
                nombre: sede.cliente_nombre
              })
            }
          }
          return acc
        }, [] as Array<{id: number, nombre: string}>)
        
        setClientes(uniqueClientes)
      }
    } catch (error) {
      console.error('Error fetching sedes:', error)
    }
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      cliente_id: '',
      sede_id: '',
      estado: '',
      prioridad: '',
      tipo_solicitud: '',
      fecha_desde: undefined,
      fecha_hasta: undefined,
      sort_by: 'fecha_creacion',
      sort_order: 'desc'
    })
  }

  const getEstadoOptions = () => {
    switch (module) {
      case 'equipos':
        return [
          { value: 'activo', label: 'Activo' },
          { value: 'inactivo', label: 'Inactivo' },
          { value: 'mantenimiento', label: 'Mantenimiento' },
          { value: 'dado_baja', label: 'Dado de Baja' }
        ]
      case 'solicitudes':
        return [
          { value: 'pendiente', label: 'Pendiente' },
          { value: 'asignada', label: 'Asignada' },
          { value: 'en_proceso', label: 'En Proceso' },
          { value: 'completada', label: 'Completada' },
          { value: 'cancelada', label: 'Cancelada' }
        ]
      case 'ordenes':
        return [
          { value: 'pendiente', label: 'Pendiente' },
          { value: 'en_proceso', label: 'En Proceso' },
          { value: 'ejecutada', label: 'Ejecutada' },
          { value: 'cancelada', label: 'Cancelada' }
        ]
      case 'visitas':
        return [
          { value: 'programada', label: 'Programada' },
          { value: 'en_curso', label: 'En Curso' },
          { value: 'completada', label: 'Completada' },
          { value: 'cancelada', label: 'Cancelada' }
        ]
      case 'cotizaciones':
        return [
          { value: 'borrador', label: 'Borrador' },
          { value: 'enviada', label: 'Enviada' },
          { value: 'aprobada', label: 'Aprobada' },
          { value: 'rechazada', label: 'Rechazada' },
          { value: 'vencida', label: 'Vencida' }
        ]
      default:
        return []
    }
  }

  const getTipoSolicitudOptions = () => {
    return [
      { value: 'mantenimiento_preventivo', label: 'Mantenimiento Preventivo' },
      { value: 'mantenimiento_correctivo', label: 'Mantenimiento Correctivo' },
      { value: 'calibracion', label: 'Calibración' },
      { value: 'instalacion', label: 'Instalación' },
      { value: 'capacitacion', label: 'Capacitación' },
      { value: 'consulta_tecnica', label: 'Consulta Técnica' }
    ]
  }

  const getSortOptions = () => {
    switch (module) {
      case 'equipos':
        return [
          { value: 'fecha_creacion', label: 'Fecha de Creación' },
          { value: 'referencia', label: 'Referencia' },
          { value: 'estado', label: 'Estado' },
          { value: 'fecha_instalacion', label: 'Fecha Instalación' }
        ]
      case 'solicitudes':
        return [
          { value: 'fecha_solicitud', label: 'Fecha de Solicitud' },
          { value: 'fecha_requerida', label: 'Fecha Requerida' },
          { value: 'prioridad', label: 'Prioridad' },
          { value: 'estado', label: 'Estado' }
        ]
      case 'ordenes':
        return [
          { value: 'fecha_programada', label: 'Fecha Programada' },
          { value: 'fecha_creacion', label: 'Fecha de Creación' },
          { value: 'prioridad', label: 'Prioridad' },
          { value: 'estado', label: 'Estado' }
        ]
      case 'visitas':
        return [
          { value: 'fecha_programada', label: 'Fecha Programada' },
          { value: 'fecha_creacion', label: 'Fecha de Creación' },
          { value: 'estado', label: 'Estado' }
        ]
      case 'cotizaciones':
        return [
          { value: 'fecha_creacion', label: 'Fecha de Creación' },
          { value: 'fecha_vencimiento', label: 'Fecha Vencimiento' },
          { value: 'total', label: 'Valor Total' },
          { value: 'estado', label: 'Estado' }
        ]
      default:
        return [{ value: 'fecha_creacion', label: 'Fecha de Creación' }]
    }
  }

  const getSedesByCliente = () => {
    if (!filters.cliente_id) return sedes
    return sedes.filter(sede => sede.cliente_id?.toString() === filters.cliente_id)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} activos</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Contraer' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Bar - Always visible */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${module}...`}
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filters - Always visible */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filters.cliente_id} onValueChange={(value) => {
            updateFilter('cliente_id', value)
            updateFilter('sede_id', '') // Reset sede when cliente changes
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los clientes</SelectItem>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id.toString()}>
                  {cliente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showEstado && (
            <Select value={filters.estado} onValueChange={(value) => updateFilter('estado', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {getEstadoOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showPrioridad && (
            <Select value={filters.prioridad} onValueChange={(value) => updateFilter('prioridad', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Extended Filters - Collapsible */}
        {isExpanded && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sede Filter */}
              <div className="space-y-2">
                <Label>Sede</Label>
                <Select 
                  value={filters.sede_id} 
                  onValueChange={(value) => updateFilter('sede_id', value)}
                  disabled={!filters.cliente_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sede" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las sedes</SelectItem>
                    {getSedesByCliente().map((sede) => (
                      <SelectItem key={sede.id} value={sede.id.toString()}>
                        {sede.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo Solicitud Filter */}
              {showTipoSolicitud && (
                <div className="space-y-2">
                  <Label>Tipo de Solicitud</Label>
                  <Select 
                    value={filters.tipo_solicitud} 
                    onValueChange={(value) => updateFilter('tipo_solicitud', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los tipos</SelectItem>
                      {getTipoSolicitudOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <div className="flex gap-2">
                  <Select 
                    value={filters.sort_by} 
                    onValueChange={(value) => updateFilter('sort_by', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getSortOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={filters.sort_order} 
                    onValueChange={(value: 'asc' | 'desc') => updateFilter('sort_order', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Desc</SelectItem>
                      <SelectItem value="asc">Asc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Date Range Filters */}
            {showDateRange && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha desde</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.fecha_desde ? (
                            format(filters.fecha_desde, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.fecha_desde}
                          onSelect={(date) => updateFilter('fecha_desde', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha hasta</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.fecha_hasta ? (
                            format(filters.fecha_hasta, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.fecha_hasta}
                          onSelect={(date) => updateFilter('fecha_hasta', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}