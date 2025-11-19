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
  Clock, 
  Search, 
  Filter, 
  AlertTriangle,
  ArrowLeft,
  Play,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'

interface ServicioPendiente {
  id: number
  solicitud_id: number
  equipo_nombre: string
  sede_nombre: string
  cliente_nombre: string
  fecha_solicitud: string
  tipo_servicio: 'preventivo' | 'correctivo' | 'instalacion' | 'calibracion'
  urgencia: 'baja' | 'media' | 'alta' | 'critica'
  descripcion: string
  tecnico_sugerido?: string
  dias_pendiente: number
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

const getDiasPendienteBadge = (dias: number) => {
  let color = 'bg-green-100 text-green-800'
  if (dias > 7) color = 'bg-yellow-100 text-yellow-800'
  if (dias > 14) color = 'bg-orange-100 text-orange-800'
  if (dias > 30) color = 'bg-red-100 text-red-800'
  
  return (
    <Badge className={color}>
      {dias} días
    </Badge>
  )
}

export default function ServiciosPendientesPage() {
  const [servicios, setServicios] = useState<ServicioPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos')

  useEffect(() => {
    fetchServiciosPendientes()
  }, [])

  const fetchServiciosPendientes = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call
      // Mock data for now
      const mockData: ServicioPendiente[] = [
        {
          id: 1,
          solicitud_id: 12360,
          equipo_nombre: 'Unidad Odontológica A1',
          sede_nombre: 'Clínica Centro',
          cliente_nombre: 'Odontología Avanzada S.A.S',
          fecha_solicitud: '2025-10-25',
          tipo_servicio: 'correctivo',
          urgencia: 'alta',
          descripcion: 'El sillón no se eleva correctamente',
          tecnico_sugerido: 'Carlos Rodríguez',
          dias_pendiente: 13
        },
        {
          id: 2,
          solicitud_id: 12361,
          equipo_nombre: 'Compressor Dental B2',
          sede_nombre: 'Clínica Norte',
          cliente_nombre: 'Dental Care Ltda',
          fecha_solicitud: '2025-11-01',
          tipo_servicio: 'preventivo',
          urgencia: 'media',
          descripcion: 'Mantenimiento rutinario mensual programado',
          tecnico_sugerido: 'Ana García',
          dias_pendiente: 6
        },
        {
          id: 3,
          solicitud_id: 12362,
          equipo_nombre: 'Rayos X Digital C3',
          sede_nombre: 'Clínica Sur',
          cliente_nombre: 'Sonrisas Perfectas',
          fecha_solicitud: '2025-09-15',
          tipo_servicio: 'calibracion',
          urgencia: 'critica',
          descripcion: 'Calibración anual requerida por normativa',
          dias_pendiente: 53
        },
        {
          id: 4,
          solicitud_id: 12363,
          equipo_nombre: 'Autoclave Digital D4',
          sede_nombre: 'Clínica Este',
          cliente_nombre: 'Centro Odontológico Integral',
          fecha_solicitud: '2025-11-05',
          tipo_servicio: 'instalacion',
          urgencia: 'media',
          descripcion: 'Instalación de nuevo equipo adquirido',
          dias_pendiente: 2
        }
      ]
      setServicios(mockData)
    } catch (error) {
      console.error('Error fetching servicios pendientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const serviciosFiltrados = servicios.filter(servicio => {
    const matchSearch = servicio.equipo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.sede_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchTipo = filtroTipo === 'todos' || servicio.tipo_servicio === filtroTipo
    const matchUrgencia = filtroUrgencia === 'todos' || servicio.urgencia === filtroUrgencia
    
    return matchSearch && matchTipo && matchUrgencia
  })

  const stats = {
    total: servicios.length,
    preventivos: servicios.filter(s => s.tipo_servicio === 'preventivo').length,
    correctivos: servicios.filter(s => s.tipo_servicio === 'correctivo').length,
    instalaciones: servicios.filter(s => s.tipo_servicio === 'instalacion').length,
    calibraciones: servicios.filter(s => s.tipo_servicio === 'calibracion').length,
    criticos: servicios.filter(s => s.urgencia === 'critica').length,
    vencidos: servicios.filter(s => s.dias_pendiente > 30).length,
    promedio_dias: servicios.reduce((acc, s) => acc + s.dias_pendiente, 0) / servicios.length || 0
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
              <Clock className="mr-3 h-8 w-8 text-yellow-600" />
              Servicios Pendientes
            </h2>
            <p className="text-muted-foreground">
              Servicios en espera de asignación y programación
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Asignar Técnico
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Iniciar Servicio
          </Button>
        </div>
      </div>

      {/* Alertas importantes */}
      {stats.vencidos > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Servicios Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Hay <strong>{stats.vencidos}</strong> servicios pendientes por más de 30 días que requieren atención inmediata.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {stats.promedio_dias.toFixed(0)} días
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correctivos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.correctivos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.correctivos / stats.total) * 100).toFixed(0) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticos}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.vencidos}</div>
            <p className="text-xs text-muted-foreground">
              Más de 30 días pendientes
            </p>
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
                placeholder="Buscar por equipo, sede, cliente o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="todos">Todos los tipos</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="instalacion">Instalación</option>
                <option value="calibracion">Calibración</option>
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
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>
            Servicios Pendientes ({serviciosFiltrados.length})
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
                  <TableHead>Descripción</TableHead>
                  <TableHead>Urgencia</TableHead>
                  <TableHead>Días Pendiente</TableHead>
                  <TableHead>Técnico Sugerido</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviciosFiltrados.map((servicio) => (
                  <TableRow key={servicio.id}>
                    <TableCell>{servicio.solicitud_id}</TableCell>
                    <TableCell>{servicio.equipo_nombre}</TableCell>
                    <TableCell>{servicio.sede_nombre}</TableCell>
                    <TableCell>{servicio.cliente_nombre}</TableCell>
                    <TableCell>{getTipoServicioBadge(servicio.tipo_servicio)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={servicio.descripcion}>
                      {servicio.descripcion}
                    </TableCell>
                    <TableCell>{getUrgenciaBadge(servicio.urgencia)}</TableCell>
                    <TableCell>{getDiasPendienteBadge(servicio.dias_pendiente)}</TableCell>
                    <TableCell>{servicio.tecnico_sugerido || 'Sin asignar'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" />
                        Iniciar
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