'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  Package, 
  FileText, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  Filter,
  Search,
  Download
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import darDeBajaService, { 
  SolicitudBaja, 
  FiltrosBajas,
  EvaluacionTecnica 
} from '@/lib/services/dar-de-baja.service'
import { cn } from '@/lib/utils'

export default function AprobacionesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudBaja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosBajas>({
    page: 1,
    limit: 10,
    estado: 'pendiente',
    orderBy: 'fechaSolicitud',
    orderDirection: 'desc'
  })
  const [totalSolicitudes, setTotalSolicitudes] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Modales
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudBaja | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showAprobacionModal, setShowAprobacionModal] = useState(false)
  const [showRechazoModal, setShowRechazoModal] = useState(false)
  
  // Estados de evaluación
  const [evaluacionTecnica, setEvaluacionTecnica] = useState<Partial<EvaluacionTecnica>>({
    aprobado: true,
    observaciones: '',
    recomendaciones: '',
    valorRecuperableAprobado: null
  })

  // Cargar datos
  useEffect(() => {
    cargarSolicitudes()
  }, [filtros])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await darDeBajaService.obtenerSolicitudes(filtros)
      setSolicitudes(response.solicitudes)
      setTotalSolicitudes(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      console.error('Error cargando solicitudes:', err)
      setError('Error al cargar las solicitudes pendientes.')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (key: keyof FiltrosBajas, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFiltros(prev => ({ ...prev, page: newPage }))
  }

  // Abrir modal de detalles
  const verDetalles = (solicitud: SolicitudBaja) => {
    setSelectedSolicitud(solicitud)
    setShowDetalleModal(true)
  }

  // Preparar aprobación
  const prepararAprobacion = (solicitud: SolicitudBaja) => {
    setSelectedSolicitud(solicitud)
    setEvaluacionTecnica({
      aprobado: true,
      observaciones: '',
      recomendaciones: '',
      valorRecuperableAprobado: solicitud.valorRecuperable
    })
    setShowAprobacionModal(true)
  }

  // Preparar rechazo
  const prepararRechazo = (solicitud: SolicitudBaja) => {
    setSelectedSolicitud(solicitud)
    setEvaluacionTecnica({
      aprobado: false,
      observaciones: '',
      recomendaciones: '',
      valorRecuperableAprobado: null
    })
    setShowRechazoModal(true)
  }

  // Procesar aprobación
  const procesarAprobacion = async () => {
    if (!selectedSolicitud || !evaluacionTecnica.observaciones) return

    try {
      const evaluacion: EvaluacionTecnica = {
        evaluador: 'Usuario Técnico', // En producción obtener del contexto
        fechaEvaluacion: new Date().toISOString(),
        aprobado: true,
        observaciones: evaluacionTecnica.observaciones!,
        recomendaciones: evaluacionTecnica.recomendaciones || '',
        valorRecuperableAprobado: evaluacionTecnica.valorRecuperableAprobado
      }

      await darDeBajaService.aprobarSolicitud(selectedSolicitud.id, evaluacion)
      
      // Actualizar lista
      await cargarSolicitudes()
      
      // Cerrar modal
      setShowAprobacionModal(false)
      setSelectedSolicitud(null)
      
    } catch (error) {
      console.error('Error aprobando solicitud:', error)
      alert('Error al aprobar la solicitud. Intente nuevamente.')
    }
  }

  // Procesar rechazo
  const procesarRechazo = async () => {
    if (!selectedSolicitud || !evaluacionTecnica.observaciones) return

    try {
      const evaluacion: EvaluacionTecnica = {
        evaluador: 'Usuario Técnico', // En producción obtener del contexto
        fechaEvaluacion: new Date().toISOString(),
        aprobado: false,
        observaciones: evaluacionTecnica.observaciones!,
        recomendaciones: evaluacionTecnica.recomendaciones || '',
        valorRecuperableAprobado: null
      }

      await darDeBajaService.rechazarSolicitud(selectedSolicitud.id, evaluacion)
      
      // Actualizar lista
      await cargarSolicitudes()
      
      // Cerrar modal
      setShowRechazoModal(false)
      setSelectedSolicitud(null)
      
    } catch (error) {
      console.error('Error rechazando solicitud:', error)
      alert('Error al rechazar la solicitud. Intente nuevamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dar-de-baja'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aprobaciones de Baja</h1>
            <p className="text-muted-foreground">
              Revise y apruebe las solicitudes de baja de equipos
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Solicitudes Pendientes de Aprobación</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por código, equipo..."
                  value={filtros.search || ''}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select
                value={filtros.estado}
                onValueChange={(value) => handleFiltroChange('estado', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {solicitudes.length > 0 ? (
            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
                <Card key={solicitud.id} className="border-l-4 border-l-yellow-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-lg">{solicitud.codigoSolicitud}</h3>
                          <p className="text-sm text-gray-600">{solicitud.nombreEquipo}</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verDetalles(solicitud)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => prepararRechazo(solicitud)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => prepararAprobacion(solicitud)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Equipo:</span>
                        <span className="font-medium">{solicitud.codigoEquipo}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Solicitante:</span>
                        <span className="font-medium">{solicitud.solicitante}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium">
                          {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium capitalize">
                          {solicitud.tipoBaja.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {solicitud.valorRecuperable && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-medium text-green-600">
                            ${solicitud.valorRecuperable.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Documentos:</span>
                        <span className="font-medium">{solicitud.documentos?.length || 0}</span>
                      </div>
                    </div>
                    
                    {solicitud.justificacionTecnica && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Justificación Técnica:</p>
                        <p className="text-sm">{solicitud.justificacionTecnica}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes pendientes</h3>
              <p className="text-gray-500">Todas las solicitudes han sido procesadas</p>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Mostrando {((filtros.page! - 1) * (filtros.limit || 10)) + 1} a{' '}
                {Math.min(filtros.page! * (filtros.limit || 10), totalSolicitudes)} de{' '}
                {totalSolicitudes} solicitudes
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filtros.page! - 1)}
                  disabled={filtros.page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {filtros.page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filtros.page! + 1)}
                  disabled={filtros.page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <Dialog open={showDetalleModal} onOpenChange={setShowDetalleModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Solicitud de Baja</DialogTitle>
            <DialogDescription>
              {selectedSolicitud?.codigoSolicitud} - {selectedSolicitud?.nombreEquipo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolicitud && (
            <div className="space-y-6">
              {/* Información del Equipo */}
              <div>
                <h4 className="font-medium mb-3">Información del Equipo</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Código:</span>
                    <span className="ml-2 font-medium">{selectedSolicitud.codigoEquipo}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nombre:</span>
                    <span className="ml-2 font-medium">{selectedSolicitud.nombreEquipo}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Marca:</span>
                    <span className="ml-2 font-medium">{selectedSolicitud.marca || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Modelo:</span>
                    <span className="ml-2 font-medium">{selectedSolicitud.modelo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="ml-2 font-medium">{selectedSolicitud.ubicacion || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Responsable:</span>
                    <span className="ml-2 font-medium">{selectedSolicitud.responsable}</span>
                  </div>
                </div>
              </div>

              {/* Información de la Baja */}
              <div>
                <h4 className="font-medium mb-3">Información de la Baja</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Tipo de Baja:</span>
                    <span className="ml-2 font-medium capitalize">
                      {selectedSolicitud.tipoBaja.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedSolicitud.valorRecuperable && (
                    <div>
                      <span className="text-gray-600">Valor Recuperable:</span>
                      <span className="ml-2 font-medium text-green-600">
                        ${selectedSolicitud.valorRecuperable.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Justificaciones */}
              <div>
                <h4 className="font-medium mb-3">Justificaciones</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Justificación Técnica:</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedSolicitud.justificacionTecnica}</p>
                  </div>
                  {selectedSolicitud.justificacionEconomica && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Justificación Económica:</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedSolicitud.justificacionEconomica}</p>
                    </div>
                  )}
                  {selectedSolicitud.observaciones && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Observaciones:</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedSolicitud.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Repuestos Recuperables */}
              {selectedSolicitud.repuestosRecuperables && selectedSolicitud.repuestosRecuperables.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Repuestos Recuperables</h4>
                  <div className="space-y-2">
                    {selectedSolicitud.repuestosRecuperables.map((repuesto) => (
                      <div key={repuesto.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{repuesto.nombre}</p>
                          <p className="text-xs text-gray-500">{repuesto.descripcion}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            ${repuesto.valorEstimado.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {repuesto.estado.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentos */}
              {selectedSolicitud.documentos && selectedSolicitud.documentos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Documentos de Soporte</h4>
                  <div className="space-y-2">
                    {selectedSolicitud.documentos.map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-3 p-2 border rounded">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.tamaño / 1024 / 1024).toFixed(2)} MB • {doc.tipo.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetalleModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Aprobación */}
      <Dialog open={showAprobacionModal} onOpenChange={setShowAprobacionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
              Aprobar Solicitud
            </DialogTitle>
            <DialogDescription>
              {selectedSolicitud?.codigoSolicitud} - {selectedSolicitud?.nombreEquipo}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="observaciones-aprobacion">Observaciones de Aprobación *</Label>
              <Textarea
                id="observaciones-aprobacion"
                value={evaluacionTecnica.observaciones || ''}
                onChange={(e) => setEvaluacionTecnica(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Indique las observaciones técnicas para la aprobación..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="recomendaciones">Recomendaciones</Label>
              <Textarea
                id="recomendaciones"
                value={evaluacionTecnica.recomendaciones || ''}
                onChange={(e) => setEvaluacionTecnica(prev => ({ ...prev, recomendaciones: e.target.value }))}
                placeholder="Recomendaciones adicionales para la ejecución..."
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="valor-aprobado">Valor Recuperable Aprobado</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="valor-aprobado"
                  type="number"
                  min="0"
                  step="0.01"
                  value={evaluacionTecnica.valorRecuperableAprobado || ''}
                  onChange={(e) => setEvaluacionTecnica(prev => ({ 
                    ...prev, 
                    valorRecuperableAprobado: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAprobacionModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={procesarAprobacion}
              disabled={!evaluacionTecnica.observaciones}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprobar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rechazo */}
      <Dialog open={showRechazoModal} onOpenChange={setShowRechazoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-600" />
              Rechazar Solicitud
            </DialogTitle>
            <DialogDescription>
              {selectedSolicitud?.codigoSolicitud} - {selectedSolicitud?.nombreEquipo}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="observaciones-rechazo">Motivo del Rechazo *</Label>
              <Textarea
                id="observaciones-rechazo"
                value={evaluacionTecnica.observaciones || ''}
                onChange={(e) => setEvaluacionTecnica(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Explique las razones técnicas por las cuales se rechaza la solicitud..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="recomendaciones-rechazo">Recomendaciones</Label>
              <Textarea
                id="recomendaciones-rechazo"
                value={evaluacionTecnica.recomendaciones || ''}
                onChange={(e) => setEvaluacionTecnica(prev => ({ ...prev, recomendaciones: e.target.value }))}
                placeholder="Recomendaciones para el solicitante..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRechazoModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={procesarRechazo}
              disabled={!evaluacionTecnica.observaciones}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}