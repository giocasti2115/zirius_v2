'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from 'lucide-react'
import { ordenApi, CreateOrdenData } from '@/lib/api/ordenes'
import { solicitudApi } from '@/lib/api/solicitudes'

interface NuevaOrdenModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Solicitud {
  id: number
  aviso: string
  observacion: string
  creacion: string
}

export function NuevaOrdenModal({ open, onClose, onSuccess }: NuevaOrdenModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false)
  
  const [formData, setFormData] = useState<CreateOrdenData>({
    id_solicitud: 0,
    nombre_recibe: '',
    cedula_recibe: '',
    observaciones_cierre: '',
    total: 0
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Cargar solicitudes al abrir el modal
  useEffect(() => {
    if (open) {
      loadSolicitudes()
    }
  }, [open])

  const loadSolicitudes = async () => {
    try {
      setLoadingSolicitudes(true)
      // Obtener solo solicitudes aprobadas que podrían generar órdenes
      const response = await solicitudApi.getAll({ 
        limit: 50, 
        estado: 2 // Aprobadas
      })
      setSolicitudes(response.data)
    } catch (error) {
      console.error('Error loading solicitudes:', error)
      setError('Error al cargar las solicitudes')
    } finally {
      setLoadingSolicitudes(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.id_solicitud || formData.id_solicitud === 0) {
      errors.id_solicitud = 'Debe seleccionar una solicitud'
    }

    if (!formData.nombre_recibe.trim()) {
      errors.nombre_recibe = 'El nombre de quien recibe es requerido'
    } else if (formData.nombre_recibe.trim().length < 2) {
      errors.nombre_recibe = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!formData.cedula_recibe.trim()) {
      errors.cedula_recibe = 'La cédula es requerida'
    } else if (formData.cedula_recibe.trim().length < 6) {
      errors.cedula_recibe = 'La cédula debe tener al menos 6 caracteres'
    }

    if (formData.total && formData.total < 0) {
      errors.total = 'El total no puede ser negativo'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      await ordenApi.create(formData)
      
      onSuccess()
      resetForm()
    } catch (error: any) {
      console.error('Error creating orden:', error)
      setError(
        error.response?.data?.message || 
        'Error al crear la orden. Por favor intente nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id_solicitud: 0,
      nombre_recibe: '',
      cedula_recibe: '',
      observaciones_cierre: '',
      total: 0
    })
    setFormErrors({})
    setError(null)
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Selección de solicitud */}
          <div className="space-y-2">
            <Label htmlFor="solicitud">Solicitud de Servicio *</Label>
            {loadingSolicitudes ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Cargando solicitudes...</span>
              </div>
            ) : (
              <Select
                value={formData.id_solicitud.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, id_solicitud: parseInt(value) }))}
              >
                <SelectTrigger className={formErrors.id_solicitud ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar solicitud..." />
                </SelectTrigger>
                <SelectContent>
                  {solicitudes.map((solicitud) => (
                    <SelectItem key={solicitud.id} value={solicitud.id.toString()}>
                      <div className="flex flex-col">
                        <span>Solicitud #{solicitud.id} - {solicitud.aviso}</span>
                        <span className="text-xs text-muted-foreground">
                          {solicitud.observacion.substring(0, 50)}...
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {formErrors.id_solicitud && (
              <p className="text-sm text-red-500">{formErrors.id_solicitud}</p>
            )}
          </div>

          {/* Información de quien recibe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_recibe">Nombre quien recibe *</Label>
              <Input
                id="nombre_recibe"
                value={formData.nombre_recibe}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre_recibe: e.target.value }))}
                placeholder="Nombre completo..."
                className={formErrors.nombre_recibe ? 'border-red-500' : ''}
                disabled={loading}
              />
              {formErrors.nombre_recibe && (
                <p className="text-sm text-red-500">{formErrors.nombre_recibe}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula_recibe">Cédula *</Label>
              <Input
                id="cedula_recibe"
                value={formData.cedula_recibe}
                onChange={(e) => setFormData(prev => ({ ...prev, cedula_recibe: e.target.value }))}
                placeholder="Número de cédula..."
                className={formErrors.cedula_recibe ? 'border-red-500' : ''}
                disabled={loading}
              />
              {formErrors.cedula_recibe && (
                <p className="text-sm text-red-500">{formErrors.cedula_recibe}</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="space-y-2">
            <Label htmlFor="total">Total (Opcional)</Label>
            <Input
              id="total"
              type="number"
              min="0"
              value={formData.total}
              onChange={(e) => setFormData(prev => ({ ...prev, total: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className={formErrors.total ? 'border-red-500' : ''}
              disabled={loading}
            />
            {formErrors.total && (
              <p className="text-sm text-red-500">{formErrors.total}</p>
            )}
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones iniciales (Opcional)</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones_cierre}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones_cierre: e.target.value }))}
              placeholder="Observaciones sobre la orden..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Orden
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}