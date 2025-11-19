'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react'

interface NuevaVisitaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Orden {
  id: number
  solicitud_id: number
  nombre_recibe: string
  observaciones_cierre?: string
}

interface Usuario {
  id: number
  nombre: string
  email: string
}

export default function NuevaVisitaModal({ isOpen, onClose, onSuccess }: NuevaVisitaModalProps) {
  const [formData, setFormData] = useState({
    id_orden: '',
    id_responsable: '',
    fecha_inicio: '',
    ejecutar_sede: true,
    duracion: 30,
    actividades: ''
  })

  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingOrdenes, setLoadingOrdenes] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchUsuarios()
      // Reset form when opening
      setFormData({
        id_orden: '',
        id_responsable: '',
        fecha_inicio: '',
        ejecutar_sede: true,
        duracion: 30,
        actividades: ''
      })
      setError(null)
    }
  }, [isOpen])

  const fetchUsuarios = async () => {
    try {
      // Para la demo, usar usuarios simulados
      setUsuarios([
        { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
        { id: 2, nombre: 'María García', email: 'maria@example.com' },
        { id: 3, nombre: 'Carlos López', email: 'carlos@example.com' }
      ])
    } catch (error) {
      console.error('Error fetching usuarios:', error)
    }
  }

  const fetchOrdenes = async (searchTerm: string) => {
    if (!searchTerm) {
      setOrdenes([])
      return
    }

    setLoadingOrdenes(true)
    try {
      // Simular búsqueda de órdenes
      const simulatedOrdenes = [
        { id: 336427, solicitud_id: 1001, nombre_recibe: 'Cliente ABC' },
        { id: 338174, solicitud_id: 1002, nombre_recibe: 'Cliente XYZ' },
        { id: 336478, solicitud_id: 1003, nombre_recibe: 'Cliente DEF' }
      ].filter(orden => 
        orden.id.toString().includes(searchTerm) || 
        orden.nombre_recibe.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      setOrdenes(simulatedOrdenes)
    } catch (error) {
      console.error('Error fetching ordenes:', error)
      setOrdenes([])
    } finally {
      setLoadingOrdenes(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Si es búsqueda de orden, fetch ordenes
    if (field === 'id_orden') {
      fetchOrdenes(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validaciones básicas
      if (!formData.id_orden) {
        throw new Error('La orden es requerida')
      }
      if (!formData.fecha_inicio) {
        throw new Error('La fecha y hora son requeridas')
      }

      // Formatear fecha para el backend
      const fechaFormateada = new Date(formData.fecha_inicio).toISOString().slice(0, 19).replace('T', ' ')

      const payload = {
        ...formData,
        id_orden: parseInt(formData.id_orden),
        id_responsable: formData.id_responsable ? parseInt(formData.id_responsable) : null,
        fecha_inicio: fechaFormateada,
        duracion: parseInt(formData.duracion.toString())
      }

      const response = await fetch('http://localhost:3002/api/v1/real/visitas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.message || 'Error al crear la visita')
      }
    } catch (error: any) {
      setError(error.message || 'Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    return now.toISOString().slice(0, 16)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nueva Visita</h2>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Orden de Servicio *
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.id_orden}
                onChange={(e) => handleInputChange('id_orden', e.target.value)}
                placeholder="Buscar por ID de orden o cliente..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {loadingOrdenes && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {/* Lista de órdenes encontradas */}
            {ordenes.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                {ordenes.map((orden) => (
                  <button
                    key={orden.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, id_orden: orden.id.toString() }))
                      setOrdenes([])
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">Orden #{orden.id}</div>
                    <div className="text-sm text-gray-600">{orden.nombre_recibe}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Responsable
              </span>
            </label>
            <select
              value={formData.id_responsable}
              onChange={(e) => handleInputChange('id_responsable', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar responsable</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Fecha y Hora *
              </span>
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_inicio}
              onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
              min={getMinDateTime()}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Duración (minutos)
              </span>
            </label>
            <select
              value={formData.duracion}
              onChange={(e) => handleInputChange('duracion', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
              <option value={180}>3 horas</option>
              <option value={240}>4 horas</option>
              <option value={480}>8 horas</option>
            </select>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Ubicación
              </span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ejecutar_sede"
                  checked={formData.ejecutar_sede}
                  onChange={() => handleInputChange('ejecutar_sede', true)}
                  className="mr-2"
                />
                En sede
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ejecutar_sede"
                  checked={!formData.ejecutar_sede}
                  onChange={() => handleInputChange('ejecutar_sede', false)}
                  className="mr-2"
                />
                En cliente
              </label>
            </div>
          </div>

          {/* Actividades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actividades a realizar
            </label>
            <textarea
              value={formData.actividades}
              onChange={(e) => handleInputChange('actividades', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe las actividades a realizar durante la visita..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Creando...' : 'Crear Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}