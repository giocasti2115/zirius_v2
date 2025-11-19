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
  CheckCircle, 
  Search, 
  Filter, 
  Calendar,
  ArrowLeft,
  Download,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface ServicioPreventivo {
  id: number
  solicitud_id: number
  equipo_nombre: string
  sede_nombre: string
  cliente_nombre: string
  fecha_programada: string
  fecha_completado?: string
  estado: 'programado' | 'en_proceso' | 'completado' | 'cancelado'
  tecnico_asignado?: string
  prioridad: 'baja' | 'media' | 'alta'
  observaciones?: string
}

const getEstadoBadge = (estado: string) => {
  const statusColors = {
    programado: 'bg-blue-100 text-blue-800',
    en_proceso: 'bg-yellow-100 text-yellow-800',
    completado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800'
  }
  return (
    <Badge className={statusColors[estado as keyof typeof statusColors]}>
      {estado.replace('_', ' ').toUpperCase()}
    </Badge>
  )
}

const getPrioridadBadge = (prioridad: string) => {
  const priorityColors = {
    baja: 'bg-gray-100 text-gray-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-red-100 text-red-800'
  }
  return (
    <Badge className={priorityColors[prioridad as keyof typeof priorityColors]}>
      {prioridad.toUpperCase()}
    </Badge>
  )
}

export default function ServiciosPreventivosPage() {
  const [servicios, setServicios] = useState<ServicioPreventivo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  useEffect(() => {
    fetchServiciosPreventivos()
  }, [])

  const fetchServiciosPreventivos = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call
      // Mock data for now
      const mockData: ServicioPreventivo[] = [
        {
          id: 1,
          solicitud_id: 12345,
          equipo_nombre: 'Unidad Odontológica A1',
          sede_nombre: 'Clínica Centro',
          cliente_nombre: 'Odontología Avanzada S.A.S',
          fecha_programada: '2025-11-15',
          estado: 'programado',
          tecnico_asignado: 'Carlos Rodríguez',
          prioridad: 'media',
          observaciones: 'Mantenimiento rutinario mensual'
        },
        {
          id: 2,
          solicitud_id: 12346,
          equipo_nombre: 'Compressor Dental B2',
          sede_nombre: 'Clínica Norte',
          cliente_nombre: 'Dental Care Ltda',
          fecha_programada: '2025-11-18',
          fecha_completado: '2025-11-18',
          estado: 'completado',
          tecnico_asignado: 'Ana García',
          prioridad: 'baja',
          observaciones: 'Limpieza y calibración completada'
        },
        {
          id: 3,
          solicitud_id: 12347,
          equipo_nombre: 'Rayos X Digital C3',
          sede_nombre: 'Clínica Sur',
          cliente_nombre: 'Sonrisas Perfectas',
          fecha_programada: '2025-11-20',
          estado: 'en_proceso',
          tecnico_asignado: 'Miguel Torres',
          prioridad: 'alta',
          observaciones: 'Revisión del sistema de imagen'
        }
      ]
      setServicios(mockData)
    } catch (error) {
      console.error('Error fetching servicios preventivos:', error)
    } finally {
      setLoading(false)
    }
  }

  const serviciosFiltrados = servicios.filter(servicio => {
    const matchSearch = servicio.equipo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.sede_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servicio.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchEstado = filtroEstado === 'todos' || servicio.estado === filtroEstado
    
    return matchSearch && matchEstado
  })

  const stats = {
    total: servicios.length,
    programados: servicios.filter(s => s.estado === 'programado').length,
    en_proceso: servicios.filter(s => s.estado === 'en_proceso').length,
    completados: servicios.filter(s => s.estado === 'completado').length,
    cancelados: servicios.filter(s => s.estado === 'cancelado').length
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
              <CheckCircle className="mr-3 h-8 w-8 text-green-600" />
              Mantenimiento Preventivo
            </h2>
            <p className="text-muted-foreground">
              Gestión de servicios de mantenimiento preventivo
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
            Programar Preventivo
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium">Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.programados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.en_proceso}</div>
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
            <CardTitle className="text-sm font-medium">Tasa Éxito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.total > 0 ? ((stats.completados / stats.total) * 100).toFixed(0) : 0}%
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
                placeholder="Buscar por equipo, sede o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
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
                <option value="programado">Programados</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>
            Servicios Preventivos ({serviciosFiltrados.length})
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
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Prioridad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviciosFiltrados.map((servicio) => (
                  <TableRow key={servicio.id}>
                    <TableCell>{servicio.solicitud_id}</TableCell>
                    <TableCell>{servicio.equipo_nombre}</TableCell>
                    <TableCell>{servicio.sede_nombre}</TableCell>
                    <TableCell>{servicio.cliente_nombre}</TableCell>
                    <TableCell>
                      {new Date(servicio.fecha_programada).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>{getEstadoBadge(servicio.estado)}</TableCell>
                    <TableCell>{servicio.tecnico_asignado || 'Sin asignar'}</TableCell>
                    <TableCell>{getPrioridadBadge(servicio.prioridad)}</TableCell>
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