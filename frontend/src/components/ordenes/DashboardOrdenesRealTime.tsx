'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  Users, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Target,
  Zap,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Timer,
  Award,
  Warning
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// Tipos para métricas de órdenes
interface MetricasOrdenes {
  total_ordenes: number
  ordenes_pendientes: number
  ordenes_en_progreso: number
  ordenes_completadas: number
  ordenes_urgentes: number
  tiempo_promedio_resolucion: number
  eficiencia_tecnicos: number
  equipos_criticos: number
  sla_cumplimiento: number
}

interface RendimientoTecnico {
  id: number
  nombre: string
  ordenes_asignadas: number
  ordenes_completadas: number
  tiempo_promedio: number
  calificacion: number
  eficiencia: number
  ubicacion_actual: string
  estado: 'disponible' | 'ocupado' | 'descanso' | 'offline'
}

interface OrdenCritica {
  id: number
  numero_orden: string
  cliente: string
  equipo: string
  tipo_servicio: string
  prioridad: 'urgente' | 'alta' | 'media' | 'baja'
  tiempo_transcurrido: number
  tiempo_limite: number
  tecnico: string
  estado: string
}

interface TendenciaOperacional {
  fecha: string
  ordenes_completadas: number
  tiempo_promedio: number
  eficiencia: number
  satisfaccion_cliente: number
}

interface EquipoCritico {
  id: number
  nombre: string
  cliente: string
  tipo: string
  ultimo_mantenimiento: string
  proxima_revision: string
  estado_salud: number
  criticidad: 'alta' | 'media' | 'baja'
  alertas_pendientes: number
}

