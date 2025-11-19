'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Filter, 
  Download, 
  Search,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Settings,
  Shield
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import informesService, { 
  RepuestoInstalado, 
  FiltrosInformes 
} from '@/lib/services/informes.service'
import { cn } from '@/lib/utils'

export default function RepuestosInstaladosPage() {
  const [instalaciones, setInstalaciones] = useState<RepuestoInstalado[]>([])
  const [estadisticas, setEstadisticas] = useState<any>(null)
  const [topRepuestos, setTopRepuestos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformes>({
    limit: 100
  })

  // Cargar datos
  useEffect(() => {
    cargarDatos()
  }, [filtros])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await informesService.obtenerRepuestosInstalados(filtros)
      
      if (response.success) {
        setInstalaciones(response.data.instalaciones || [])
        setEstadisticas(response.data.estadisticas || {})
        setTopRepuestos(response.data.top_repuestos || [])
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (err) {
      console.error('Error cargando repuestos instalados:', err)
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
      const response = await informesService.exportarReporte('repuestos-instalados', formato, filtros)
      if (response.success) {
        console.log('Archivo generado:', response.data.archivo_generado)
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
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getGarantiaBadge = (garantiaMeses: number) => {
    if (garantiaMeses >= 12) return { color: 'bg-green-100 text-green-800', label: `${garantiaMeses}M` }
    if (garantiaMeses >= 6) return { color: 'bg-blue-100 text-blue-800', label: `${garantiaMeses}M` }
    if (garantiaMeses > 0) return { color: 'bg-yellow-100 text-yellow-800', label: `${garantiaMeses}M` }
    return { color: 'bg-gray-100 text-gray-800', label: 'Sin garantía' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Repuestos Instalados</h1>
          <p className="text-gray-600 mt-2">
            Historial completo de repuestos instalados en equipos médicos
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
            onClick={() => exportarReporte('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/informes'}
          >
            <Package className="h-4 w-4 mr-2" />
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
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Total Instalaciones</p>
                <p className="text-2xl font-bold text-green-900">
                  {estadisticas?.total_instalaciones?.toLocaleString('es-CO') || '0'}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Repuestos Diferentes</p>
                <p className="text-2xl font-bold text-blue-900">
                  {estadisticas?.repuestos_diferentes?.toLocaleString('es-CO') || '0'}
                </p>
                <p className="text-xs text-blue-700">
                  En {estadisticas?.equipos_intervenidos || '0'} equipos
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Costo Total</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(estadisticas?.costo_total_repuestos || 0)}
                </p>
                <p className="text-xs text-purple-700">
                  Promedio: {formatCurrency(estadisticas?.costo_promedio || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Con Garantía</p>
                <p className="text-2xl font-bold text-orange-900">
                  {estadisticas?.con_garantia?.toLocaleString('es-CO') || '0'}
                </p>
                <p className="text-xs text-orange-700">
                  {estadisticas?.total_instalaciones > 0 
                    ? ((estadisticas?.con_garantia / estadisticas?.total_instalaciones) * 100).toFixed(1)
                    : '0'
                  }% del total
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
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
              <label className="text-sm font-medium mb-2 block">Equipo</label>
              <Input
                placeholder="ID del equipo"
                type="number"
                value={filtros.equipo_id || ''}
                onChange={(e) => handleFiltroChange('equipo_id', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Repuesto</label>
              <Input
                placeholder="ID del repuesto"
                type="number"
                value={filtros.repuesto_id || ''}
                onChange={(e) => handleFiltroChange('repuesto_id', e.target.value ? parseInt(e.target.value) : undefined)}
              />
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
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFiltros({ limit: 100 })}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
            <div className="text-sm text-gray-600 ml-4">
              Mostrando los {Math.min(filtros.limit || 100, instalaciones.length)} registros más recientes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Instalaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Historial de Instalaciones ({instalaciones.length})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Ordenado por fecha más reciente</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left p-3 font-medium text-gray-600">Repuesto</th>
                  <th className="text-left p-3 font-medium text-gray-600">Equipo</th>
                  <th className="text-left p-3 font-medium text-gray-600">Cliente/Sede</th>
                  <th className="text-left p-3 font-medium text-gray-600">Cantidad</th>
                  <th className="text-left p-3 font-medium text-gray-600">Costo</th>
                  <th className="text-left p-3 font-medium text-gray-600">Técnico</th>
                  <th className="text-left p-3 font-medium text-gray-600">Garantía</th>
                  <th className="text-left p-3 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {instalaciones.map((instalacion) => {
                  const garantia = getGarantiaBadge(instalacion.garantia_meses)
                  return (
                    <tr key={instalacion.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">
                            {formatDate(instalacion.fecha_instalacion)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {instalacion.tiempo_instalacion} min
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{instalacion.repuesto_codigo}</div>
                          <div className="text-sm text-gray-600">{instalacion.repuesto_nombre}</div>
                          <div className="text-xs text-gray-500">
                            {instalacion.repuesto_marca} {instalacion.repuesto_modelo}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{instalacion.codigo_equipo}</div>
                          <div className="text-sm text-gray-600">{instalacion.nombre_equipo}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{instalacion.cliente_nombre}</div>
                          <div className="text-sm text-gray-600">{instalacion.sede_nombre}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-center">
                          <div className="font-bold text-lg">{instalacion.cantidad}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">
                            {formatCurrency(instalacion.costo_total)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Unit: {formatCurrency(instalacion.costo_unitario)}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{instalacion.tecnico_nombre || 'N/A'}</div>
                          <div className="text-xs text-gray-600">
                            {instalacion.codigo_solicitud && `SOL: ${instalacion.codigo_solicitud}`}
                          </div>
                          <div className="text-xs text-gray-600">
                            {instalacion.numero_orden && `ORD: ${instalacion.numero_orden}`}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={cn("text-xs", garantia.color)}>
                          {garantia.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Antes: {instalacion.estado_anterior}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Después: {instalacion.estado_posterior}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {instalaciones.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron instalaciones con los filtros actuales</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Repuestos y Estadísticas Adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Repuestos Más Instalados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topRepuestos.length > 0 ? (
              <div className="space-y-3">
                {topRepuestos.slice(0, 5).map((repuesto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{repuesto.codigo}</div>
                      <div className="text-sm text-gray-600">{repuesto.nombre}</div>
                      <div className="text-xs text-gray-500">{repuesto.marca}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{repuesto.veces_instalado}</div>
                      <div className="text-xs text-gray-600">instalaciones</div>
                      <div className="text-xs text-gray-600">
                        {formatCurrency(repuesto.costo_total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600 text-center py-4">
                No hay datos de top repuestos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Estadísticas de Instalación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Tiempo promedio de instalación</span>
                <span className="font-bold">{estadisticas?.tiempo_promedio_instalacion || '0'} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Última instalación</span>
                <span className="font-bold">
                  {estadisticas?.ultima_instalacion 
                    ? formatDate(estadisticas.ultima_instalacion)
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Equipos intervenidos</span>
                <span className="font-bold">{estadisticas?.equipos_intervenidos || '0'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Tipos diferentes</span>
                <span className="font-bold">{estadisticas?.repuestos_diferentes || '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}