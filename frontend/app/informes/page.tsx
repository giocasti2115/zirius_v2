'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, FileText, Package, AlertTriangle, Clock, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

export default function InformesPage() {
  const informes = [
    {
      title: 'Resumen Correctivos por Equipo',
      description: 'Análisis de mantenimientos correctivos por equipo',
      icon: BarChart3,
      status: 'En Desarrollo',
      href: '/informes/correctivos-equipo',
      count: '342 Equipos'
    },
    {
      title: 'Repuestos Instalados',
      description: 'Historial de repuestos instalados',
      icon: Package,
      status: 'En Desarrollo', 
      href: '/informes/repuestos-instalados',
      count: '1,247 Repuestos'
    },
    {
      title: 'Repuestos',
      description: 'Reporte general de repuestos',
      icon: Package,
      status: 'En Desarrollo',
      href: '/informes/repuestos',
      count: '2,847 En Stock'
    },
    {
      title: 'Fallos',
      description: 'Análisis de fallos y averías',
      icon: AlertTriangle,
      status: 'En Desarrollo',
      href: '/informes/fallos',
      count: '156 Fallos'
    },
    {
      title: 'Duración Repuestos',
      description: 'Análisis de vida útil de repuestos',
      icon: Clock,
      status: 'En Desarrollo',
      href: '/informes/duracion-repuestos',
      count: '12 Meses Promedio'
    },
    {
      title: 'Indicadores',
      description: 'Indicadores de rendimiento (KPIs)',
      icon: TrendingUp,
      status: 'En Desarrollo',
      href: '/informes/indicadores',
      count: '24 Indicadores'
    },
    {
      title: 'Correctivos Resultados',
      description: 'Resultados de mantenimientos correctivos',
      icon: Activity,
      status: 'En Desarrollo',
      href: '/informes/correctivos-resultados',
      count: '89% Exitosos'
    }
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Informes y Reportes</h2>
          <p className="text-muted-foreground">
            Análisis detallado y reportes del sistema de gestión
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar Todo
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Nuevo Reporte
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {informes.map((informe, index) => {
          const Icon = informe.icon
          return (
            <Link key={index} href={informe.href}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {informe.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {informe.count}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mb-3">
                    {informe.description}
                  </CardDescription>
                  <Badge variant="secondary" className="text-xs">
                    {informe.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Información de Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Reportes:</span> {informes.length}
              </div>
              <div>
                <span className="font-medium">Última Actualización:</span> Hace 2 horas
              </div>
              <div>
                <span className="font-medium">Próxima Actualización:</span> 
                <Badge variant="default" className="ml-2">Automática</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}