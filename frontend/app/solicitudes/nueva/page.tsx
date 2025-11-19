'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Save, ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Cliente {
  id: number
  nombre: string
  nit: string
  activo: boolean
}

interface Equipo {
  id: number
  nombre: string
  codigo: string
  cliente_id: number
  sede_id: number
  serie?: string
}

interface Sede {
  id: number
  nombre: string
  cliente_id: number
}

export default function NuevaSolicitudPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    aviso: '',
    servicio: 'Mantenimiento Preventivo',
    cliente_id: '',
    sede_id: '',
    equipo_id: '',
    prioridad: 'Media',
    fecha_programada: '',
    descripcion: '',
    observaciones: ''
  })

  // Data for dropdowns
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [loadingSedes, setLoadingSedes] = useState(false)
  const [loadingEquipos, setLoadingEquipos] = useState(false)

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      setLoadingClientes(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3002/api/v1/real/clientes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setClientes(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clientes:', error)
    } finally {
      setLoadingClientes(false)
    }
  }

  const fetchSedes = async (clienteId: string) => {
    if (!clienteId) {
      setSedes([])
      return
    }

    try {
      setLoadingSedes(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3002/api/v1/real/sedes?cliente_id=${clienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSedes(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching sedes:', error)
    } finally {
      setLoadingSedes(false)
    }
  }

  const fetchEquipos = async (sedeId: string) => {
    if (!sedeId) {
      setEquipos([])
      return
    }

    try {
      setLoadingEquipos(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3002/api/v1/real/equipos?sede_id=${sedeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEquipos(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching equipos:', error)
    } finally {
      setLoadingEquipos(false)
    }
  }

  const handleClienteChange = (clienteId: string) => {
    setFormData(prev => ({
      ...prev,
      cliente_id: clienteId,
      sede_id: '',
      equipo_id: ''
    }))
    setSedes([])
    setEquipos([])
    if (clienteId) {
      fetchSedes(clienteId)
    }
  }

  const handleSedeChange = (sedeId: string) => {
    setFormData(prev => ({
      ...prev,
      sede_id: sedeId,
      equipo_id: ''
    }))
    setEquipos([])
    if (sedeId) {
      fetchEquipos(sedeId)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.aviso.trim()) {
      newErrors.aviso = 'El número de aviso es requerido'
    }

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Debe seleccionar un cliente'
    }

    if (!formData.sede_id) {
      newErrors.sede_id = 'Debe seleccionar una sede'
    }

    if (!formData.equipo_id) {
      newErrors.equipo_id = 'Debe seleccionar un equipo'
    }

    if (!formData.fecha_programada) {
      newErrors.fecha_programada = 'La fecha programada es requerida'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción del servicio es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3002/api/v1/real/solicitudes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          estado: 'Pendiente',
          creado_por: user?.id,
          fecha_creacion: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/solicitudes')
        }, 2000)
      } else {
        setError(data.message || 'Error al crear la solicitud')
      }
    } catch (error) {
      console.error('Error creating solicitud:', error)
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Solicitud Creada!
              </h2>
              <p className="text-gray-600 mb-4">
                La solicitud de servicio ha sido creada exitosamente.
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo a la lista de solicitudes...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="h-8 w-8 text-blue-600" />
            Nueva Solicitud de Servicio
          </h1>
          <p className="text-gray-600 mt-1">Complete los datos para crear una nueva solicitud de servicio técnico</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/solicitudes')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Solicitudes
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Datos principales de la solicitud de servicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aviso */}
              <div className="space-y-2">
                <Label htmlFor="aviso">
                  Número de Aviso <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="aviso"
                  value={formData.aviso}
                  onChange={(e) => setFormData(prev => ({ ...prev, aviso: e.target.value }))}
                  placeholder="Ej: AV-2024-001"
                  className={errors.aviso ? 'border-red-500' : ''}
                />
                {errors.aviso && <p className="text-sm text-red-500">{errors.aviso}</p>}
              </div>

              {/* Tipo de Servicio */}
              <div className="space-y-2">
                <Label htmlFor="servicio">
                  Tipo de Servicio <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.servicio}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, servicio: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mantenimiento Preventivo">Mantenimiento Preventivo</SelectItem>
                    <SelectItem value="Mantenimiento Correctivo">Mantenimiento Correctivo</SelectItem>
                    <SelectItem value="Calibración">Calibración</SelectItem>
                    <SelectItem value="Instalación">Instalación</SelectItem>
                    <SelectItem value="Capacitación">Capacitación</SelectItem>
                    <SelectItem value="Garantía">Garantía</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridad */}
              <div className="space-y-2">
                <Label htmlFor="prioridad">
                  Prioridad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, prioridad: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baja">Baja</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha Programada */}
              <div className="space-y-2">
                <Label htmlFor="fecha_programada">
                  Fecha Programada <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_programada"
                  type="date"
                  value={formData.fecha_programada}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_programada: e.target.value }))}
                  className={errors.fecha_programada ? 'border-red-500' : ''}
                />
                {errors.fecha_programada && <p className="text-sm text-red-500">{errors.fecha_programada}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubicación y Equipo</CardTitle>
            <CardDescription>
              Seleccione el cliente, sede y equipo para el servicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente">
                  Cliente <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={handleClienteChange}
                  disabled={loadingClientes}
                >
                  <SelectTrigger className={errors.cliente_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={loadingClientes ? "Cargando..." : "Seleccione cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cliente_id && <p className="text-sm text-red-500">{errors.cliente_id}</p>}
              </div>

              {/* Sede */}
              <div className="space-y-2">
                <Label htmlFor="sede">
                  Sede <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.sede_id}
                  onValueChange={handleSedeChange}
                  disabled={!formData.cliente_id || loadingSedes}
                >
                  <SelectTrigger className={errors.sede_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={
                      !formData.cliente_id ? "Primero seleccione cliente" :
                      loadingSedes ? "Cargando..." : 
                      "Seleccione sede"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {sedes.map((sede) => (
                      <SelectItem key={sede.id} value={sede.id.toString()}>
                        {sede.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sede_id && <p className="text-sm text-red-500">{errors.sede_id}</p>}
              </div>

              {/* Equipo */}
              <div className="space-y-2">
                <Label htmlFor="equipo">
                  Equipo <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.equipo_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, equipo_id: value }))}
                  disabled={!formData.sede_id || loadingEquipos}
                >
                  <SelectTrigger className={errors.equipo_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={
                      !formData.sede_id ? "Primero seleccione sede" :
                      loadingEquipos ? "Cargando..." :
                      "Seleccione equipo"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((equipo) => (
                      <SelectItem key={equipo.id} value={equipo.id.toString()}>
                        {equipo.nombre} ({equipo.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipo_id && <p className="text-sm text-red-500">{errors.equipo_id}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Servicio</CardTitle>
            <CardDescription>
              Descripción y observaciones del servicio requerido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción del Servicio <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describa detalladamente el servicio requerido..."
                rows={4}
                className={errors.descripcion ? 'border-red-500' : ''}
              />
              {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion}</p>}
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">
                Observaciones Adicionales
              </Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Información adicional, instrucciones especiales, etc..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/solicitudes')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Solicitud
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-red-600 font-medium uppercase tracking-wide">DISEÑO DE FORMULARIOS</p>
      </div>
    </div>
  )
}