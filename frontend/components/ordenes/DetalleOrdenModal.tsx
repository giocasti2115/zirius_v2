'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, XCircle, MessageSquare, Calendar, User, FileText } from 'lucide-react'
import { ordenApi, Orden } from '@/lib/api/ordenes'
import { AgregarCambioModal } from './AgregarCambioModal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DetalleOrdenModalProps {
  open: boolean
  onClose: () => void
  ordenId: number
}

export function DetalleOrdenModal({ open, onClose, ordenId }: DetalleOrdenModalProps) {
  const [loading, setLoading] = useState(true)
  const [orden, setOrden] = useState<Orden | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAgregarCambio, setShowAgregarCambio] = useState(false)

  useEffect(() => {
    if (open && ordenId) {
      loadOrden()
    }
  }, [open, ordenId])

  const loadOrden = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ordenApi.getById(ordenId)
      setOrden(response.data)
    } catch (error: any) {
      console.error('Error loading orden:', error)
      setError('Error al cargar los detalles de la orden')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: number, estadoNombre: string) => {
    const variants: Record<number, { variant: any, icon: any, color: string }> = {
      1: { variant: 'default', icon: AlertCircle, color: 'text-blue-600' },
      2: { variant: 'secondary', icon: CheckCircle, color: 'text-green-600' },
      3: { variant: 'destructive', icon: XCircle, color: 'text-red-600' }
    }
    
    const config = variants[estado] || variants[1]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {estadoNombre}
      </Badge>
    )
  }

  const handleCambioAgregado = () => {
    loadOrden()
    setShowAgregarCambio(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden #{ordenId}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Cargando detalles de la orden...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : orden ? (
            <div className="space-y-6">
              {/* Información principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Información General</span>
                    {getEstadoBadge(orden.id_estado, orden.estado_nombre)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Solicitud:</span>
                        <span>#{orden.id_solicitud} - {orden.solicitud_aviso}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Creado por:</span>
                        <span>{orden.creador_nombre}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Creación:</span>
                        <span>{format(new Date(orden.creacion), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                      </div>
                      
                      {orden.cierre && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Cierre:</span>
                          <span>{format(new Date(orden.cierre), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Recibe:</span>
                        <p className="text-sm text-muted-foreground">{orden.nombre_recibe}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Cédula:</span>
                        <p className="text-sm text-muted-foreground">{orden.cedula_recibe}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Total:</span>
                        <p className="text-sm font-medium">${orden.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {orden.solicitud_observacion && (
                    <div>
                      <span className="font-medium">Descripción de la solicitud:</span>
                      <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                        {orden.solicitud_observacion}
                      </p>
                    </div>
                  )}

                  {orden.observaciones_cierre && (
                    <div>
                      <span className="font-medium">Observaciones de cierre:</span>
                      <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                        {orden.observaciones_cierre}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historial de cambios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Historial de Cambios
                    </div>
                    {orden.id_estado === 1 && (
                      <Button
                        size="sm"
                        onClick={() => setShowAgregarCambio(true)}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Agregar Comentario
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orden.cambios && orden.cambios.length > 0 ? (
                    <div className="space-y-4">
                      {orden.cambios.map((cambio, index) => (
                        <div key={cambio.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {index < orden.cambios!.length - 1 && (
                              <div className="w-px h-12 bg-border"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{cambio.creador_nombre}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(cambio.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{cambio.comentario}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay cambios registrados para esta orden
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal para agregar cambio */}
      {showAgregarCambio && orden && (
        <AgregarCambioModal
          open={showAgregarCambio}
          onClose={() => setShowAgregarCambio(false)}
          onSuccess={handleCambioAgregado}
          ordenId={orden.id}
        />
      )}
    </>
  )
}