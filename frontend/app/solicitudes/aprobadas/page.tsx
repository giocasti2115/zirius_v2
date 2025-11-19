'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, Filter, Download, Grid, MoreVertical,
  Eye, Edit, Trash2, Plus, Wrench, Calendar, 
  Clock, User, FileText, CheckCircle, XCircle,
  AlertTriangle, ArrowLeft, PlayCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Interface matching legacy PHP structure
interface SolicitudAprobada {
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
  fecha_aprobacion?: string
  aprobado_por?: string
}

export default function SolicitudesAprobadas() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [servicioFilter, setServicioFilter] = useState('all')
  const [prioridadFilter, setPrioridadFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  // Mock data - solicitudes aprobadas
  const [solicitudes, setSolicitudes] = useState<SolicitudAprobada[]>([
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
      fecha_programada: '2025-10-18',
      fecha_aprobacion: '2025-10-04 09:15:30',
      aprobado_por: 'Supervisor Técnico'
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
      fecha_programada: '2025-10-20',
      fecha_aprobacion: '2025-10-04 11:30:15',
      aprobado_por: 'Coordinador Técnico'
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
      fecha_programada: '2025-10-22',
      fecha_aprobacion: '2025-10-04 14:45:22',
      aprobado_por: 'Supervisor Técnico'
    },
    {
      id: 342621,
      aviso: 'AV-10556551',
      servicio: 'Calibración',
      creacion: '2025-10-02 16:20:10',
      equipo: 'Bomba de Infusión',
      id_equipo: 69350,
      estado: 'Aprobada',
      sede: 'HOSPITAL CENTRAL - UCI',
      serie: 'BI-2023-078',
      cliente: 'Hospital Central',
      prioridad: 'Alta',
      tecnico_asignado: 'Carlos López',
      fecha_programada: '2025-10-15',
      fecha_aprobacion: '2025-10-03 08:30:45',
      aprobado_por: 'Jefe de Área'
    },
    {
      id: 342620,
      aviso: 'AV-10556535',
      servicio: 'Mantenimiento Correctivo',
      creacion: '2025-10-01 11:15:42',
      equipo: 'Ventilador Mecánico',
      id_equipo: 69450,
      estado: 'Aprobada',
      sede: 'CLINICA SAN JUAN - CIRUGÍA',
      serie: 'VM-2023-089',
      cliente: 'Clínica San Juan',
      prioridad: 'Urgente',
      tecnico_asignado: 'Ana Rodríguez',
      fecha_programada: '2025-10-08',
      fecha_aprobacion: '2025-10-02 10:20:30',
      aprobado_por: 'Director Técnico'
    }
  ])

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesSearch = solicitud.aviso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.tecnico_asignado?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesServicio = servicioFilter === 'all' || solicitud.servicio.toLowerCase().replace(' ', '-') === servicioFilter
    const matchesPrioridad = prioridadFilter === 'all' || solicitud.prioridad?.toLowerCase() === prioridadFilter
    
    return matchesSearch && matchesServicio && matchesPrioridad
  })

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
      case 'garantía':
        return <Badge variant="outline" className="border-indigo-300 text-indigo-700 text-xs">Garantía</Badge>
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getServicioCount = (servicio: string) => {
    return solicitudes.filter(s => s.servicio.toLowerCase() === servicio.toLowerCase()).length
  }

  const getDaysUntilService = (fechaProgramada: string) => {
    const today = new Date()
    const serviceDate = new Date(fechaProgramada)
    const diffTime = serviceDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  useEffect(() => {
    setMounted(true)
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <Link href="/solicitudes" className="hover:text-blue-600">
          Solicitudes de Servicio
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Solicitudes Aprobadas</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CheckCircle className="h-8 w-8 text-emerald-600" />
            Solicitudes Aprobadas
          </h1>
          <p className="text-gray-600 mt-1">Solicitudes aprobadas listas para programación y ejecución</p>
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
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => router.push('/solicitudes/nueva')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Service Type Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Aprobadas</p>
              <p className="text-2xl font-bold text-emerald-600">{solicitudes.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setServicioFilter('mantenimiento-preventivo')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Preventivo</p>
              <p className="text-2xl font-bold text-green-600">{getServicioCount('Mantenimiento Preventivo')}</p>
            </div>
            <PlayCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setServicioFilter('mantenimiento-correctivo')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Correctivo</p>
              <p className="text-2xl font-bold text-orange-600">{getServicioCount('Mantenimiento Correctivo')}</p>
            </div>
            <Wrench className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setServicioFilter('calibración')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Calibración</p>
              <p className="text-2xl font-bold text-purple-600">{getServicioCount('Calibración')}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-purple-600"></div>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setServicioFilter('instalación')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Instalación</p>
              <p className="text-2xl font-bold text-blue-600">{getServicioCount('Instalación')}</p>
            </div>
            <Grid className="h-8 w-8 text-blue-600" />
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
                placeholder="Buscar por aviso, servicio, equipo, técnico, sede, serie o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
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
            </select>

            <select 
              value={prioridadFilter}
              onChange={(e) => setPrioridadFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
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
              <h3 className="text-lg font-medium text-gray-900">Solicitudes Aprobadas</h3>
              <div className="text-sm text-gray-600">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">15</span> | {filteredSolicitudes.length} registros
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
                  <div className="flex items-center gap-2">
                    Programación
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
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Cargando solicitudes aprobadas...</p>
                  </td>
                </tr>
              ) : filteredSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron solicitudes aprobadas</h3>
                    <p className="text-sm text-gray-500">Intenta cambiar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                filteredSolicitudes.map((solicitud) => {
                  const daysUntilService = getDaysUntilService(solicitud.fecha_programada!)
                  const isToday = daysUntilService === 0
                  const isOverdue = daysUntilService < 0
                  const isSoon = daysUntilService <= 3 && daysUntilService > 0

                  return (
                    <tr key={solicitud.id} className={`hover:bg-gray-50 ${isToday ? 'bg-blue-50' : isOverdue ? 'bg-red-50' : isSoon ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {solicitud.id}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{solicitud.aviso}</div>
                          <div className="mt-1">{getPrioridadBadge(solicitud.prioridad!)}</div>
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
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                          Aprobada
                        </Badge>
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
                        <div className="text-sm">
                          <div className={`font-medium ${isToday ? 'text-blue-600' : isOverdue ? 'text-red-600' : isSoon ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {formatDateShort(solicitud.fecha_programada!)}
                          </div>
                          <div className={`text-xs ${isToday ? 'text-blue-500' : isOverdue ? 'text-red-500' : isSoon ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {isToday ? 'Hoy' :
                             isOverdue ? `Atrasado ${Math.abs(daysUntilService)} días` : 
                             isSoon ? `En ${daysUntilService} días` : 
                             `En ${daysUntilService} días`}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Ejecutar servicio">
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Reprogramar">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Más opciones">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}