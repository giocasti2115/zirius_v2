'use client'

import React, { useState, useEffect } from 'react'

export function SimpleDashboard() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    solicitudes: 24,
    clientes: 12,
    equipos: 48,
    ordenes: 16
  })

  useEffect(() => {
    setMounted(true)
    // Get user data
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido de vuelta, {user?.nombre || user?.usuario || 'Usuario'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Solicitudes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.solicitudes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">C</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clientes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.clientes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Equipos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.equipos}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">O</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Órdenes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.ordenes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nueva solicitud de mantenimiento creada
                </p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Orden de servicio completada
                </p>
                <p className="text-xs text-gray-500">Hace 4 horas</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Cotización pendiente de aprobación
                </p>
                <p className="text-xs text-gray-500">Hace 6 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => window.location.href = '/solicitudes'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
              >
                Nueva Solicitud
              </button>
              <button
                onClick={() => window.location.href = '/clientes'}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
              >
                Ver Clientes
              </button>
              <button
                onClick={() => window.location.href = '/cotizaciones'}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
              >
                Ver Cotizaciones
              </button>
              <button
                onClick={() => window.location.href = '/equipos'}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
              >
                Ver Equipos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}