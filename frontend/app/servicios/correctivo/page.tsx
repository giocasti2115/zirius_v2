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
  Wrench, 
  Search, 
  Filter, 
  AlertTriangle,
  ArrowLeft,
  Download,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface ServicioCorrectivo {
  id: number
  solicitud_id: number
  equipo_nombre: string
  sede_nombre: string
  cliente_nombre: string
  fecha_solicitud: string
  fecha_completado?: string
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
  tecnico_asignado?: string
  urgencia: 'baja' | 'media' | 'alta' | 'critica'
  problema_reportado: string
  tiempo_respuesta?: number // en horas
}

const getEstadoBadge = (estado: string) => {
  const statusColors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    en_proceso: 'bg-blue-100 text-blue-800',
    completado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800'
  }
  return (
    <Badge className={statusColors[estado as keyof typeof statusColors]}>
      {estado.replace('_', ' ').toUpperCase()}
    </Badge>
  )
}

const getUrgenciaBadge = (urgencia: string) => {
  const urgencyColors = {
    baja: 'bg-gray-100 text-gray-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-orange-100 text-orange-800',
    critica: 'bg-red-100 text-red-800'
  }
  return (
    <Badge className={urgencyColors[urgencia as keyof typeof urgencyColors]}>
      {urgencia.toUpperCase()}
    </Badge>
  )
}

export default function ServiciosCorrectivoPage() {
  const [servicios, setServicios] = useState<ServicioCorrectivo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos')

  useEffect(() => {
    fetchServiciosCorrectivos()
  }, [])

  const fetchServiciosCorrectivos = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call
      // Mock data for now
      const mockData: ServicioCorrectivo[] = [
        {
          id: 1,
          solicitud_id: 12350,
          equipo_nombre: 'Unidad Odontológica A1',
          sede_nombre: 'Clínica Centro',
          cliente_nombre: 'Odontología Avanzada S.A.S',
          fecha_solicitud: '2025-11-07',
          estado: 'pendiente',
          tecnico_asignado: 'Carlos Rodríguez',
          urgencia: 'alta',
          problema_reportado: 'El sillón no se eleva correctamente',
          tiempo_respuesta: 4
        },
        {
          id: 2,
          solicitud_id: 12351,
          equipo_nombre: 'Compressor Dental B2',
          sede_nombre: 'Clínica Norte',
          cliente_nombre: 'Dental Care Ltda',
          fecha_solicitud: '2025-11-06',
          fecha_completado: '2025-11-07',
          estado: 'completado',
          tecnico_asignado: 'Ana García',
          urgencia: 'critica',
          problema_reportado: 'Pérdida total de presión - equipo inoperativo',
          tiempo_respuesta: 2
        },
        {
          id: 3,
          solicitud_id: 12352,
          equipo_nombre: 'Rayos X Digital C3',
          sede_nombre: 'Clínica Sur',
          cliente_nombre: 'Sonrisas Perfectas',
          fecha_solicitud: '2025-11-07',
          estado: 'en_proceso',
          tecnico_asignado: 'Miguel Torres',
          urgencia: 'media',
          problema_reportado: 'Imagen borrosa en todas las tomas',
          tiempo_respuesta: 6
        },
        {
          id: 4,
          solicitud_id: 12353,
          equipo_nombre: 'Autoclave Digital D4',
          sede_nombre: 'Clínica Este',
          cliente_nombre: 'Centro Odontológico Integral',
          fecha_solicitud: '2025-11-05',
          estado: 'pendiente',
          urgencia: 'critica',
          problema_reportado: 'No completa el ciclo de esterilización',
          tiempo_respuesta: 12
        }
      ]
      setServicios(mockData)
    } catch (error) {
      console.error('Error fetching servicios correctivos:', error)
    } finally {
      setLoading(false)
    }
  }

  const serviciosFiltrados = servicios.filter(servicio => {
    const matchSearch = servicio.equipo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.sede_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.problema_reportado.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchEstado = filtroEstado === 'todos' || servicio.estado === filtroEstado
    const matchUrgencia = filtroUrgencia === 'todos' || servicio.urgencia === filtroUrgencia
    
    return matchSearch && matchEstado && matchUrgencia
  })

  const stats = {
    total: servicios.length,
    pendientes: servicios.filter(s => s.estado === 'pendiente').length,
    en_proceso: servicios.filter(s => s.estado === 'en_proceso').length,
    completados: servicios.filter(s => s.estado === 'completado').length,
    criticos: servicios.filter(s => s.urgencia === 'critica').length,
    tiempo_promedio: servicios.filter(s => s.tiempo_respuesta).reduce((acc, s) => acc + (s.tiempo_respuesta || 0), 0) / servicios.filter(s => s.tiempo_respuesta).length || 0
  }

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
              <Wrench className="mr-3 h-8 w-8 text-orange-600" />
              Mantenimiento Correctivo
            </h2>
            <p className="text-muted-foreground">
              Gestión de servicios de mantenimiento correctivo y reparaciones
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Reportar Falla
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.en_proceso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.tiempo_promedio.toFixed(1)}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar por equipo, sede, cliente o problema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <select
                value={filtroUrgencia}
                onChange={(e) => setFiltroUrgencia(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="todos">Todas las urgencias</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>
            Servicios Correctivos ({serviciosFiltrados.length})
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
                  <TableHead>Problema</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Urgencia</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Tiempo Resp.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviciosFiltrados.map((servicio) => (
                  <TableRow key={servicio.id}>
                    <TableCell>{servicio.solicitud_id}</TableCell>
                    <TableCell>{servicio.equipo_nombre}</TableCell>
                    <TableCell>{servicio.sede_nombre}</TableCell>
                    <TableCell>{servicio.cliente_nombre}</TableCell>
                    <TableCell className="max-w-xs truncate" title={servicio.problema_reportado}>
                      {servicio.problema_reportado}
                    </TableCell>
                    <TableCell>
                      {new Date(servicio.fecha_solicitud).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>{getEstadoBadge(servicio.estado)}</TableCell>
                    <TableCell>{getUrgenciaBadge(servicio.urgencia)}</TableCell>
                    <TableCell>{servicio.tecnico_asignado || 'Sin asignar'}</TableCell>
                    <TableCell>
                      {servicio.tiempo_respuesta ? `${servicio.tiempo_respuesta}h` : '-'}
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