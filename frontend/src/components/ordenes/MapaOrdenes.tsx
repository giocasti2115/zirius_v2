'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, User, Wrench, AlertTriangle, Navigation, Zap } from 'lucide-react'

// Tipos para órdenes de servicio
interface OrdenServicio {
  id: number
  numero_orden: string
  cliente: string
  equipo: string
  tipo_servicio: 'mantenimiento' | 'reparacion' | 'instalacion' | 'diagnostico'
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  estado: 'pendiente' | 'asignada' | 'en_progreso' | 'en_reparacion' | 'completada' | 'cancelada'
  tecnico: {
    id: number
    nombre: string
    ubicacion: {
      latitud: number
      longitud: number
      direccion: string
      precision: number
    }
    ultima_actualizacion: string
  }
  ubicacion_destino: {
    latitud: number
    longitud: number
    direccion: string
  }
  fecha_programada: string
  tiempo_estimado: number
  descripcion: string
}

interface FiltrosOrden {
  estado: string
  prioridad: string
  tipo_servicio: string
  tecnico: string
  busqueda: string
}

export default function MapaOrdenes() {
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([])
  const [filtros, setFiltros] = useState<FiltrosOrden>({
    estado: 'todos',
    prioridad: 'todos',
    tipo_servicio: 'todos',
    tecnico: 'todos',
    busqueda: ''
  })
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenServicio | null>(null)
  const [vistaMapa, setVistaMapa] = useState<'mapa' | 'lista'>('mapa')

  // Simulación de datos de órdenes de servicio con tracking GPS
  useEffect(() => {
    const ordenesSimuladas: OrdenServicio[] = [
      {
        id: 1,
        numero_orden: 'OS-2024-001',
        cliente: 'Hospital San Rafael',
        equipo: 'Resonancia Magnética Siemens',
        tipo_servicio: 'mantenimiento',
        prioridad: 'alta',
        estado: 'en_progreso',
        tecnico: {
          id: 101,
          nombre: 'Carlos Mendoza',
          ubicacion: {
            latitud: 6.2442,
            longitud: -75.5812,
            direccion: 'Av. El Poblado, Medellín',
            precision: 12
          },
          ultima_actualizacion: new Date().toISOString()
        },
        ubicacion_destino: {
          latitud: 6.2518,
          longitud: -75.5636,
          direccion: 'Cra 51C #62-78, Hospital San Rafael'
        },
        fecha_programada: '2024-11-16T08:00:00',
        tiempo_estimado: 180,
        descripcion: 'Mantenimiento preventivo trimestral - Revisión completa del sistema'
      },
      {
        id: 2,
        numero_orden: 'OS-2024-002',
        cliente: 'Clínica Bolivariana',
        equipo: 'TAC GE Healthcare',
        tipo_servicio: 'reparacion',
        prioridad: 'urgente',
        estado: 'asignada',
        tecnico: {
          id: 102,
          nombre: 'María García',
          ubicacion: {
            latitud: 6.2676,
            longitud: -75.5658,
            direccion: 'Cra 70 #52-20, Laureles',
            precision: 8
          },
          ultima_actualizacion: new Date(Date.now() - 300000).toISOString()
        },
        ubicacion_destino: {
          latitud: 6.2442,
          longitud: -75.5515,
          direccion: 'Cra 25A #1A Sur-45, Clínica Bolivariana'
        },
        fecha_programada: '2024-11-16T10:30:00',
        tiempo_estimado: 240,
        descripcion: 'Falla en sistema de enfriamiento - Emergencia médica'
      },
      {
        id: 3,
        numero_orden: 'OS-2024-003',
        cliente: 'Centro Médico Imbanaco',
        equipo: 'Ecógrafo Philips',
        tipo_servicio: 'instalacion',
        prioridad: 'media',
        estado: 'pendiente',
        tecnico: {
          id: 103,
          nombre: 'Andrés López',
          ubicacion: {
            latitud: 6.2308,
            longitud: -75.5906,
            direccion: 'Base Técnica - Zona Industrial',
            precision: 15
          },
          ultima_actualizacion: new Date(Date.now() - 900000).toISOString()
        },
        ubicacion_destino: {
          latitud: 6.2087,
          longitud: -75.5764,
          direccion: 'Cra 38A #5A-100, Centro Médico Imbanaco'
        },
        fecha_programada: '2024-11-16T14:00:00',
        tiempo_estimado: 300,
        descripcion: 'Instalación de nuevo equipo ecográfico'
      },
      {
        id: 4,
        numero_orden: 'OS-2024-004',
        cliente: 'Hospital Pablo Tobón Uribe',
        equipo: 'Ventilador Mecánico Dräger',
        tipo_servicio: 'diagnostico',
        prioridad: 'alta',
        estado: 'completada',
        tecnico: {
          id: 104,
          nombre: 'Laura Ruiz',
          ubicacion: {
            latitud: 6.2622,
            longitud: -75.5658,
            direccion: 'Cra 51B #67-90, Hospital Pablo Tobón Uribe',
            precision: 5
          },
          ultima_actualizacion: new Date(Date.now() - 1800000).toISOString()
        },
        ubicacion_destino: {
          latitud: 6.2622,
          longitud: -75.5658,
          direccion: 'Cra 51B #67-90, Hospital Pablo Tobón Uribe'
        },
        fecha_programada: '2024-11-16T06:00:00',
        tiempo_estimado: 120,
        descripcion: 'Diagnóstico de falla en ventilador - UCI'
      }
    ]

    setOrdenes(ordenesSimuladas)

    // Simulación de actualización en tiempo real
    const interval = setInterval(() => {
      setOrdenes(prev => prev.map(orden => {
        if (orden.estado === 'en_progreso' || orden.estado === 'asignada') {
          // Simular movimiento del técnico
          const deltaLat = (Math.random() - 0.5) * 0.002
          const deltaLng = (Math.random() - 0.5) * 0.002
          
          return {
            ...orden,
            tecnico: {
              ...orden.tecnico,
              ubicacion: {
                ...orden.tecnico.ubicacion,
                latitud: orden.tecnico.ubicacion.latitud + deltaLat,
                longitud: orden.tecnico.ubicacion.longitud + deltaLng,
                precision: Math.random() * 20 + 5
              },
              ultima_actualizacion: new Date().toISOString()
            }
          }
        }
        return orden
      }))
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  // Filtrar órdenes según criterios
  const ordenesFiltradas = ordenes.filter(orden => {
    const coincideEstado = filtros.estado === 'todos' || orden.estado === filtros.estado
    const coincidePrioridad = filtros.prioridad === 'todos' || orden.prioridad === filtros.prioridad
    const coincideTipo = filtros.tipo_servicio === 'todos' || orden.tipo_servicio === filtros.tipo_servicio
    const coincideTecnico = filtros.tecnico === 'todos' || orden.tecnico.id.toString() === filtros.tecnico
    const coincideBusqueda = filtros.busqueda === '' || 
      orden.numero_orden.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      orden.cliente.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      orden.equipo.toLowerCase().includes(filtros.busqueda.toLowerCase())

    return coincideEstado && coincidePrioridad && coincideTipo && coincideTecnico && coincideBusqueda
  })

  const obtenerColorEstado = (estado: string) => {
    const colores = {
      'pendiente': 'bg-gray-100 text-gray-800',
      'asignada': 'bg-blue-100 text-blue-800',
      'en_progreso': 'bg-yellow-100 text-yellow-800',
      'en_reparacion': 'bg-orange-100 text-orange-800',
      'completada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const obtenerColorPrioridad = (prioridad: string) => {
    const colores = {
      'baja': 'bg-blue-500',
      'media': 'bg-yellow-500',
      'alta': 'bg-orange-500',
      'urgente': 'bg-red-500'
    }
    return colores[prioridad] || 'bg-gray-500'
  }

  const obtenerIconoTipoServicio = (tipo: string) => {
    const iconos = {
      'mantenimiento': <Wrench className="h-4 w-4" />,
      'reparacion': <AlertTriangle className="h-4 w-4" />,
      'instalacion': <Zap className="h-4 w-4" />,
      'diagnostico': <Navigation className="h-4 w-4" />
    }
    return iconos[tipo] || <Wrench className="h-4 w-4" />
  }

  const calcularTiempoTranscurrido = (ultimaActualizacion: string) => {
    const ahora = new Date()
    const ultima = new Date(ultimaActualizacion)
    const minutos = Math.floor((ahora.getTime() - ultima.getTime()) / (1000 * 60))
    
    if (minutos < 1) return 'Hace menos de 1 min'
    if (minutos < 60) return `Hace ${minutos} min`
    const horas = Math.floor(minutos / 60)
    return `Hace ${horas}h ${minutos % 60}m`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tracking GPS - Órdenes de Servicio</h1>
          <p className="text-gray-600">Monitoreo en tiempo real de técnicos y órdenes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={vistaMapa === 'mapa' ? 'default' : 'outline'}
            onClick={() => setVistaMapa('mapa')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Mapa
          </Button>
          <Button 
            variant={vistaMapa === 'lista' ? 'default' : 'outline'}
            onClick={() => setVistaMapa('lista')}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Órdenes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            placeholder="Buscar órden, cliente, equipo..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
          />
          
          <Select value={filtros.estado} onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="asignada">Asignada</SelectItem>
              <SelectItem value="en_progreso">En Progreso</SelectItem>
              <SelectItem value="en_reparacion">En Reparación</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtros.prioridad} onValueChange={(value) => setFiltros(prev => ({ ...prev, prioridad: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las prioridades</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtros.tipo_servicio} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo_servicio: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo Servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              <SelectItem value="reparacion">Reparación</SelectItem>
              <SelectItem value="instalacion">Instalación</SelectItem>
              <SelectItem value="diagnostico">Diagnóstico</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtros.tecnico} onValueChange={(value) => setFiltros(prev => ({ ...prev, tecnico: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Técnico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los técnicos</SelectItem>
              {Array.from(new Set(ordenes.map(o => o.tecnico.id))).map(id => {
                const tecnico = ordenes.find(o => o.tecnico.id === id)?.tecnico
                return tecnico ? (
                  <SelectItem key={id} value={id.toString()}>{tecnico.nombre}</SelectItem>
                ) : null
              })}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setFiltros({
              estado: 'todos',
              prioridad: 'todos', 
              tipo_servicio: 'todos',
              tecnico: 'todos',
              busqueda: ''
            })}
          >
            Limpiar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Vista de Mapa Simulado */}
      {vistaMapa === 'mapa' && (
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Órdenes en Tiempo Real</CardTitle>
            <CardDescription>
              Simulación de tracking GPS de técnicos y ubicaciones de órdenes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 min-h-[500px] relative border-2 border-dashed border-blue-200">
              <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-semibold text-lg">
                🗺️ SIMULACIÓN MAPA GPS ÓRDENES DE SERVICIO 🗺️
              </div>
              
              {/* Marcadores simulados */}
              <div className="absolute top-16 left-16">
                <div className="bg-red-500 rounded-full p-2 animate-pulse">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white px-2 py-1 rounded shadow-lg text-xs mt-1">
                  Urgente: TAC GE Healthcare
                </div>
              </div>
              
              <div className="absolute top-32 right-20">
                <div className="bg-yellow-500 rounded-full p-2 animate-bounce">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white px-2 py-1 rounded shadow-lg text-xs mt-1">
                  Carlos Mendoza - En ruta
                </div>
              </div>
              
              <div className="absolute bottom-20 left-1/3">
                <div className="bg-green-500 rounded-full p-2">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white px-2 py-1 rounded shadow-lg text-xs mt-1">
                  Completada: Hospital Pablo Tobón
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Órdenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ordenesFiltradas.map((orden) => (
          <Card 
            key={orden.id} 
            className={`hover:shadow-lg transition-shadow cursor-pointer ${ordenSeleccionada?.id === orden.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setOrdenSeleccionada(orden)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{orden.numero_orden}</CardTitle>
                  <CardDescription>{orden.cliente}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={obtenerColorEstado(orden.estado)}>
                    {orden.estado.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className={`w-3 h-3 rounded-full ${obtenerColorPrioridad(orden.prioridad)}`} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {obtenerIconoTipoServicio(orden.tipo_servicio)}
                <span>{orden.equipo}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{orden.tecnico.nombre}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{orden.tecnico.ubicacion.direccion}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{calcularTiempoTranscurrido(orden.tecnico.ultima_actualizacion)}</span>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {orden.descripcion}
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">
                  Programada: {new Date(orden.fecha_programada).toLocaleString()}
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  {orden.tiempo_estimado} min
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen de estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Órdenes de Servicio</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{ordenes.filter(o => o.estado === 'pendiente').length}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{ordenes.filter(o => o.estado === 'en_progreso').length}</div>
            <div className="text-sm text-gray-600">En Progreso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{ordenes.filter(o => o.estado === 'completada').length}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{ordenes.filter(o => o.prioridad === 'urgente').length}</div>
            <div className="text-sm text-gray-600">Urgentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Array.from(new Set(ordenes.map(o => o.tecnico.id))).length}</div>
            <div className="text-sm text-gray-600">Técnicos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{ordenesFiltradas.length}</div>
            <div className="text-sm text-gray-600">Filtradas</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}