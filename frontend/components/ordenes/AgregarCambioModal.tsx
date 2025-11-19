'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, MessageSquare } from 'lucide-react'
import { ordenApi, AgregarCambioData } from '@/lib/api/ordenes'

interface AgregarCambioModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  ordenId: number
}

export function AgregarCambioModal({ open, onClose, onSuccess, ordenId }: AgregarCambioModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<AgregarCambioData>({
    comentario: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.comentario.trim()) {
      errors.comentario = 'El comentario es requerido'
    } else if (formData.comentario.trim().length < 5) {
      errors.comentario = 'El comentario debe tener al menos 5 caracteres'
    } else if (formData.comentario.length > 600) {
      errors.comentario = 'El comentario no puede exceder 600 caracteres'
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

      await ordenApi.agregarCambio(ordenId, formData)
      
      onSuccess()
      resetForm()
    } catch (error: any) {
      console.error('Error adding cambio:', error)
      setError(
        error.response?.data?.message || 
        'Error al agregar el comentario. Por favor intente nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      comentario: ''
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
            <MessageSquare className="h-5 w-5" />
            Agregar Comentario - Orden #{ordenId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario *</Label>
            <Textarea
              id="comentario"
              value={formData.comentario}
              onChange={(e) => setFormData(prev => ({ ...prev, comentario: e.target.value }))}
              placeholder="Agregar un comentario sobre el progreso, estado actual, observaciones, etc..."
              rows={5}
              className={formErrors.comentario ? 'border-red-500' : ''}
              disabled={loading}
            />
            {formErrors.comentario && (
              <p className="text-sm text-red-500">{formErrors.comentario}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.comentario.length}/600 caracteres
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este comentario será agregado al historial de la orden y será visible para todos los usuarios.
            </AlertDescription>
          </Alert>

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
              <MessageSquare className="mr-2 h-4 w-4" />
              Agregar Comentario
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}