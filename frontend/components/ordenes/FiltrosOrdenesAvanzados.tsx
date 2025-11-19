'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from "@/lib/utils"
import { ordenApi } from '@/lib/api/ordenes'
import { solicitudApi } from '@/lib/api/solicitudes'

interface FiltrosOrdenesAvanzadosProps {
  open: boolean
  onClose: () => void
  onAplicar: (filtros: any) => void
  filtrosActuales: any
}

interface OrdenEstado {
  id: number
  estado: string
}

export function FiltrosOrdenesAvanzados({ 
  open, 
  onClose, 
  onAplicar, 
  filtrosActuales 
}: FiltrosOrdenesAvanzadosProps) {
  const [estados, setEstados] = useState<OrdenEstado[]>([])
  const [loading, setLoading] = useState(false)
  
  const [filtros, setFiltros] = useState({
    estado: filtrosActuales.estado || '',
    solicitud_id: filtrosActuales.solicitud_id || '',
    creador_id: filtrosActuales.creador_id || '',
    fecha_desde: filtrosActuales.fecha_desde ? new Date(filtrosActuales.fecha_desde) : undefined,
    fecha_hasta: filtrosActuales.fecha_hasta ? new Date(filtrosActuales.fecha_hasta) : undefined,
    buscar: filtrosActuales.buscar || ''
  })

  useEffect(() => {
    if (open) {
      loadEstados()
    }
  }, [open])

  const loadEstados = async () => {
    try {
      const response = await ordenApi.getEstados()
      setEstados(response.data)
    } catch (error) {
      console.error('Error loading estados:', error)
    }
  }

  const handleAplicar = () => {
    const filtrosLimpios: any = {}
    
    if (filtros.estado) filtrosLimpios.estado = filtros.estado
    if (filtros.solicitud_id) filtrosLimpios.solicitud_id = filtros.solicitud_id
    if (filtros.creador_id) filtrosLimpios.creador_id = filtros.creador_id
    if (filtros.fecha_desde) filtrosLimpios.fecha_desde = format(filtros.fecha_desde, 'yyyy-MM-dd')
    if (filtros.fecha_hasta) filtrosLimpios.fecha_hasta = format(filtros.fecha_hasta, 'yyyy-MM-dd')
    if (filtros.buscar) filtrosLimpios.buscar = filtros.buscar

    onAplicar(filtrosLimpios)
  }

  const handleLimpiar = () => {
    setFiltros({
      estado: '',
      solicitud_id: '',
      creador_id: '',
      fecha_desde: undefined,
      fecha_hasta: undefined,
      buscar: ''
    })
    onAplicar({})
  }

  const contarFiltrosActivos = () => {
    let count = 0
    if (filtros.estado) count++
    if (filtros.solicitud_id) count++
    if (filtros.creador_id) count++
    if (filtros.fecha_desde) count++
    if (filtros.fecha_hasta) count++
    if (filtros.buscar) count++
    return count
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avanzados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado de la orden</Label>
            <Select
              value={filtros.estado}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                {estados.map((estado) => (
                  <SelectItem key={estado.id} value={estado.id.toString()}>
                    {estado.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filtros.fecha_desde && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtros.fecha_desde ? (
                      format(filtros.fecha_desde, "dd/MM/yyyy", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtros.fecha_desde}
                    onSelect={(date) => setFiltros(prev => ({ ...prev, fecha_desde: date }))}
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
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filtros.fecha_hasta && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtros.fecha_hasta ? (
                      format(filtros.fecha_hasta, "dd/MM/yyyy", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtros.fecha_hasta}
                    onSelect={(date) => setFiltros(prev => ({ ...prev, fecha_hasta: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* IDs específicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ID de Solicitud</Label>
              <Input
                type="number"
                placeholder="Número de solicitud..."
                value={filtros.solicitud_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, solicitud_id: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>ID de Creador</Label>
              <Input
                type="number"
                placeholder="ID del creador..."
                value={filtros.creador_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, creador_id: e.target.value }))}
              />
            </div>
          </div>

          {/* Búsqueda */}
          <div className="space-y-2">
            <Label>Búsqueda general</Label>
            <Input
              placeholder="Buscar en observaciones, nombre, cédula..."
              value={filtros.buscar}
              onChange={(e) => setFiltros(prev => ({ ...prev, buscar: e.target.value }))}
            />
          </div>

          {/* Resumen de filtros */}
          {contarFiltrosActivos() > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Filtros activos:</span>
              <Badge variant="secondary">{contarFiltrosActivos()} filtro(s)</Badge>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleLimpiar}>
              <X className="mr-2 h-4 w-4" />
              Limpiar todo
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleAplicar}>
                <Filter className="mr-2 h-4 w-4" />
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}