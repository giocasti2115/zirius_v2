'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, FileX, Clock, CheckCircle } from 'lucide-react'

export default function BajaEquiposPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Baja de Equipos</h2>
          <p className="text-muted-foreground">
            Proceso de baja y desmantelamiento de equipos médicos
          </p>
        </div>
        <Button variant="destructive">
          <FileX className="h-4 w-4 mr-2" />
          Nueva Solicitud de Baja
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12</div>
            <p className="text-xs text-muted-foreground">Esperando aprobación</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5</div>
            <p className="text-xs text-muted-foreground">En desmantelamiento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89</div>
            <p className="text-xs text-muted-foreground">Este año</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Recuperado</CardTitle>
            <FileX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45M</div>
            <p className="text-xs text-muted-foreground">En repuestos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proceso de Baja de Equipos</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-xs">
            En Desarrollo
          </Badge>
          <p className="text-muted-foreground mt-4">
            Próximamente: Sistema completo para gestión de baja de equipos incluyendo 
            evaluación técnica, recuperación de repuestos y documentación completa.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}