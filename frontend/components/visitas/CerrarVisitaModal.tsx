'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface CerrarVisitaModalProps {
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

export default function CerrarVisitaModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  visita 
}: CerrarVisitaModalProps) {
  const [actividades, setActividades] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actividadesComunes = [
    'Mantenimiento preventivo completado',
    'Reparación de equipo realizada',
    'Inspección técnica ejecutada',
    'Calibración de equipos',
    'Instalación de repuestos',
    'Diagnóstico técnico completado',
    'Capacitación al usuario',
    'Verificación de funcionamiento'
  ]

  React.useEffect(() => {
    if (isOpen && visita) {
      // Pre-cargar actividades previas si existen
      setActividades(visita.actividades || '')
      setError(null)
    }
  }, [isOpen, visita])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visita) return

    if (!actividades.trim()) {
      setError('Las actividades realizadas son requeridas')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3002/api/v1/real/visitas/${visita.id}/cerrar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actividades: actividades
        })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        onClose()
        setActividades('')
      } else {
        setError(result.message || 'Error al cerrar la visita')
      }
    } catch (error: any) {
      setError(error.message || 'Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleActividadClick = (actividad: string) => {
    const currentActividades = actividades.trim()
    
    if (currentActividades) {
      // Si ya hay actividades, agregar como nueva línea
      setActividades(currentActividades + '\n• ' + actividad)
    } else {
      // Si no hay actividades, agregar como primera
      setActividades('• ' + actividad)
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

  const getDuracionReal = () => {
    if (!visita) return null
    
    const inicio = new Date(visita.fecha_inicio)
    const ahora = new Date()
    const diferencia = Math.floor((ahora.getTime() - inicio.getTime()) / (1000 * 60))
    
    return diferencia > 0 ? diferencia : 0
  }

  if (!isOpen || !visita) return null

  const duracionReal = getDuracionReal()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Cerrar Visita</h2>
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Visita:</span>
              <span className="ml-2 text-gray-900">#{visita.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Orden:</span>
              <span className="ml-2 text-gray-900">#{visita.id_orden}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Inicio:</span>
              <span className="ml-2 text-gray-900">{formatDate(visita.fecha_inicio)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Duración Estimada:</span>
              <span className="ml-2 text-gray-900">{formatDuration(visita.duracion)}</span>
            </div>
            {duracionReal !== null && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Duración Real:</span>
                <span className={`ml-2 ${duracionReal > visita.duracion ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatDuration(duracionReal)}
                  {duracionReal > visita.duracion && (
                    <span className="text-orange-600 text-xs ml-1">
                      (+{formatDuration(duracionReal - visita.duracion)} extra)
                    </span>
                  )}
                </span>
              </div>
            )}
            {visita.responsable_nombre && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Responsable:</span>
                <span className="ml-2 text-gray-900">{visita.responsable_nombre}</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Actividades comunes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Actividades Comunes (Clic para agregar)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {actividadesComunes.map((actividad, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleActividadClick(actividad)}
                  className="text-left px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                >
                  + {actividad}
                </button>
              ))}
            </div>
          </div>

          {/* Actividades realizadas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actividades Realizadas *
            </label>
            <textarea
              value={actividades}
              onChange={(e) => setActividades(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe detalladamente las actividades realizadas durante la visita..."
              maxLength={1000}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {actividades.length}/1000 caracteres
            </div>
          </div>

          {/* Confirmación */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                ¿Estás seguro de que deseas cerrar esta visita?
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              La visita pasará a estado "Cerrada" y se registrará la fecha y hora de cierre.
            </p>
            {duracionReal !== null && duracionReal > visita.duracion && (
              <div className="mt-2 flex items-center">
                <Clock className="w-4 h-4 text-orange-600 mr-1" />
                <span className="text-orange-700 text-xs">
                  Nota: La visita excedió la duración estimada por {formatDuration(duracionReal - visita.duracion)}
                </span>
              </div>
            )}
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
              disabled={loading || !actividades.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Cerrando...' : 'Cerrar Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}