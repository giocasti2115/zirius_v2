'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, Edit, Check, X, Clock, FileText, User, Calendar, DollarSign, Building } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemCotizacion {
  descripcion: string
  cantidad: number
  valorUnitario: number
  valorTotal: number
  categoria: string
}

interface Cotizacion {
  id: number
  aviso: number
  cliente: string
  fecha: string
  monto: string
  estado: string
  validez: string
  numeroOrden?: string
  contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  fechaVencimiento?: string
  condicionesPago?: string
  tiempoEntrega?: string
  observaciones?: string
  items?: ItemCotizacion[]
  subtotal?: number
  descuento?: number
  impuestos?: number
  total?: number
  cambios?: Array<{
    fecha: string
    accion: string
    usuario: string
    comentario?: string
  }>
}

interface QuotesModalProps {
  isOpen: boolean
  onClose: () => void
  cotizacion: Cotizacion | null
  onEdit?: (cotizacion: Cotizacion) => void
  onApprove?: (cotizacion: Cotizacion) => void
  onReject?: (cotizacion: Cotizacion) => void
  onSend?: (cotizacion: Cotizacion) => void
}

export function QuotesModal({
  isOpen,
  onClose,
  cotizacion,
  onEdit,
  onApprove,
  onReject,
  onSend
}: QuotesModalProps) {
  if (!cotizacion) return null

  const getEstadoBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'enviada':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'vencida':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Cotización #{cotizacion.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Número</label>
              <div className="text-lg font-semibold">COT-{cotizacion.id}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <div className="mt-1">
                <Badge className={cn("border", getEstadoBadge(cotizacion.estado))}>
                  {cotizacion.estado}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha</label>
              <div className="text-sm flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {cotizacion.fecha}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Aviso</label>
              <div className="text-sm font-medium text-blue-600">{cotizacion.aviso}</div>
            </div>
          </div>

          <Separator />

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cliente</label>
                  <div className="text-sm font-medium">{cotizacion.cliente}</div>
                </div>
                
                {cotizacion.contacto && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contacto</label>
                    <div className="text-sm flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-400" />
                      {cotizacion.contacto}
                    </div>
                  </div>
                )}
                
                {cotizacion.telefono && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                    <div className="text-sm">{cotizacion.telefono}</div>
                  </div>
                )}
                
                {cotizacion.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="text-sm">{cotizacion.email}</div>
                  </div>
                )}
                
                {cotizacion.direccion && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Dirección</label>
                    <div className="text-sm">{cotizacion.direccion}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Detalles de la Cotización
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {cotizacion.fechaVencimiento && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Vencimiento</label>
                    <div className="text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-red-400" />
                      {cotizacion.fechaVencimiento}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Validez</label>
                  <div className="text-sm">{cotizacion.validez}</div>
                </div>
                
                {cotizacion.condicionesPago && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Condiciones de Pago</label>
                    <div className="text-sm">{cotizacion.condicionesPago}</div>
                  </div>
                )}
                
                {cotizacion.tiempoEntrega && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tiempo de Entrega</label>
                    <div className="text-sm">{cotizacion.tiempoEntrega}</div>
                  </div>
                )}
              </div>

              {cotizacion.observaciones && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Observaciones</label>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{cotizacion.observaciones}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          {cotizacion.items && cotizacion.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Items Cotizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Descripción</th>
                        <th className="text-left p-3 font-medium">Categoría</th>
                        <th className="text-right p-3 font-medium">Cantidad</th>
                        <th className="text-right p-3 font-medium">Valor Unitario</th>
                        <th className="text-right p-3 font-medium">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotizacion.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{item.descripcion}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {item.categoria}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">{item.cantidad}</td>
                          <td className="p-3 text-right">{formatCurrency(item.valorUnitario)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(item.valorTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2">
                      {cotizacion.subtotal && (
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(cotizacion.subtotal)}</span>
                        </div>
                      )}
                      
                      {cotizacion.descuento && (
                        <div className="flex justify-between text-sm">
                          <span>Descuento:</span>
                          <span className="text-red-600">-{formatCurrency(cotizacion.descuento)}</span>
                        </div>
                      )}
                      
                      {cotizacion.impuestos && (
                        <div className="flex justify-between text-sm">
                          <span>IVA (19%):</span>
                          <span>{formatCurrency(cotizacion.impuestos)}</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{cotizacion.total ? formatCurrency(cotizacion.total) : cotizacion.monto}</span>
                      </div>
                    </div>
                  </div>
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
                {cotizacion.cambios?.map((cambio, index) => (
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
            {cotizacion.estado === 'Pendiente' && (
              <>
                {onEdit && (
                  <Button
                    variant="outline"
                    onClick={() => onEdit(cotizacion)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Cotización
                  </Button>
                )}
                
                {onSend && (
                  <Button
                    onClick={() => onSend(cotizacion)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="h-4 w-4" />
                    Enviar Cotización
                  </Button>
                )}
                
                {onApprove && (
                  <Button
                    onClick={() => onApprove(cotizacion)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Aprobar Cotización
                  </Button>
                )}
                
                {onReject && (
                  <Button
                    variant="destructive"
                    onClick={() => onReject(cotizacion)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Rechazar Cotización
                  </Button>
                )}
              </>
            )}
            
            {cotizacion.estado === 'Aprobada' && onSend && (
              <Button
                onClick={() => onSend(cotizacion)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-4 w-4" />
                Reenviar Cotización
              </Button>
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

export type { Cotizacion, ItemCotizacion }