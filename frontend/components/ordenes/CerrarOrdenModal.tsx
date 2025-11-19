'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { ordenApi, CerrarOrdenData } from '@/lib/api/ordenes'

interface CerrarOrdenModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  ordenId: number
}

export function CerrarOrdenModal({ open, onClose, onSuccess, ordenId }: CerrarOrdenModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CerrarOrdenData>({
    observaciones_cierre: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.observaciones_cierre.trim()) {
      errors.observaciones_cierre = 'Las observaciones de cierre son requeridas'
    } else if (formData.observaciones_cierre.trim().length < 10) {
      errors.observaciones_cierre = 'Las observaciones deben tener al menos 10 caracteres'
    } else if (formData.observaciones_cierre.length > 2000) {
      errors.observaciones_cierre = 'Las observaciones no pueden exceder 2000 caracteres'
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

      await ordenApi.cerrar(ordenId, formData)
      
      onSuccess()
      resetForm()
    } catch (error: any) {
      console.error('Error closing orden:', error)
      setError(
        error.response?.data?.message || 
        'Error al cerrar la orden. Por favor intente nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      observaciones_cierre: ''
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Cerrar Orden #{ordenId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Al cerrar esta orden, su estado cambiará a "Cerrada" y se registrará la fecha de cierre.
              Esta acción no se puede deshacer.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Observaciones de cierre */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones de cierre *</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones_cierre}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones_cierre: e.target.value }))}
                placeholder="Describir el trabajo realizado, estado final del equipo, recomendaciones, etc..."
                rows={6}
                className={formErrors.observaciones_cierre ? 'border-red-500' : ''}
                disabled={loading}
              />
              {formErrors.observaciones_cierre && (
                <p className="text-sm text-red-500">{formErrors.observaciones_cierre}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.observaciones_cierre.length}/2000 caracteres
              </p>
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
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Cerrar Orden
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}