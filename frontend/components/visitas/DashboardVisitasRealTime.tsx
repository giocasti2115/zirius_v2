'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  MapPin, Users, Clock, Activity, AlertTriangle, 
  CheckCircle2, Navigation, TrendingUp, TrendingDown,
  Calendar, Target, Zap, Route, Smartphone, Car,
  BarChart3, PieChart, LineChart, RefreshCw
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PieChart as RechartsPieChart, Cell, Pie } from 'recharts'
import { BarChart as RechartsBarChart, Bar } from 'recharts'

interface EstadisticasVisitas {
  total_hoy: number
  programadas: number
  en_curso: number
  completadas: number
  canceladas: number
  tiempo_promedio: number
  eficiencia_tecnico: number
  satisfaccion_cliente: number
}

interface TecnicoEnCampo {
  id: number
  nombre: string
  estado: 'disponible' | 'en_ruta' | 'en_visita' | 'almorzando' | 'desconectado'
  visitas_completadas: number
  visitas_programadas: number
  ubicacion: {
    latitud: number
    longitud: number
    direccion: string
  }
  ultima_actividad: string
  tiempo_en_ruta: number
  eficiencia: number
  visita_actual?: {
    id: number
    cliente: string
    tiempo_transcurrido: number
    progreso: number
  }
}

interface AlertaOperativa {
  id: number
  tipo: 'retraso' | 'emergencia' | 'cancelacion' | 'tecnico_inactivo' | 'cliente_llamada'
  prioridad: 'alta' | 'media' | 'baja'
  titulo: string
  descripcion: string
  visita_id?: number
  tecnico_id?: number
  tiempo_transcurrido: number
  requiere_accion: boolean
}

