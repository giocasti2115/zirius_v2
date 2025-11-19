'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Package, 
  FileText, 
  Calendar, 
  User, 
  Camera, 
  Upload, 
  Download,
  Cog,
  AlertTriangle,
  DollarSign,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import darDeBajaService, { 
  SolicitudBaja, 
  FiltrosBajas,
  DocumentoBaja,
  RepuestoRecuperable 
} from '@/lib/services/dar-de-baja.service'
import { cn } from '@/lib/utils'

interface EjecucionBaja {
  fechaEjecucion: string
  ejecutor: string
  documentosFinal: DocumentoBaja[]
  repuestosRecuperados: RepuestoRecuperable[]
  observacionesEjecucion: string
  confirmacionBaja: boolean
}

export default function EjecucionBajasPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudBaja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosBajas>({
    page: 1,
    limit: 10,
    estado: 'aprobada',
    orderBy: 'fechaSolicitud',
    orderDirection: 'desc'
  })
  const [totalSolicitudes, setTotalSolicitudes] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para ejecución
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudBaja | null>(null)
  const [showEjecucionModal, setShowEjecucionModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [ejecucionData, setEjecucionData] = useState<EjecucionBaja>({
    fechaEjecucion: new Date().toISOString().split('T')[0],
    ejecutor: '',
    documentosFinal: [],
    repuestosRecuperados: [],
    observacionesEjecucion: '',
    confirmacionBaja: false
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
      setError('Error al cargar las solicitudes aprobadas.')
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

  // Ver detalles
  const verDetalles = (solicitud: SolicitudBaja) => {
    setSelectedSolicitud(solicitud)
    setShowDetalleModal(true)
  }

  // Iniciar ejecución
  const iniciarEjecucion = (solicitud: SolicitudBaja) => {
    setSelectedSolicitud(solicitud)
    setEjecucionData({
      fechaEjecucion: new Date().toISOString().split('T')[0],
      ejecutor: 'Usuario Técnico', // En producción obtener del contexto
      documentosFinal: [],
      repuestosRecuperados: solicitud.repuestosRecuperables || [],
      observacionesEjecucion: '',
      confirmacionBaja: false
    })
    setShowEjecucionModal(true)
  }

  // Agregar documento final
  const agregarDocumentoFinal = (file: File) => {
    const nuevoDocumento: DocumentoBaja = {
      id: Date.now().toString(),
      nombre: file.name,
      tipo: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      tamaño: file.size,
      fechaSubida: new Date().toISOString(),
      url: URL.createObjectURL(file)
    }
    setEjecucionData(prev => ({
      ...prev,
      documentosFinal: [...prev.documentosFinal, nuevoDocumento]
    }))
  }

  // Actualizar estado de repuesto recuperado
  const actualizarRepuesto = (id: string, campo: keyof RepuestoRecuperable, valor: any) => {
    setEjecucionData(prev => ({
      ...prev,
      repuestosRecuperados: prev.repuestosRecuperados.map(repuesto =>
        repuesto.id === id ? { ...repuesto, [campo]: valor } : repuesto
      )
    }))
  }

  // Procesar ejecución
  const procesarEjecucion = async () => {
    if (!selectedSolicitud || !ejecucionData.confirmacionBaja) return

    try {
      const datosEjecucion = {
        ...ejecucionData,
        fechaEjecucion: new Date(ejecucionData.fechaEjecucion).toISOString()
      }

      await darDeBajaService.ejecutarBaja(selectedSolicitud.id, datosEjecucion)
      
      // Actualizar lista
      await cargarSolicitudes()
      
      // Cerrar modal
      setShowEjecucionModal(false)
      setSelectedSolicitud(null)
      
    } catch (error) {
      console.error('Error ejecutando baja:', error)
      alert('Error al ejecutar la baja. Intente nuevamente.')
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
            <h1 className="text-3xl font-bold tracking-tight">Ejecución de Bajas</h1>
            <p className="text-muted-foreground">
              Gestione la ejecución física de las bajas aprobadas
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
            <CardTitle>Solicitudes Aprobadas para Ejecución</CardTitle>
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
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="ejecutada">Ejecutada</SelectItem>
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
                <Card key={solicitud.id} className="border-l-4 border-l-green-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-lg">{solicitud.codigoSolicitud}</h3>
                          <p className="text-sm text-gray-600">{solicitud.nombreEquipo}</p>
                        </div>
                        <Badge 
                          variant={solicitud.estado === 'aprobada' ? 'default' : 'secondary'}
                          className={cn(
                            solicitud.estado === 'aprobada' && 'bg-green-100 text-green-800 hover:bg-green-100',
                            solicitud.estado === 'en_proceso' && 'bg-blue-100 text-blue-800 hover:bg-blue-100',
                            solicitud.estado === 'ejecutada' && 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                          )}
                        >
                          {solicitud.estado === 'aprobada' && (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Aprobada</>
                          )}
                          {solicitud.estado === 'en_proceso' && (
                            <><Clock className="h-3 w-3 mr-1" />En Proceso</>
                          )}
                          {solicitud.estado === 'ejecutada' && (
                            <><CheckCircle className="h-3 w-3 mr-1" />Ejecutada</>
                          )}
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
                        {solicitud.estado === 'aprobada' && (
                          <Button
                            size="sm"
                            onClick={() => iniciarEjecucion(solicitud)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Ejecutar Baja
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
                        <span className="text-gray-600">Aprobada:</span>
                        <span className="font-medium">
                          {solicitud.evaluacionTecnica?.fechaEvaluacion ? 
                            new Date(solicitud.evaluacionTecnica.fechaEvaluacion).toLocaleDateString('es-ES') : 
                            'N/A'
                          }
                        </span>
                      </div>
                      
                      {solicitud.evaluacionTecnica?.valorRecuperableAprobado && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Valor Aprobado:</span>
                          <span className="font-medium text-green-600">
                            ${solicitud.evaluacionTecnica.valorRecuperableAprobado.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {solicitud.evaluacionTecnica?.recomendaciones && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800 mb-1">Recomendaciones para Ejecución:</p>
                        <p className="text-sm text-green-700">{solicitud.evaluacionTecnica.recomendaciones}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Cog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes para ejecutar</h3>
              <p className="text-gray-500">Las solicitudes aprobadas aparecerán aquí</p>
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
            <DialogTitle>Detalles de Solicitud Aprobada</DialogTitle>
            <DialogDescription>
              {selectedSolicitud?.codigoSolicitud} - {selectedSolicitud?.nombreEquipo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolicitud && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Código Equipo:</span>
                  <span className="ml-2 font-medium">{selectedSolicitud.codigoEquipo}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ubicación:</span>
                  <span className="ml-2 font-medium">{selectedSolicitud.ubicacion || 'N/A'}</span>
                </div>
              </div>

              {/* Evaluación Técnica */}
              {selectedSolicitud.evaluacionTecnica && (
                <div>
                  <h4 className="font-medium mb-3">Evaluación Técnica</h4>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium">Evaluador:</span>
                      <span className="ml-2 text-sm">{selectedSolicitud.evaluacionTecnica.evaluador}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Fecha:</span>
                      <span className="ml-2 text-sm">
                        {new Date(selectedSolicitud.evaluacionTecnica.fechaEvaluacion).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Observaciones:</p>
                      <p className="text-sm mt-1">{selectedSolicitud.evaluacionTecnica.observaciones}</p>
                    </div>
                    {selectedSolicitud.evaluacionTecnica.recomendaciones && (
                      <div>
                        <p className="text-sm font-medium">Recomendaciones:</p>
                        <p className="text-sm mt-1">{selectedSolicitud.evaluacionTecnica.recomendaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Repuestos a Recuperar */}
              {selectedSolicitud.repuestosRecuperables && selectedSolicitud.repuestosRecuperables.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Repuestos a Recuperar</h4>
                  <div className="space-y-2">
                    {selectedSolicitud.repuestosRecuperables.map((repuesto) => (
                      <div key={repuesto.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{repuesto.nombre}</p>
                            <p className="text-xs text-gray-500">{repuesto.descripcion}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              ${repuesto.valorEstimado.toLocaleString()}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {repuesto.estado.replace('_', ' ')}
                            </Badge>
                          </div>
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

      {/* Modal de Ejecución */}
      <Dialog open={showEjecucionModal} onOpenChange={setShowEjecucionModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ejecutar Baja de Equipo</DialogTitle>
            <DialogDescription>
              {selectedSolicitud?.codigoSolicitud} - {selectedSolicitud?.nombreEquipo}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="informacion" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="informacion">Información General</TabsTrigger>
              <TabsTrigger value="repuestos">Repuestos</TabsTrigger>
              <TabsTrigger value="documentacion">Documentación</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacion" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha-ejecucion">Fecha de Ejecución *</Label>
                  <Input
                    id="fecha-ejecucion"
                    type="date"
                    value={ejecucionData.fechaEjecucion}
                    onChange={(e) => setEjecucionData(prev => ({ ...prev, fechaEjecucion: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ejecutor">Ejecutor *</Label>
                  <Input
                    id="ejecutor"
                    value={ejecucionData.ejecutor}
                    onChange={(e) => setEjecucionData(prev => ({ ...prev, ejecutor: e.target.value }))}
                    placeholder="Nombre del técnico responsable"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="observaciones-ejecucion">Observaciones de Ejecución</Label>
                <Textarea
                  id="observaciones-ejecucion"
                  value={ejecucionData.observacionesEjecucion}
                  onChange={(e) => setEjecucionData(prev => ({ ...prev, observacionesEjecucion: e.target.value }))}
                  placeholder="Detalles sobre el proceso de baja, incidencias, etc..."
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmacion-baja"
                  checked={ejecucionData.confirmacionBaja}
                  onCheckedChange={(checked) => 
                    setEjecucionData(prev => ({ ...prev, confirmacionBaja: checked as boolean }))
                  }
                />
                <Label htmlFor="confirmacion-baja" className="text-sm">
                  Confirmo que se ha ejecutado físicamente la baja del equipo y se han seguido todos los protocolos establecidos *
                </Label>
              </div>
            </TabsContent>
            
            <TabsContent value="repuestos" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Repuestos Recuperados</h4>
                {ejecucionData.repuestosRecuperados.length > 0 ? (
                  <div className="space-y-3">
                    {ejecucionData.repuestosRecuperados.map((repuesto) => (
                      <div key={repuesto.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{repuesto.nombre}</p>
                            <p className="text-sm text-gray-600">{repuesto.descripcion}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              ${repuesto.valorEstimado.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Estado Final</Label>
                            <Select
                              value={repuesto.estado}
                              onValueChange={(value) => actualizarRepuesto(repuesto.id, 'estado', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="funcional">Funcional</SelectItem>
                                <SelectItem value="requiere_reparacion">Requiere Reparación</SelectItem>
                                <SelectItem value="no_funcional">No Funcional</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-xs">Valor Real Recuperado</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={repuesto.valorEstimado}
                                onChange={(e) => actualizarRepuesto(
                                  repuesto.id, 
                                  'valorEstimado', 
                                  parseFloat(e.target.value) || 0
                                )}
                                className="pl-7 h-8 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No hay repuestos registrados para recuperar
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="documentacion" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Documentación Final</h4>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      Array.from(e.target.files || []).forEach(file => {
                        agregarDocumentoFinal(file)
                      })
                      e.target.value = ''
                    }}
                    className="hidden"
                    id="documentos-finales"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => document.getElementById('documentos-finales')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documentos
                  </Button>
                </div>
                
                {ejecucionData.documentosFinal.length > 0 ? (
                  <div className="space-y-2">
                    {ejecucionData.documentosFinal.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">{doc.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {(doc.tamaño / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Suba fotografías del equipo dado de baja</p>
                    <p className="text-sm">Documentación de respaldo y actas de baja</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEjecucionModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={procesarEjecucion}
              disabled={!ejecucionData.confirmacionBaja || !ejecucionData.ejecutor}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar Baja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}