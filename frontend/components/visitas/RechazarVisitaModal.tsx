'use client'

import React, { useState } from 'react'
import { X, XCircle, AlertTriangle, AlertCircle } from 'lucide-react'

interface RechazarVisitaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  visita: {
    id: number
    id_orden: number
    fecha_inicio: string
    duracion: number
    responsable_nombre?: string
    actividades: string
  } | null
}

export default function RechazarVisitaModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  visita 
}: RechazarVisitaModalProps) {
  const [observacion, setObservacion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const motivosComunes = [
    'Información incompleta en la orden',
    'Conflicto de horarios',
    'Cliente no disponible',
    'Falta de recursos técnicos',
    'Orden duplicada',
    'Actividades no claras',
    'Otro motivo'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visita) return

    if (!observacion.trim()) {
      setError('La observación de rechazo es requerida')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3002/api/v1/real/visitas/${visita.id}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          observacion_aprobacion: observacion
        })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        onClose()
        setObservacion('')
      } else {
        setError(result.message || 'Error al rechazar la visita')
      }
    } catch (error: any) {
      setError(error.message || 'Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleMotivoClick = (motivo: string) => {
    if (motivo === 'Otro motivo') {
      setObservacion('')
    } else {
      setObservacion(motivo)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (!isOpen || !visita) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Rechazar Visita</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Información de la visita */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles de la Visita</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Visita:</span>
              <span className="ml-2 text-gray-900">#{visita.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Orden:</span>
              <span className="ml-2 text-gray-900">#{visita.id_orden}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha y Hora:</span>
              <span className="ml-2 text-gray-900">{formatDate(visita.fecha_inicio)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Duración:</span>
              <span className="ml-2 text-gray-900">{formatDuration(visita.duracion)}</span>
            </div>
            {visita.responsable_nombre && (
              <div>
                <span className="font-medium text-gray-700">Responsable:</span>
                <span className="ml-2 text-gray-900">{visita.responsable_nombre}</span>
              </div>
            )}
            {visita.actividades && (
              <div>
                <span className="font-medium text-gray-700">Actividades:</span>
                <p className="ml-2 text-gray-900 mt-1">{visita.actividades}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Motivos comunes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Motivos Comunes (Clic para seleccionar)
            </label>
            <div className="space-y-2">
              {motivosComunes.map((motivo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleMotivoClick(motivo)}
                  className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                    observacion === motivo
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {motivo}
                </button>
              ))}
            </div>
          </div>

          {/* Observaciones de rechazo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del Rechazo *
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Describe el motivo del rechazo..."
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {observacion.length}/500 caracteres
            </div>
          </div>

          {/* Advertencia */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                ¿Estás seguro de que deseas rechazar esta visita?
              </span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              La visita pasará a estado "Rechazada" y no podrá ser ejecutada. Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !observacion.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Rechazando...' : 'Rechazar Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}