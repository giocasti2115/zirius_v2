'use client'

import { useState } from 'react'
import { DataTable } from '@/components/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

interface DecommissionRequestsProps {
  title: string
  filterStatus?: string
}

export function DecommissionRequests({ title, filterStatus }: DecommissionRequestsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">
              Gestión de solicitudes de desbaja de equipos
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Solicitud de Desbaja
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">852</div>
            <div className="text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Todos los estados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">718</div>
            <div className="text-xs text-muted-foreground">
              <Badge className="text-xs bg-yellow-100 text-yellow-800">
                Requieren revisión
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89</div>
            <div className="text-xs text-muted-foreground">
              <Badge className="text-xs bg-green-100 text-green-800">
                Listas para ejecutar
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">45</div>
            <div className="text-xs text-muted-foreground">
              <Badge className="text-xs bg-red-100 text-red-800">
                No aprobadas
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            title={title}
            type="decommission"
            data={undefined} // Will use generated mock data
            totalRecords={852}
          />
        </CardContent>
      </Card>
    </div>
  )
}