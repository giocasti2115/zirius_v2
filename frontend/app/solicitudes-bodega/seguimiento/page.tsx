'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Eye, 
  Clock, 
  AlertTriangle, 
  Package,
  User,
  Calendar,
  DollarSign,
  Timeline,
  Truck,
  CheckCircle,
  Bell,
  Filter,
  Search,
  Download,
  MapPin,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react'
import solicitudesBodegaService, { 
  SolicitudBodega, 
  FiltrosSolicitudes 
} from '@/lib/services/solicitudes-bodega.service'
import { cn } from '@/lib/utils'

// Timeline de estados
const TIMELINE_ESTADOS = [
  { key: 'pendiente', label: 'Pendiente', icon: Clock, color: 'yellow' },
  { key: 'aprobada', label: 'Aprobada', icon: CheckCircle, color: 'green' },
  { key: 'despachada', label: 'Despachada', icon: Truck, color: 'blue' },
  { key: 'completada', label: 'Completada', icon: CheckCircle, color: 'emerald' }
]

interface SolicitudConProgreso extends SolicitudBodega {
  progreso: number
  diasTranscurridos: number
  estadoActualIndex: number
  proximoPaso?: string
  alertas?: string[]
  comentarios?: Array<{
    fecha: string
    usuario: string
    mensaje: string
    tipo: 'info' | 'warning' | 'success'
  }>
}

