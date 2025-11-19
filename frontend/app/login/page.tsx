'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    usuario: '',
    clave: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(credentials)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-6">ZIRIUZ</h1>
            <h2 className="text-2xl font-semibold text-blue-100 mb-4">
              Sistema de Gestión de Equipos Odontológicos
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed mb-8">
              Controla y administra eficientemente todos los aspectos de tu negocio odontológico desde una sola plataforma.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Gestión de clientes y solicitudes</span>
              </div>
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Control de equipos y órdenes</span>
              </div>
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Cotizaciones y reportes</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-indigo-400 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-25"></div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="lg:hidden mb-8">
              <h1 className="text-4xl font-bold text-blue-600 mb-2">ZIRIUZ</h1>
              <p className="text-gray-600">Sistema de Gestión Odontológica</p>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido
            </h2>
            <p className="text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ingresa tu usuario"
                  value={credentials.usuario}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="clave" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  id="clave"
                  name="clave"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ingresa tu contraseña"
                  value={credentials.clave}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}