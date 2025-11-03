'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, Edit, Check, X, Clock, AlertTriangle, FileText, User, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SolicitudDesbaja {
  id: number
  aviso: number
  servicio: string
  creacion: string
  equipo: string
  idEquipo: number
  estado: string
  sede: string
  serie: string
  cliente?: string
  tecnico?: string
  motivo?: string
  observaciones?: string
  fechaSolicitud?: string
  fechaAprobacion?: string
  fechaEjecucion?: string
  justificacion?: string
  documentos?: Array<{
    nombre: string
    tipo: string
    url: string
  }>
  cambios?: Array<{
    fecha: string
    accion: string
    usuario: string
    comentario?: string
  }>
}

interface DecommissionModalProps {
  isOpen: boolean
  onClose: () => void
  solicitud: SolicitudDesbaja | null
  onEdit?: (solicitud: SolicitudDesbaja) => void
  onApprove?: (solicitud: SolicitudDesbaja) => void
  onReject?: (solicitud: SolicitudDesbaja) => void
}

export function DecommissionModal({
  isOpen,
  onClose,
  solicitud,
  onEdit,
  onApprove,
  onReject
}: DecommissionModalProps) {
  if (!solicitud) return null

  const getEstadoBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'ejecutado':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMotivoBadge = (motivo: string) => {
    switch (motivo?.toLowerCase()) {
      case 'obsolescencia':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'daño irreparable':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cambio tecnológico':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'fin de vida útil':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Solicitud de Desbaja #{solicitud.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Id Solicitud</label>
              <div className="text-lg font-semibold">{solicitud.id}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <div className="mt-1">
                <Badge className={cn("border", getEstadoBadge(solicitud.estado))}>
                  {solicitud.estado}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Aviso</label>
              <div className="text-sm font-medium text-blue-600">{solicitud.aviso}</div>
            </div>
          </div>

          <Separator />

          {/* Información del Equipo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Información del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Equipo</label>
                  <div className="text-sm">{solicitud.equipo}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">ID Equipo</label>
                  <div className="text-sm font-medium text-blue-600">{solicitud.idEquipo}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Serie</label>
                  <div className="text-sm">{solicitud.serie}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Sede</label>
                  <div className="text-sm">{solicitud.sede}</div>
                </div>
                
                {solicitud.cliente && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cliente</label>
                    <div className="text-sm">{solicitud.cliente}</div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Servicio</label>
                  <div className="text-sm">{solicitud.servicio}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles de la Solicitud */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles de la Solicitud
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solicitud.motivo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Motivo de Desbaja</label>
                    <div className="mt-1">
                      <Badge className={cn("border", getMotivoBadge(solicitud.motivo))}>
                        {solicitud.motivo}
                      </Badge>
                    </div>
                  </div>
                )}
                
                {solicitud.justificacion && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Justificación</label>
                    <div className="text-sm bg-gray-50 p-3 rounded-lg">{solicitud.justificacion}</div>
                  </div>
                )}
                
                {solicitud.observaciones && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Observaciones</label>
                    <div className="text-sm bg-gray-50 p-3 rounded-lg">{solicitud.observaciones}</div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha Solicitud</label>
                    <div className="text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {solicitud.fechaSolicitud || solicitud.creacion}
                    </div>
                  </div>
                  
                  {solicitud.fechaAprobacion && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha Aprobación</label>
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-green-400" />
                        {solicitud.fechaAprobacion}
                      </div>
                    </div>
                  )}
                  
                  {solicitud.fechaEjecucion && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha Ejecución</label>
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        {solicitud.fechaEjecucion}
                      </div>
                    </div>
                  )}
                </div>
                
                {solicitud.tecnico && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Técnico Responsable</label>
                    <div className="text-sm flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-400" />
                      {solicitud.tecnico}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          {solicitud.documentos && solicitud.documentos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {solicitud.documentos.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{doc.nombre}</span>
                        <Badge variant="outline" className="text-xs">
                          {doc.tipo}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de Cambios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historial de Cambios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {solicitud.cambios?.map((cambio, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{cambio.fecha}</span>
                      <span>-</span>
                      <span className="font-medium">{cambio.accion}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 ml-6">
                      <div>Por: {cambio.usuario}</div>
                      {cambio.comentario && (
                        <div className="mt-1 italic">{cambio.comentario}</div>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-4">
                    No hay cambios registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {solicitud.estado === 'Pendiente' && (
              <>
                {onEdit && (
                  <Button
                    variant="outline"
                    onClick={() => onEdit(solicitud)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Solicitud
                  </Button>
                )}
                
                {onApprove && (
                  <Button
                    onClick={() => onApprove(solicitud)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Aprobar Desbaja
                  </Button>
                )}
                
                {onReject && (
                  <Button
                    variant="destructive"
                    onClick={() => onReject(solicitud)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Rechazar Solicitud
                  </Button>
                )}
              </>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type { SolicitudDesbaja }