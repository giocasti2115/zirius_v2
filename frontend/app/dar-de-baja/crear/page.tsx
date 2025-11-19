'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  AlertTriangle,
  DollarSign,
  Package,
  FileText,
  Calendar,
  User,
  Search,
  CheckCircle
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import darDeBajaService, { 
  SolicitudBaja, 
  TipoBaja, 
  DocumentoBaja,
  RepuestoRecuperable 
} from '@/lib/services/dar-de-baja.service'

interface FormData {
  codigoEquipo: string
  nombreEquipo: string
  marca: string
  modelo: string
  numeroSerie: string
  ubicacion: string
  responsable: string
  tipoBaja: TipoBaja | ''
  justificacionTecnica: string
  justificacionEconomica: string
  valorRecuperable: number | null
  observaciones: string
}

export default function CrearSolicitudBajaPage() {
  const [formData, setFormData] = useState<FormData>({
    codigoEquipo: '',
    nombreEquipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    ubicacion: '',
    responsable: '',
    tipoBaja: '',
    justificacionTecnica: '',
    justificacionEconomica: '',
    valorRecuperable: null,
    observaciones: ''
  })
  
  const [documentos, setDocumentos] = useState<DocumentoBaja[]>([])
  const [repuestos, setRepuestos] = useState<RepuestoRecuperable[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showEquipoSearch, setShowEquipoSearch] = useState(false)
  const [showRepuestoModal, setShowRepuestoModal] = useState(false)
  const [equiposBusqueda, setEquiposBusqueda] = useState<any[]>([])

  const tiposBaja: { value: TipoBaja; label: string }[] = [
    { value: 'obsolescencia_tecnologica', label: 'Obsolescencia Tecnológica' },
    { value: 'fin_vida_util', label: 'Fin de Vida Útil' },
    { value: 'daño_irreparable', label: 'Daño Irreparable' },
    { value: 'costo_mantenimiento_elevado', label: 'Costo de Mantenimiento Elevado' },
    { value: 'falta_repuestos', label: 'Falta de Repuestos' },
    { value: 'normativa_vigente', label: 'No Cumple Normativa Vigente' },
    { value: 'reemplazo_tecnologico', label: 'Reemplazo Tecnológico' }
  ]

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.codigoEquipo) newErrors.codigoEquipo = 'Código de equipo es requerido'
    if (!formData.nombreEquipo) newErrors.nombreEquipo = 'Nombre del equipo es requerido'
    if (!formData.tipoBaja) newErrors.tipoBaja = 'Tipo de baja es requerido'
    if (!formData.justificacionTecnica) newErrors.justificacionTecnica = 'Justificación técnica es requerida'
    if (!formData.responsable) newErrors.responsable = 'Responsable es requerido'

    if (formData.valorRecuperable && formData.valorRecuperable < 0) {
      newErrors.valorRecuperable = 'El valor no puede ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Buscar equipos
  const buscarEquipos = async (termino: string) => {
    if (termino.length < 2) return
    
    try {
      // Simulación de búsqueda - en producción conectar con endpoint real
      const equiposEncontrados = [
        {
          codigo: 'EQ-2024-001',
          nombre: 'Monitor de Signos Vitales Phillips MP20',
          marca: 'Phillips',
          modelo: 'MP20',
          numeroSerie: 'PH-MP20-2021-456',
          ubicacion: 'UCI - Cama 3',
          responsable: 'Dr. García'
        },
        {
          codigo: 'EQ-2024-002', 
          nombre: 'Ventilador Mecánico Dräger V500',
          marca: 'Dräger',
          modelo: 'V500',
          numeroSerie: 'DR-V500-2022-789',
          ubicacion: 'UCI - Cama 5',
          responsable: 'Dr. Martínez'
        }
      ].filter(equipo => 
        equipo.codigo.toLowerCase().includes(termino.toLowerCase()) ||
        equipo.nombre.toLowerCase().includes(termino.toLowerCase())
      )
      
      setEquiposBusqueda(equiposEncontrados)
    } catch (error) {
      console.error('Error buscando equipos:', error)
    }
  }

  // Seleccionar equipo
  const seleccionarEquipo = (equipo: any) => {
    setFormData(prev => ({
      ...prev,
      codigoEquipo: equipo.codigo,
      nombreEquipo: equipo.nombre,
      marca: equipo.marca,
      modelo: equipo.modelo,
      numeroSerie: equipo.numeroSerie,
      ubicacion: equipo.ubicacion,
      responsable: equipo.responsable
    }))
    setShowEquipoSearch(false)
    setEquiposBusqueda([])
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Agregar documento
  const agregarDocumento = (file: File) => {
    const nuevoDocumento: DocumentoBaja = {
      id: Date.now().toString(),
      nombre: file.name,
      tipo: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      tamaño: file.size,
      fechaSubida: new Date().toISOString(),
      url: URL.createObjectURL(file)
    }
    setDocumentos(prev => [...prev, nuevoDocumento])
  }

  // Eliminar documento
  const eliminarDocumento = (id: string) => {
    setDocumentos(prev => prev.filter(doc => doc.id !== id))
  }

  // Agregar repuesto recuperable
  const agregarRepuesto = (repuesto: Omit<RepuestoRecuperable, 'id'>) => {
    const nuevoRepuesto: RepuestoRecuperable = {
      ...repuesto,
      id: Date.now().toString()
    }
    setRepuestos(prev => [...prev, nuevoRepuesto])
    setShowRepuestoModal(false)
  }

  // Eliminar repuesto
  const eliminarRepuesto = (id: string) => {
    setRepuestos(prev => prev.filter(rep => rep.id !== id))
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const solicitudData: Omit<SolicitudBaja, 'id' | 'codigoSolicitud' | 'fechaSolicitud' | 'estado' | 'evaluacionTecnica'> = {
        codigoEquipo: formData.codigoEquipo,
        nombreEquipo: formData.nombreEquipo,
        marca: formData.marca,
        modelo: formData.modelo,
        numeroSerie: formData.numeroSerie,
        ubicacion: formData.ubicacion,
        responsable: formData.responsable,
        solicitante: 'Usuario Actual', // En producción obtener del contexto de autenticación
        tipoBaja: formData.tipoBaja as TipoBaja,
        justificacionTecnica: formData.justificacionTecnica,
        justificacionEconomica: formData.justificacionEconomica,
        valorRecuperable: formData.valorRecuperable,
        observaciones: formData.observaciones,
        documentos,
        repuestosRecuperables: repuestos
      }

      await darDeBajaService.crearSolicitud(solicitudData)
      
      // Redirigir al dashboard con mensaje de éxito
      window.location.href = '/dar-de-baja?created=success'
      
    } catch (error) {
      console.error('Error creando solicitud:', error)
      alert('Error al crear la solicitud. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dar-de-baja'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Solicitud de Baja</h1>
            <p className="text-muted-foreground">
              Complete la información del equipo y justificación para la baja
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button 
            type="submit" 
            form="solicitud-form"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Crear Solicitud
          </Button>
        </div>
      </div>

      <form id="solicitud-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Equipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Información del Equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Búsqueda de Equipo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">Buscar Equipo Existente</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEquipoSearch(!showEquipoSearch)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {showEquipoSearch ? 'Ocultar' : 'Buscar'}
                </Button>
              </div>
              
              {showEquipoSearch && (
                <div className="space-y-3">
                  <Input
                    placeholder="Buscar por código o nombre del equipo..."
                    onChange={(e) => buscarEquipos(e.target.value)}
                  />
                  
                  {equiposBusqueda.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {equiposBusqueda.map((equipo) => (
                        <div
                          key={equipo.codigo}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                          onClick={() => seleccionarEquipo(equipo)}
                        >
                          <div className="font-medium">{equipo.codigo}</div>
                          <div className="text-sm text-gray-600">{equipo.nombre}</div>
                          <div className="text-xs text-gray-500">{equipo.ubicacion}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Campos del Equipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="codigoEquipo">Código del Equipo *</Label>
                <Input
                  id="codigoEquipo"
                  value={formData.codigoEquipo}
                  onChange={(e) => handleInputChange('codigoEquipo', e.target.value)}
                  placeholder="EQ-2024-001"
                />
                {errors.codigoEquipo && (
                  <p className="text-sm text-red-600">{errors.codigoEquipo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreEquipo">Nombre del Equipo *</Label>
                <Input
                  id="nombreEquipo"
                  value={formData.nombreEquipo}
                  onChange={(e) => handleInputChange('nombreEquipo', e.target.value)}
                  placeholder="Monitor de Signos Vitales"
                />
                {errors.nombreEquipo && (
                  <p className="text-sm text-red-600">{errors.nombreEquipo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  placeholder="Phillips"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  placeholder="MP20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroSerie">Número de Serie</Label>
                <Input
                  id="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={(e) => handleInputChange('numeroSerie', e.target.value)}
                  placeholder="PH-MP20-2021-456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                  placeholder="UCI - Cama 3"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="responsable">Responsable *</Label>
                <Input
                  id="responsable"
                  value={formData.responsable}
                  onChange={(e) => handleInputChange('responsable', e.target.value)}
                  placeholder="Dr. García"
                />
                {errors.responsable && (
                  <p className="text-sm text-red-600">{errors.responsable}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la Baja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Información de la Baja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tipoBaja">Tipo de Baja *</Label>
                <Select
                  value={formData.tipoBaja}
                  onValueChange={(value) => handleInputChange('tipoBaja', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de baja" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposBaja.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoBaja && (
                  <p className="text-sm text-red-600">{errors.tipoBaja}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorRecuperable">Valor Recuperable Estimado</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="valorRecuperable"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valorRecuperable || ''}
                    onChange={(e) => handleInputChange('valorRecuperable', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
                {errors.valorRecuperable && (
                  <p className="text-sm text-red-600">{errors.valorRecuperable}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificacionTecnica">Justificación Técnica *</Label>
              <Textarea
                id="justificacionTecnica"
                value={formData.justificacionTecnica}
                onChange={(e) => handleInputChange('justificacionTecnica', e.target.value)}
                placeholder="Describa las razones técnicas que justifican la baja del equipo..."
                rows={4}
              />
              {errors.justificacionTecnica && (
                <p className="text-sm text-red-600">{errors.justificacionTecnica}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificacionEconomica">Justificación Económica</Label>
              <Textarea
                id="justificacionEconomica"
                value={formData.justificacionEconomica}
                onChange={(e) => handleInputChange('justificacionEconomica', e.target.value)}
                placeholder="Describa los aspectos económicos que justifican la baja (costos de mantenimiento, obsolescencia, etc.)..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones Adicionales</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                placeholder="Información adicional relevante..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documentos de Soporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Documentos de Soporte
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  Array.from(e.target.files || []).forEach(file => {
                    agregarDocumento(file)
                  })
                  e.target.value = ''
                }}
                className="hidden"
                id="file-upload"
              />
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Documento
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentos.length > 0 ? (
              <div className="space-y-3">
                {documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{doc.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.tamaño / 1024 / 1024).toFixed(2)} MB • {doc.tipo.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarDocumento(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No se han agregado documentos</p>
                <p className="text-sm">Adjunte informes técnicos, fotografías o documentos de soporte</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Repuestos Recuperables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Repuestos Recuperables
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRepuestoModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Repuesto
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {repuestos.length > 0 ? (
              <div className="space-y-3">
                {repuestos.map((repuesto) => (
                  <div key={repuesto.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{repuesto.nombre}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">
                            {repuesto.estado === 'funcional' ? 'Funcional' : 
                             repuesto.estado === 'requiere_reparacion' ? 'Requiere Reparación' : 'No Funcional'}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            ${repuesto.valorEstimado.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{repuesto.descripcion}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarRepuesto(repuesto.id)}
                      className="text-red-600 hover:text-red-700 ml-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No se han registrado repuestos recuperables</p>
                <p className="text-sm">Indique los repuestos que pueden ser recuperados y reutilizados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Modal de Repuesto */}
      <RepuestoModal
        open={showRepuestoModal}
        onClose={() => setShowRepuestoModal(false)}
        onSave={agregarRepuesto}
      />
    </div>
  )
}

// Componente Modal para Repuestos
function RepuestoModal({ 
  open, 
  onClose, 
  onSave 
}: { 
  open: boolean
  onClose: () => void
  onSave: (repuesto: Omit<RepuestoRecuperable, 'id'>) => void
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'funcional' as 'funcional' | 'requiere_reparacion' | 'no_funcional',
    valorEstimado: 0
  })

  const handleSubmit = () => {
    if (!formData.nombre || formData.valorEstimado <= 0) return
    
    onSave(formData)
    setFormData({
      nombre: '',
      descripcion: '',
      estado: 'funcional',
      valorEstimado: 0
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Repuesto Recuperable</DialogTitle>
          <DialogDescription>
            Registre información del repuesto que puede ser recuperado
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="repuesto-nombre">Nombre del Repuesto *</Label>
            <Input
              id="repuesto-nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Sensor de presión"
            />
          </div>
          
          <div>
            <Label htmlFor="repuesto-descripcion">Descripción</Label>
            <Textarea
              id="repuesto-descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción detallada del repuesto"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="repuesto-estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, estado: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funcional">Funcional</SelectItem>
                <SelectItem value="requiere_reparacion">Requiere Reparación</SelectItem>
                <SelectItem value="no_funcional">No Funcional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="repuesto-valor">Valor Estimado *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="repuesto-valor"
                type="number"
                min="0"
                step="0.01"
                value={formData.valorEstimado}
                onChange={(e) => setFormData(prev => ({ ...prev, valorEstimado: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}