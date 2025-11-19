'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, FileText, CreditCard, BarChart, Settings } from 'lucide-react'

export default function ComercialPage() {
  const modules = [
    {
      title: 'Cotizaciones',
      description: 'Gestión de cotizaciones comerciales',
      icon: FileText,
      status: 'Disponible',
      href: '/cotizaciones'
    },
    {
      title: 'Contratos',
      description: 'Gestión de contratos comerciales',
      icon: FileText,
      status: 'En Desarrollo',
      href: '/comercial/contratos'
    },
    {
      title: 'Facturación',
      description: 'Proceso de facturación',
      icon: CreditCard,
      status: 'En Desarrollo',
      href: '/comercial/facturacion'
    },
    {
      title: 'Precios y Tarifas',
      description: 'Gestión de precios y tarifas',
      icon: DollarSign,
      status: 'En Desarrollo',
      href: '/comercial/precios'
    },
    {
      title: 'Informes Comerciales',
      description: 'Reportes y análisis comerciales',
      icon: BarChart,
      status: 'En Desarrollo',
      href: '/comercial/informes'
    }
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestión Comercial</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => {
          const Icon = module.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {module.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-muted-foreground mb-3">
                  {module.description}
                </CardDescription>
                <Badge 
                  variant={module.status === 'Disponible' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {module.status}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}