'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function StatsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Estadísticas del Sistema</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Métricas y Reportes</CardTitle>
          <CardDescription>
            Análisis detallado del rendimiento del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-xs">
            En Desarrollo
          </Badge>
          <p className="text-muted-foreground mt-4">
            Próximamente: Gráficos y métricas detalladas del sistema
          </p>
        </CardContent>
      </Card>
    </div>
  )
}