export default function DashboardVisitasRealTime() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasVisitas>({
    total_hoy: 0,
    programadas: 0,
    en_curso: 0,
    completadas: 0,
    canceladas: 0,
    tiempo_promedio: 0,
    eficiencia_tecnico: 0,
    satisfaccion_cliente: 0
  })
  
  const [tecnicos, setTecnicos] = useState<TecnicoEnCampo[]>([])
  const [alertas, setAlertas] = useState<AlertaOperativa[]>([])
  const [loading, setLoading] = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date())

  // Datos para gráficos
  const [datosRendimiento, setDatosRendimiento] = useState([
    { hora: '08:00', visitas: 2, completadas: 1 },
    { hora: '09:00', visitas: 5, completadas: 3 },
    { hora: '10:00', visitas: 8, completadas: 6 },
    { hora: '11:00', visitas: 12, completadas: 10 },
    { hora: '12:00', visitas: 15, completadas: 13 },
    { hora: '13:00', visitas: 18, completadas: 16 },
    { hora: '14:00', visitas: 22, completadas: 19 },
    { hora: '15:00', visitas: 25, completadas: 22 },
    { hora: '16:00', visitas: 28, completadas: 25 }
  ])

  const [datosEstados, setDatosEstados] = useState([
    { name: 'Completadas', value: 25, color: '#10b981' },
    { name: 'En Curso', value: 8, color: '#3b82f6' },
    { name: 'Programadas', value: 12, color: '#f59e0b' },
    { name: 'Canceladas', value: 2, color: '#ef4444' }
  ])

  // Cargar datos iniciales y configurar actualizaciones automáticas
  useEffect(() => {
    cargarDatos()
    
    const interval = setInterval(() => {
      cargarDatos()
    }, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Simular carga de datos del backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Estadísticas simuladas
      setEstadisticas({
        total_hoy: 47,
        programadas: 12,
        en_curso: 8,
        completadas: 25,
        canceladas: 2,
        tiempo_promedio: 95,
        eficiencia_tecnico: 87.5,
        satisfaccion_cliente: 94.2
      })

      // Técnicos en campo simulados
      setTecnicos([
        {
          id: 1,
          nombre: 'Juan Pérez',
          estado: 'en_visita',
          visitas_completadas: 3,
          visitas_programadas: 5,
          ubicacion: {
            latitud: 4.7110,
            longitud: -74.0721,
            direccion: 'Zona Norte, Bogotá'
          },
          ultima_actividad: new Date(Date.now() - 300000).toISOString(),
          tiempo_en_ruta: 45,
          eficiencia: 92,
          visita_actual: {
            id: 101,
            cliente: 'Hospital San Juan',
            tiempo_transcurrido: 35,
            progreso: 65
          }
        },
        {
          id: 2,
          nombre: 'María García',
          estado: 'en_ruta',
          visitas_completadas: 4,
          visitas_programadas: 6,
          ubicacion: {
            latitud: 4.6486,
            longitud: -74.0857,
            direccion: 'Zona Sur, Bogotá'
          },
          ultima_actividad: new Date(Date.now() - 120000).toISOString(),
          tiempo_en_ruta: 15,
          eficiencia: 88
        },
        {
          id: 3,
          nombre: 'Carlos López',
          estado: 'disponible',
          visitas_completadas: 5,
          visitas_programadas: 7,
          ubicacion: {
            latitud: 4.7390,
            longitud: -74.1020,
            direccion: 'Zona Oeste, Bogotá'
          },
          ultima_actividad: new Date(Date.now() - 600000).toISOString(),
          tiempo_en_ruta: 0,
          eficiencia: 95
        },
        {
          id: 4,
          nombre: 'Ana Rodríguez',
          estado: 'almorzando',
          visitas_completadas: 2,
          visitas_programadas: 4,
          ubicacion: {
            latitud: 4.6951,
            longitud: -74.0488,
            direccion: 'Centro, Bogotá'
          },
          ultima_actividad: new Date(Date.now() - 1800000).toISOString(),
          tiempo_en_ruta: 0,
          eficiencia: 82
        }
      ])

      // Alertas simuladas
      setAlertas([
        {
          id: 1,
          tipo: 'retraso',
          prioridad: 'alta',
          titulo: 'Visita con retraso significativo',
          descripcion: 'VST-2024-001 lleva 45 minutos de retraso en Hospital Central',
          visita_id: 101,
          tecnico_id: 1,
          tiempo_transcurrido: 45,
          requiere_accion: true
        },
        {
          id: 2,
          tipo: 'emergencia',
          prioridad: 'alta',
          titulo: 'Equipo crítico fuera de servicio',
          descripcion: 'Ventilador en UCI necesita atención inmediata',
          visita_id: 102,
          tiempo_transcurrido: 15,
          requiere_accion: true
        },
        {
          id: 3,
          tipo: 'tecnico_inactivo',
          prioridad: 'media',
          titulo: 'Técnico sin actividad',
          descripción: 'Carlos López disponible por más de 30 minutos sin asignación',
          tecnico_id: 3,
          tiempo_transcurrido: 35,
          requiere_accion: false
        }
      ])

      setUltimaActualizacion(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    const colores = {
      'disponible': 'bg-green-500',
      'en_ruta': 'bg-blue-500',
      'en_visita': 'bg-orange-500',
      'almorzando': 'bg-yellow-500',
      'desconectado': 'bg-gray-500'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-500'
  }

  const getPrioridadColor = (prioridad: string) => {
    const colores = {
      'alta': 'border-l-red-500 bg-red-50',
      'media': 'border-l-yellow-500 bg-yellow-50',
      'baja': 'border-l-green-500 bg-green-50'
    }
    return colores[prioridad as keyof typeof colores] || 'border-l-gray-500 bg-gray-50'
  }

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`
  }

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Visitas</h1>
          <p className="text-gray-600 mt-1">
            Monitoreo en tiempo real • Última actualización: {formatearHora(ultimaActualizacion.toISOString())}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={cargarDatos}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Activity className="w-4 h-4 mr-2" />
            Vista Completa
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.total_hoy}</p>
              </div>
              <Calendar className="w-6 h-6 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">En Curso</p>
                <p className="text-2xl font-bold text-orange-600">{estadisticas.en_curso}</p>
              </div>
              <Activity className="w-6 h-6 text-orange-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.completadas}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Programadas</p>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.programadas}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Tiempo Prom.</p>
                <p className="text-lg font-bold text-gray-900">{formatearTiempo(estadisticas.tiempo_promedio)}</p>
              </div>
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Eficiencia</p>
                <p className="text-lg font-bold text-gray-900">{estadisticas.eficiencia_tecnico}%</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Satisfacción</p>
                <p className="text-lg font-bold text-gray-900">{estadisticas.satisfaccion_cliente}%</p>
              </div>
              <Target className="w-5 h-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Canceladas</p>
                <p className="text-lg font-bold text-red-600">{estadisticas.canceladas}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Rendimiento por Horas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Rendimiento por Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={datosRendimiento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="visitas" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Visitas Programadas"
                />
                <Line 
                  type="monotone" 
                  dataKey="completadas" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Visitas Completadas"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Estados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Estados de Visitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={datosEstados}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosEstados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Técnicos en Campo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Técnicos en Campo ({tecnicos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {tecnicos.map((tecnico) => (
                <div key={tecnico.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getEstadoColor(tecnico.estado)}`} />
                      <div>
                        <p className="font-semibold text-gray-900">{tecnico.nombre}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {tecnico.estado.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {tecnico.visitas_completadas}/{tecnico.visitas_programadas}
                      </p>
                      <p className="text-xs text-gray-500">Eficiencia: {tecnico.eficiencia}%</p>
                    </div>
                  </div>

                  {tecnico.visita_actual && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-l-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-900">
                          {tecnico.visita_actual.cliente}
                        </p>
                        <p className="text-xs text-blue-700">
                          {formatearTiempo(tecnico.visita_actual.tiempo_transcurrido)}
                        </p>
                      </div>
                      <Progress 
                        value={tecnico.visita_actual.progreso} 
                        className="h-2" 
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        Progreso: {tecnico.visita_actual.progreso}%
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{tecnico.ubicacion.direccion}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatearHora(tecnico.ultima_actividad)}</span>
                    </div>
                  </div>

                  {tecnico.tiempo_en_ruta > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                      <Car className="w-3 h-3" />
                      <span>En ruta: {formatearTiempo(tecnico.tiempo_en_ruta)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas Operativas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas Operativas ({alertas.filter(a => a.requiere_accion).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0 max-h-96 overflow-y-auto">
              {alertas.map((alerta) => (
                <div 
                  key={alerta.id} 
                  className={`p-4 border-b last:border-b-0 border-l-4 ${getPrioridadColor(alerta.prioridad)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {alerta.titulo}
                        </p>
                        <Badge 
                          variant={alerta.prioridad === 'alta' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {alerta.prioridad}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alerta.descripcion}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Hace {formatearTiempo(alerta.tiempo_transcurrido)}</span>
                        {alerta.visita_id && (
                          <span>Visita #{alerta.visita_id}</span>
                        )}
                      </div>
                    </div>
                    {alerta.requiere_accion && (
                      <Button size="sm" variant="outline" className="ml-2">
                        <Zap className="w-3 h-3 mr-1" />
                        Actuar
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {alertas.length === 0 && (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">Sin alertas activas</p>
                  <p className="text-sm text-gray-500">Todas las operaciones funcionando normalmente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tiempo Promedio por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mantenimiento</span>
              <span className="font-medium">2h 15m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Reparación</span>
              <span className="font-medium">1h 45m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Instalación</span>
              <span className="font-medium">3h 30m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Calibración</span>
              <span className="font-medium">1h 20m</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rutas Optimizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-600" />
                <span className="text-sm">8 rutas calculadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="text-sm">23% reducción en tiempo</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-orange-600" />
                <span className="text-sm">156 km ahorrados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conectividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-600" />
                <span className="text-sm">4/4 técnicos conectados</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm">GPS activo: 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Última sync: 2 min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}