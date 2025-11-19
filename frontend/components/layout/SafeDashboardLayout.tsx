'use client'

import React, { useState, useEffect } from 'react'

interface SafeDashboardLayoutProps {
  children: React.ReactNode
}

export function SafeDashboardLayout({ children }: SafeDashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">ZIRIUZ</h1>
              <span className="ml-4 text-sm text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido, {user?.nombre || user?.usuario || 'Usuario'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-white shadow-sm border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/solicitudes'}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Solicitudes
            </button>
            <button
              onClick={() => window.location.href = '/cotizaciones'}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Cotizaciones
            </button>
            <button
              onClick={() => window.location.href = '/clientes'}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Clientes
            </button>
            <button
              onClick={() => window.location.href = '/equipos'}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Equipos
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}