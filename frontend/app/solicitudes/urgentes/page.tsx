'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function SolicitudesUrgentesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Solicitudes Urgentes</h2>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atención Prioritaria</AlertTitle>
        <AlertDescription>
          Esta sección está dedicada a solicitudes que requieren atención inmediata.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Alta Prioridad</CardTitle>
          <CardDescription>
            Gestión de solicitudes marcadas como urgentes o críticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive" className="text-xs">
            En Desarrollo
          </Badge>
          <p className="text-muted-foreground mt-4">
            Próximamente: Dashboard especializado para solicitudes urgentes con notificaciones en tiempo real
          </p>
        </CardContent>
      </Card>
    </div>
  )
}