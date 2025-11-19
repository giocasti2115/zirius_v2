'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle,
  Calendar,
  Target,
  Users,
  DollarSign
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import informesService, { 
  KPIData, 
  FiltrosInformes 
} from '@/lib/services/informes.service'
import { cn } from '@/lib/utils'

export default function IndicadoresPage() {
  const [kpis, setKpis] = useState<any>(null)
  const [tendencias, setTendencias] = useState<any[]>([])
  const [periodo, setPeriodo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformes>({
    fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0]
  })

  // Cargar datos
  useEffect(() => {
    cargarDatos()
  }, [filtros])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await informesService.obtenerIndicadores(filtros)
      
      if (response.success) {
        setKpis(response.data.kpis || {})
        setTendencias(response.data.tendencias || [])
        setPeriodo(response.data.periodo || {})
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (err) {
      console.error('Error cargando indicadores:', err)
      setError('Error al cargar los datos. Usando información de ejemplo.')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (key: keyof FiltrosInformes, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value?.toFixed(1) || '0'}%`
  }

  const formatNumber = (value: number) => {
    return value?.toLocaleString('es-CO') || '0'
  }

  const getTendenciaIcon = (actual: number, anterior: number) => {
    if (actual > anterior) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (actual < anterior) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  const getKPIColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'text-green-600'
    if (value >= threshold.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Indicadores de Rendimiento (KPIs)</h1>
          <p className="text-gray-600 mt-2">
            Dashboard ejecutivo con métricas clave del sistema de gestión
          </p>
          {periodo && (
            <p className="text-sm text-gray-500 mt-1">
              Período: {new Date(periodo.fecha_inicio).toLocaleDateString('es-CO')} - {new Date(periodo.fecha_fin).toLocaleDateString('es-CO')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/informes'}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Todos los Informes
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seleccionar Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
              <Input
                type="date"
                value={filtros.fecha_inicio || ''}
                onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
              <Input
                type="date"
                value={filtros.fecha_fin || ''}
                onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setFiltros({
                  fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  fecha_fin: new Date().toISOString().split('T')[0]
                })}
                variant="outline"
              >
                Últimos 30 días
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs de Solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Indicadores de Solicitudes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">Total Solicitudes</span>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(kpis?.solicitudes?.total_solicitudes || 0)}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Urgentes: {formatNumber(kpis?.solicitudes?.urgentes || 0)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600">Tasa de Completitud</span>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className={cn("text-2xl font-bold", getKPIColor(kpis?.solicitudes?.tasa_completitud || 0, { good: 85, warning: 70 }))}>
                {formatPercentage(kpis?.solicitudes?.tasa_completitud || 0)}
              </div>
              <div className="text-xs text-green-700 mt-1">
                {formatNumber(kpis?.solicitudes?.completadas || 0)} completadas
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-600">Tiempo Promedio</span>
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {(kpis?.solicitudes?.tiempo_resolucion_promedio || 0).toFixed(1)} días
              </div>
              <div className="text-xs text-purple-700 mt-1">
                24h: {formatNumber(kpis?.solicitudes?.resueltas_24h || 0)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-600">En Proceso</span>
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {formatNumber(kpis?.solicitudes?.en_proceso || 0)}
              </div>
              <div className="text-xs text-orange-700 mt-1">
                Pendientes: {formatNumber(kpis?.solicitudes?.pendientes || 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs de Órdenes y Visitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Indicadores de Órdenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Total Órdenes</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.ordenes?.total_ordenes || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Ejecutadas</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.ordenes?.ejecutadas || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">Abiertas</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.ordenes?.abiertas || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Costo Promedio</span>
                <span className="font-bold text-lg">{formatCurrency(kpis?.ordenes?.costo_promedio || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Tiempo Ejecución</span>
                <span className="font-bold text-lg">{(kpis?.ordenes?.tiempo_ejecucion_promedio || 0).toFixed(1)} días</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Indicadores de Visitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Total Visitas</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.visitas?.total_visitas || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Completadas</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.visitas?.completadas || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">Programadas</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.visitas?.programadas || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Calificación Promedio</span>
                <span className="font-bold text-lg">{(kpis?.visitas?.calificacion_promedio || 0).toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Duración Promedio</span>
                <span className="font-bold text-lg">{(kpis?.visitas?.duracion_promedio || 0).toFixed(1)} hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Operacionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Indicadores Operacionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Total Equipos</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.equipos?.total_equipos || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Disponibilidad</span>
                <span className={cn("font-bold text-lg", getKPIColor(kpis?.equipos?.disponibilidad_equipos || 0, { good: 95, warning: 85 }))}>
                  {formatPercentage(kpis?.equipos?.disponibilidad_equipos || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">En Mantenimiento</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.equipos?.en_mantenimiento || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Total Técnicos</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.tecnicos?.total_tecnicos || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Calificación Técnicos</span>
                <span className="font-bold text-lg">{(kpis?.tecnicos?.calificacion_promedio_tecnicos || 0).toFixed(1)}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Indicadores Financieros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Ingresos Órdenes</span>
                <span className="font-bold text-lg">{formatCurrency(kpis?.financieros?.ingresos_ordenes || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Ticket Promedio</span>
                <span className="font-bold text-lg">{formatCurrency(kpis?.financieros?.ticket_promedio || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Clientes Activos</span>
                <span className="font-bold text-lg">{formatNumber(kpis?.financieros?.clientes_activos || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Costo Repuestos</span>
                <span className="font-bold text-lg">{formatCurrency(kpis?.financieros?.costo_repuestos || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                <span className="text-sm font-medium">Margen Bruto</span>
                <span className="font-bold text-lg">{formatCurrency(kpis?.financieros?.margen_bruto || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias */}
      {tendencias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Tendencias Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Mes</th>
                    <th className="text-left p-3 font-medium text-gray-600">Total Solicitudes</th>
                    <th className="text-left p-3 font-medium text-gray-600">Completadas</th>
                    <th className="text-left p-3 font-medium text-gray-600">Tiempo Promedio</th>
                    <th className="text-left p-3 font-medium text-gray-600">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {tendencias.map((mes, index) => {
                    const anterior = tendencias[index + 1]
                    return (
                      <tr key={mes.mes} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{mes.mes}</td>
                        <td className="p-3">{formatNumber(mes.total_solicitudes)}</td>
                        <td className="p-3">{formatNumber(mes.completadas)}</td>
                        <td className="p-3">{(mes.tiempo_promedio || 0).toFixed(1)} días</td>
                        <td className="p-3">
                          {anterior && getTendenciaIcon(mes.total_solicitudes, anterior.total_solicitudes)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}