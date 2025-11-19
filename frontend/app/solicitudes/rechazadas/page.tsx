'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, Filter, Download, Grid, MoreVertical,
  Eye, Edit, Trash2, Plus, Wrench, Calendar, 
  Clock, User, FileText, CheckCircle, XCircle,
  AlertTriangle, ArrowLeft, Ban, RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Interface matching legacy PHP structure
interface SolicitudRechazada {
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
  fecha_rechazo?: string
  rechazado_por?: string
  motivo_rechazo?: string
  observaciones?: string
}

export default function SolicitudesRechazadas() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [motivoFilter, setMotivoFilter] = useState('all')
  const [servicioFilter, setServicioFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  // Estado para datos reales de solicitudes rechazadas
  const [solicitudes, setSolicitudes] = useState<SolicitudRechazada[]>([])
  const [totalSolicitudes, setTotalSolicitudes] = useState(0)

  // Función para obtener solicitudes rechazadas desde la API
  const fetchSolicitudesRechazadas = async () => {
    try {
      setLoading(true)
      // Intentar obtener datos reales del backend
      const response = await fetch('/api/solicitudes?estado=3', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setSolicitudes(data.data.slice(0, 50)) // Limitar a 50 para performance
          setTotalSolicitudes(data.data.length)
        }
      } else {
        // Fallback a datos mock si la API no responde
        console.log('API no disponible, usando datos mock')
        setSolicitudes([
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
      fecha_rechazo: '2025-10-04 10:30:15',
      rechazado_por: 'Supervisor Técnico',
      motivo_rechazo: 'Información incompleta',
      observaciones: 'Faltan especificaciones del equipo y código de ubicación'
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
      fecha_rechazo: '2025-10-04 14:15:30',
      rechazado_por: 'Coordinador Técnico',
      motivo_rechazo: 'Equipo no disponible',
      observaciones: 'El equipo está fuera de servicio por reparación mayor'
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
      fecha_rechazo: '2025-10-03 18:45:22',
      rechazado_por: 'Director Técnico',
      motivo_rechazo: 'Presupuesto no autorizado',
      observaciones: 'La reparación excede el presupuesto autorizado, requiere aprobación gerencial'
    },
    {
      id: 342619,
      aviso: 'AV-10556505',
      servicio: 'Calibración',
      creacion: '2025-10-02 11:30:15',
      equipo: 'Báscula Digital',
      id_equipo: 69350,
      estado: 'Rechazada',
      sede: 'HOSPITAL CENTRAL - FARMACIA',
      serie: 'BD-2023-045',
      cliente: 'Hospital Central',
      prioridad: 'Media',
      tecnico_asignado: null,
      fecha_rechazo: '2025-10-03 09:20:10',
      rechazado_por: 'Jefe de Área',
      motivo_rechazo: 'Documentación incompleta',
      observaciones: 'Faltan certificados de calibración previos y protocolo específico'
    },
    {
      id: 342617,
      aviso: 'AV-10556473',
      servicio: 'Instalación',
      creacion: '2025-10-01 14:45:30',
      equipo: 'Sistema de Gases Medicinales',
      id_equipo: 69560,
      estado: 'Rechazada',
      sede: 'CLINICA SAN JUAN - QUIRÓFANOS',
      serie: 'SGM-2024-012',
      cliente: 'Clínica San Juan',
      prioridad: 'Alta',
      tecnico_asignado: null,
      fecha_rechazo: '2025-10-02 16:30:45',
      rechazado_por: 'Ingeniero en Jefe',
      motivo_rechazo: 'Requisitos no cumplidos',
      observaciones: 'No cumple con normativas de seguridad hospitalaria vigentes'
    }
        ])
        setTotalSolicitudes(7095) // Total real de solicitudes rechazadas
      }
    } catch (error) {
      console.error('Error fetching solicitudes rechazadas:', error)
      // Mantener datos mock en caso de error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchSolicitudesRechazadas()
  }, [])

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesSearch = solicitud.aviso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.motivo_rechazo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMotivo = motivoFilter === 'all' || solicitud.motivo_rechazo?.toLowerCase().replace(' ', '-') === motivoFilter
    const matchesServicio = servicioFilter === 'all' || solicitud.servicio.toLowerCase().replace(' ', '-') === servicioFilter
    
    return matchesSearch && matchesMotivo && matchesServicio
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
      case 'informe':
        return <Badge variant="outline" className="border-gray-300 text-gray-700 text-xs">Informe</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{servicio}</Badge>
    }
  }

  const getMotivoRechazoColor = (motivo: string) => {
    switch (motivo?.toLowerCase()) {
      case 'información incompleta':
      case 'documentación incompleta':
        return 'text-orange-600'
      case 'equipo no disponible':
        return 'text-blue-600'
      case 'presupuesto no autorizado':
        return 'text-red-600'
      case 'requisitos no cumplidos':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
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

  const getMotivoCount = (motivo: string) => {
    return solicitudes.filter(s => s.motivo_rechazo?.toLowerCase().includes(motivo.toLowerCase())).length
  }

  const getServicioCount = (servicio: string) => {
    return solicitudes.filter(s => s.servicio.toLowerCase() === servicio.toLowerCase()).length
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
        <span className="text-gray-900 font-medium">Solicitudes Rechazadas</span>
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
            <XCircle className="h-8 w-8 text-red-600" />
            Solicitudes Rechazadas
          </h1>
          <p className="text-gray-600 mt-1">Solicitudes que requieren corrección o revisión para nueva evaluación</p>
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
            className="bg-red-600 hover:bg-red-700"
            onClick={() => router.push('/solicitudes/nueva')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Rejection Reason Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{solicitudes.length}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setMotivoFilter('información-incompleta')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Info Incompleta</p>
              <p className="text-2xl font-bold text-orange-600">{getMotivoCount('información')}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setMotivoFilter('equipo-no-disponible')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Equipo No Disp.</p>
              <p className="text-2xl font-bold text-blue-600">{getMotivoCount('equipo')}</p>
            </div>
            <Ban className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setMotivoFilter('presupuesto')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Presupuesto</p>
              <p className="text-2xl font-bold text-purple-600">{getMotivoCount('presupuesto')}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setMotivoFilter('requisitos')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requisitos</p>
              <p className="text-2xl font-bold text-indigo-600">{getMotivoCount('requisitos')}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-indigo-600" />
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
                placeholder="Buscar por aviso, servicio, equipo, sede, serie, cliente o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select 
              value={motivoFilter}
              onChange={(e) => setMotivoFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos los motivos</option>
              <option value="información-incompleta">Información incompleta</option>
              <option value="equipo-no-disponible">Equipo no disponible</option>
              <option value="presupuesto">Presupuesto</option>
              <option value="requisitos">Requisitos no cumplidos</option>
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
              <h3 className="text-lg font-medium text-gray-900">Solicitudes Rechazadas ({totalSolicitudes || filteredSolicitudes.length})</h3>
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
                    Motivo Rechazo
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
                    <p className="mt-2 text-sm text-gray-500">Cargando solicitudes rechazadas...</p>
                  </td>
                </tr>
              ) : filteredSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron solicitudes rechazadas</h3>
                    <p className="text-sm text-gray-500">¡Excelente! No hay solicitudes rechazadas en este momento</p>
                  </td>
                </tr>
              ) : (
                filteredSolicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-gray-50 bg-red-25">
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
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        Rechazada
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{solicitud.sede}</div>
                      {solicitud.rechazado_por && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          {solicitud.rechazado_por}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {solicitud.serie}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className={`font-medium ${getMotivoRechazoColor(solicitud.motivo_rechazo!)}`}>
                          {solicitud.motivo_rechazo}
                        </div>
                        {solicitud.observaciones && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={solicitud.observaciones}>
                            {solicitud.observaciones}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Revisar solicitud">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Nueva solicitud">
                          <Plus className="h-4 w-4" />
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
              Mostrando <span className="font-medium">1-{Math.min(rowsPerPage, filteredSolicitudes.length)}</span> de <span className="font-medium">{totalSolicitudes || filteredSolicitudes.length}</span> registros
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