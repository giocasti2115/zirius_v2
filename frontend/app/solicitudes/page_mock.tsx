'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, Filter, Download, Grid, MoreVertical,
  Eye, Edit, Trash2, Plus, Wrench, Calendar, 
  Clock, User, FileText, CheckCircle, XCircle,
  AlertTriangle
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

// Interface matching legacy PHP structure
interface Solicitud {
  id: number
  aviso: string
  servicio: string
  creacion: string
  equipo: string
  id_equipo: number
  estado: string
  sede: string
  serie: string
  cliente?: string
  prioridad?: string
  tecnico_asignado?: string
  fecha_programada?: string
}

export default function SolicitudesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [servicioFilter, setServicioFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  // Initialize filters from URL params
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam) {
      switch (filterParam) {
        case 'pendientes':
          setStatusFilter('pendiente')
          break
        case 'aprobadas':
          setStatusFilter('aprobada')
          break
        case 'rechazadas':
          setStatusFilter('rechazada')
          break
        case 'en-progreso':
          setStatusFilter('en-progreso')
          break
      }
    }
  }, [searchParams])

  // Mock data following legacy PHP structure
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
    {
      id: 342629,
      aviso: 'AV-10556679',
      servicio: 'Informe',
      creacion: '2025-10-03 16:16:02',
      equipo: 'Bascula',
      id_equipo: 68640,
      estado: 'Rechazada',
      sede: 'IPS Salud Sura Chipichape',
      serie: 'ZYC00362-0',
      cliente: 'Hospital Central',
      prioridad: 'Media',
      tecnico_asignado: null,
      fecha_programada: null
    },
    {
      id: 342628,
      aviso: 'AV-10556663',
      servicio: 'Mantenimiento Preventivo',
      creacion: '2025-10-03 16:05:42',
      equipo: 'Monitor de signos vitales',
      id_equipo: 68740,
      estado: 'Rechazada',
      sede: 'AY DX SALUD SURA CHIPICHAPE IMAGENES',
      serie: 'ZYC00362-1',
      cliente: 'Clínica San Juan',
      prioridad: 'Baja',
      tecnico_asignado: null,
      fecha_programada: null
    },
    {
      id: 342627,
      aviso: 'AV-10556647',
      servicio: 'Mantenimiento Preventivo',
      creacion: '2025-10-03 16:26:13',
      equipo: 'Monitor de signos vitales',
      id_equipo: 68840,
      estado: 'Pendiente',
      sede: 'IPS ODONTOLOGIA DOMICILIARIA CENTRO',
      serie: 'ZYC00362-2',
      cliente: 'Hospital Nacional',
      prioridad: 'Alta',
      tecnico_asignado: 'Carlos López',
      fecha_programada: '2025-10-15'
    },
    {
      id: 342626,
      aviso: 'AV-10556631',
      servicio: 'Mantenimiento Correctivo',
      creacion: '2025-10-03 16:09:36',
      equipo: 'Glucómetro',
      id_equipo: 68940,
      estado: 'Rechazada',
      sede: 'LAS AMÉRICAS',
      serie: 'ZYC00362-3',
      cliente: 'Hospital Central',
      prioridad: 'Urgente',
      tecnico_asignado: null,
      fecha_programada: null
    },
    {
      id: 342625,
      aviso: 'AV-10556615',
      servicio: 'Mantenimiento Preventivo',
      creacion: '2025-10-03 15:23:06',
      equipo: 'Glucómetro',
      id_equipo: 69040,
      estado: 'Aprobada',
      sede: 'IPS ODONTOLOGIA DOMICILIARIA CENTRO',
      serie: 'ZYC00362-4',
      cliente: 'Clínica San Juan',
      prioridad: 'Media',
      tecnico_asignado: 'Ana Rodríguez',
      fecha_programada: '2025-10-18'
    },
    {
      id: 342624,
      aviso: 'AV-10556599',
      servicio: 'Mantenimiento Preventivo',
      creacion: '2025-10-03 15:52:36',
      equipo: 'Monitor de signos vitales',
      id_equipo: 69140,
      estado: 'Aprobada',
      sede: 'AYUDAS DIAGNOSTICAS SURA VIVIR NORTE',
      serie: 'ZYC00362-5',
      cliente: 'Hospital Nacional',
      prioridad: 'Media',
      tecnico_asignado: 'Miguel Torres',
      fecha_programada: '2025-10-20'
    },
    {
      id: 342623,
      aviso: 'AV-10556583',
      servicio: 'Instalación',
      creacion: '2025-10-03 15:38:45',
      equipo: 'Unidad portátil',
      id_equipo: 69240,
      estado: 'Aprobada',
      sede: 'IPS Salud Sura Chipichape',
      serie: 'ZYC00362-6',
      cliente: 'Hospital Central',
      prioridad: 'Alta',
      tecnico_asignado: 'Lucía Martínez',
      fecha_programada: '2025-10-22'
    },
    {
      id: 342622,
      aviso: 'AV-10556567',
      servicio: 'Calibración',
      creacion: '2025-10-03 14:12:30',
      equipo: 'Ventilador Mecánico',
      id_equipo: 69340,
      estado: 'En Progreso',
      sede: 'HOSPITAL CENTRAL - UCI',
      serie: 'ZYC00362-7',
      cliente: 'Hospital Central',
      prioridad: 'Urgente',
      tecnico_asignado: 'Carlos López',
      fecha_programada: '2025-10-12'
    }
  ])

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesSearch = solicitud.aviso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || solicitud.estado.toLowerCase().replace(' ', '-') === statusFilter
    const matchesServicio = servicioFilter === 'all' || solicitud.servicio.toLowerCase().replace(' ', '-') === servicioFilter
    
    return matchesSearch && matchesStatus && matchesServicio
  })

  const getStatusBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
      case 'en progreso':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">En Progreso</Badge>
      case 'aprobada':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Aprobada</Badge>
      case 'rechazada':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rechazada</Badge>
      case 'completada':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case 'urgente':
        return <Badge variant="destructive" className="text-xs">Urgente</Badge>
      case 'alta':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">Alta</Badge>
      case 'media':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">Media</Badge>
      case 'baja':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs">Baja</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{prioridad}</Badge>
    }
  }

  const getServicioBadge = (servicio: string) => {
    switch (servicio.toLowerCase()) {
      case 'mantenimiento preventivo':
        return <Badge variant="outline" className="border-green-300 text-green-700 text-xs">Preventivo</Badge>
      case 'mantenimiento correctivo':
        return <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">Correctivo</Badge>
      case 'calibración':
        return <Badge variant="outline" className="border-purple-300 text-purple-700 text-xs">Calibración</Badge>
      case 'instalación':
        return <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">Instalación</Badge>
      case 'informe':
        return <Badge variant="outline" className="border-gray-300 text-gray-700 text-xs">Informe</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{servicio}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatsCount = (estado: string) => {
    return solicitudes.filter(s => s.estado.toLowerCase() === estado.toLowerCase()).length
  }

  useEffect(() => {
    setMounted(true)
    // Simulate API call
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            Solicitudes de Servicio
          </h1>
          <p className="text-gray-600 mt-1">Gestión completa de solicitudes de servicio técnico</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            XLS
          </Button>
          <Button variant="outline" size="sm">
            <Grid className="h-4 w-4 mr-2" />
            Columnas
          </Button>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/solicitudes/nueva')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div 
            className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/solicitudes/pendientes-preventivo')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatsCount('Pendiente')}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div 
            className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter('en-progreso')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-blue-600">{getStatsCount('En Progreso')}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div 
            className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/solicitudes/aprobadas')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-emerald-600">{getStatsCount('Aprobada')}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          
          <div 
            className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/solicitudes/rechazadas')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">{getStatsCount('Rechazada')}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{solicitudes.length}</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por aviso, servicio, equipo, sede, serie o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="en-progreso">En Progreso</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>

            <select 
              value={servicioFilter}
              onChange={(e) => setServicioFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos los servicios</option>
              <option value="mantenimiento-preventivo">Preventivo</option>
              <option value="mantenimiento-correctivo">Correctivo</option>
              <option value="calibración">Calibración</option>
              <option value="instalación">Instalación</option>
              <option value="informe">Informe</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Table - Following Legacy PHP Structure */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-gray-900">Solicitudes de Servicio</h3>
              <div className="text-sm text-gray-600">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">208</span> | {solicitudes.length} registros
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filas</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Id
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Aviso
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Servicio
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Creación
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Equipo
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Id Equipo
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Estado
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Sede
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Serie
                    <Filter className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Cargando solicitudes...</p>
                  </td>
                </tr>
              ) : filteredSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron solicitudes</h3>
                    <p className="text-sm text-gray-500">Intenta cambiar los filtros o crear una nueva solicitud</p>
                  </td>
                </tr>
              ) : (
                filteredSolicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {solicitud.id}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{solicitud.aviso}</div>
                        {solicitud.prioridad && (
                          <div className="mt-1">{getPrioridadBadge(solicitud.prioridad)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getServicioBadge(solicitud.servicio)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(solicitud.creacion)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{solicitud.equipo}</div>
                      {solicitud.cliente && (
                        <div className="text-sm text-gray-500">{solicitud.cliente}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {solicitud.id_equipo}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(solicitud.estado)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{solicitud.sede}</div>
                      {solicitud.tecnico_asignado && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          {solicitud.tecnico_asignado}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {solicitud.serie}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Más opciones">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-medium">1-{Math.min(rowsPerPage, filteredSolicitudes.length)}</span> de <span className="font-medium">{filteredSolicitudes.length}</span> registros
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <span className="text-sm text-gray-500">...</span>
              <Button variant="outline" size="sm">
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
