'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, MapPin, Camera, Clock, CheckCircle, XCircle, Wrench, AlertTriangle, Upload, FileImage } from 'lucide-react'

// Tipos para órdenes de servicio
interface OrdenServicio {
  id: number
  numero_orden: string
  cliente: string
  equipo: string
  tipo_servicio: 'mantenimiento' | 'reparacion' | 'instalacion' | 'diagnostico'
  estado: 'pendiente' | 'asignada' | 'en_progreso' | 'en_reparacion' | 'completada' | 'cancelada'
  ubicacion: {
    latitud: number
    longitud: number
    direccion: string
  }
  descripcion: string
}

interface CheckInData {
  ubicacion: {
    latitud: number
    longitud: number
    precision: number
    direccion: string
  }
  foto_inicial?: File
  observaciones_iniciales: string
  estado_equipo_inicial: 'operativo' | 'parcial' | 'no_operativo' | 'desconocido'
  timestamp: string
}

interface CheckOutData {
  foto_final?: File
  observaciones_finales: string
  estado_equipo_final: 'operativo' | 'parcial' | 'no_operativo' | 'requiere_seguimiento'
  trabajos_realizados: string
  materiales_utilizados: string
  tiempo_trabajo: number
  requiere_visita_adicional: boolean
  timestamp: string
}

