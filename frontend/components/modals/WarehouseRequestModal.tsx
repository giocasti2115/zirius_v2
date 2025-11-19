'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, Edit, Check, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Repuesto {
  descripcion: string
  cantidad: number
  valorUnitario: number
  sumaCliente: string
}

interface ItemAdicional {
  descripcion: string
  cantidad: number
  valorUnitario: number
  sumaCliente: string
}

interface Cambio {
  fecha: string
  accion: string
  usuario: string
}

interface SolicitudBodega {
  id: number
  aviso: number
  cliente: string
  ordenRelacionada: number
  estado: string
  creador: string
  servicio: string
  creacion: string
  equipo: string
  idEquipo: number
  sede: string
  serie: string
  cotizaciones?: string[]
  repuestos?: Repuesto[]
  itemsAdicionales?: ItemAdicional[]
  cambios?: Cambio[]
}

interface WarehouseRequestModalProps {
  isOpen: boolean
  onClose: () => void
  solicitud: SolicitudBodega | null
  onEdit?: (solicitud: SolicitudBodega) => void
  onApprove?: (solicitud: SolicitudBodega) => void
  onReject?: (solicitud: SolicitudBodega) => void
}

export function WarehouseRequestModal({ 
  isOpen, 
  onClose, 
  solicitud, 
  onEdit, 
  onApprove, 
  onReject 
}: WarehouseRequestModalProps) {
  if (!solicitud) return null

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Aprobada': 'bg-green-100 text-green-800 border-green-200',
      'Rechazada': 'bg-red-100 text-red-800 border-red-200',
      'Despachada': 'bg-blue-100 text-blue-800 border-blue-200',
      'Terminada': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-teal-500 text-white p-4 -m-6 mb-6">
          <DialogTitle className="text-xl font-semibold">
            Ver Solicitud Bodega
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID</label>
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
                <label className="text-sm font-medium text-gray-600">Creador</label>
                <div className="text-sm">{solicitud.creador}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Cliente</label>
                <div className="text-sm">{solicitud.cliente}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Orden Relacionada *</label>
                <div className="text-sm font-medium text-blue-600">
                  {solicitud.ordenRelacionada}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">IDs de cotizaciones</label>
                <div className="text-sm">
                  {solicitud.cotizaciones?.join(', ') || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Repuestos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Repuestos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Repuesto</th>
                      <th className="text-left p-2 font-medium">Cant</th>
                      <th className="text-left p-2 font-medium">V Unitario</th>
                      <th className="text-left p-2 font-medium">Sum Cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitud.repuestos?.map((repuesto, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{repuesto.descripcion}</td>
                        <td className="p-2">{repuesto.cantidad}</td>
                        <td className="p-2">${repuesto.valorUnitario}</td>
                        <td className="p-2">{repuesto.sumaCliente}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="p-2 text-center text-gray-500">
                          No hay repuestos registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Items Adicionales */}
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
                      <th className="text-left p-2 font-medium">V Unitario</th>
                      <th className="text-left p-2 font-medium">Sum Cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitud.itemsAdicionales?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.descripcion}</td>
                        <td className="p-2">{item.cantidad}</td>
                        <td className="p-2">${item.valorUnitario}</td>
                        <td className="p-2">{item.sumaCliente}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="p-2 text-center text-gray-500">
                          No hay items adicionales registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cambios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cambios</CardTitle>
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
                      {cambio.usuario}
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
                    Editar Solicitud de Repuestos
                  </Button>
                )}
                
                {onApprove && (
                  <Button
                    onClick={() => onApprove(solicitud)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Aprobar Solicitud de Repuestos
                  </Button>
                )}
                
                {onReject && (
                  <Button
                    variant="destructive"
                    onClick={() => onReject(solicitud)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Rechazar Solicitud de Repuestos
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

export type { SolicitudBodega, Repuesto, ItemAdicional, Cambio }