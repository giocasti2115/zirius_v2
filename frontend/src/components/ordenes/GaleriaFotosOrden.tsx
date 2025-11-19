'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, Image, Tag, MessageSquare, ZoomIn, Download, Trash2, Eye, Calendar, User, MapPin, Wrench } from 'lucide-react'

// Tipos para manejo de fotos de órdenes
interface FotoOrden {
  id: number
  orden_id: number
  nombre_archivo: string
  url: string
  tipo: 'inicial' | 'progreso' | 'final' | 'evidencia' | 'problema'
  categoria: 'equipo' | 'reparacion' | 'instalacion' | 'ambiente' | 'documentacion'
  etiquetas: string[]
  descripcion: string
  metadata: {
    fecha_captura: string
    tecnico: string
    ubicacion?: {
      latitud: number
      longitud: number
    }
    condiciones_equipo: string
    fase_trabajo: string
    tamano_archivo: number
    resolucion: string
    dispositivo: string
  }
  comentarios: ComentarioFoto[]
}

interface ComentarioFoto {
  id: number
  autor: string
  fecha: string
  contenido: string
  tipo: 'observacion' | 'pregunta' | 'aprobacion' | 'rechazo'
}

interface OrdenServicio {
  id: number
  numero_orden: string
  cliente: string
  equipo: string
  tipo_servicio: string
  estado: string
}

