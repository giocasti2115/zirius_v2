'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, AlertTriangle, TrendingUp, Wrench } from 'lucide-react'

export default function RepuestosPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Repuestos</h2>
          <p className="text-muted-foreground">
            Inventario y gestión de repuestos para equipos médicos
          </p>
        </div>
        <Button>
          <Package className="h-4 w-4 mr-2" />
          Agregar Repuesto
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Stock</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2,847</div>
            <p className="text-xs text-muted-foreground">Repuestos disponibles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">23</div>
            <p className="text-xs text-muted-foreground">Requieren reposición</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Más Usados</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">156</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$234M</div>
            <p className="text-xs text-muted-foreground">Inventario actual</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Repuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-xs">
            En Desarrollo
          </Badge>
          <p className="text-muted-foreground mt-4">
            Próximamente: Sistema completo de inventario de repuestos con control de stock, 
            alertas de reposición, historial de uso y gestión de proveedores.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}