export default function QRCheckInOutOrdenes() {
  const [ordenActual, setOrdenActual] = useState<OrdenServicio | null>(null)
  const [estadoCheckIn, setEstadoCheckIn] = useState<'pendiente' | 'checked_in' | 'checked_out'>('pendiente')
  const [datosCheckIn, setDatosCheckIn] = useState<CheckInData | null>(null)
  const [datosCheckOut, setDatosCheckOut] = useState<Partial<CheckOutData>>({})
  const [ubicacionActual, setUbicacionActual] = useState<{lat: number, lng: number} | null>(null)
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false)
  const [codigoQR, setCodigoQR] = useState('')
  const [errorValidacion, setErrorValidacion] = useState('')
  const [vistaPrevia, setVistaPrevia] = useState<{tipo: 'inicial' | 'final', url: string} | null>(null)

  // Órdenes simuladas
  const ordenesDisponibles: OrdenServicio[] = [
    {
      id: 1,
      numero_orden: 'OS-2024-001',
      cliente: 'Hospital San Rafael',
      equipo: 'Resonancia Magnética Siemens',
      tipo_servicio: 'mantenimiento',
      estado: 'asignada',
      ubicacion: {
        latitud: 6.2518,
        longitud: -75.5636,
        direccion: 'Cra 51C #62-78, Hospital San Rafael'
      },
      descripcion: 'Mantenimiento preventivo trimestral - Revisión completa del sistema'
    },
    {
      id: 2,
      numero_orden: 'OS-2024-002',
      cliente: 'Clínica Bolivariana',
      equipo: 'TAC GE Healthcare',
      tipo_servicio: 'reparacion',
      estado: 'asignada',
      ubicacion: {
        latitud: 6.2442,
        longitud: -75.5515,
        direccion: 'Cra 25A #1A Sur-45, Clínica Bolivariana'
      },
      descripcion: 'Falla en sistema de enfriamiento - Emergencia médica'
    },
    {
      id: 3,
      numero_orden: 'OS-2024-003',
      cliente: 'Centro Médico Imbanaco',
      equipo: 'Ecógrafo Philips',
      tipo_servicio: 'instalacion',
      estado: 'asignada',
      ubicacion: {
        latitud: 6.2087,
        longitud: -75.5764,
        direccion: 'Cra 38A #5A-100, Centro Médico Imbanaco'
      },
      descripcion: 'Instalación de nuevo equipo ecográfico'
    }
  ]

  // Obtener ubicación GPS actual
  const obtenerUbicacion = async () => {
    setCargandoUbicacion(true)
    setErrorValidacion('')

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      setUbicacionActual({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    } catch (error) {
      setErrorValidacion('No se pudo obtener la ubicación GPS. Verifique los permisos.')
      // Simulación para desarrollo
      setUbicacionActual({
        lat: 6.2442 + (Math.random() - 0.5) * 0.01,
        lng: -75.5636 + (Math.random() - 0.5) * 0.01
      })
    } finally {
      setCargandoUbicacion(false)
    }
  }

  // Validar proximidad a la ubicación de la orden
  const validarProximidad = (ubicacionOrden: {latitud: number, longitud: number}) => {
    if (!ubicacionActual) return false

    const distancia = calcularDistancia(
      ubicacionActual.lat, ubicacionActual.lng,
      ubicacionOrden.latitud, ubicacionOrden.longitud
    )

    return distancia <= 100 // 100 metros de tolerancia
  }

  // Calcular distancia entre coordenadas (en metros)
  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3 // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lng2-lng1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  // Procesar código QR
  const procesarCodigoQR = () => {
    const orden = ordenesDisponibles.find(o => o.numero_orden === codigoQR.trim())
    
    if (!orden) {
      setErrorValidacion('Código QR no válido o orden no encontrada')
      return
    }

    if (!ubicacionActual) {
      setErrorValidacion('Primero debe obtener su ubicación GPS')
      return
    }

    if (!validarProximidad(orden.ubicacion)) {
      const distancia = calcularDistancia(
        ubicacionActual.lat, ubicacionActual.lng,
        orden.ubicacion.latitud, orden.ubicacion.longitud
      )
      setErrorValidacion(`Está demasiado lejos de la ubicación de la orden (${Math.round(distancia)}m). Acérquese a menos de 100m.`)
      return
    }

    setOrdenActual(orden)
    setErrorValidacion('')
  }

  // Manejar Check-In
  const realizarCheckIn = async () => {
    if (!ordenActual || !ubicacionActual) return

    const checkInData: CheckInData = {
      ubicacion: {
        latitud: ubicacionActual.lat,
        longitud: ubicacionActual.lng,
        precision: 10,
        direccion: ordenActual.ubicacion.direccion
      },
      observaciones_iniciales: datosCheckIn?.observaciones_iniciales || '',
      estado_equipo_inicial: datosCheckIn?.estado_equipo_inicial || 'desconocido',
      timestamp: new Date().toISOString()
    }

    setDatosCheckIn(checkInData)
    setEstadoCheckIn('checked_in')
  }

  // Manejar Check-Out
  const realizarCheckOut = async () => {
    if (!ordenActual || !datosCheckIn) return

    const tiempoTrabajo = Math.floor((new Date().getTime() - new Date(datosCheckIn.timestamp).getTime()) / (1000 * 60))

    const checkOutData: CheckOutData = {
      ...datosCheckOut,
      tiempo_trabajo: tiempoTrabajo,
      timestamp: new Date().toISOString()
    } as CheckOutData

    setEstadoCheckIn('checked_out')
  }

  // Manejar carga de fotos
  const manejarCargaFoto = (archivo: File, tipo: 'inicial' | 'final') => {
    const url = URL.createObjectURL(archivo)
    setVistaPrevia({ tipo, url })

    if (tipo === 'inicial') {
      setDatosCheckIn(prev => prev ? { ...prev, foto_inicial: archivo } : null)
    } else {
      setDatosCheckOut(prev => ({ ...prev, foto_final: archivo }))
    }
  }

  const obtenerIconoTipoServicio = (tipo: string) => {
    const iconos = {
      'mantenimiento': <Wrench className="h-5 w-5" />,
      'reparacion': <AlertTriangle className="h-5 w-5" />,
      'instalacion': <CheckCircle className="h-5 w-5" />,
      'diagnostico': <XCircle className="h-5 w-5" />
    }
    return iconos[tipo] || <Wrench className="h-5 w-5" />
  }

  const obtenerColorEstadoEquipo = (estado: string) => {
    const colores = {
      'operativo': 'bg-green-100 text-green-800',
      'parcial': 'bg-yellow-100 text-yellow-800',
      'no_operativo': 'bg-red-100 text-red-800',
      'desconocido': 'bg-gray-100 text-gray-800',
      'requiere_seguimiento': 'bg-orange-100 text-orange-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  useEffect(() => {
    obtenerUbicacion()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Check-In/Out QR - Órdenes de Servicio</h1>
          <p className="text-gray-600">Sistema de registro con validación GPS para órdenes de servicio</p>
        </div>
        <Badge className={`text-sm px-4 py-2 ${estadoCheckIn === 'pendiente' ? 'bg-gray-100 text-gray-800' : 
          estadoCheckIn === 'checked_in' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {estadoCheckIn === 'pendiente' ? 'Sin Iniciar' : 
           estadoCheckIn === 'checked_in' ? 'En Progreso' : 'Completado'}
        </Badge>
      </div>

      {/* Estado de ubicación GPS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Estado de Ubicación GPS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${ubicacionActual ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {ubicacionActual 
                  ? `Ubicación obtenida: ${ubicacionActual.lat.toFixed(6)}, ${ubicacionActual.lng.toFixed(6)}`
                  : 'Ubicación no disponible'
                }
              </span>
            </div>
            <Button 
              onClick={obtenerUbicacion} 
              disabled={cargandoUbicacion}
              size="sm"
            >
              {cargandoUbicacion ? 'Obteniendo...' : 'Actualizar GPS'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorValidacion && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorValidacion}
          </AlertDescription>
        </Alert>
      )}

      {/* Escaneo QR o selección manual */}
      {!ordenActual && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Escanear Código QR de Orden
            </CardTitle>
            <CardDescription>
              Escanee el código QR de la orden de servicio o ingréselo manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Ingrese código de orden (ej: OS-2024-001)"
                value={codigoQR}
                onChange={(e) => setCodigoQR(e.target.value)}
                className="flex-1"
              />
              <Button onClick={procesarCodigoQR} disabled={!codigoQR.trim()}>
                Validar Orden
              </Button>
            </div>

            {/* Simulación de códigos QR disponibles */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Órdenes disponibles para prueba:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ordenesDisponibles.map(orden => (
                  <Button
                    key={orden.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setCodigoQR(orden.numero_orden)}
                    className="text-left justify-start"
                  >
                    <div>
                      <div className="font-medium">{orden.numero_orden}</div>
                      <div className="text-xs text-gray-500">{orden.cliente}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de la orden actual */}
      {ordenActual && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {obtenerIconoTipoServicio(ordenActual.tipo_servicio)}
              {ordenActual.numero_orden} - {ordenActual.cliente}
            </CardTitle>
            <CardDescription>{ordenActual.equipo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de Servicio</label>
                <p className="text-sm">{ordenActual.tipo_servicio}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ubicación</label>
                <p className="text-sm">{ordenActual.ubicacion.direccion}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <p className="text-sm text-gray-600">{ordenActual.descripcion}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-In */}
      {ordenActual && estadoCheckIn === 'pendiente' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Check-In de Orden
            </CardTitle>
            <CardDescription>
              Complete la información inicial para comenzar el trabajo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Estado Inicial del Equipo</label>
                <Select 
                  onValueChange={(value) => setDatosCheckIn(prev => prev ? 
                    { ...prev, estado_equipo_inicial: value as CheckInData['estado_equipo_inicial'] } : 
                    {
                      ubicacion: {
                        latitud: ubicacionActual?.lat || 0,
                        longitud: ubicacionActual?.lng || 0,
                        precision: 10,
                        direccion: ordenActual.ubicacion.direccion
                      },
                      observaciones_iniciales: '',
                      estado_equipo_inicial: value as CheckInData['estado_equipo_inicial'],
                      timestamp: new Date().toISOString()
                    }
                  )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione estado del equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operativo">Operativo</SelectItem>
                    <SelectItem value="parcial">Operativo Parcial</SelectItem>
                    <SelectItem value="no_operativo">No Operativo</SelectItem>
                    <SelectItem value="desconocido">Estado Desconocido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Foto Inicial (Opcional)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) manejarCargaFoto(file, 'inicial')
                    }}
                    className="flex-1"
                  />
                  <Camera className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Observaciones Iniciales</label>
              <Textarea 
                placeholder="Describa el estado inicial del equipo y cualquier observación relevante..."
                value={datosCheckIn?.observaciones_iniciales || ''}
                onChange={(e) => setDatosCheckIn(prev => prev ? 
                  { ...prev, observaciones_iniciales: e.target.value } : 
                  {
                    ubicacion: {
                      latitud: ubicacionActual?.lat || 0,
                      longitud: ubicacionActual?.lng || 0,
                      precision: 10,
                      direccion: ordenActual.ubicacion.direccion
                    },
                    observaciones_iniciales: e.target.value,
                    estado_equipo_inicial: 'desconocido',
                    timestamp: new Date().toISOString()
                  }
                )}
              />
            </div>

            {vistaPrevia && vistaPrevia.tipo === 'inicial' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Vista Previa - Foto Inicial</h4>
                <img 
                  src={vistaPrevia.url} 
                  alt="Vista previa foto inicial" 
                  className="max-w-xs h-auto rounded border"
                />
              </div>
            )}

            <Button 
              onClick={realizarCheckIn}
              className="w-full"
              disabled={!ubicacionActual}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Realizar Check-In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trabajo en Progreso */}
      {estadoCheckIn === 'checked_in' && datosCheckIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Trabajo en Progreso
            </CardTitle>
            <CardDescription>
              Iniciado el {new Date(datosCheckIn.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={obtenerColorEstadoEquipo(datosCheckIn.estado_equipo_inicial)}>
                  Estado Inicial: {datosCheckIn.estado_equipo_inicial}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Observaciones iniciales:</strong> {datosCheckIn.observaciones_iniciales || 'Sin observaciones'}
              </p>
            </div>

            <Button 
              onClick={() => setEstadoCheckIn('checked_out')}
              className="w-full"
              variant="outline"
            >
              Proceder a Check-Out
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Check-Out */}
      {estadoCheckIn === 'checked_out' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Check-Out de Orden
            </CardTitle>
            <CardDescription>
              Complete la información final del trabajo realizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Estado Final del Equipo</label>
                <Select 
                  value={datosCheckOut.estado_equipo_final}
                  onValueChange={(value) => setDatosCheckOut(prev => ({
                    ...prev, 
                    estado_equipo_final: value as CheckOutData['estado_equipo_final']
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione estado final" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operativo">Operativo</SelectItem>
                    <SelectItem value="parcial">Operativo Parcial</SelectItem>
                    <SelectItem value="no_operativo">No Operativo</SelectItem>
                    <SelectItem value="requiere_seguimiento">Requiere Seguimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Foto Final (Opcional)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) manejarCargaFoto(file, 'final')
                    }}
                    className="flex-1"
                  />
                  <Camera className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Trabajos Realizados</label>
              <Textarea 
                placeholder="Describa detalladamente los trabajos realizados..."
                value={datosCheckOut.trabajos_realizados || ''}
                onChange={(e) => setDatosCheckOut(prev => ({
                  ...prev, 
                  trabajos_realizados: e.target.value
                }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Materiales Utilizados</label>
              <Textarea 
                placeholder="Liste los materiales y repuestos utilizados..."
                value={datosCheckOut.materiales_utilizados || ''}
                onChange={(e) => setDatosCheckOut(prev => ({
                  ...prev, 
                  materiales_utilizados: e.target.value
                }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Observaciones Finales</label>
              <Textarea 
                placeholder="Observaciones adicionales, recomendaciones..."
                value={datosCheckOut.observaciones_finales || ''}
                onChange={(e) => setDatosCheckOut(prev => ({
                  ...prev, 
                  observaciones_finales: e.target.value
                }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requiere_visita"
                checked={datosCheckOut.requiere_visita_adicional || false}
                onChange={(e) => setDatosCheckOut(prev => ({
                  ...prev, 
                  requiere_visita_adicional: e.target.checked
                }))}
              />
              <label htmlFor="requiere_visita" className="text-sm font-medium text-gray-700">
                Requiere visita adicional
              </label>
            </div>

            {vistaPrevia && vistaPrevia.tipo === 'final' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Vista Previa - Foto Final</h4>
                <img 
                  src={vistaPrevia.url} 
                  alt="Vista previa foto final" 
                  className="max-w-xs h-auto rounded border"
                />
              </div>
            )}

            <Button 
              onClick={realizarCheckOut}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Completar Check-Out
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resumen final */}
      {estadoCheckIn === 'checked_out' && datosCheckIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Orden de Servicio Completada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Resumen del Trabajo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Tiempo total:</strong> {Math.floor((new Date().getTime() - new Date(datosCheckIn.timestamp).getTime()) / (1000 * 60))} minutos
                </div>
                <div>
                  <strong>Estado final:</strong> 
                  <Badge className={`ml-2 ${obtenerColorEstadoEquipo(datosCheckOut.estado_equipo_final || 'desconocido')}`}>
                    {datosCheckOut.estado_equipo_final || 'No especificado'}
                  </Badge>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => {
                setOrdenActual(null)
                setEstadoCheckIn('pendiente')
                setDatosCheckIn(null)
                setDatosCheckOut({})
                setCodigoQR('')
                setVistaPrevia(null)
              }}
              className="w-full"
              variant="outline"
            >
              Procesar Nueva Orden
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}