export default function DashboardOrdenesRealTime() {
  const [metricas, setMetricas] = useState<MetricasOrdenes | null>(null)
  const [tecnicos, setTecnicos] = useState<RendimientoTecnico[]>([])
  const [ordenesCriticas, setOrdenesCriticas] = useState<OrdenCritica[]>([])
  const [tendencias, setTendencias] = useState<TendenciaOperacional[]>([])
  const [equiposCriticos, setEquiposCriticos] = useState<EquipoCritico[]>([])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('7d')
  const [actualizacionTiempo, setActualizacionTiempo] = useState<Date>(new Date())

  // Colores para gráficos
  const COLORES = {
    primario: '#3B82F6',
    secundario: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#8B5CF6'
  }

  // Simulación de datos en tiempo real
  useEffect(() => {
    const cargarDatos = () => {
      // Métricas principales
      const metricasSimuladas: MetricasOrdenes = {
        total_ordenes: 45,
        ordenes_pendientes: 8,
        ordenes_en_progreso: 12,
        ordenes_completadas: 25,
        ordenes_urgentes: 3,
        tiempo_promedio_resolucion: 185, // minutos
        eficiencia_tecnicos: 87.5,
        equipos_criticos: 6,
        sla_cumplimiento: 94.2
      }

      // Técnicos
      const tecnicosSimulados: RendimientoTecnico[] = [
        {
          id: 1,
          nombre: 'Carlos Mendoza',
          ordenes_asignadas: 8,
          ordenes_completadas: 6,
          tiempo_promedio: 165,
          calificacion: 4.8,
          eficiencia: 92,
          ubicacion_actual: 'Hospital San Rafael',
          estado: 'ocupado'
        },
        {
          id: 2,
          nombre: 'María García',
          ordenes_asignadas: 7,
          ordenes_completadas: 7,
          tiempo_promedio: 145,
          calificacion: 4.9,
          eficiencia: 95,
          ubicacion_actual: 'Clínica Bolivariana',
          estado: 'ocupado'
        },
        {
          id: 3,
          nombre: 'Andrés López',
          ordenes_asignadas: 6,
          ordenes_completadas: 5,
          tiempo_promedio: 210,
          calificacion: 4.6,
          eficiencia: 85,
          ubicacion_actual: 'Base Técnica',
          estado: 'disponible'
        },
        {
          id: 4,
          nombre: 'Laura Ruiz',
          ordenes_asignadas: 9,
          ordenes_completadas: 8,
          tiempo_promedio: 175,
          calificacion: 4.7,
          eficiencia: 89,
          ubicacion_actual: 'Hospital Pablo Tobón',
          estado: 'ocupado'
        }
      ]

      // Órdenes críticas
      const ordenesCriticasSimuladas: OrdenCritica[] = [
        {
          id: 1,
          numero_orden: 'OS-2024-042',
          cliente: 'Hospital San Vicente',
          equipo: 'Ventilador UCI',
          tipo_servicio: 'reparacion',
          prioridad: 'urgente',
          tiempo_transcurrido: 280,
          tiempo_limite: 360,
          tecnico: 'Carlos Mendoza',
          estado: 'en_progreso'
        },
        {
          id: 2,
          numero_orden: 'OS-2024-043',
          cliente: 'Clínica del Country',
          equipo: 'Resonancia Magnética',
          tipo_servicio: 'mantenimiento',
          prioridad: 'alta',
          tiempo_transcurrido: 420,
          tiempo_limite: 480,
          tecnico: 'María García',
          estado: 'en_progreso'
        },
        {
          id: 3,
          numero_orden: 'OS-2024-044',
          cliente: 'Hospital General',
          equipo: 'TAC',
          tipo_servicio: 'diagnostico',
          prioridad: 'urgente',
          tiempo_transcurrido: 180,
          tiempo_limite: 240,
          tecnico: 'Sin asignar',
          estado: 'pendiente'
        }
      ]

      // Tendencias operacionales
      const tendenciasSimuladas: TendenciaOperacional[] = [
        { fecha: '2024-11-10', ordenes_completadas: 22, tiempo_promedio: 195, eficiencia: 85, satisfaccion_cliente: 4.6 },
        { fecha: '2024-11-11', ordenes_completadas: 28, tiempo_promedio: 180, eficiencia: 88, satisfaccion_cliente: 4.7 },
        { fecha: '2024-11-12', ordenes_completadas: 31, tiempo_promedio: 175, eficiencia: 90, satisfaccion_cliente: 4.8 },
        { fecha: '2024-11-13', ordenes_completadas: 25, tiempo_promedio: 190, eficiencia: 87, satisfaccion_cliente: 4.6 },
        { fecha: '2024-11-14', ordenes_completadas: 33, tiempo_promedio: 165, eficiencia: 92, satisfaccion_cliente: 4.9 },
        { fecha: '2024-11-15', ordenes_completadas: 29, tiempo_promedio: 170, eficiencia: 91, satisfaccion_cliente: 4.8 },
        { fecha: '2024-11-16', ordenes_completadas: 25, tiempo_promedio: 185, eficiencia: 89, satisfaccion_cliente: 4.7 }
      ]

      // Equipos críticos
      const equiposCriticosSimulados: EquipoCritico[] = [
        {
          id: 1,
          nombre: 'Resonancia Magnética Siemens #001',
          cliente: 'Hospital San Rafael',
          tipo: 'Resonancia Magnética',
          ultimo_mantenimiento: '2024-08-15',
          proxima_revision: '2024-11-20',
          estado_salud: 78,
          criticidad: 'alta',
          alertas_pendientes: 2
        },
        {
          id: 2,
          nombre: 'TAC GE Healthcare #003',
          cliente: 'Clínica Bolivariana',
          tipo: 'TAC',
          ultimo_mantenimiento: '2024-09-01',
          proxima_revision: '2024-11-18',
          estado_salud: 65,
          criticidad: 'alta',
          alertas_pendientes: 3
        },
        {
          id: 3,
          nombre: 'Ventilador Dräger #015',
          cliente: 'Hospital Pablo Tobón',
          tipo: 'Ventilador',
          ultimo_mantenimiento: '2024-10-05',
          proxima_revision: '2024-11-25',
          estado_salud: 45,
          criticidad: 'alta',
          alertas_pendientes: 4
        }
      ]

      setMetricas(metricasSimuladas)
      setTecnicos(tecnicosSimulados)
      setOrdenesCriticas(ordenesCriticasSimuladas)
      setTendencias(tendenciasSimuladas)
      setEquiposCriticos(equiposCriticosSimulados)
      setActualizacionTiempo(new Date())
    }

    cargarDatos()

    // Actualización en tiempo real cada 30 segundos
    const interval = setInterval(cargarDatos, 30000)
    return () => clearInterval(interval)
  }, [periodoSeleccionado])

  const obtenerColorEstado = (estado: string) => {
    const colores = {
      'disponible': 'bg-green-100 text-green-800',
      'ocupado': 'bg-blue-100 text-blue-800',
      'descanso': 'bg-yellow-100 text-yellow-800',
      'offline': 'bg-gray-100 text-gray-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const obtenerColorPrioridad = (prioridad: string) => {
    const colores = {
      'urgente': 'bg-red-500',
      'alta': 'bg-orange-500',
      'media': 'bg-yellow-500',
      'baja': 'bg-blue-500'
    }
    return colores[prioridad] || 'bg-gray-500'
  }

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`
  }

  const calcularPorcentajeTiempo = (transcurrido: number, limite: number) => {
    return Math.min((transcurrido / limite) * 100, 100)
  }

  if (!metricas) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Cargando dashboard en tiempo real...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Órdenes - Tiempo Real</h1>
          <p className="text-gray-600">
            Última actualización: {actualizacionTiempo.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hoy</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.total_ordenes}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metricas.ordenes_en_progreso}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.ordenes_urgentes} urgentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatearTiempo(metricas.tiempo_promedio_resolucion)}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -8% esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Cumplimiento</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metricas.sla_cumplimiento}%</div>
            <Progress value={metricas.sla_cumplimiento} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="tecnicos">Técnicos</TabsTrigger>
          <TabsTrigger value="criticas">Órdenes Críticas</TabsTrigger>
          <TabsTrigger value="equipos">Equipos Críticos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencia de órdenes completadas */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Órdenes Completadas</CardTitle>
                <CardDescription>Evolución diaria de productividad</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tendencias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" tickFormatter={(date) => new Date(date).getDate().toString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <Area 
                      type="monotone" 
                      dataKey="ordenes_completadas" 
                      stroke={COLORES.primario} 
                      fill={COLORES.primario}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución por tipo de servicio */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo de Servicio</CardTitle>
                <CardDescription>Últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Mantenimiento', value: 45, fill: COLORES.primario },
                        { name: 'Reparación', value: 30, fill: COLORES.error },
                        { name: 'Instalación', value: 15, fill: COLORES.secundario },
                        { name: 'Diagnóstico', value: 10, fill: COLORES.warning }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de eficiencia */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Eficiencia</CardTitle>
              <CardDescription>Indicadores clave de rendimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tendencias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tickFormatter={(date) => new Date(date).getDate().toString()} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="eficiencia" 
                    stroke={COLORES.secundario} 
                    name="Eficiencia (%)"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="satisfaccion_cliente" 
                    stroke={COLORES.info} 
                    name="Satisfacción Cliente"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="tiempo_promedio" 
                    stroke={COLORES.warning} 
                    name="Tiempo Promedio (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tecnicos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {tecnicos.map((tecnico) => (
              <Card key={tecnico.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{tecnico.nombre}</CardTitle>
                      <CardDescription>{tecnico.ubicacion_actual}</CardDescription>
                    </div>
                    <Badge className={obtenerColorEstado(tecnico.estado)}>
                      {tecnico.estado}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Asignadas:</span>
                      <p className="font-semibold">{tecnico.ordenes_asignadas}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Completadas:</span>
                      <p className="font-semibold text-green-600">{tecnico.ordenes_completadas}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo Prom:</span>
                      <p className="font-semibold">{formatearTiempo(tecnico.tiempo_promedio)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold ml-1">{tecnico.calificacion}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Eficiencia</span>
                      <span className="text-sm font-semibold">{tecnico.eficiencia}%</span>
                    </div>
                    <Progress value={tecnico.eficiencia} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="criticas" className="space-y-6">
          <div className="space-y-4">
            {ordenesCriticas.map((orden) => (
              <Card key={orden.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        {orden.numero_orden} - {orden.cliente}
                      </CardTitle>
                      <CardDescription>{orden.equipo}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${obtenerColorPrioridad(orden.prioridad)}`} />
                      <Badge variant="outline">{orden.prioridad}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Técnico Asignado:</span>
                      <p className="font-semibold">{orden.tecnico}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tiempo Transcurrido:</span>
                      <p className="font-semibold">{formatearTiempo(orden.tiempo_transcurrido)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tiempo Límite:</span>
                      <p className="font-semibold">{formatearTiempo(orden.tiempo_limite)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progreso de Tiempo</span>
                      <span className="text-sm font-semibold">
                        {calcularPorcentajeTiempo(orden.tiempo_transcurrido, orden.tiempo_limite).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={calcularPorcentajeTiempo(orden.tiempo_transcurrido, orden.tiempo_limite)}
                      className={`${calcularPorcentajeTiempo(orden.tiempo_transcurrido, orden.tiempo_limite) > 80 ? 'bg-red-100' : 'bg-yellow-100'}`}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver Ubicación
                    </Button>
                    <Button size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Escalar Prioridad
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipos" className="space-y-6">
          <div className="space-y-4">
            {equiposCriticos.map((equipo) => (
              <Card key={equipo.id} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Warning className="h-5 w-5 text-orange-600" />
                        {equipo.nombre}
                      </CardTitle>
                      <CardDescription>{equipo.cliente} - {equipo.tipo}</CardDescription>
                    </div>
                    <Badge 
                      className={`${equipo.criticidad === 'alta' ? 'bg-red-100 text-red-800' : 
                        equipo.criticidad === 'media' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}`}
                    >
                      {equipo.criticidad}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Último Mantenimiento:</span>
                      <p className="font-semibold">{new Date(equipo.ultimo_mantenimiento).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Próxima Revisión:</span>
                      <p className="font-semibold">{new Date(equipo.proxima_revision).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Alertas Pendientes:</span>
                      <p className="font-semibold text-red-600">{equipo.alertas_pendientes}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Estado de Salud</span>
                      <span className="text-sm font-semibold">{equipo.estado_salud}%</span>
                    </div>
                    <Progress 
                      value={equipo.estado_salud}
                      className={`${equipo.estado_salud < 50 ? 'bg-red-100' : 
                        equipo.estado_salud < 75 ? 'bg-yellow-100' : 'bg-green-100'}`}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Programar Mantenimiento
                    </Button>
                    <Button size="sm">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Ver Alertas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Alertas del sistema */}
      <div className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <Warning className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>3 órdenes urgentes</strong> requieren atención inmediata. Tiempo promedio de respuesta: 45 minutos.
          </AlertDescription>
        </Alert>
        
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Ventilador Dräger #015</strong> en estado crítico (45% salud). Programar mantenimiento urgente.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}