'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  AlertTriangle, 
  FileText,
  Package,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  History,
  Filter,
  Search,
  Download
} from 'lucide-react'
import solicitudesBodegaService, { 
  SolicitudBodega, 
  CambioEstado,
  FiltrosSolicitudes 
} from '@/lib/services/solicitudes-bodega.service'
import { cn } from '@/lib/utils'

export default function AprobacionesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudBodega[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudBodega | null>(null)
  const [showDetalles, setShowDetalles] = useState(false)
  const [actionModal, setActionModal] = useState<{
    type: 'aprobar' | 'rechazar' | null
    solicitud: SolicitudBodega | null
  }>({ type: null, solicitud: null })
  const [observaciones, setObservaciones] = useState('')
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)
  
  const [filtros, setFiltros] = useState<FiltrosSolicitudes>({
    estado: 'pendiente',
    page: 1,
    limit: 20,
    orderBy: 'creacion',
    orderDirection: 'desc'
  })

  // Cargar solicitudes pendientes
  useEffect(() => {
    cargarSolicitudes()
  }, [filtros])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await solicitudesBodegaService.obtenerSolicitudes(filtros)
      setSolicitudes(response.solicitudes)
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

  const abrirDetalles = (solicitud: SolicitudBodega) => {
    setSolicitudSeleccionada(solicitud)
    setShowDetalles(true)
  }

  const abrirModalAprobacion = (solicitud: SolicitudBodega, type: 'aprobar' | 'rechazar') => {
    setActionModal({ type, solicitud })
    setObservaciones('')
    setMotivo('')
  }

  const procesarAprobacion = async () => {
    if (!actionModal.solicitud) return
    
    try {
      setProcesando(true)
      
      if (actionModal.type === 'aprobar') {
        await solicitudesBodegaService.aprobarSolicitud(
          actionModal.solicitud.id, 
          observaciones
        )
      } else {
        await solicitudesBodegaService.rechazarSolicitud(
          actionModal.solicitud.id, 
          motivo
        )
      }
      
      // Recargar solicitudes
      await cargarSolicitudes()
      
      // Cerrar modal
      setActionModal({ type: null, solicitud: null })
    } catch (err) {
      console.error('Error procesando solicitud:', err)
      setError(`Error al ${actionModal.type} la solicitud`)
    } finally {
      setProcesando(false)
    }
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'media':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'baja':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
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

  const getDiasEnEspera = (fechaCreacion: string): number => {
    const fechaCreacionDate = new Date(fechaCreacion)
    const fechaActual = new Date()
    const diffTime = Math.abs(fechaActual.getTime() - fechaCreacionDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
          <h1 className="text-3xl font-bold text-gray-900">Aprobaciones de Solicitudes</h1>
          <p className="text-gray-600 mt-2">
            Revisa y aprueba o rechaza las solicitudes de bodega pendientes
          </p>
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
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Aprobación</CardTitle>
        </CardHeader>
        <CardContent>
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
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="aprobada">Aprobadas</SelectItem>
                <SelectItem value="rechazada">Rechazadas</SelectItem>
                <SelectItem value="">Todas</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitudes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {solicitudes.map((solicitud) => (
          <Card 
            key={solicitud.id} 
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              solicitud.prioridad === 'urgente' ? 'border-red-300 bg-red-50' : '',
              solicitud.prioridad === 'alta' ? 'border-orange-300 bg-orange-50' : ''
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
                <Badge variant="outline" className={cn("border", getPrioridadBadge(solicitud.prioridad || 'media'))}>
                  {solicitud.prioridad || 'Media'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Aviso: {solicitud.aviso}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">{solicitud.cliente}</div>
                    <div className="text-xs text-gray-600">{solicitud.sede}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">{solicitud.equipo}</div>
                    <div className="text-xs text-gray-600">Serie: {solicitud.serie}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm">{formatDate(solicitud.creacion || '')}</div>
                    <div className="text-xs text-gray-600">
                      {getDiasEnEspera(solicitud.creacion || '')} días en espera
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div className="font-medium text-sm">
                    {formatCurrency(solicitud.valorTotal || 0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>
                  {(solicitud.repuestos?.length || 0)} repuestos, {(solicitud.itemsAdicionales?.length || 0)} items
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => abrirDetalles(solicitud)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                {solicitud.estado === 'Pendiente' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => abrirModalAprobacion(solicitud, 'aprobar')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => abrirModalAprobacion(solicitud, 'rechazar')}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {solicitudes.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay solicitudes para aprobar
            </h3>
            <p className="text-gray-600">
              No se encontraron solicitudes con los filtros actuales
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalles */}
      <Dialog open={showDetalles} onOpenChange={setShowDetalles}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalles de Solicitud #{solicitudSeleccionada?.id}
            </DialogTitle>
          </DialogHeader>
          
          {solicitudSeleccionada && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ID / Aviso</Label>
                      <div className="text-sm">#{solicitudSeleccionada.id} - AV: {solicitudSeleccionada.aviso}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                      <div className="text-sm">{solicitudSeleccionada.cliente}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Sede</Label>
                      <div className="text-sm">{solicitudSeleccionada.sede}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Equipo</Label>
                      <div className="text-sm">{solicitudSeleccionada.equipo} - {solicitudSeleccionada.serie}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Servicio</Label>
                      <div className="text-sm">{solicitudSeleccionada.servicio}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Creador</Label>
                      <div className="text-sm">{solicitudSeleccionada.creador}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado y Prioridad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estado Actual</Label>
                      <div className="mt-1">
                        <Badge className={cn("border", getEstadoBadge(solicitudSeleccionada.estado))}>
                          {solicitudSeleccionada.estado}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Prioridad</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className={cn("border", getPrioridadBadge(solicitudSeleccionada.prioridad || 'media'))}>
                          {solicitudSeleccionada.prioridad || 'Media'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
                      <div className="text-sm">{formatDate(solicitudSeleccionada.creacion || '')}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Días en Espera</Label>
                      <div className="text-sm font-semibold text-orange-600">
                        {getDiasEnEspera(solicitudSeleccionada.creacion || '')} días
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Valor Total</Label>
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(solicitudSeleccionada.valorTotal || 0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Repuestos */}
              {solicitudSeleccionada.repuestos && solicitudSeleccionada.repuestos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Repuestos Solicitados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Descripción</th>
                            <th className="text-left p-2 font-medium">Cant</th>
                            <th className="text-left p-2 font-medium">V. Unitario</th>
                            <th className="text-left p-2 font-medium">V. Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {solicitudSeleccionada.repuestos.map((repuesto, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{repuesto.descripcion}</td>
                              <td className="p-2">{repuesto.cantidad}</td>
                              <td className="p-2">{formatCurrency(repuesto.valorUnitario)}</td>
                              <td className="p-2 font-semibold">{formatCurrency(repuesto.valorTotal || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items Adicionales */}
              {solicitudSeleccionada.itemsAdicionales && solicitudSeleccionada.itemsAdicionales.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Items Adicionales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Descripción</th>
                            <th className="text-left p-2 font-medium">Cant</th>
                            <th className="text-left p-2 font-medium">V. Unitario</th>
                            <th className="text-left p-2 font-medium">V. Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {solicitudSeleccionada.itemsAdicionales.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{item.descripcion}</td>
                              <td className="p-2">{item.cantidad}</td>
                              <td className="p-2">{formatCurrency(item.valorUnitario)}</td>
                              <td className="p-2 font-semibold">{formatCurrency(item.valorTotal || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observaciones */}
              {solicitudSeleccionada.observaciones && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{solicitudSeleccionada.observaciones}</p>
                  </CardContent>
                </Card>
              )}

              {/* Historial de Cambios */}
              {solicitudSeleccionada.cambios && solicitudSeleccionada.cambios.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Historial de Cambios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {solicitudSeleccionada.cambios.map((cambio, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{formatDate(cambio.fecha)}</span>
                              <span>-</span>
                              <span className="font-medium">{cambio.accion}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Usuario: {cambio.usuario}
                            </div>
                            {cambio.comentario && (
                              <div className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border">
                                {cambio.comentario}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acciones */}
              {solicitudSeleccionada.estado === 'Pendiente' && (
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    onClick={() => abrirModalAprobacion(solicitudSeleccionada, 'aprobar')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobar Solicitud
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => abrirModalAprobacion(solicitudSeleccionada, 'rechazar')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar Solicitud
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Aprobación/Rechazo */}
      <AlertDialog open={actionModal.type !== null} onOpenChange={() => setActionModal({ type: null, solicitud: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {actionModal.type === 'aprobar' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {actionModal.type === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionModal.type === 'aprobar' 
                ? `¿Está seguro de que desea aprobar la solicitud #${actionModal.solicitud?.id}?`
                : `¿Está seguro de que desea rechazar la solicitud #${actionModal.solicitud?.id}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {actionModal.type === 'aprobar' ? (
              <div>
                <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones sobre la aprobación..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="motivo">Motivo del rechazo *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Explique el motivo del rechazo..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={procesando}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={procesarAprobacion}
              disabled={procesando || (actionModal.type === 'rechazar' && !motivo.trim())}
              className={cn(
                actionModal.type === 'aprobar' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              )}
            >
              {procesando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  {actionModal.type === 'aprobar' ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {actionModal.type === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}