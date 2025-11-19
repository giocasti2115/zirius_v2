'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ActivityPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Actividad Reciente</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Log de Actividades</CardTitle>
          <CardDescription>
            Registro de actividades recientes del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-xs">
            En Desarrollo
          </Badge>
          <p className="text-muted-foreground mt-4">
            Próximamente: Timeline de actividades del sistema
          </p>
        </CardContent>
      </Card>
    </div>
  )
}