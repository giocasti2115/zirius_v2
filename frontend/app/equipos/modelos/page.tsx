'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, Tag, Settings, Plus } from 'lucide-react'

export default function ModelosPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Modelos y Marcas</h2>
          <p className="text-muted-foreground">
            Catálogo de modelos y marcas de equipos médicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Tag className="h-4 w-4 mr-2" />
            Nueva Marca
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Modelo
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marcas</CardTitle>
            <Tag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">45</div>
            <p className="text-xs text-muted-foreground">Marcas registradas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos</CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">287</div>
            <p className="text-xs text-muted-foreground">Modelos catalogados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipos</CardTitle>
            <Settings className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">1,247</div>
            <p className="text-xs text-muted-foreground">Equipos registrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Tipos de equipos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Modelos y Marcas</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-xs">
            En Desarrollo
          </Badge>
          <p className="text-muted-foreground mt-4">
            Próximamente: Catálogo completo de marcas y modelos con especificaciones técnicas, 
            manuales de servicio y compatibilidad de repuestos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}