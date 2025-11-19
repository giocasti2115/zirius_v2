'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, Filter, Download, Grid, MoreVertical,
  Eye, Edit, Trash2, Plus, Wrench, Calendar, 
  Clock, User, FileText, CheckCircle, XCircle,
  AlertTriangle, ArrowLeft, Settings
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Interface matching legacy PHP structure
interface SolicitudPreventivo {
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
  tipo_mantenimiento: 'preventivo'
}

export default function SolicitudesPendientesPreventivo() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [prioridadFilter, setPrioridadFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  // Mock data - only preventivo pendientes
  const [solicitudes, setSolicitudes] = useState<SolicitudPreventivo[]>([
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
      tecnico_asignado: null,
      fecha_programada: '2025-10-15',
      tipo_mantenimiento: 'preventivo'
    },
    {
      id: 342625,
      aviso: 'AV-10556615',
      servicio: 'Mantenimiento Preventivo',
      creacion: '2025-10-03 15:23:06',
      equipo: 'Glucómetro',
      id_equipo: 69040,
      estado: 'Pendiente',
      sede: 'IPS ODONTOLOGIA DOMICILIARIA CENTRO',
      serie: 'ZYC00362-4',
      cliente: 'Clínica San Juan',
      prioridad: 'Media',
      tecnico_asignado: null,
      fecha_programada: '2025-10-18',
      tipo_mantenimiento: 'preventivo'
    },
    {
      id: 342624,
      aviso: 'AV-10556599',
      servicio: 'Mantenimiento Preventivo',
      creacion: '2025-10-03 15:52:36',
      equipo: 'Monitor de signos vitales',
      id_equipo: 69140,
      estado: 'Pendiente',
      sede: 'AYUDAS DIAGNOSTICAS SURA VIVIR NORTE',
      serie: 'ZYC00362-5',
      cliente: 'Hospital Nacional',
      prioridad: 'Baja',
      tecnico_asignado: null,
      fecha_programada: '2025-10-20',
      tipo_mantenimiento: 'preventivo'
    },
    {
      id: 342620,
      aviso: 'AV-10556521',
      servicio: 'Mantenimiento Preventivo',
      creacion: '2025-10-02 14:30:15',
      equipo: 'Ventilador Mecánico',
      id_equipo: 69450,
      estado: 'Pendiente',
      sede: 'HOSPITAL CENTRAL - UCI',
      serie: 'VM-2023-089',
      cliente: 'Hospital Central',
      prioridad: 'Urgente',
      tecnico_asignado: null,
      fecha_programada: '2025-10-08',
      tipo_mantenimiento: 'preventivo'
    },
    {
      id: 342618,
      aviso: 'AV-10556489',
      servicio: 'Mantenimiento Preventivo',
      creacion: '2025-10-01 11:15:42',
      equipo: 'Desfibrilador',
      id_equipo: 69680,
      estado: 'Pendiente',
      sede: 'CLINICA SAN JUAN - URGENCIAS',
      serie: 'DF-2023-012',
      cliente: 'Clínica San Juan',
      prioridad: 'Alta',
      tecnico_asignado: null,
      fecha_programada: '2025-10-10',
      tipo_mantenimiento: 'preventivo'
    }
  ])

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesSearch = solicitud.aviso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPrioridad = prioridadFilter === 'all' || solicitud.prioridad?.toLowerCase() === prioridadFilter
    
    return matchesSearch && matchesPrioridad
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

  const getPrioridadCount = (prioridad: string) => {
    return solicitudes.filter(s => s.prioridad?.toLowerCase() === prioridad.toLowerCase()).length
  }

  const getDaysUntilMaintenance = (fechaProgramada: string) => {
    const today = new Date()
    const maintenanceDate = new Date(fechaProgramada)
    const diffTime = maintenanceDate.getTime() - today.getTime()
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
        <span className="text-gray-900 font-medium">Solicitudes Pendientes Preventivo</span>
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
            <Settings className="h-8 w-8 text-green-600" />
            Solicitudes Pendientes Preventivo
          </h1>
          <p className="text-gray-600 mt-1">Mantenimientos preventivos programados pendientes de ejecución</p>
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
            className="bg-green-600 hover:bg-green-700"
            onClick={() => router.push('/solicitudes/nueva')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Priority Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{solicitudes.length}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setPrioridadFilter('urgente')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgentes</p>
              <p className="text-2xl font-bold text-red-600">{getPrioridadCount('Urgente')}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setPrioridadFilter('alta')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alta Prioridad</p>
              <p className="text-2xl font-bold text-orange-600">{getPrioridadCount('Alta')}</p>
            </div>
            <XCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setPrioridadFilter('media')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Media Prioridad</p>
              <p className="text-2xl font-bold text-blue-600">{getPrioridadCount('Media')}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setPrioridadFilter('baja')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Baja Prioridad</p>
              <p className="text-2xl font-bold text-gray-600">{getPrioridadCount('Baja')}</p>
            </div>
            <User className="h-8 w-8 text-gray-600" />
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
                placeholder="Buscar por aviso, equipo, sede, serie o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
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
              <h3 className="text-lg font-medium text-gray-900">Solicitudes Pendientes Preventivo</h3>
              <div className="text-sm text-gray-600">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">12</span> | {filteredSolicitudes.length} registros
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
                    Prog. Mantenimiento
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
                    <p className="mt-2 text-sm text-gray-500">Cargando solicitudes pendientes...</p>
                  </td>
                </tr>
              ) : filteredSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron solicitudes pendientes</h3>
                    <p className="text-sm text-gray-500">Todas las solicitudes preventivas están al día</p>
                  </td>
                </tr>
              ) : (
                filteredSolicitudes.map((solicitud) => {
                  const daysUntilMaintenance = getDaysUntilMaintenance(solicitud.fecha_programada!)
                  const isOverdue = daysUntilMaintenance < 0
                  const isUrgent = daysUntilMaintenance <= 3 && daysUntilMaintenance >= 0

                  return (
                    <tr key={solicitud.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : isUrgent ? 'bg-yellow-50' : ''}`}>
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
                        <Badge variant="outline" className="border-green-300 text-green-700 text-xs">
                          Preventivo
                        </Badge>
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
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Pendiente
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{solicitud.sede}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {solicitud.serie}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className={`font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {formatDateShort(solicitud.fecha_programada!)}
                          </div>
                          <div className={`text-xs ${isOverdue ? 'text-red-500' : isUrgent ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {isOverdue ? `Vencido ${Math.abs(daysUntilMaintenance)} días` : 
                             isUrgent ? `En ${daysUntilMaintenance} días` : 
                             `En ${daysUntilMaintenance} días`}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Asignar técnico">
                            <User className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Programar">
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
                2
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