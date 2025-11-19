'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ContactosPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contactos por Cliente</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Contactos</CardTitle>
          <CardDescription>
            Administración de contactos asociados a cada cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-xs">
            En Desarrollo
          </Badge>
          <p className="text-muted-foreground mt-4">
            Próximamente: Lista y gestión de contactos por cliente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}