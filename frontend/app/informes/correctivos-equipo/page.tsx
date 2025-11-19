'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  Filter, 
  Download, 
  Search,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Wrench
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import informesService, { 
  CorrectivosPorEquipo, 
  FiltrosInformes 
} from '@/lib/services/informes.service'
import { cn } from '@/lib/utils'

export default function CorrectivosPorEquipoPage() {
  const [equipos, setEquipos] = useState<CorrectivosPorEquipo[]>([])
  const [estadisticas, setEstadisticas] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformes>({
    limit: 50
  })

  // Cargar datos
  useEffect(() => {
    cargarDatos()
  }, [filtros])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await informesService.obtenerCorrectivosPorEquipo(filtros)
      
      if (response.success) {
        setEquipos(response.data.equipos || [])
        setEstadisticas(response.data.estadisticas || {})
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (err) {
      console.error('Error cargando correctivos por equipo:', err)
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

  const exportarReporte = async (formato: 'excel' | 'pdf' | 'csv') => {
    try {
      const response = await informesService.exportarReporte('correctivos-equipo', formato, filtros)
      if (response.success) {
        // Aquí iría la lógica para descargar el archivo
        console.log('Archivo generado:', response.data.archivo_generado)
        // Simular descarga
        alert('Exportación iniciada. El archivo estará listo en unos minutos.')
      }
    } catch (error) {
      console.error('Error exportando:', error)
      alert('Error al exportar el reporte')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  const getCriticidadBadge = (total: number, completados: number) => {
    const tasa = (completados / total) * 100
    if (tasa >= 90) return { color: 'bg-green-100 text-green-800', label: 'EXCELENTE' }
    if (tasa >= 75) return { color: 'bg-blue-100 text-blue-800', label: 'BUENO' }
    if (tasa >= 50) return { color: 'bg-yellow-100 text-yellow-800', label: 'REGULAR' }
    return { color: 'bg-red-100 text-red-800', label: 'CRÍTICO' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Correctivos por Equipo</h1>
          <p className="text-gray-600 mt-2">
            Análisis detallado de mantenimientos correctivos por equipo médico
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => exportarReporte('excel')}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button 
            variant="outline"
            onClick={() => exportarReporte('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
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
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Equipos</p>
                <p className="text-2xl font-bold text-blue-900">
                  {estadisticas?.total_equipos?.toLocaleString('es-CO') || '0'}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Correctivos</p>
                <p className="text-2xl font-bold text-purple-900">
                  {estadisticas?.total_correctivos?.toLocaleString('es-CO') || '0'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Tasa Completitud</p>
                <p className="text-2xl font-bold text-green-900">
                  {estadisticas?.tasa_completitud?.toFixed(1) || '0'}%
                </p>
                <p className="text-xs text-green-700">
                  {estadisticas?.completados_general || '0'} completados
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Costo Total</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(estadisticas?.costo_total_general || 0)}
                </p>
                <p className="text-xs text-orange-700">
                  Tiempo prom: {estadisticas?.tiempo_promedio_general?.toFixed(1) || '0'} días
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cliente</label>
              <Select 
                value={filtros.cliente_id?.toString() || ''} 
                onValueChange={(value) => handleFiltroChange('cliente_id', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los clientes</SelectItem>
                  <SelectItem value="1">Hospital Central</SelectItem>
                  <SelectItem value="2">Clínica San Rafael</SelectItem>
                  <SelectItem value="3">Centro Médico Norte</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div>
              <label className="text-sm font-medium mb-2 block">Límite Resultados</label>
              <Select 
                value={filtros.limit?.toString() || '50'} 
                onValueChange={(value) => handleFiltroChange('limit', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 equipos</SelectItem>
                  <SelectItem value="50">50 equipos</SelectItem>
                  <SelectItem value="100">100 equipos</SelectItem>
                  <SelectItem value="200">200 equipos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFiltros({ limit: 50 })}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Equipos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Equipos con Correctivos ({equipos.length})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Último correctivo más reciente primero</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">Equipo</th>
                  <th className="text-left p-3 font-medium text-gray-600">Cliente/Sede</th>
                  <th className="text-left p-3 font-medium text-gray-600">Correctivos</th>
                  <th className="text-left p-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left p-3 font-medium text-gray-600">Tiempos</th>
                  <th className="text-left p-3 font-medium text-gray-600">Costos</th>
                  <th className="text-left p-3 font-medium text-gray-600">Último</th>
                  <th className="text-left p-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((equipo) => {
                  const criticidad = getCriticidadBadge(equipo.total_correctivos, equipo.correctivos_completados)
                  return (
                    <tr key={equipo.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{equipo.codigo_equipo}</div>
                          <div className="text-sm text-gray-600">{equipo.nombre_equipo}</div>
                          <div className="text-xs text-gray-500">{equipo.marca} {equipo.modelo}</div>
                          <div className="text-xs text-gray-500">S/N: {equipo.serie}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{equipo.cliente_nombre}</div>
                          <div className="text-sm text-gray-600">{equipo.sede_nombre}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-bold text-lg">{equipo.total_correctivos}</div>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Reactivos: {equipo.correctivos_reactivos}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Preventivos: {equipo.correctivos_preventivos}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <Badge className={cn("text-xs", criticidad.color)}>
                            {criticidad.label}
                          </Badge>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span>{equipo.correctivos_completados} Completados</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-yellow-600" />
                              <span>{equipo.correctivos_pendientes} Pendientes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-orange-600" />
                              <span>{equipo.correctivos_en_proceso} En Proceso</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium">
                            {equipo.tiempo_promedio_resolucion?.toFixed(1) || '0'} días
                          </div>
                          <div className="text-xs text-gray-600">
                            Tiempo promedio
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatCurrency(equipo.costo_total_correctivos || 0)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Costo total
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(equipo.ultimo_correctivo)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Último correctivo
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {equipos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron equipos con los filtros actuales</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Equipos con Mejor Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Los equipos con mayor tasa de completitud (≥90%) representan el mejor rendimiento operativo.
              Estos equipos requieren menos intervenciones correctivas y tienen tiempos de resolución más eficientes.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Equipos que Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Los equipos con baja tasa de completitud (&lt;75%) o alta frecuencia de correctivos 
              pueden requerir atención especial, reemplazo o mantenimiento preventivo intensivo.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}