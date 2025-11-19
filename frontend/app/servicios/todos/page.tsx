'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart3, 
  Search, 
  Filter, 
  ArrowLeft,
  Download,
  Calendar,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface ServicioCompleto {
  id: number
  solicitud_id: number
  equipo_nombre: string
  sede_nombre: string
  cliente_nombre: string
  fecha_solicitud: string
  fecha_completado?: string
  tipo_servicio: 'preventivo' | 'correctivo' | 'instalacion' | 'calibracion'
  estado: 'pendiente' | 'programado' | 'en_proceso' | 'completado' | 'cancelado'
  urgencia: 'baja' | 'media' | 'alta' | 'critica'
  tecnico_asignado?: string
  descripcion: string
  duracion?: number // en horas
  costo?: number
}

const getTipoServicioBadge = (tipo: string) => {
  const typeColors = {
    preventivo: 'bg-green-100 text-green-800',
    correctivo: 'bg-orange-100 text-orange-800',
    instalacion: 'bg-blue-100 text-blue-800',
    calibracion: 'bg-purple-100 text-purple-800'
  }
  return (
    <Badge className={typeColors[tipo as keyof typeof typeColors]}>
      {tipo.toUpperCase()}
    </Badge>
  )
}

const getEstadoBadge = (estado: string) => {
  const statusColors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    programado: 'bg-blue-100 text-blue-800',
    en_proceso: 'bg-orange-100 text-orange-800',
    completado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800'
  }
  return (
    <Badge className={statusColors[estado as keyof typeof statusColors]}>
      {estado.replace('_', ' ').toUpperCase()}
    </Badge>
  )
}

