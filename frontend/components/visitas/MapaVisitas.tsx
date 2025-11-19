'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MapPin, Navigation, Users, Clock, Route, Target, 
  Car, AlertTriangle, Zap, Settings, Maximize, 
  Filter, Search, RefreshCw 
} from 'lucide-react'

interface Visita {
  id: number
  numero_visita: string
  cliente_nombre: string
  sede_nombre: string
  direccion: string
  latitud?: number
  longitud?: number
  tecnico_nombre: string
  estado: string
  tipo_visita: string
  fecha_programada: string
  hora_estimada: string
  prioridad: 'alta' | 'media' | 'baja'
  distancia_estimada?: number
  tiempo_estimado?: number
}

interface TecnicoEnCampo {
  id: number
  nombre: string
  latitud: number
  longitud: number
  estado: 'disponible' | 'en_ruta' | 'en_visita' | 'almorzando'
  visita_actual?: Visita
  ultima_actualizacion: string
  velocidad?: number
  direccion?: number
}

interface MapaVisitasProps {
  visitas: Visita[]
  mostrarTecnicos?: boolean
  altura?: string
}

export default function MapaVisitas({ 
  visitas = [], 
  mostrarTecnicos = true,
  altura = "600px" 
}: MapaVisitasProps) {
  const [tecnicosEnCampo, setTecnicosEnCampo] = useState<TecnicoEnCampo[]>([])
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<Visita | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [centroMapa, setCentroMapa] = useState({ lat: 4.7110, lng: -74.0721 }) // Bogotá por defecto
  const [zoom, setZoom] = useState(11)
  const [loading, setLoading] = useState(false)
  const mapaRef = useRef<HTMLDivElement>(null)

  // Simular datos de técnicos en campo
  useEffect(() => {
    const simularTecnicosEnCampo = () => {
      const tecnicos: TecnicoEnCampo[] = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          latitud: 4.7280,
          longitud: -74.0776,
          estado: 'en_visita',
          ultima_actualizacion: new Date().toISOString(),
          velocidad: 0,
          visita_actual: visitas[0]
        },
        {
          id: 2,
          nombre: 'María García',
          latitud: 4.6951,
          longitud: -74.0488,
          estado: 'en_ruta',
          ultima_actualizacion: new Date().toISOString(),
          velocidad: 25,
          direccion: 45
        },
        {
          id: 3,
          nombre: 'Carlos López',
          latitud: 4.7390,
          longitud: -74.1020,
          estado: 'disponible',
          ultima_actualizacion: new Date().toISOString(),
          velocidad: 0
        },
        {
          id: 4,
          nombre: 'Ana Rodríguez',
          latitud: 4.6486,
          longitud: -74.0857,
          estado: 'almorzando',
          ultima_actualizacion: new Date().toISOString(),
          velocidad: 0
        }
      ]
      setTecnicosEnCampo(tecnicos)
    }

    simularTecnicosEnCampo()
    
    // Actualizar posiciones cada 30 segundos
    const interval = setInterval(simularTecnicosEnCampo, 30000)
    return () => clearInterval(interval)
  }, [visitas])

  const visitasFiltradas = visitas.filter(visita => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || visita.estado === filtroEstado
    const cumpleBusqueda = !busqueda || 
      visita.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      visita.numero_visita.toLowerCase().includes(busqueda.toLowerCase()) ||
      visita.tecnico_nombre.toLowerCase().includes(busqueda.toLowerCase())
    
    return cumpleFiltroEstado && cumpleBusqueda
  })

  const getEstadoColor = (estado: string) => {
    const colores = {
      'programada': 'bg-blue-500',
      'en_curso': 'bg-green-500',
      'completada': 'bg-gray-500',
      'cancelada': 'bg-red-500',
      'reagendada': 'bg-yellow-500'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-500'
  }

  const getTecnicoEstadoColor = (estado: string) => {
    const colores = {
      'disponible': 'bg-green-500',
      'en_ruta': 'bg-blue-500',
      'en_visita': 'bg-orange-500',
      'almorzando': 'bg-yellow-500'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-500'
  }

  const getPrioridadColor = (prioridad: string) => {
    const colores = {
      'alta': 'bg-red-500',
      'media': 'bg-yellow-500',
      'baja': 'bg-green-500'
    }
    return colores[prioridad as keyof typeof colores] || 'bg-gray-500'
  }

  const calcularRutaOptima = async (tecnicoId: number) => {
    setLoading(true)
    // Simular cálculo de ruta
    setTimeout(() => {
      console.log(`Calculando ruta óptima para técnico ${tecnicoId}`)
      setLoading(false)
    }, 2000)
  }

  const centrarEnVisita = (visita: Visita) => {
    if (visita.latitud && visita.longitud) {
      setCentroMapa({ lat: visita.latitud, lng: visita.longitud })
      setZoom(15)
      setVisitaSeleccionada(visita)
    }
  }

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearDistancia = (distancia: number) => {
    if (distancia < 1000) {
      return `${distancia}m`
    }
    return `${(distancia / 1000).toFixed(1)}km`
  }

  return (
    <div className="space-y-4">
      {/* Controles del Mapa */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar visitas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="todos">Todos los Estados</option>
                <option value="programada">Programadas</option>
                <option value="en_curso">En Curso</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => calcularRutaOptima(1)}
                disabled={loading}
              >
                <Route className="w-4 h-4 mr-2" />
                Calcular Rutas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Mapa Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mapa de Visitas en Tiempo Real
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Maximize className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={mapaRef}
                className="w-full bg-gray-200 relative overflow-hidden rounded-b-lg"
                style={{ height: altura }}
              >
                {/* Simulación de Mapa */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Marcadores de Visitas */}
                  {visitasFiltradas.map((visita, index) => (
                    <div
                      key={visita.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        left: `${20 + (index % 6) * 12}%`,
                        top: `${20 + Math.floor(index / 6) * 15}%`
                      }}
                      onClick={() => centrarEnVisita(visita)}
                    >
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full ${getEstadoColor(visita.estado)} border-2 border-white shadow-lg flex items-center justify-center`}>
                          <div className={`w-2 h-2 rounded-full ${getPrioridadColor(visita.prioridad)}`} />
                        </div>
                        {visitaSeleccionada?.id === visita.id && (
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg border z-10 min-w-48">
                            <div className="text-sm font-semibold">{visita.numero_visita}</div>
                            <div className="text-xs text-gray-600">{visita.cliente_nombre}</div>
                            <div className="text-xs text-gray-600">{visita.sede_nombre}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatearHora(visita.fecha_programada)}
                            </div>
                            <div className="flex gap-1 mt-2">
                              <Badge variant="outline" className={`text-xs ${getEstadoColor(visita.estado)}`}>
                                {visita.estado}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Marcadores de Técnicos */}
                  {mostrarTecnicos && tecnicosEnCampo.map((tecnico, index) => (
                    <div
                      key={tecnico.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${60 + (index % 4) * 8}%`,
                        top: `${30 + Math.floor(index / 4) * 20}%`
                      }}
                    >
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full ${getTecnicoEstadoColor(tecnico.estado)} border-2 border-white shadow-lg flex items-center justify-center`}>
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        {tecnico.estado === 'en_ruta' && tecnico.velocidad && tecnico.velocidad > 0 && (
                          <div className="absolute -top-1 -right-1">
                            <Car className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg border z-10 min-w-32">
                          <div className="text-xs font-semibold">{tecnico.nombre}</div>
                          <div className="text-xs text-gray-600 capitalize">{tecnico.estado.replace('_', ' ')}</div>
                          {tecnico.velocidad !== undefined && tecnico.velocidad > 0 && (
                            <div className="text-xs text-gray-500">{tecnico.velocidad} km/h</div>
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(tecnico.ultima_actualizacion).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Leyenda del Mapa */}
                  <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
                    <div className="text-xs font-semibold mb-2">Leyenda</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
                        <span>Programada</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                        <span>En Curso</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-gray-500 border border-white"></div>
                        <span>Completada</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="w-3 h-3 text-orange-500" />
                        <span>Técnicos</span>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Zoom */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.min(zoom + 1, 20))}
                      className="rounded-b-none"
                    >
                      +
                    </Button>
                    <div className="border-t px-3 py-1 text-xs text-center bg-gray-50">
                      {zoom}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.max(zoom - 1, 1))}
                      className="rounded-t-none"
                    >
                      -
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-4">
          {/* Técnicos en Campo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Técnicos en Campo ({tecnicosEnCampo.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {tecnicosEnCampo.map((tecnico) => (
                  <div key={tecnico.id} className="p-2 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getTecnicoEstadoColor(tecnico.estado)}`} />
                        <span className="text-xs font-medium">{tecnico.nombre}</span>
                      </div>
                      {tecnico.estado === 'en_ruta' && (
                        <Navigation className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 capitalize mt-1">
                      {tecnico.estado.replace('_', ' ')}
                    </div>
                    {tecnico.visita_actual && (
                      <div className="text-xs text-gray-500 mt-1">
                        Visita: {tecnico.visita_actual.numero_visita}
                      </div>
                    )}
                    {tecnico.velocidad !== undefined && tecnico.velocidad > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        {tecnico.velocidad} km/h
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas Rápidas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Estadísticas del Día</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Total Visitas</span>
                  <span className="font-semibold">{visitasFiltradas.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">En Curso</span>
                  <span className="font-semibold text-green-600">
                    {visitasFiltradas.filter(v => v.estado === 'en_curso').length}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Programadas</span>
                  <span className="font-semibold text-blue-600">
                    {visitasFiltradas.filter(v => v.estado === 'programada').length}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Completadas</span>
                  <span className="font-semibold text-gray-600">
                    {visitasFiltradas.filter(v => v.estado === 'completada').length}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xs">
                  <span className="text-gray-600">Técnicos Activos</span>
                  <span className="font-semibold text-orange-600">
                    {tecnicosEnCampo.filter(t => t.estado !== 'almorzando').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-yellow-600" />
                    <span className="font-medium">Retraso en Visita</span>
                  </div>
                  <div className="text-yellow-700 mt-1">
                    VST-2024-001 lleva 30 min de retraso
                  </div>
                </div>
                
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-red-600" />
                    <span className="font-medium">Prioridad Alta</span>
                  </div>
                  <div className="text-red-700 mt-1">
                    3 visitas urgentes sin asignar
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}