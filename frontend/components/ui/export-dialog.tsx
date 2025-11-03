'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FileText, Download, Mail, Calendar, Database, FileSpreadsheet, Filter, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json'
export type ExportData = 'clientes' | 'sedes' | 'equipos' | 'ordenes' | 'custom'

interface ExportField {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'array'
  required?: boolean
}

export interface ExportConfig {
  dataType: ExportData
  format: ExportFormat
  fields: string[]
  filters?: Record<string, any>
  filename?: string
  emailRecipients?: string[]
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    time?: string
    dayOfWeek?: number
    dayOfMonth?: number
  }
}

interface ExportDialogProps {
  dataType: ExportData
  availableFields: ExportField[]
  onExport: (config: ExportConfig) => Promise<void>
  filters?: Record<string, any>
}

export function ExportDialog({ dataType, availableFields, onExport, filters = {} }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [config, setConfig] = useState<ExportConfig>({
    dataType,
    format: 'excel',
    fields: availableFields.filter(f => f.required).map(f => f.key),
    filters,
    filename: `${dataType}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`
  })

  const formatLabels: Record<ExportFormat, string> = {
    excel: 'Excel (.xlsx)',
    csv: 'CSV (.csv)',
    pdf: 'PDF (.pdf)',
    json: 'JSON (.json)'
  }

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    const field = availableFields.find(f => f.key === fieldKey)
    if (field?.required) return // No permitir desmarcar campos requeridos

    setConfig(prev => ({
      ...prev,
      fields: checked 
        ? [...prev.fields, fieldKey]
        : prev.fields.filter(f => f !== fieldKey)
    }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simular progreso de exportación
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 200)

    try {
      await onExport(config)
      setExportProgress(100)
      
      setTimeout(() => {
        setIsOpen(false)
        setIsExporting(false)
        setExportProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Error exporting data:', error)
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const getDataTypeLabel = (type: ExportData) => {
    const labels: Record<ExportData, string> = {
      clientes: 'Clientes',
      sedes: 'Sedes',
      equipos: 'Equipos',
      ordenes: 'Órdenes de Trabajo',
      custom: 'Datos Personalizados'
    }
    return labels[type]
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Exportar {getDataTypeLabel(dataType)}
          </DialogTitle>
        </DialogHeader>

        {isExporting ? (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Exportando datos...</h3>
              <p className="text-muted-foreground">Por favor espere mientras procesamos su exportación</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Formato de exportación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Formato de Exportación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={config.format}
                  onValueChange={(value: ExportFormat) => 
                    setConfig(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(formatLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Campos a exportar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Campos a Exportar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableFields.map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.key}
                        checked={config.fields.includes(field.key)}
                        onCheckedChange={(checked) => 
                          handleFieldToggle(field.key, checked as boolean)
                        }
                        disabled={field.required}
                      />
                      <Label 
                        htmlFor={field.key} 
                        className={`text-sm ${field.required ? 'font-medium' : ''}`}
                      >
                        {field.label}
                        {field.required && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            Requerido
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  {config.fields.length} de {availableFields.length} campos seleccionados
                </div>
              </CardContent>
            </Card>

            {/* Filtros aplicados */}
            {Object.keys(filters).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros Aplicados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => (
                      <Badge key={key} variant="outline">
                        {key}: {JSON.stringify(value)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configuración del archivo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuración del Archivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="filename">Nombre del archivo</Label>
                  <Input
                    id="filename"
                    value={config.filename}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, filename: e.target.value }))
                    }
                    placeholder="nombre_archivo"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Envío por email (opcional) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Envío por Email (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="email1@ejemplo.com, email2@ejemplo.com"
                  value={config.emailRecipients?.join(', ') || ''}
                  onChange={(e) => {
                    const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                    setConfig(prev => ({ ...prev, emailRecipients: emails.length > 0 ? emails : undefined }))
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Separe múltiples emails con comas
                </p>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleExport}
                disabled={config.fields.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar {formatLabels[config.format]}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Hook para manejar exportaciones
export function useExport() {
  const exportData = async (config: ExportConfig): Promise<void> => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error('Error al exportar datos')
      }

      // Si es una descarga directa
      if (config.format !== 'json' || !config.emailRecipients) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${config.filename}.${config.format === 'excel' ? 'xlsx' : config.format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error in export:', error)
      throw error
    }
  }

  return { exportData }
}