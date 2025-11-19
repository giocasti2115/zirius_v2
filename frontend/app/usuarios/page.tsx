'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, Filter, Download, Grid, MoreVertical,
  Eye, Edit, Trash2, Plus, Users, Shield, UserCheck, 
  UserX, Settings, Clock
} from 'lucide-react'

export default function UsuariosPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock data for demonstration
  const usuarios = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      rol: 'Administrador',
      estado: 'Activo',
      ultimo_acceso: '2024-01-15 10:30',
      creado: '2023-06-01'
    },
    {
      id: 2,
      nombre: 'María García',
      email: 'maria.garcia@empresa.com',
      rol: 'Técnico',
      estado: 'Activo',
      ultimo_acceso: '2024-01-15 09:15',
      creado: '2023-08-15'
    },
    {
      id: 3,
      nombre: 'Carlos López',
      email: 'carlos.lopez@empresa.com',
      rol: 'Operador',
      estado: 'Inactivo',
      ultimo_acceso: '2024-01-10 16:45',
      creado: '2023-10-20'
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez',
      email: 'ana.rodriguez@empresa.com',
      rol: 'Supervisor',
      estado: 'Activo',
      ultimo_acceso: '2024-01-15 08:20',
      creado: '2023-05-10'
    }
  ]

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || usuario.estado.toLowerCase() === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
      case 'inactivo':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getRolBadge = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'administrador':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Administrador</Badge>
      case 'supervisor':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Supervisor</Badge>
      case 'técnico':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Técnico</Badge>
      case 'operador':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Operador</Badge>
      default:
        return <Badge variant="outline">{rol}</Badge>
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra usuarios, roles y permisos del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {usuarios.filter(u => u.estado === 'Activo').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">
                {usuarios.filter(u => u.rol === 'Administrador').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conectados Hoy</p>
              <p className="text-2xl font-bold text-blue-600">
                {usuarios.filter(u => u.ultimo_acceso.includes('2024-01-15')).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
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
                placeholder="Buscar por nombre, email o rol..."
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
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
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
            <h3 className="text-lg font-medium text-gray-900">Lista de Usuarios</h3>
            <p className="text-sm text-red-600 font-medium uppercase tracking-wide">DISEÑO DE TABLAS MÁS MODERNAS</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {usuario.nombre.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                        <div className="text-sm text-gray-500">{usuario.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRolBadge(usuario.rol)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(usuario.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.ultimo_acceso}
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
                        <Settings className="h-4 w-4" />
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
        
        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron usuarios</h3>
            <p className="text-sm text-gray-500">Intenta cambiar los filtros o términos de búsqueda</p>
          </div>
        )}
        
        {/* Pagination */}
        {filteredUsuarios.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
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