export default function GaleriaFotosOrden() {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenServicio | null>(null)
  const [fotos, setFotos] = useState<FotoOrden[]>([])
  const [fotoSeleccionada, setFotoSeleccionada] = useState<FotoOrden | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [vistaModal, setVistaModal] = useState(false)
  const [nuevaFoto, setNuevaFoto] = useState<Partial<FotoOrden>>({})
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [nuevoComentario, setNuevoComentario] = useState('')

  // Órdenes simuladas
  const ordenesDisponibles: OrdenServicio[] = [
    {
      id: 1,
      numero_orden: 'OS-2024-001',
      cliente: 'Hospital San Rafael',
      equipo: 'Resonancia Magnética Siemens',
      tipo_servicio: 'mantenimiento',
      estado: 'en_progreso'
    },
    {
      id: 2,
      numero_orden: 'OS-2024-002',
      cliente: 'Clínica Bolivariana',
      equipo: 'TAC GE Healthcare',
      tipo_servicio: 'reparacion',
      estado: 'completada'
    },
    {
      id: 3,
      numero_orden: 'OS-2024-003',
      cliente: 'Centro Médico Imbanaco',
      equipo: 'Ecógrafo Philips',
      tipo_servicio: 'instalacion',
      estado: 'en_progreso'
    }
  ]

  // Fotos simuladas
  useEffect(() => {
    if (ordenSeleccionada) {
      const fotosSimuladas: FotoOrden[] = [
        {
          id: 1,
          orden_id: ordenSeleccionada.id,
          nombre_archivo: `estado_inicial_${ordenSeleccionada.numero_orden}.jpg`,
          url: '/placeholder-medical-equipment.jpg',
          tipo: 'inicial',
          categoria: 'equipo',
          etiquetas: ['estado-inicial', 'equipo-completo', 'panel-control'],
          descripcion: 'Estado inicial del equipo antes del mantenimiento. Se observa funcionamiento normal con todos los indicadores en verde.',
          metadata: {
            fecha_captura: new Date(Date.now() - 3600000).toISOString(),
            tecnico: 'Carlos Mendoza',
            ubicacion: {
              latitud: 6.2518,
              longitud: -75.5636
            },
            condiciones_equipo: 'Operativo',
            fase_trabajo: 'Pre-mantenimiento',
            tamano_archivo: 2456789,
            resolucion: '1920x1080',
            dispositivo: 'iPhone 14 Pro'
          },
          comentarios: [
            {
              id: 1,
              autor: 'Carlos Mendoza',
              fecha: new Date(Date.now() - 3500000).toISOString(),
              contenido: 'Equipo en condiciones normales de operación, todos los sistemas respondiendo correctamente.',
              tipo: 'observacion'
            }
          ]
        },
        {
          id: 2,
          orden_id: ordenSeleccionada.id,
          nombre_archivo: `proceso_mantenimiento_${ordenSeleccionada.numero_orden}.jpg`,
          url: '/placeholder-maintenance-work.jpg',
          tipo: 'progreso',
          categoria: 'reparacion',
          etiquetas: ['mantenimiento', 'limpieza', 'calibracion'],
          descripcion: 'Proceso de limpieza y calibración de los sensores principales. Se realiza limpieza profunda de componentes críticos.',
          metadata: {
            fecha_captura: new Date(Date.now() - 1800000).toISOString(),
            tecnico: 'Carlos Mendoza',
            condiciones_equipo: 'En mantenimiento',
            fase_trabajo: 'Mantenimiento activo',
            tamano_archivo: 3245678,
            resolucion: '1920x1080',
            dispositivo: 'iPhone 14 Pro'
          },
          comentarios: [
            {
              id: 2,
              autor: 'María García',
              fecha: new Date(Date.now() - 1700000).toISOString(),
              contenido: '¿Se realizó la calibración completa de todos los sensores?',
              tipo: 'pregunta'
            },
            {
              id: 3,
              autor: 'Carlos Mendoza',
              fecha: new Date(Date.now() - 1600000).toISOString(),
              contenido: 'Sí, calibración completa realizada según protocolo del fabricante.',
              tipo: 'observacion'
            }
          ]
        },
        {
          id: 3,
          orden_id: ordenSeleccionada.id,
          nombre_archivo: `resultado_final_${ordenSeleccionada.numero_orden}.jpg`,
          url: '/placeholder-final-result.jpg',
          tipo: 'final',
          categoria: 'documentacion',
          etiquetas: ['resultado-final', 'equipo-operativo', 'certificacion'],
          descripcion: 'Estado final del equipo después del mantenimiento. Todos los sistemas funcionando correctamente, certificación completada.',
          metadata: {
            fecha_captura: new Date().toISOString(),
            tecnico: 'Carlos Mendoza',
            condiciones_equipo: 'Operativo certificado',
            fase_trabajo: 'Post-mantenimiento',
            tamano_archivo: 2789123,
            resolucion: '1920x1080',
            dispositivo: 'iPhone 14 Pro'
          },
          comentarios: [
            {
              id: 4,
              autor: 'Supervisor Técnico',
              fecha: new Date(Date.now() - 300000).toISOString(),
              contenido: 'Trabajo excelente, equipo certificado para operación normal.',
              tipo: 'aprobacion'
            }
          ]
        },
        {
          id: 4,
          orden_id: ordenSeleccionada.id,
          nombre_archivo: `evidencia_problema_${ordenSeleccionada.numero_orden}.jpg`,
          url: '/placeholder-problem-evidence.jpg',
          tipo: 'evidencia',
          categoria: 'problema',
          etiquetas: ['evidencia', 'desgaste', 'componente-critico'],
          descripcion: 'Evidencia de desgaste en componente crítico que requiere reemplazo en próxima visita programada.',
          metadata: {
            fecha_captura: new Date(Date.now() - 900000).toISOString(),
            tecnico: 'Carlos Mendoza',
            condiciones_equipo: 'Requiere seguimiento',
            fase_trabajo: 'Inspección detallada',
            tamano_archivo: 1987654,
            resolucion: '1920x1080',
            dispositivo: 'iPhone 14 Pro'
          },
          comentarios: [
            {
              id: 5,
              autor: 'Carlos Mendoza',
              fecha: new Date(Date.now() - 850000).toISOString(),
              contenido: 'Componente con desgaste significativo, recomendar reemplazo en próximos 30 días.',
              tipo: 'observacion'
            }
          ]
        }
      ]
      setFotos(fotosSimuladas)
    }
  }, [ordenSeleccionada])

  // Filtrar fotos
  const fotosFiltradas = fotos.filter(foto => {
    const coincideTipo = filtroTipo === 'todos' || foto.tipo === filtroTipo
    const coincideCategoria = filtroCategoria === 'todos' || foto.categoria === filtroCategoria
    return coincideTipo && coincideCategoria
  })

  // Manejar subida de nueva foto
  const manejarSubidaFoto = async () => {
    if (!archivoSeleccionado || !ordenSeleccionada) return

    const nuevaFotoCompleta: FotoOrden = {
      id: fotos.length + 1,
      orden_id: ordenSeleccionada.id,
      nombre_archivo: archivoSeleccionado.name,
      url: URL.createObjectURL(archivoSeleccionado),
      tipo: (nuevaFoto.tipo as FotoOrden['tipo']) || 'progreso',
      categoria: (nuevaFoto.categoria as FotoOrden['categoria']) || 'equipo',
      etiquetas: nuevaFoto.etiquetas || [],
      descripcion: nuevaFoto.descripcion || '',
      metadata: {
        fecha_captura: new Date().toISOString(),
        tecnico: 'Usuario Actual',
        condiciones_equipo: nuevaFoto.metadata?.condiciones_equipo || 'En revisión',
        fase_trabajo: nuevaFoto.metadata?.fase_trabajo || 'Documentación',
        tamano_archivo: archivoSeleccionado.size,
        resolucion: '1920x1080',
        dispositivo: 'Navegador Web'
      },
      comentarios: []
    }

    setFotos(prev => [...prev, nuevaFotoCompleta])
    setArchivoSeleccionado(null)
    setNuevaFoto({})
  }

  // Agregar comentario
  const agregarComentario = (fotoId: number) => {
    if (!nuevoComentario.trim()) return

    const comentario: ComentarioFoto = {
      id: Date.now(),
      autor: 'Usuario Actual',
      fecha: new Date().toISOString(),
      contenido: nuevoComentario,
      tipo: 'observacion'
    }

    setFotos(prev => prev.map(foto => 
      foto.id === fotoId 
        ? { ...foto, comentarios: [...foto.comentarios, comentario] }
        : foto
    ))

    setNuevoComentario('')
  }

  // Obtener color para tipo de foto
  const obtenerColorTipo = (tipo: string) => {
    const colores = {
      'inicial': 'bg-blue-100 text-blue-800',
      'progreso': 'bg-yellow-100 text-yellow-800',
      'final': 'bg-green-100 text-green-800',
      'evidencia': 'bg-red-100 text-red-800',
      'problema': 'bg-orange-100 text-orange-800'
    }
    return colores[tipo] || 'bg-gray-100 text-gray-800'
  }

  // Obtener icono para categoría
  const obtenerIconoCategoria = (categoria: string) => {
    const iconos = {
      'equipo': <Wrench className="h-4 w-4" />,
      'reparacion': <Camera className="h-4 w-4" />,
      'instalacion': <Upload className="h-4 w-4" />,
      'ambiente': <MapPin className="h-4 w-4" />,
      'documentacion': <Image className="h-4 w-4" />
    }
    return iconos[categoria] || <Image className="h-4 w-4" />
  }

  // Formatear tamaño de archivo
  const formatearTamano = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Galería de Fotos - Órdenes de Servicio</h1>
          <p className="text-gray-600">Documentación visual de trabajos y evidencias técnicas</p>
        </div>
      </div>

      {/* Selección de orden */}
      {!ordenSeleccionada && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Orden de Servicio</CardTitle>
            <CardDescription>Elija la orden para ver y gestionar sus fotos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ordenesDisponibles.map(orden => (
                <Card 
                  key={orden.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setOrdenSeleccionada(orden)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{orden.numero_orden}</CardTitle>
                    <CardDescription>{orden.cliente}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Wrench className="h-4 w-4" />
                        <span>{orden.equipo}</span>
                      </div>
                      <Badge className="text-xs">
                        {orden.tipo_servicio}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panel principal con orden seleccionada */}
      {ordenSeleccionada && (
        <>
          {/* Información de la orden */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    {ordenSeleccionada.numero_orden} - {ordenSeleccionada.cliente}
                  </CardTitle>
                  <CardDescription>{ordenSeleccionada.equipo}</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setOrdenSeleccionada(null)}
                >
                  Cambiar Orden
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Controles y filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Fotos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    <SelectItem value="inicial">Inicial</SelectItem>
                    <SelectItem value="progreso">Progreso</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="evidencia">Evidencia</SelectItem>
                    <SelectItem value="problema">Problema</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las categorías</SelectItem>
                    <SelectItem value="equipo">Equipo</SelectItem>
                    <SelectItem value="reparacion">Reparación</SelectItem>
                    <SelectItem value="instalacion">Instalación</SelectItem>
                    <SelectItem value="ambiente">Ambiente</SelectItem>
                    <SelectItem value="documentacion">Documentación</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Nueva Foto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Subir Nueva Foto</DialogTitle>
                      <DialogDescription>
                        Agregue una nueva foto con descripción y metadatos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Archivo de Imagen</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setArchivoSeleccionado(e.target.files?.[0] || null)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Tipo</label>
                          <Select 
                            value={nuevaFoto.tipo} 
                            onValueChange={(value) => setNuevaFoto(prev => ({ ...prev, tipo: value as FotoOrden['tipo'] }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inicial">Inicial</SelectItem>
                              <SelectItem value="progreso">Progreso</SelectItem>
                              <SelectItem value="final">Final</SelectItem>
                              <SelectItem value="evidencia">Evidencia</SelectItem>
                              <SelectItem value="problema">Problema</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Categoría</label>
                          <Select 
                            value={nuevaFoto.categoria} 
                            onValueChange={(value) => setNuevaFoto(prev => ({ ...prev, categoria: value as FotoOrden['categoria'] }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equipo">Equipo</SelectItem>
                              <SelectItem value="reparacion">Reparación</SelectItem>
                              <SelectItem value="instalacion">Instalación</SelectItem>
                              <SelectItem value="ambiente">Ambiente</SelectItem>
                              <SelectItem value="documentacion">Documentación</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Descripción</label>
                        <Textarea
                          placeholder="Describa el contenido y propósito de la foto..."
                          value={nuevaFoto.descripcion || ''}
                          onChange={(e) => setNuevaFoto(prev => ({ ...prev, descripcion: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Etiquetas (separadas por comas)</label>
                        <Input
                          placeholder="etiqueta1, etiqueta2, etiqueta3"
                          onChange={(e) => setNuevaFoto(prev => ({ 
                            ...prev, 
                            etiquetas: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                          }))}
                        />
                      </div>

                      <Button 
                        onClick={manejarSubidaFoto}
                        disabled={!archivoSeleccionado}
                        className="w-full"
                      >
                        Subir Foto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Total de fotos: {fotos.length}</span>
                <span>Filtradas: {fotosFiltradas.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Galería de fotos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fotosFiltradas.map((foto) => (
              <Card key={foto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {obtenerIconoCategoria(foto.categoria)}
                      <Badge className={`text-xs ${obtenerColorTipo(foto.tipo)}`}>
                        {foto.tipo}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setFotoSeleccionada(foto)
                        setVistaModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="text-gray-400 text-center">
                      <Image className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Vista previa de imagen</p>
                      <p className="text-xs">{foto.nombre_archivo}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium line-clamp-2">
                      {foto.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(foto.metadata.fecha_captura).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{foto.metadata.tecnico}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      <span>{formatearTamano(foto.metadata.tamano_archivo)}</span>
                    </div>
                  </div>
                  
                  {foto.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {foto.etiquetas.slice(0, 3).map((etiqueta, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {etiqueta}
                        </Badge>
                      ))}
                      {foto.etiquetas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{foto.etiquetas.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      {foto.comentarios.length} comentarios
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Modal de vista detallada */}
          <Dialog open={vistaModal} onOpenChange={setVistaModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {fotoSeleccionada && (
                <div className="space-y-6">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {obtenerIconoCategoria(fotoSeleccionada.categoria)}
                      {fotoSeleccionada.nombre_archivo}
                    </DialogTitle>
                    <DialogDescription>
                      {new Date(fotoSeleccionada.metadata.fecha_captura).toLocaleString()} - {fotoSeleccionada.metadata.tecnico}
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="imagen" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="imagen">Imagen</TabsTrigger>
                      <TabsTrigger value="detalles">Detalles</TabsTrigger>
                      <TabsTrigger value="comentarios">Comentarios ({fotoSeleccionada.comentarios.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="imagen" className="space-y-4">
                      <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                        <div className="text-center text-gray-500">
                          <ZoomIn className="h-16 w-16 mx-auto mb-4" />
                          <p>Vista ampliada de la imagen</p>
                          <p className="text-sm mt-2">{fotoSeleccionada.metadata.resolucion}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{fotoSeleccionada.descripcion}</p>
                    </TabsContent>
                    
                    <TabsContent value="detalles" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Información General</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Tipo:</strong> <Badge className={obtenerColorTipo(fotoSeleccionada.tipo)}>{fotoSeleccionada.tipo}</Badge></div>
                            <div><strong>Categoría:</strong> {fotoSeleccionada.categoria}</div>
                            <div><strong>Condiciones Equipo:</strong> {fotoSeleccionada.metadata.condiciones_equipo}</div>
                            <div><strong>Fase de Trabajo:</strong> {fotoSeleccionada.metadata.fase_trabajo}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Metadatos Técnicos</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Tamaño:</strong> {formatearTamano(fotoSeleccionada.metadata.tamano_archivo)}</div>
                            <div><strong>Resolución:</strong> {fotoSeleccionada.metadata.resolucion}</div>
                            <div><strong>Dispositivo:</strong> {fotoSeleccionada.metadata.dispositivo}</div>
                            {fotoSeleccionada.metadata.ubicacion && (
                              <div><strong>GPS:</strong> {fotoSeleccionada.metadata.ubicacion.latitud.toFixed(6)}, {fotoSeleccionada.metadata.ubicacion.longitud.toFixed(6)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {fotoSeleccionada.etiquetas.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Etiquetas</h4>
                          <div className="flex flex-wrap gap-2">
                            {fotoSeleccionada.etiquetas.map((etiqueta, index) => (
                              <Badge key={index} variant="outline">
                                <Tag className="h-3 w-3 mr-1" />
                                {etiqueta}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="comentarios" className="space-y-4">
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {fotoSeleccionada.comentarios.map((comentario) => (
                          <div key={comentario.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{comentario.autor}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comentario.fecha).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comentario.contenido}</p>
                            <Badge variant="outline" className="text-xs mt-2">
                              {comentario.tipo}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Agregar comentario..."
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            className="flex-1"
                            rows={2}
                          />
                          <Button 
                            onClick={() => agregarComentario(fotoSeleccionada.id)}
                            disabled={!nuevoComentario.trim()}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}