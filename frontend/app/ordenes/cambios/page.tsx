'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  History, 
  Clock, 
  User, 
  FileEdit, 
  TrendingUp,
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit3,
  UserCheck,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { ordenesService, type EstadisticasOrdenes } from '@/lib/services/ordenes.service'

interface CambioOrden {
  id: number;
  numeroOrden: string;
  cliente: string;
  equipo: string;
  tipoMantenimiento: string;
  fechaCambio: string;
  horaCambio: string;
  usuario: string;
  tipoCambio: 'estado' | 'fecha' | 'tecnico' | 'prioridad' | 'descripcion' | 'otros';
  valorAnterior: string;
  valorNuevo: string;
  motivo: string;
  estado: 'aplicado' | 'pendiente' | 'rechazado';
}

export default function CambiosOrdenesPage() {
  const [cambios, setCambios] = useState<CambioOrden[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasOrdenes | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroUsuario, setFiltroUsuario] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadCambiosOrdenes()
  }, [])

  const loadCambiosOrdenes = async () => {
    try {
      setLoading(true)
      // Simular datos mientras se implementa el endpoint real
      const cambiosSimulados: CambioOrden[] = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        numeroOrden: `ORD-${2024}${String(i + 1).padStart(4, '0')}`,
        cliente: ['Empresa ABC', 'Corporación XYZ', 'Industrias DEF', 'Servicios GHI'][i % 4],
        equipo: ['Compresor Industrial', 'Generador Eléctrico', 'Bomba Centrífuga', 'Motor Trifásico'][i % 4],
        tipoMantenimiento: ['preventivo', 'correctivo', 'calibracion', 'inspeccion'][i % 4],
        fechaCambio: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        horaCambio: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        usuario: ['admin@empresa.com', 'tecnico1@empresa.com', 'supervisor@empresa.com', 'gerente@empresa.com'][i % 4],
        tipoCambio: ['estado', 'fecha', 'tecnico', 'prioridad', 'descripcion'][i % 5] as any,
        valorAnterior: ['En Progreso', '2024-11-15', 'Juan Pérez', 'Media', 'Revisión rutinaria'][i % 5],
        valorNuevo: ['Completado', '2024-11-20', 'María García', 'Alta', 'Revisión completa con calibración'][i % 5],
        motivo: ['Finalización de trabajo', 'Reprogramación por clima', 'Reasignación de técnico', 'Escalamiento urgente', 'Ampliación de alcance'][i % 5],
        estado: ['aplicado', 'pendiente', 'rechazado'][i % 3] as any
      }))

      const [estadisticasResponse] = await Promise.all([
        ordenesService.obtenerEstadisticas()
      ])
      
      setCambios(cambiosSimulados)
      setEstadisticas(estadisticasResponse.data)
    } catch (error) {
      console.error('Error loading cambios órdenes:', error)
    } finally {
      setLoading(false)
    }
  }

  const cambiosFiltrados = cambios.filter(cambio => {
    const matchesSearch = cambio.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cambio.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cambio.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTipo = filtroTipo === 'todos' || cambio.tipoCambio === filtroTipo
    const matchesUsuario = filtroUsuario === 'todos' || cambio.usuario.includes(filtroUsuario)
    const matchesEstado = filtroEstado === 'todos' || cambio.estado === filtroEstado
    
    return matchesSearch && matchesTipo && matchesUsuario && matchesEstado
  })

  const totalPages = Math.ceil(cambiosFiltrados.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const cambiosPaginados = cambiosFiltrados.slice(startIndex, startIndex + itemsPerPage)

  const getEstadoBadge = (estado: string) => {
    const styles = {
      aplicado: 'bg-green-100 text-green-800 border-green-200',
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rechazado: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getTipoCambioBadge = (tipo: string) => {
    const config = {
      estado: { icon: Activity, color: 'bg-blue-50 text-blue-700 border-blue-200' },
      fecha: { icon: Clock, color: 'bg-purple-50 text-purple-700 border-purple-200' },
      tecnico: { icon: UserCheck, color: 'bg-green-50 text-green-700 border-green-200' },
      prioridad: { icon: TrendingUp, color: 'bg-orange-50 text-orange-700 border-orange-200' },
      descripcion: { icon: Edit3, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      otros: { icon: FileEdit, color: 'bg-gray-50 text-gray-700 border-gray-200' }
    }
    
    const { icon: Icon, color } = config[tipo as keyof typeof config] || 
      { icon: FileEdit, color: 'bg-gray-50 text-gray-700 border-gray-200' }
    
    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    )
  }

  // Estadísticas calculadas
  const estadisticasCambios = {
    totalCambios: cambios.length,
    cambiosHoy: cambios.filter(c => c.fechaCambio === new Date().toISOString().split('T')[0]).length,
    cambiosAplicados: cambios.filter(c => c.estado === 'aplicado').length,
    cambiosPendientes: cambios.filter(c => c.estado === 'pendiente').length,
    usuarioActivo: cambios.reduce((acc, c) => {
      acc[c.usuario] = (acc[c.usuario] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }

  const usuarioMasActivo = Object.entries(estadisticasCambios.usuarioActivo)
    .sort(([,a], [,b]) => b - a)[0]?.[0]?.split('@')[0] || 'N/A'

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-600">
        <Link href="/ordenes" className="hover:text-blue-600">Órdenes de Servicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Cambios Órdenes</span>
      </nav>

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/ordenes" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Cambios en Órdenes</h1>
          </div>
          <p className="text-sm text-gray-600">
            Auditoría y seguimiento de modificaciones en órdenes de servicio
          </p>
        </div>
        <Button onClick={loadCambiosOrdenes} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <History className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas de Cambios - Patrón Compacto */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <History className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Total Cambios</p>
                <p className="text-xl font-bold text-gray-900">
                  {estadisticasCambios.totalCambios}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Hoy</p>
                <p className="text-xl font-bold text-green-600">
                  {estadisticasCambios.cambiosHoy}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Aplicados</p>
                <p className="text-xl font-bold text-emerald-600">
                  {estadisticasCambios.cambiosAplicados}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Pendientes</p>
                <p className="text-xl font-bold text-yellow-600">
                  {estadisticasCambios.cambiosPendientes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Usuario Activo</p>
                <p className="text-xl font-bold text-purple-600">
                  {usuarioMasActivo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por orden, cliente o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Tipo cambio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="estado">Estado</SelectItem>
                <SelectItem value="fecha">Fecha</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="prioridad">Prioridad</SelectItem>
                <SelectItem value="descripcion">Descripción</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="aplicado">Aplicado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Auditoría con Scroll Embebido */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              Auditoría de Cambios ({cambiosFiltrados.length} total)
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>por página</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando cambios de órdenes...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tabla con altura fija y scroll interno */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="w-32">Orden</TableHead>
                        <TableHead className="w-40">Cliente</TableHead>
                        <TableHead className="w-32">Tipo Cambio</TableHead>
                        <TableHead className="w-36">Valor Anterior</TableHead>
                        <TableHead className="w-36">Valor Nuevo</TableHead>
                        <TableHead className="w-24">Usuario</TableHead>
                        <TableHead className="w-32">Fecha/Hora</TableHead>
                        <TableHead className="w-24">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cambiosPaginados.length > 0 ? (
                        cambiosPaginados.map((cambio) => (
                          <TableRow key={cambio.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-sm font-semibold text-blue-600">
                              {cambio.numeroOrden}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="font-medium text-gray-900">{cambio.cliente}</div>
                              <div className="text-xs text-gray-500">{cambio.equipo}</div>
                            </TableCell>
                            <TableCell>
                              {getTipoCambioBadge(cambio.tipoCambio)}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="text-gray-600 max-w-32 truncate" title={cambio.valorAnterior}>
                                {cambio.valorAnterior}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="font-medium text-gray-900 max-w-32 truncate" title={cambio.valorNuevo}>
                                {cambio.valorNuevo}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {cambio.usuario.split('@')[0]}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="text-gray-900">
                                {new Date(cambio.fechaCambio).toLocaleDateString('es-ES')}
                              </div>
                              <div className="text-xs text-gray-500">{cambio.horaCambio}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getEstadoBadge(cambio.estado)}>
                                {cambio.estado}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                            No se encontraron cambios con los filtros aplicados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-3 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, cambiosFiltrados.length)} de {cambiosFiltrados.length} cambios
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm"
                    >
                      Anterior
                    </Button>
                    
                    {/* Números de página */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pagina = i + 1;
                        return (
                          <Button
                            key={pagina}
                            variant={currentPage === pagina ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pagina)}
                            className="px-3 py-1 text-sm w-8"
                          >
                            {pagina}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="px-2 py-1 text-sm text-gray-500">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="px-3 py-1 text-sm"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}