export default function TodosLosServiciosPage() {
  const [servicios, setServicios] = useState<ServicioCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroMes, setFiltroMes] = useState('todos')

  useEffect(() => {
    fetchTodosLosServicios()
  }, [])

  const fetchTodosLosServicios = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call
      // Mock data for now - comprehensive service data
      const mockData: ServicioCompleto[] = [
        {
          id: 1,
          solicitud_id: 12340,
          equipo_nombre: 'Unidad Odontológica A1',
          sede_nombre: 'Clínica Centro',
          cliente_nombre: 'Odontología Avanzada S.A.S',
          fecha_solicitud: '2025-11-01',
          fecha_completado: '2025-11-02',
          tipo_servicio: 'preventivo',
          estado: 'completado',
          urgencia: 'media',
          tecnico_asignado: 'Carlos Rodríguez',
          descripcion: 'Mantenimiento rutinario mensual',
          duracion: 3,
          costo: 150000
        },
        {
          id: 2,
          solicitud_id: 12341,
          equipo_nombre: 'Compressor Dental B2',
          sede_nombre: 'Clínica Norte',
          cliente_nombre: 'Dental Care Ltda',
          fecha_solicitud: '2025-11-03',
          tipo_servicio: 'correctivo',
          estado: 'en_proceso',
          urgencia: 'alta',
          tecnico_asignado: 'Ana García',
          descripcion: 'Pérdida de presión en sistema',
          duracion: 4
        },
        {
          id: 3,
          solicitud_id: 12342,
          equipo_nombre: 'Rayos X Digital C3',
          sede_nombre: 'Clínica Sur',
          cliente_nombre: 'Sonrisas Perfectas',
          fecha_solicitud: '2025-11-05',
          tipo_servicio: 'calibracion',
          estado: 'programado',
          urgencia: 'media',
          tecnico_asignado: 'Miguel Torres',
          descripcion: 'Calibración semestral de rayos X'
        },
        {
          id: 4,
          solicitud_id: 12343,
          equipo_nombre: 'Autoclave Digital D4',
          sede_nombre: 'Clínica Este',
          cliente_nombre: 'Centro Odontológico Integral',
          fecha_solicitud: '2025-10-28',
          fecha_completado: '2025-10-30',
          tipo_servicio: 'instalacion',
          estado: 'completado',
          urgencia: 'baja',
          tecnico_asignado: 'Luis Pérez',
          descripcion: 'Instalación de nuevo autoclave',
          duracion: 6,
          costo: 800000
        },
        {
          id: 5,
          solicitud_id: 12344,
          equipo_nombre: 'Sillón Odontológico E5',
          sede_nombre: 'Clínica Oeste',
          cliente_nombre: 'Dental Solutions',
          fecha_solicitud: '2025-11-06',
          tipo_servicio: 'correctivo',
          estado: 'pendiente',
          urgencia: 'critica',
          descripcion: 'Sillón no responde a comandos'
        }
      ]
      setServicios(mockData)
    } catch (error) {
      console.error('Error fetching todos los servicios:', error)
    } finally {
      setLoading(false)
    }
  }

  const serviciosFiltrados = servicios.filter(servicio => {
    const matchSearch = servicio.equipo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.sede_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.solicitud_id.toString().includes(searchTerm)
    
    const matchTipo = filtroTipo === 'todos' || servicio.tipo_servicio === filtroTipo
    const matchEstado = filtroEstado === 'todos' || servicio.estado === filtroEstado
    
    let matchMes = true
    if (filtroMes !== 'todos') {
      const fechaServicio = new Date(servicio.fecha_solicitud)
      const mesServicio = fechaServicio.getMonth()
      matchMes = mesServicio.toString() === filtroMes
    }
    
    return matchSearch && matchTipo && matchEstado && matchMes
  })

  const stats = {
    total: servicios.length,
    pendientes: servicios.filter(s => s.estado === 'pendiente').length,
    programados: servicios.filter(s => s.estado === 'programado').length,
    en_proceso: servicios.filter(s => s.estado === 'en_proceso').length,
    completados: servicios.filter(s => s.estado === 'completado').length,
    cancelados: servicios.filter(s => s.estado === 'cancelado').length,
    preventivos: servicios.filter(s => s.tipo_servicio === 'preventivo').length,
    correctivos: servicios.filter(s => s.tipo_servicio === 'correctivo').length,
    costo_total: servicios.filter(s => s.costo).reduce((acc, s) => acc + (s.costo || 0), 0),
    duracion_promedio: servicios.filter(s => s.duracion).reduce((acc, s) => acc + (s.duracion || 0), 0) / servicios.filter(s => s.duracion).length || 0
  }

  const meses = [
    { value: '0', label: 'Enero' },
    { value: '1', label: 'Febrero' },
    { value: '2', label: 'Marzo' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Mayo' },
    { value: '5', label: 'Junio' },
    { value: '6', label: 'Julio' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Septiembre' },
    { value: '9', label: 'Octubre' },
    { value: '10', label: 'Noviembre' },
    { value: '11', label: 'Diciembre' }
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/servicios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Servicios
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
              Todos los Servicios
            </h2>
            <p className="text-muted-foreground">
              Vista completa de todos los servicios del sistema
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Calendario
          </Button>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todos los estados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completados}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.completados / stats.total) * 100).toFixed(0) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendientes + stats.programados + stats.en_proceso}
            </div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.duracion_promedio.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">Por servicio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.costo_total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Servicios facturados</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por tipo y estado */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Tipo de Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Preventivos:</span>
              <Badge variant="secondary">{stats.preventivos}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Correctivos:</span>
              <Badge variant="secondary">{stats.correctivos}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Instalaciones:</span>
              <Badge variant="secondary">
                {servicios.filter(s => s.tipo_servicio === 'instalacion').length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Calibraciones:</span>
              <Badge variant="secondary">
                {servicios.filter(s => s.tipo_servicio === 'calibracion').length}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Pendientes:</span>
              <Badge variant="secondary">{stats.pendientes}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Programados:</span>
              <Badge variant="secondary">{stats.programados}</Badge>
            </div>
            <div className="flex justify-between">
              <span>En Proceso:</span>
              <Badge variant="secondary">{stats.en_proceso}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Completados:</span>
              <Badge variant="secondary">{stats.completados}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros avanzados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="todos">Todos los tipos</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="instalacion">Instalación</option>
                <option value="calibracion">Calibración</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="programado">Programados</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="todos">Todos los meses</option>
                {meses.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla completa */}
      <Card>
        <CardHeader>
          <CardTitle>
            Servicios ({serviciosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitud #</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Sede</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviciosFiltrados.map((servicio) => (
                  <TableRow key={servicio.id}>
                    <TableCell className="font-medium">{servicio.solicitud_id}</TableCell>
                    <TableCell>{servicio.equipo_nombre}</TableCell>
                    <TableCell>{servicio.sede_nombre}</TableCell>
                    <TableCell>{servicio.cliente_nombre}</TableCell>
                    <TableCell>{getTipoServicioBadge(servicio.tipo_servicio)}</TableCell>
                    <TableCell>{getEstadoBadge(servicio.estado)}</TableCell>
                    <TableCell>
                      {new Date(servicio.fecha_solicitud).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>{servicio.tecnico_asignado || 'Sin asignar'}</TableCell>
                    <TableCell>
                      {servicio.duracion ? `${servicio.duracion}h` : '-'}
                    </TableCell>
                    <TableCell>
                      {servicio.costo ? `$${servicio.costo.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}