export default function SeguimientoPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudConProgreso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudConProgreso | null>(null)
  const [showDetalles, setShowDetalles] = useState(false)
  const [vistaActual, setVistaActual] = useState<'tarjetas' | 'timeline' | 'analytics'>('tarjetas')
  
  const [filtros, setFiltros] = useState<FiltrosSolicitudes>({
    page: 1,
    limit: 50,
    orderBy: 'creacion',
    orderDirection: 'desc'
  })

  // Cargar y enriquecer solicitudes
  useEffect(() => {
    cargarSolicitudes()
  }, [filtros])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await solicitudesBodegaService.obtenerSolicitudes(filtros)
      
      // Enriquecer solicitudes con datos de seguimiento
      const solicitudesEnriquecidas: SolicitudConProgreso[] = response.solicitudes.map(solicitud => {
        const estadoIndex = TIMELINE_ESTADOS.findIndex(e => 
          e.key === solicitud.estado.toLowerCase()
        )
        
        const progreso = estadoIndex >= 0 ? ((estadoIndex + 1) / TIMELINE_ESTADOS.length) * 100 : 0
        const diasTranscurridos = getDiasTranscurridos(solicitud.creacion || '')
        
        // Generar alertas
        const alertas: string[] = []
        if (solicitud.prioridad === 'urgente' && estadoIndex === 0 && diasTranscurridos > 1) {
          alertas.push('Solicitud urgente pendiente por más de 1 día')
        }
        if (estadoIndex === 1 && diasTranscurridos > 7) {
          alertas.push('Solicitud aprobada sin despachar por más de 7 días')
        }
        if (estadoIndex === 2 && diasTranscurridos > 14) {
          alertas.push('Solicitud despachada sin completar por más de 14 días')
        }

        // Próximo paso
        let proximoPaso = ''
        switch (estadoIndex) {
          case 0:
            proximoPaso = 'Esperando aprobación'
            break
          case 1:
            proximoPaso = 'Preparar despacho'
            break
          case 2:
            proximoPaso = 'Confirmar recepción'
            break
          case 3:
            proximoPaso = 'Completado'
            break
          default:
            proximoPaso = 'Revisar estado'
        }

        // Comentarios simulados
        const comentarios = [
          {
            fecha: solicitud.creacion || '',
            usuario: solicitud.creador,
            mensaje: 'Solicitud creada',
            tipo: 'info' as const
          }
        ]

        if (solicitud.fechaAprobacion) {
          comentarios.push({
            fecha: solicitud.fechaAprobacion,
            usuario: 'Supervisor',
            mensaje: 'Solicitud aprobada',
            tipo: 'success' as const
          })
        }

        if (solicitud.fechaDespacho) {
          comentarios.push({
            fecha: solicitud.fechaDespacho,
            usuario: 'Bodeguero',
            mensaje: 'Solicitud despachada',
            tipo: 'info' as const
          })
        }

        return {
          ...solicitud,
          progreso,
          diasTranscurridos,
          estadoActualIndex: estadoIndex,
          proximoPaso,
          alertas,
          comentarios
        }
      })
      
      setSolicitudes(solicitudesEnriquecidas)
    } catch (err) {
      console.error('Error cargando solicitudes:', err)
      setError('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (key: keyof FiltrosSolicitudes, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const abrirDetalles = (solicitud: SolicitudConProgreso) => {
    setSolicitudSeleccionada(solicitud)
    setShowDetalles(true)
  }

  const getDiasTranscurridos = (fechaCreacion: string): number => {
    const fechaCreacionDate = new Date(fechaCreacion)
    const fechaActual = new Date()
    const diffTime = Math.abs(fechaActual.getTime() - fechaCreacionDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase()
    switch (estadoLower) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'despachada':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completada':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'text-red-600'
      case 'alta':
        return 'text-orange-600'
      case 'media':
        return 'text-blue-600'
      case 'baja':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  // Renderizar vista de tarjetas
  const renderVistaTarjetas = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {solicitudes.map((solicitud) => (
        <Card 
          key={solicitud.id} 
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg",
            solicitud.alertas && solicitud.alertas.length > 0 ? 'border-orange-300 bg-orange-50' : ''
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-lg">#{solicitud.id}</div>
                <Badge className={cn("border", getEstadoBadge(solicitud.estado))}>
                  {solicitud.estado}
                </Badge>
              </div>
              {solicitud.alertas && solicitud.alertas.length > 0 && (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progreso */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso</span>
                <span className="font-medium">{Math.round(solicitud.progreso)}%</span>
              </div>
              <Progress value={solicitud.progreso} className="h-2" />
            </div>

            {/* Información básica */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{solicitud.cliente}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span>{solicitud.equipo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{solicitud.diasTranscurridos} días transcurridos</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{formatCurrency(solicitud.valorTotal || 0)}</span>
              </div>
            </div>

            {/* Próximo paso */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-blue-600 mb-1">PRÓXIMO PASO</div>
              <div className="text-sm text-blue-800">{solicitud.proximoPaso}</div>
            </div>

            {/* Alertas */}
            {solicitud.alertas && solicitud.alertas.length > 0 && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-orange-600 mb-1">ALERTAS</div>
                {solicitud.alertas.map((alerta, index) => (
                  <div key={index} className="text-sm text-orange-800">
                    • {alerta}
                  </div>
                ))}
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => abrirDetalles(solicitud)}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Seguimiento Completo
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Renderizar vista de timeline
  const renderVistaTimeline = () => (
    <div className="space-y-6">
      {solicitudes.map((solicitud) => (
        <Card key={solicitud.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="font-semibold text-lg">#{solicitud.id}</div>
              <div className="text-sm text-gray-600">{solicitud.cliente} - {solicitud.equipo}</div>
            </div>
            <Badge className={cn("border", getEstadoBadge(solicitud.estado))}>
              {solicitud.estado}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            {TIMELINE_ESTADOS.map((estado, index) => {
              const isCompleted = index <= solicitud.estadoActualIndex
              const isCurrent = index === solicitud.estadoActualIndex
              const EstadoIcon = estado.icon

              return (
                <div key={estado.key} className="flex flex-col items-center flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2",
                    isCompleted 
                      ? `bg-${estado.color}-100 border-${estado.color}-300 text-${estado.color}-700`
                      : 'bg-gray-100 border-gray-300 text-gray-500',
                    isCurrent ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  )}>
                    <EstadoIcon className="h-5 w-5" />
                  </div>
                  <div className={cn(
                    "text-xs text-center",
                    isCompleted ? `text-${estado.color}-700` : 'text-gray-500'
                  )}>
                    {estado.label}
                  </div>
                  {index < TIMELINE_ESTADOS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mt-2",
                      index < solicitud.estadoActualIndex 
                        ? `bg-${estado.color}-300` 
                        : 'bg-gray-200'
                    )} />
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>{solicitud.diasTranscurridos} días transcurridos</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => abrirDetalles(solicitud)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )

  // Renderizar vista de analytics
  const renderVistaAnalytics = () => {
    const estadisticas = {
      promedioTiempo: solicitudes.reduce((acc, s) => acc + s.diasTranscurridos, 0) / solicitudes.length,
      solicitudesConAlertas: solicitudes.filter(s => s.alertas && s.alertas.length > 0).length,
      distribucionEstados: TIMELINE_ESTADOS.map(estado => ({
        estado: estado.label,
        cantidad: solicitudes.filter(s => s.estado.toLowerCase() === estado.key).length
      }))
    }

    return (
      <div className="space-y-6">
        {/* Métricas de rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">{estadisticas.promedioTiempo.toFixed(1)} días</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Con Alertas</p>
                  <p className="text-2xl font-bold text-orange-600">{estadisticas.solicitudesConAlertas}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Seguimiento</p>
                  <p className="text-2xl font-bold">{solicitudes.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                  <p className="text-2xl font-bold text-emerald-600">87%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribución por estados */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estadisticas.distribucionEstados.map((item) => (
                <div key={item.estado} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.estado}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.cantidad / solicitudes.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{item.cantidad}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista resumida */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes con Mayor Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {solicitudes
                .sort((a, b) => b.diasTranscurridos - a.diasTranscurridos)
                .slice(0, 10)
                .map((solicitud) => (
                <div key={solicitud.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">#{solicitud.id}</div>
                    <div className="text-sm text-gray-600">{solicitud.cliente}</div>
                    <Badge className={cn("border", getEstadoBadge(solicitud.estado))}>
                      {solicitud.estado}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-orange-600">
                    {solicitud.diasTranscurridos} días
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seguimiento de Solicitudes</h1>
          <p className="text-gray-600 mt-2">
            Monitoreo en tiempo real del estado y progreso de todas las solicitudes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={vistaActual} onValueChange={(value) => setVistaActual(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tarjetas">Vista Tarjetas</SelectItem>
              <SelectItem value="timeline">Vista Timeline</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, equipo, aviso..."
                  className="pl-10"
                  value={filtros.search || ''}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                />
              </div>
            </div>
            <Select value={filtros.estado || ''} onValueChange={(value) => handleFiltroChange('estado', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="despachada">Despachada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido según vista seleccionada */}
      {vistaActual === 'tarjetas' && renderVistaTarjetas()}
      {vistaActual === 'timeline' && renderVistaTimeline()}
      {vistaActual === 'analytics' && renderVistaAnalytics()}

      {solicitudes.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay solicitudes para seguimiento
            </h3>
            <p className="text-gray-600">
              No se encontraron solicitudes con los filtros actuales
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalles Completos */}
      <Dialog open={showDetalles} onOpenChange={setShowDetalles}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timeline className="h-5 w-5" />
              Seguimiento Completo - Solicitud #{solicitudSeleccionada?.id}
            </DialogTitle>
          </DialogHeader>
          
          {solicitudSeleccionada && (
            <div className="space-y-6">
              {/* Progreso visual */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado del Proceso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progreso General</span>
                        <span className="font-medium">{Math.round(solicitudSeleccionada.progreso)}%</span>
                      </div>
                      <Progress value={solicitudSeleccionada.progreso} className="h-3" />
                    </div>

                    {/* Timeline detallado */}
                    <div className="space-y-4 mt-6">
                      {TIMELINE_ESTADOS.map((estado, index) => {
                        const isCompleted = index <= solicitudSeleccionada.estadoActualIndex
                        const isCurrent = index === solicitudSeleccionada.estadoActualIndex
                        const EstadoIcon = estado.icon

                        return (
                          <div key={estado.key} className="flex items-center gap-4">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center border-2",
                              isCompleted 
                                ? `bg-${estado.color}-100 border-${estado.color}-300 text-${estado.color}-700`
                                : 'bg-gray-100 border-gray-300 text-gray-500',
                              isCurrent ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                            )}>
                              <EstadoIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className={cn(
                                "font-medium",
                                isCompleted ? `text-${estado.color}-700` : 'text-gray-500'
                              )}>
                                {estado.label}
                              </div>
                              {isCurrent && (
                                <div className="text-sm text-blue-600 font-medium">
                                  Estado actual - {solicitudSeleccionada.proximoPaso}
                                </div>
                              )}
                            </div>
                            {isCompleted && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información detallada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información de la Solicitud</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Cliente</div>
                      <div>{solicitudSeleccionada.cliente}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Sede</div>
                      <div>{solicitudSeleccionada.sede}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Equipo</div>
                      <div>{solicitudSeleccionada.equipo} - {solicitudSeleccionada.serie}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Creador</div>
                      <div>{solicitudSeleccionada.creador}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Valor Total</div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(solicitudSeleccionada.valorTotal || 0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métricas de Tiempo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Fecha de Creación</div>
                      <div>{formatDate(solicitudSeleccionada.creacion || '')}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Días Transcurridos</div>
                      <div className="font-semibold">{solicitudSeleccionada.diasTranscurridos} días</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Prioridad</div>
                      <Badge variant="outline" className="border">
                        {solicitudSeleccionada.prioridad || 'Media'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Próximo Paso</div>
                      <div className="text-blue-600 font-medium">{solicitudSeleccionada.proximoPaso}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas */}
              {solicitudSeleccionada.alertas && solicitudSeleccionada.alertas.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Alertas y Notificaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {solicitudSeleccionada.alertas.map((alerta, index) => (
                        <div key={index} className="flex items-center gap-2 text-orange-800">
                          <Bell className="h-4 w-4" />
                          <span>{alerta}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comentarios y notas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Historial de Comentarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {solicitudSeleccionada.comentarios?.map((comentario, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{comentario.usuario}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{formatDate(comentario.fecha)}</span>
                        </div>
                        <div className="text-sm mt-1">{comentario.mensaje}</div>
                      </div>
                    )) || (
                      <div className="text-center text-gray-500 py-4">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No hay comentarios registrados</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}