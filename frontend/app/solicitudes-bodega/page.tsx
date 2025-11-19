'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  CheckCircle,
  Plus, 
  Filter, 
  Download, 
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  Truck,
  AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import solicitudesBodegaService, { 
  SolicitudBodega, 
  EstadisticasSolicitudes,
  FiltrosSolicitudes 
} from '@/lib/services/solicitudes-bodega.service'
import { cn } from '@/lib/utils'

export default function SolicitudesBodegaPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasSolicitudes | null>(null)
  const [solicitudes, setSolicitudes] = useState<SolicitudBodega[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosSolicitudes>({
    page: 1,
    limit: 10,
    orderBy: 'creacion',
    orderDirection: 'desc'
  })
  const [totalSolicitudes, setTotalSolicitudes] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos()
  }, [filtros])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar estadísticas y solicitudes en paralelo
      const [statsResponse, solicitudesResponse] = await Promise.all([
        solicitudesBodegaService.obtenerEstadisticas(),
        solicitudesBodegaService.obtenerSolicitudes(filtros)
      ])
      
      setEstadisticas(statsResponse)
      setSolicitudes(solicitudesResponse.solicitudes)
      setTotalSolicitudes(solicitudesResponse.total)
      setTotalPages(solicitudesResponse.totalPages)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar los datos. Usando información de ejemplo.')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (key: keyof FiltrosSolicitudes, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset a primera página al cambiar filtros
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFiltros(prev => ({ ...prev, page: newPage }))
  }

  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase()
    switch (estadoLower) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'despachada':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completada':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'media':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'baja':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Bodega</h1>
          <p className="text-gray-600 mt-2">
            Gestión completa de solicitudes de materiales, repuestos y equipos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/solicitudes-bodega/aprobaciones'}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Aprobaciones
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/solicitudes-bodega/seguimiento'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Seguimiento
          </Button>
          <Button 
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => window.location.href = '/solicitudes-bodega/crear'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
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

      {/* Métricas Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Solicitudes</p>
                <p className="text-2xl font-bold text-blue-900">
                  {estadisticas?.totalSolicitudes.toLocaleString('es-CO') || '0'}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {estadisticas?.pendientes.toLocaleString('es-CO') || '0'}
                </p>
                <p className="text-xs text-yellow-700">
                  {estadisticas?.porcentajePendientes.toFixed(1) || '0'}% del total
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Aprobadas</p>
                <p className="text-2xl font-bold text-green-900">
                  {estadisticas?.aprobadas.toLocaleString('es-CO') || '0'}
                </p>
                <p className="text-xs text-green-700">
                  {estadisticas?.porcentajeAprobadas.toFixed(1) || '0'}% del total
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Rechazadas</p>
                <p className="text-2xl font-bold text-red-900">
                  {estadisticas?.rechazadas.toLocaleString('es-CO') || '0'}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Despachadas</p>
                <p className="text-2xl font-bold text-purple-900">
                  {estadisticas?.despachadas.toLocaleString('es-CO') || '0'}
                </p>
              </div>
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">Completadas</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {estadisticas?.completadas.toLocaleString('es-CO') || '0'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600">Urgentes</p>
                <p className="text-xl font-bold text-teal-900">
                  {estadisticas?.solicitudesUrgentes || '0'}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Valor Pendiente</p>
                <p className="text-lg font-bold text-indigo-900">
                  {formatCurrency(estadisticas?.valorTotalPendiente || 0)}
                </p>
              </div>
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600">Tiempo Promedio</p>
                <p className="text-lg font-bold text-cyan-900">
                  {estadisticas?.tiempoPromedioAprobacion.toFixed(1) || '0'} días
                </p>
              </div>
              <Clock className="h-6 w-6 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Lista de Solicitudes</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, equipo, aviso..."
                  className="pl-10"
                  value={filtros.search || ''}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                />
              </div>
            </div>
            <Select value={filtros.estado || ''} onValueChange={(value) => handleFiltroChange('estado', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="despachada">Despachada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de Solicitudes */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">ID / Aviso</th>
                  <th className="text-left p-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left p-3 font-medium text-gray-600">Equipo</th>
                  <th className="text-left p-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left p-3 font-medium text-gray-600">Prioridad</th>
                  <th className="text-left p-3 font-medium text-gray-600">Creador</th>
                  <th className="text-left p-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left p-3 font-medium text-gray-600">Valor</th>
                  <th className="text-left p-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">#{solicitud.id}</div>
                        <div className="text-sm text-gray-600">AV: {solicitud.aviso}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{solicitud.cliente}</div>
                      <div className="text-sm text-gray-600">{solicitud.sede}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{solicitud.equipo}</div>
                      <div className="text-sm text-gray-600">Serie: {solicitud.serie}</div>
                    </td>
                    <td className="p-3">
                      <Badge className={cn("border", getEstadoBadge(solicitud.estado))}>
                        {solicitud.estado}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={cn("border", getPrioridadBadge(solicitud.prioridad || 'media'))}>
                        {solicitud.prioridad || 'Media'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{solicitud.creador}</div>
                      <div className="text-sm text-gray-600">{solicitud.servicio}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{formatDate(solicitud.creacion || '')}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {formatCurrency(solicitud.valorTotal || 0)}
                      </div>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {solicitud.estado === 'Pendiente' && (
                            <>
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aprobar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Rechazar
                              </DropdownMenuItem>
                            </>
                          )}
                          {solicitud.estado === 'Aprobada' && (
                            <DropdownMenuItem className="text-blue-600">
                              <Truck className="h-4 w-4 mr-2" />
                              Despachar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {solicitudes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron solicitudes con los filtros actuales</p>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {((filtros.page || 1) - 1) * (filtros.limit || 10) + 1} a{' '}
                {Math.min((filtros.page || 1) * (filtros.limit || 10), totalSolicitudes)} de{' '}
                {totalSolicitudes} solicitudes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filtros.page || 1) <= 1}
                  onClick={() => handlePageChange((filtros.page || 1) - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                  {filtros.page || 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filtros.page || 1) >= totalPages}
                  onClick={() => handlePageChange((filtros.page || 1) + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}