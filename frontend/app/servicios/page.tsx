'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Settings,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react'
import Link from 'next/link'

interface ServicioStats {
  total: number
  preventivo: number
  correctivo: number
  instalacion: number
  calibracion: number
  pendientes: number
  en_proceso: number
  completados: number
  cancelados: number
}

export default function ServiciosPage() {
  const [stats, setStats] = useState<ServicioStats>({
    total: 0,
    preventivo: 0,
    correctivo: 0,
    instalacion: 0,
    calibracion: 0,
    pendientes: 0,
    en_proceso: 0,
    completados: 0,
    cancelados: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServiciosStats()
  }, [])

  const fetchServiciosStats = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call when services stats endpoint is ready
      // Mock data for now
      setStats({
        total: 1247,
        preventivo: 650,
        correctivo: 380,
        instalacion: 120,
        calibracion: 97,
        pendientes: 156,
        en_proceso: 89,
        completados: 987,
        cancelados: 15
      })
    } catch (error) {
      console.error('Error fetching servicios stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const servicioCards = [
    {
      title: 'Mantenimiento Preventivo',
      count: stats.preventivo,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/servicios/preventivo'
    },
    {
      title: 'Mantenimiento Correctivo',
      count: stats.correctivo,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/servicios/correctivo'
    },
    {
      title: 'Instalaciones',
      count: stats.instalacion,
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/servicios/instalacion'
    },
    {
      title: 'Calibraciones',
      count: stats.calibracion,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/servicios/calibracion'
    }
  ]

  const estadoCards = [
    {
      title: 'Pendientes',
      count: stats.pendientes,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/servicios/pendientes'
    },
    {
      title: 'En Proceso',
      count: stats.en_proceso,
      icon: AlertTriangle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/servicios/en-proceso'
    },
    {
      title: 'Completados',
      count: stats.completados,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/servicios/completados'
    },
    {
      title: 'Cancelados',
      count: stats.cancelados,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/servicios/cancelados'
    }
  ]

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Servicios</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Servicios</h2>
          <p className="text-muted-foreground">
            Panel de control para la gestión de servicios técnicos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/servicios/programar">
              <Calendar className="mr-2 h-4 w-4" />
              Programar Servicio
            </Link>
          </Button>
        </div>
      </div>

      {/* Resumen general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Resumen General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Servicios</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.en_proceso}</div>
              <p className="text-sm text-muted-foreground">En Proceso</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((stats.completados / stats.total) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Tasa de Completitud</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de servicio */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Servicios por Tipo</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {servicioCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link href={card.href}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <div className={`p-2 rounded-full ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${card.color}`}>{card.count}</div>
                    <Badge variant="secondary" className="mt-1">
                      {((card.count / stats.total) * 100).toFixed(1)}% del total
                    </Badge>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Estados de servicio */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Servicios por Estado</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {estadoCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link href={card.href}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <div className={`p-2 rounded-full ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${card.color}`}>{card.count}</div>
                    <Badge variant="secondary" className="mt-1">
                      {((card.count / stats.total) * 100).toFixed(1)}% del total
                    </Badge>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/servicios/todos">
                <BarChart3 className="h-6 w-6 mb-2" />
                Ver Todos los Servicios
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/servicios/calendario">
                <Calendar className="h-6 w-6 mb-2" />
                Calendario de Servicios
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/servicios/reportes">
                <BarChart3 className="h-6 w-6 mb-2" />
                Reportes y Estadísticas
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}