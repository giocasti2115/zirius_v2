'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  PhoneOff, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Cog, 
  CheckCircle,
  Plus, 
  Filter, 
  Download, 
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  AlertTriangle,
  DollarSign,
  Package
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
import darDeBajaService, { 
  SolicitudBaja, 
  EstadisticasBajas,
  FiltrosBajas 
} from '@/lib/services/dar-de-baja.service'
import { cn } from '@/lib/utils'

export default function DarDeBajaPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasBajas | null>(null)
  const [solicitudes, setSolicitudes] = useState<SolicitudBaja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosBajas>({
    page: 1,
    limit: 15,
    orderBy: 'fechaSolicitud',
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
        darDeBajaService.obtenerEstadisticas(),
        darDeBajaService.obtenerSolicitudes(filtros)
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

  const handleFiltroChange = (key: keyof FiltrosBajas, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset a primera página al cambiar filtros
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFiltros(prev => ({ ...prev, page: newPage }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dar de Baja</h1>
          <p className="text-muted-foreground">
            Gestión integral de solicitudes y procesos de baja de equipos
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dar-de-baja/aprobaciones'}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Aprobaciones
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/dar-de-baja/ejecucion'}
          >
            <Cog className="h-4 w-4 mr-2" />
            Ejecución
          </Button>
          <Button 
            onClick={() => window.location.href = '/dar-de-baja/crear'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <PhoneOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas?.totalSolicitudes.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {((estadisticas?.totalSolicitudes || 0) > 0) && '+12% vs mes anterior'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes Aprobación</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {estadisticas?.solicitudesPendientes.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren revisión técnica
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas?.solicitudesAprobadas.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Listas para ejecución
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ejecutadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas?.solicitudesEjecutadas.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Completadas exitosamente
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estadisticas?.solicitudesRechazadas.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Con observaciones técnicas
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Cog className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {estadisticas?.solicitudesEnProceso.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              En diferentes etapas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Solicitudes de Baja</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por código, equipo..."
                  value={filtros.search || ''}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select
                value={filtros.estado}
                onValueChange={(value) => handleFiltroChange('estado', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="ejecutada">Ejecutada</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Código</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Equipo</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Solicitante</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Valor Recuperable</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      {solicitud.codigoEquipo}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-sm">{solicitud.codigoEquipo}</p>
                        <p className="text-xs text-gray-500">{solicitud.nombreEquipo}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">
                      {solicitud.tipoMotivo?.replace('_', ' ') || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {solicitud.tecnicoSolicitante}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={
                          solicitud.estado === 'aprobada' ? 'default' :
                          solicitud.estado === 'pendiente' ? 'secondary' :
                          solicitud.estado === 'rechazada' ? 'destructive' :
                          solicitud.estado === 'ejecutada' ? 'default' : 'secondary'
                        }
                        className={cn(
                          solicitud.estado === 'aprobada' && 'bg-green-100 text-green-800 hover:bg-green-100',
                          solicitud.estado === 'pendiente' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
                          solicitud.estado === 'ejecutada' && 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        )}
                      >
                        {solicitud.estado === 'pendiente' && 'Pendiente'}
                        {solicitud.estado === 'aprobada' && 'Aprobada'}
                        {solicitud.estado === 'rechazada' && 'Rechazada'}
                        {solicitud.estado === 'ejecutada' && 'Ejecutada'}
                        {solicitud.estado === 'en_proceso' && 'En Proceso'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {solicitud.valorLibros ? (
                        <div className="flex items-center text-green-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${solicitud.valorLibros.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {solicitud.estado === 'pendiente' && (
                            <DropdownMenuItem>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Aprobar
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Mostrando {((filtros.page! - 1) * (filtros.limit || 15)) + 1} a{' '}
                {Math.min(filtros.page! * (filtros.limit || 15), totalSolicitudes)} de{' '}
                {totalSolicitudes} solicitudes
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filtros.page! - 1)}
                  disabled={filtros.page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {filtros.page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filtros.page! + 1)}
                  disabled={filtros.page === totalPages}
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