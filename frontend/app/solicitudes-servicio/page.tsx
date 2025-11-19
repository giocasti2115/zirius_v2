'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, Filter, Download, Grid, MoreVertical,
  Eye, Edit, Trash2, Plus, Wrench, Calendar, 
  Clock, User, FileText
} from 'lucide-react'

export default function SolicitudesServicioPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)

  // Mock data for demonstration
  const solicitudes = [
    {
      id: 1,
      codigo: 'SS-001',
      cliente: 'Hospital Central',
      equipo: 'Equipo de Rayos X',
      tipo_servicio: 'Mantenimiento Preventivo',
      estado: 'Pendiente',
      fecha_solicitud: '2024-01-15',
      fecha_programada: '2024-01-20',
      tecnico_asignado: 'Carlos López'
    },
    {
      id: 2,
      codigo: 'SS-002',
      cliente: 'Clínica San Juan',
      equipo: 'Monitor Signos Vitales',
      tipo_servicio: 'Mantenimiento Correctivo',
      estado: 'En Progreso',
      fecha_solicitud: '2024-01-14',
      fecha_programada: '2024-01-18',
      tecnico_asignado: 'Ana Rodríguez'
    },
    {
      id: 3,
      codigo: 'SS-003',
      cliente: 'Hospital Nacional',
      equipo: 'Ventilador Mecánico',
      tipo_servicio: 'Instalación',
      estado: 'Completado',
      fecha_solicitud: '2024-01-10',
      fecha_programada: '2024-01-15',
      tecnico_asignado: 'Miguel Torres'
    }
  ]

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesSearch = solicitud.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.equipo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || solicitud.estado.toLowerCase().replace(' ', '-') === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
      case 'en progreso':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">En Progreso</Badge>
      case 'completado':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getTipoServicioBadge = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'mantenimiento preventivo':
        return <Badge variant="outline" className="border-green-300 text-green-700">Preventivo</Badge>
      case 'mantenimiento correctivo':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Correctivo</Badge>
      case 'instalación':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Instalación</Badge>
      case 'calibración':
        return <Badge variant="outline" className="border-purple-300 text-purple-700">Calibración</Badge>
      default:
        return <Badge variant="outline">{tipo}</Badge>
    }
  }

  useEffect(() => {
    setMounted(true)
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
          <p className="text-gray-600 mt-1">Gestiona las solicitudes de servicio técnico</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Solicitudes</p>
              <p className="text-2xl font-bold text-gray-900">{solicitudes.length}</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {solicitudes.filter(s => s.estado === 'Pendiente').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-blue-600">
                {solicitudes.filter(s => s.estado === 'En Progreso').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-blue-600"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">
                {solicitudes.filter(s => s.estado === 'Completado').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-green-600"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Nueva Solicitud de Servicio
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Seleccione un cliente</option>
                <option value="hospital-central">Hospital Central</option>
                <option value="clinica-san-juan">Clínica San Juan</option>
                <option value="hospital-nacional">Hospital Nacional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipo <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                placeholder="Nombre del equipo"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Servicio <span className="text-red-500">*</span>
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Seleccione tipo de servicio</option>
                <option value="preventivo">Mantenimiento Preventivo</option>
                <option value="correctivo">Mantenimiento Correctivo</option>
                <option value="instalacion">Instalación</option>
                <option value="calibracion">Calibración</option>
                <option value="capacitacion">Capacitación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Programada <span className="text-red-500">*</span>
              </label>
              <Input 
                type="date" 
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnico Asignado
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Seleccione un técnico</option>
                <option value="carlos-lopez">Carlos López</option>
                <option value="ana-rodriguez">Ana Rodríguez</option>
                <option value="miguel-torres">Miguel Torres</option>
                <option value="lucia-martinez">Lucía Martínez</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Seleccione prioridad</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Servicio
              </label>
              <textarea 
                rows={3}
                placeholder="Describe el servicio requerido..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              ></textarea>
            </div>
          </div>

          <p className="text-sm text-red-600 mt-4 font-medium uppercase tracking-wide">DISEÑO DE FORMULARIOS</p>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear Solicitud
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código, cliente o equipo..."
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
              <option value="completado">Completadas</option>
              <option value="cancelado">Canceladas</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Solicitudes de Servicio</h3>
            <p className="text-sm text-red-600 font-medium uppercase tracking-wide">DISEÑO DE TABLAS MÁS MODERNAS</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente / Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Técnico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSolicitudes.map((solicitud) => (
                <tr key={solicitud.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{solicitud.codigo}</div>
                        <div className="text-sm text-gray-500">
                          {solicitud.fecha_solicitud}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{solicitud.cliente}</div>
                    <div className="text-sm text-gray-500">{solicitud.equipo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTipoServicioBadge(solicitud.tipo_servicio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(solicitud.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{solicitud.tecnico_asignado}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSolicitudes.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron solicitudes</h3>
            <p className="text-sm text-gray-500">Intenta cambiar los filtros o términos de búsqueda</p>
          </div>
        )}
        
        {/* Pagination */}
        {filteredSolicitudes.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {filteredSolicitudes.length} de {solicitudes.length} solicitudes
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}