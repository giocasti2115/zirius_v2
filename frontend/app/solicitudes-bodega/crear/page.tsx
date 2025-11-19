'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Search,
  AlertTriangle,
  Package,
  User,
  Building,
  Wrench,
  Calculator,
  CheckCircle
} from 'lucide-react'
import solicitudesBodegaService, { 
  SolicitudBodega, 
  RepuestoSolicitud,
  ItemAdicional 
} from '@/lib/services/solicitudes-bodega.service'
import { cn } from '@/lib/utils'

interface FormularioSolicitud {
  cliente: string
  sede: string
  equipo: string
  idEquipo: number | null
  servicio: string
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  tipo: 'repuestos' | 'materiales' | 'herramientas' | 'equipos'
  observaciones: string
  repuestos: RepuestoSolicitud[]
  itemsAdicionales: ItemAdicional[]
}

const PRIORIDADES = [
  { value: 'baja', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'media', label: 'Media', color: 'bg-blue-100 text-blue-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
]

const TIPOS_SOLICITUD = [
  { value: 'repuestos', label: 'Repuestos', icon: Package },
  { value: 'materiales', label: 'Materiales', icon: Package },
  { value: 'herramientas', label: 'Herramientas', icon: Wrench },
  { value: 'equipos', label: 'Equipos', icon: Package }
]

const SERVICIOS = [
  'Correctivo',
  'Preventivo',
  'Instalación',
  'Calibración',
  'Reubicación',
  'Mantenimiento'
]

export default function CrearSolicitudPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [currentProductType, setCurrentProductType] = useState<'repuesto' | 'item'>('repuesto')
  
  const [formulario, setFormulario] = useState<FormularioSolicitud>({
    cliente: '',
    sede: '',
    equipo: '',
    idEquipo: null,
    servicio: '',
    prioridad: 'media',
    tipo: 'repuestos',
    observaciones: '',
    repuestos: [],
    itemsAdicionales: []
  })

  const [nuevoProducto, setNuevoProducto] = useState({
    descripcion: '',
    cantidad: 1,
    valorUnitario: 0,
    sumaCliente: ''
  })

  // Clientes de ejemplo (en producción vendríamos de la BD)
  const clientesEjemplo = [
    'SURA EPS',
    'COOMEVA EPS', 
    'NUEVA EPS',
    'SANITAS EPS',
    'FAMISANAR EPS',
    'COMPENSAR EPS'
  ]

  const sedesEjemplo = [
    'Hospital San Vicente',
    'Clínica Los Remedios',
    'Hospital Militar',
    'Centro Médico Norte',
    'Clínica Santa Fe',
    'IPS Salud Sura'
  ]

  const equiposEjemplo = [
    { id: 12345, nombre: 'Monitor de Signos Vitales', serie: 'MSV-2024-001' },
    { id: 12346, nombre: 'Ventilador Mecánico', serie: 'VM-2024-002' },
    { id: 12347, nombre: 'Bomba de Infusión', serie: 'BI-2024-003' },
    { id: 12348, nombre: 'Electrocardiografo', serie: 'ECG-2024-004' },
    { id: 12349, nombre: 'Desfibrilador', serie: 'DEF-2024-005' }
  ]

  const handleInputChange = (field: keyof FormularioSolicitud, value: any) => {
    setFormulario(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEquipoSelect = (equipoNombre: string) => {
    const equipo = equiposEjemplo.find(e => e.nombre === equipoNombre)
    setFormulario(prev => ({
      ...prev,
      equipo: equipoNombre,
      idEquipo: equipo?.id || null
    }))
  }

  const calcularValorTotal = (cantidad: number, valorUnitario: number): number => {
    return cantidad * valorUnitario
  }

  const agregarProducto = () => {
    if (!nuevoProducto.descripcion || nuevoProducto.cantidad <= 0) {
      setError('Por favor complete todos los campos del producto')
      return
    }

    const valorTotal = calcularValorTotal(nuevoProducto.cantidad, nuevoProducto.valorUnitario)
    
    const producto = {
      ...nuevoProducto,
      valorTotal,
      sumaCliente: valorTotal.toString()
    }

    if (currentProductType === 'repuesto') {
      setFormulario(prev => ({
        ...prev,
        repuestos: [...prev.repuestos, producto]
      }))
    } else {
      setFormulario(prev => ({
        ...prev,
        itemsAdicionales: [...prev.itemsAdicionales, producto]
      }))
    }

    // Reset form
    setNuevoProducto({
      descripcion: '',
      cantidad: 1,
      valorUnitario: 0,
      sumaCliente: ''
    })
    setShowProductModal(false)
    setError(null)
  }

  const eliminarRepuesto = (index: number) => {
    setFormulario(prev => ({
      ...prev,
      repuestos: prev.repuestos.filter((_, i) => i !== index)
    }))
  }

  const eliminarItemAdicional = (index: number) => {
    setFormulario(prev => ({
      ...prev,
      itemsAdicionales: prev.itemsAdicionales.filter((_, i) => i !== index)
    }))
  }

  const calcularValorTotalSolicitud = (): number => {
    const valorRepuestos = formulario.repuestos.reduce((sum, r) => sum + (r.valorTotal || 0), 0)
    const valorItems = formulario.itemsAdicionales.reduce((sum, i) => sum + (i.valorTotal || 0), 0)
    return valorRepuestos + valorItems
  }

  const validarFormulario = (): boolean => {
    if (!formulario.cliente || !formulario.sede || !formulario.equipo || !formulario.servicio) {
      setError('Por favor complete todos los campos obligatorios')
      return false
    }

    if (formulario.repuestos.length === 0 && formulario.itemsAdicionales.length === 0) {
      setError('Debe agregar al menos un repuesto o item adicional')
      return false
    }

    return true
  }

  const crearSolicitud = async () => {
    if (!validarFormulario()) return

    try {
      setLoading(true)
      setError(null)

      const nuevaSolicitud: Partial<SolicitudBodega> = {
        cliente: formulario.cliente,
        sede: formulario.sede,
        equipo: formulario.equipo,
        idEquipo: formulario.idEquipo || 0,
        servicio: formulario.servicio,
        prioridad: formulario.prioridad,
        tipo: formulario.tipo,
        observaciones: formulario.observaciones,
        valorTotal: calcularValorTotalSolicitud(),
        estado: 'Pendiente',
        creador: 'Usuario Actual', // En producción obtener del contexto de auth
        repuestos: formulario.repuestos,
        itemsAdicionales: formulario.itemsAdicionales,
        creacion: new Date().toISOString()
      }

      await solicitudesBodegaService.crearSolicitud(nuevaSolicitud)
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/solicitudes-bodega')
      }, 2000)
    } catch (err) {
      console.error('Error creando solicitud:', err)
      setError('Error al crear la solicitud. Por favor intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Solicitud Creada Exitosamente!
            </h2>
            <p className="text-gray-600 mb-4">
              Su solicitud ha sido enviada y está pendiente de aprobación.
            </p>
            <div className="text-sm text-gray-500">
              Redirigiendo automáticamente...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud de Bodega</h1>
            <p className="text-gray-600 mt-2">
              Complete el formulario para crear una nueva solicitud
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Select value={formulario.cliente} onValueChange={(value) => handleInputChange('cliente', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientesEjemplo.map(cliente => (
                        <SelectItem key={cliente} value={cliente}>
                          {cliente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sede">Sede *</Label>
                  <Select value={formulario.sede} onValueChange={(value) => handleInputChange('sede', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {sedesEjemplo.map(sede => (
                        <SelectItem key={sede} value={sede}>
                          {sede}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="equipo">Equipo *</Label>
                  <Select value={formulario.equipo} onValueChange={handleEquipoSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equiposEjemplo.map(equipo => (
                        <SelectItem key={equipo.id} value={equipo.nombre}>
                          {equipo.nombre} - {equipo.serie}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="servicio">Tipo de Servicio *</Label>
                  <Select value={formulario.servicio} onValueChange={(value) => handleInputChange('servicio', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICIOS.map(servicio => (
                        <SelectItem key={servicio} value={servicio}>
                          {servicio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prioridad">Prioridad</Label>
                  <Select value={formulario.prioridad} onValueChange={(value) => handleInputChange('prioridad', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES.map(prioridad => (
                        <SelectItem key={prioridad.value} value={prioridad.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("border", prioridad.color)}>
                              {prioridad.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo de Solicitud</Label>
                  <Select value={formulario.tipo} onValueChange={(value) => handleInputChange('tipo', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_SOLICITUD.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center gap-2">
                            <tipo.icon className="h-4 w-4" />
                            {tipo.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones adicionales sobre la solicitud..."
                  value={formulario.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Repuestos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Repuestos Solicitados
                </CardTitle>
                <Dialog open={showProductModal && currentProductType === 'repuesto'} onOpenChange={(open) => {
                  if (open) {
                    setCurrentProductType('repuesto')
                    setShowProductModal(true)
                  } else {
                    setShowProductModal(false)
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Repuesto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Repuesto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="descripcion">Descripción *</Label>
                        <Input
                          id="descripcion"
                          placeholder="Descripción del repuesto"
                          value={nuevoProducto.descripcion}
                          onChange={(e) => setNuevoProducto(prev => ({ ...prev, descripcion: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cantidad">Cantidad *</Label>
                          <Input
                            id="cantidad"
                            type="number"
                            min="1"
                            value={nuevoProducto.cantidad}
                            onChange={(e) => setNuevoProducto(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="valorUnitario">Valor Unitario</Label>
                          <Input
                            id="valorUnitario"
                            type="number"
                            min="0"
                            value={nuevoProducto.valorUnitario}
                            onChange={(e) => setNuevoProducto(prev => ({ ...prev, valorUnitario: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Valor Total</Label>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(calcularValorTotal(nuevoProducto.cantidad, nuevoProducto.valorUnitario))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowProductModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={agregarProducto}>
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {formulario.repuestos.length > 0 ? (
                <div className="space-y-2">
                  {formulario.repuestos.map((repuesto, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{repuesto.descripcion}</div>
                        <div className="text-sm text-gray-600">
                          Cantidad: {repuesto.cantidad} | Valor Unit: {formatCurrency(repuesto.valorUnitario)} | 
                          Total: {formatCurrency(repuesto.valorTotal || 0)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarRepuesto(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay repuestos agregados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Adicionales */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Items Adicionales
                </CardTitle>
                <Dialog open={showProductModal && currentProductType === 'item'} onOpenChange={(open) => {
                  if (open) {
                    setCurrentProductType('item')
                    setShowProductModal(true)
                  } else {
                    setShowProductModal(false)
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Item Adicional</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="descripcion">Descripción *</Label>
                        <Input
                          id="descripcion"
                          placeholder="Descripción del item"
                          value={nuevoProducto.descripcion}
                          onChange={(e) => setNuevoProducto(prev => ({ ...prev, descripcion: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cantidad">Cantidad *</Label>
                          <Input
                            id="cantidad"
                            type="number"
                            min="1"
                            value={nuevoProducto.cantidad}
                            onChange={(e) => setNuevoProducto(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="valorUnitario">Valor Unitario</Label>
                          <Input
                            id="valorUnitario"
                            type="number"
                            min="0"
                            value={nuevoProducto.valorUnitario}
                            onChange={(e) => setNuevoProducto(prev => ({ ...prev, valorUnitario: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Valor Total</Label>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(calcularValorTotal(nuevoProducto.cantidad, nuevoProducto.valorUnitario))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowProductModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={agregarProducto}>
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {formulario.itemsAdicionales.length > 0 ? (
                <div className="space-y-2">
                  {formulario.itemsAdicionales.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.descripcion}</div>
                        <div className="text-sm text-gray-600">
                          Cantidad: {item.cantidad} | Valor Unit: {formatCurrency(item.valorUnitario)} | 
                          Total: {formatCurrency(item.valorTotal || 0)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarItemAdicional(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay items adicionales agregados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral - Resumen */}
        <div className="space-y-6">
          {/* Resumen de la Solicitud */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen de Solicitud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Repuestos:</span>
                  <span>{formulario.repuestos.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Items adicionales:</span>
                  <span>{formulario.itemsAdicionales.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor total:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(calcularValorTotalSolicitud())}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div><strong>Cliente:</strong> {formulario.cliente || 'No seleccionado'}</div>
                  <div><strong>Sede:</strong> {formulario.sede || 'No seleccionada'}</div>
                  <div><strong>Equipo:</strong> {formulario.equipo || 'No seleccionado'}</div>
                  <div><strong>Servicio:</strong> {formulario.servicio || 'No seleccionado'}</div>
                  <div className="flex items-center gap-2">
                    <strong>Prioridad:</strong>
                    <Badge className={cn("border", PRIORIDADES.find(p => p.value === formulario.prioridad)?.color)}>
                      {PRIORIDADES.find(p => p.value === formulario.prioridad)?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700" 
                onClick={crearSolicitud}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Solicitud
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}