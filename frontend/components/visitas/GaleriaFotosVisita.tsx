'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Camera, Upload, X, Eye, Download, Share, 
  Grid3X3, List, Filter, Search, Calendar,
  MapPin, User, Clock, Trash2, Edit, Plus,
  ZoomIn, ZoomOut, RotateCw, Maximize2,
  Tag, Star, Heart, MessageCircle, Send
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FotoVisita {
  id: number
  nombre: string
  url: string
  miniatura: string
  tamaño: number
  fecha_subida: string
  descripcion?: string
  etiquetas: string[]
  ubicacion?: {
    latitud: number
    longitud: number
  }
  metadata: {
    ancho: number
    alto: number
    formato: string
    camara?: string
  }
  favorita: boolean
  comentarios: ComentarioFoto[]
}

interface ComentarioFoto {
  id: number
  usuario: string
  comentario: string
  fecha: string
}

interface GaleriaProps {
  visitaId: number
  fotos?: FotoVisita[]
  readonly?: boolean
  onFotosChange?: (fotos: FotoVisita[]) => void
}

export default function GaleriaFotosVisita({ 
  visitaId, 
  fotos = [], 
  readonly = false,
  onFotosChange 
}: GaleriaProps) {
  const [fotosState, setFotosState] = useState<FotoVisita[]>(fotos)
  const [vistaActual, setVistaActual] = useState<'grid' | 'lista'>('grid')
  const [fotoSeleccionada, setFotoSeleccionada] = useState<FotoVisita | null>(null)
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [zoom, setZoom] = useState(100)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Etiquetas predefinidas para visitas
  const etiquetasPredefinidas = [
    'Antes', 'Después', 'Problema', 'Solución', 'Equipo', 'Instalación',
    'Mantenimiento', 'Reparación', 'Calibración', 'Documentación',
    'Serial', 'Placa', 'Estado', 'Daño', 'Repuesto', 'Herramienta'
  ]

  // Inicializar con fotos de demo si no hay fotos
  useEffect(() => {
    if (fotos.length === 0) {
      const fotosDemo: FotoVisita[] = [
        {
          id: 1,
          nombre: 'equipo_antes_mantenimiento.jpg',
          url: 'https://via.placeholder.com/800x600/e2e8f0/64748b?text=Equipo+Antes',
          miniatura: 'https://via.placeholder.com/200x150/e2e8f0/64748b?text=Equipo+Antes',
          tamaño: 245760,
          fecha_subida: new Date(Date.now() - 3600000).toISOString(),
          descripcion: 'Estado del equipo antes del mantenimiento preventivo',
          etiquetas: ['Antes', 'Equipo', 'Mantenimiento'],
          metadata: { ancho: 800, alto: 600, formato: 'JPEG', camara: 'iPhone 13' },
          favorita: true,
          comentarios: [
            {
              id: 1,
              usuario: 'Juan Pérez',
              comentario: 'Se observa acumulación de polvo en los filtros',
              fecha: new Date(Date.now() - 1800000).toISOString()
            }
          ]
        },
        {
          id: 2,
          nombre: 'serial_equipo.jpg',
          url: 'https://via.placeholder.com/800x600/fef3c7/d97706?text=Serial+EQ001234',
          miniatura: 'https://via.placeholder.com/200x150/fef3c7/d97706?text=Serial',
          tamaño: 156432,
          fecha_subida: new Date(Date.now() - 3000000).toISOString(),
          descripcion: 'Número de serie del equipo para identificación',
          etiquetas: ['Serial', 'Documentación', 'Equipo'],
          metadata: { ancho: 800, alto: 600, formato: 'JPEG' },
          favorita: false,
          comentarios: []
        },
        {
          id: 3,
          nombre: 'reparacion_completada.jpg',
          url: 'https://via.placeholder.com/800x600/d1fae5/059669?text=Reparaci%C3%B3n+OK',
          miniatura: 'https://via.placeholder.com/200x150/d1fae5/059669?text=Después',
          tamaño: 298765,
          fecha_subida: new Date(Date.now() - 900000).toISOString(),
          descripción: 'Equipo después de completar la reparación',
          etiquetas: ['Después', 'Reparación', 'Completado'],
          metadata: { ancho: 800, alto: 600, formato: 'JPEG' },
          favorita: true,
          comentarios: [
            {
              id: 2,
              usuario: 'María García',
              comentario: 'Excelente trabajo, equipo funcionando perfectamente',
              fecha: new Date(Date.now() - 300000).toISOString()
            }
          ]
        },
        {
          id: 4,
          nombre: 'instalacion_repuesto.jpg',
          url: 'https://via.placeholder.com/800x600/fce7f3/be185d?text=Repuesto+Nuevo',
          miniatura: 'https://via.placeholder.com/200x150/fce7f3/be185d?text=Repuesto',
          tamaño: 187654,
          fecha_subida: new Date(Date.now() - 1500000).toISOString(),
          descripcion: 'Instalación del nuevo repuesto',
          etiquetas: ['Repuesto', 'Instalación', 'Nuevo'],
          metadata: { ancho: 800, alto: 600, formato: 'JPEG' },
          favorita: false,
          comentarios: []
        }
      ]
      setFotosState(fotosDemo)
    } else {
      setFotosState(fotos)
    }
  }, [fotos])

  const handleFileUpload = async (files: FileList) => {
    if (readonly) return

    setSubiendo(true)
    const nuevasFotos: FotoVisita[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Simular subida de archivo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const nuevaFoto: FotoVisita = {
        id: Date.now() + i,
        nombre: file.name,
        url: URL.createObjectURL(file),
        miniatura: URL.createObjectURL(file),
        tamaño: file.size,
        fecha_subida: new Date().toISOString(),
        descripcion: '',
        etiquetas: [],
        metadata: {
          ancho: 800,
          alto: 600,
          formato: file.type.split('/')[1].toUpperCase()
        },
        favorita: false,
        comentarios: []
      }
      
      nuevasFotos.push(nuevaFoto)
    }

    const fotosActualizadas = [...fotosState, ...nuevasFotos]
    setFotosState(fotosActualizadas)
    onFotosChange?.(fotosActualizadas)
    setSubiendo(false)
  }

  const eliminarFoto = (fotoId: number) => {
    if (readonly) return
    
    const fotosActualizadas = fotosState.filter(foto => foto.id !== fotoId)
    setFotosState(fotosActualizadas)
    onFotosChange?.(fotosActualizadas)
    
    if (fotoSeleccionada?.id === fotoId) {
      setFotoSeleccionada(null)
    }
  }

  const toggleFavorita = (fotoId: number) => {
    if (readonly) return
    
    const fotosActualizadas = fotosState.map(foto => 
      foto.id === fotoId ? { ...foto, favorita: !foto.favorita } : foto
    )
    setFotosState(fotosActualizadas)
    onFotosChange?.(fotosActualizadas)
  }

  const actualizarDescripcion = (fotoId: number, descripcion: string) => {
    if (readonly) return
    
    const fotosActualizadas = fotosState.map(foto => 
      foto.id === fotoId ? { ...foto, descripcion } : foto
    )
    setFotosState(fotosActualizadas)
    onFotosChange?.(fotosActualizadas)
  }

  const agregarEtiqueta = (fotoId: number, etiqueta: string) => {
    if (readonly || !etiqueta.trim()) return
    
    const fotosActualizadas = fotosState.map(foto => 
      foto.id === fotoId && !foto.etiquetas.includes(etiqueta) 
        ? { ...foto, etiquetas: [...foto.etiquetas, etiqueta] } 
        : foto
    )
    setFotosState(fotosActualizadas)
    onFotosChange?.(fotosActualizadas)
  }

  const removerEtiqueta = (fotoId: number, etiqueta: string) => {
    if (readonly) return
    
    const fotosActualizadas = fotosState.map(foto => 
      foto.id === fotoId 
        ? { ...foto, etiquetas: foto.etiquetas.filter(e => e !== etiqueta) }
        : foto
    )
    setFotosState(fotosActualizadas)
    onFotosChange?.(fotosActualizadas)
  }

  const agregarComentario = (fotoId: number, comentario: string) => {
    if (!comentario.trim()) return
    
    const nuevoComentario: ComentarioFoto = {
      id: Date.now(),
      usuario: 'Usuario Actual',
      comentario: comentario.trim(),
      fecha: new Date().toISOString()
    }
    
    const fotosActualizadas = fotosState.map(foto => 
      foto.id === fotoId 
        ? { ...foto, comentarios: [...foto.comentarios, nuevoComentario] }
        : foto
    )
    setFotosState(fotosActualizadas)
    onFotosChange?.(fotosActualizadas)
  }

  const fotosFiltradas = fotosState.filter(foto => {
    const cumpleBusqueda = !busqueda || 
      foto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      foto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    
    const cumpleEtiqueta = !filtroEtiqueta || 
      foto.etiquetas.some(etiqueta => 
        etiqueta.toLowerCase().includes(filtroEtiqueta.toLowerCase())
      )
    
    return cumpleBusqueda && cumpleEtiqueta
  })

  const formatearTamaño = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES')
  }

  return (
    <div className="space-y-4">
      {/* Header y Controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Galería de Fotos - Visita #{visitaId}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {fotosState.length} foto(s) • {formatearTamaño(fotosState.reduce((total, foto) => total + foto.tamaño, 0))}
              </p>
            </div>

            <div className="flex gap-2">
              {!readonly && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={subiendo}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {subiendo ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Fotos
                      </>
                    )}
                  </Button>
                </>
              )}
              
              <div className="flex border rounded-lg">
                <Button
                  variant={vistaActual === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVistaActual('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={vistaActual === 'lista' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVistaActual('lista')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar fotos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Filtrar por etiqueta..."
                value={filtroEtiqueta}
                onChange={(e) => setFiltroEtiqueta(e.target.value)}
                className="pl-10 w-full sm:w-48"
              />
            </div>
          </div>

          {/* Etiquetas Rápidas */}
          <div className="flex flex-wrap gap-1 mt-2">
            {etiquetasPredefinidas.slice(0, 6).map(etiqueta => (
              <Button
                key={etiqueta}
                variant="outline"
                size="sm"
                onClick={() => setFiltroEtiqueta(etiqueta)}
                className="h-6 px-2 text-xs"
              >
                {etiqueta}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Galería */}
      <div className="space-y-4">
        {fotosFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {fotosState.length === 0 ? 'No hay fotos' : 'No se encontraron fotos'}
              </h3>
              <p className="text-gray-600 mb-4">
                {fotosState.length === 0 
                  ? 'Agrega fotos de la visita para documentar el trabajo realizado'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
              {!readonly && fotosState.length === 0 && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Primera Foto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {vistaActual === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {fotosFiltradas.map((foto) => (
                  <div key={foto.id} className="group relative">
                    <div className="relative overflow-hidden rounded-lg border bg-white">
                      <img
                        src={foto.miniatura}
                        alt={foto.nombre}
                        className="w-full h-32 object-cover transition-transform group-hover:scale-105 cursor-pointer"
                        onClick={() => setFotoSeleccionada(foto)}
                      />
                      
                      {/* Overlay con controles */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFotoSeleccionada(foto)}
                          className="text-white hover:bg-white/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!readonly && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFavorita(foto.id)}
                              className={`text-white hover:bg-white/20 ${foto.favorita ? 'text-yellow-400' : ''}`}
                            >
                              <Star className={`w-4 h-4 ${foto.favorita ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => eliminarFoto(foto.id)}
                              className="text-white hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Indicadores */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {foto.favorita && (
                          <div className="bg-yellow-500 text-white p-1 rounded">
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                        )}
                        {foto.comentarios.length > 0 && (
                          <div className="bg-blue-500 text-white p-1 rounded">
                            <MessageCircle className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info de la foto */}
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {foto.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatearTamaño(foto.tamaño)}
                      </p>
                      {foto.etiquetas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {foto.etiquetas.slice(0, 2).map(etiqueta => (
                            <Badge key={etiqueta} variant="secondary" className="text-xs px-1">
                              {etiqueta}
                            </Badge>
                          ))}
                          {foto.etiquetas.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1">
                              +{foto.etiquetas.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {fotosFiltradas.map((foto) => (
                      <div key={foto.id} className="p-4 hover:bg-gray-50">
                        <div className="flex gap-4">
                          <img
                            src={foto.miniatura}
                            alt={foto.nombre}
                            className="w-16 h-16 object-cover rounded border cursor-pointer"
                            onClick={() => setFotoSeleccionada(foto)}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 truncate">
                                  {foto.nombre}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {foto.descripcion || 'Sin descripción'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                  <span>{formatearTamaño(foto.tamaño)}</span>
                                  <span>{foto.metadata.ancho} × {foto.metadata.alto}</span>
                                  <span>{formatearFecha(foto.fecha_subida)}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-1 ml-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setFotoSeleccionada(foto)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {!readonly && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleFavorita(foto.id)}
                                      className={foto.favorita ? 'text-yellow-500' : ''}
                                    >
                                      <Star className={`w-4 h-4 ${foto.favorita ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => eliminarFoto(foto.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {foto.etiquetas.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {foto.etiquetas.map(etiqueta => (
                                  <Badge key={etiqueta} variant="secondary" className="text-xs">
                                    {etiqueta}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modal de Foto Seleccionada */}
      {fotoSeleccionada && (
        <FotoModal
          foto={fotoSeleccionada}
          readonly={readonly}
          onClose={() => setFotoSeleccionada(null)}
          onActualizar={(fotoActualizada) => {
            const fotosActualizadas = fotosState.map(foto => 
              foto.id === fotoActualizada.id ? fotoActualizada : foto
            )
            setFotosState(fotosActualizadas)
            onFotosChange?.(fotosActualizadas)
            setFotoSeleccionada(fotoActualizada)
          }}
          etiquetasPredefinidas={etiquetasPredefinidas}
        />
      )}
    </div>
  )
}

// Componente Modal para vista detallada de foto
interface FotoModalProps {
  foto: FotoVisita
  readonly: boolean
  onClose: () => void
  onActualizar: (foto: FotoVisita) => void
  etiquetasPredefinidas: string[]
}

function FotoModal({ foto, readonly, onClose, onActualizar, etiquetasPredefinidas }: FotoModalProps) {
  const [descripcionLocal, setDescripcionLocal] = useState(foto.descripcion || '')
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('')
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [zoom, setZoom] = useState(100)

  const guardarDescripcion = () => {
    onActualizar({ ...foto, descripcion: descripcionLocal })
  }

  const agregarEtiqueta = (etiqueta: string) => {
    if (!etiqueta.trim() || foto.etiquetas.includes(etiqueta)) return
    onActualizar({ ...foto, etiquetas: [...foto.etiquetas, etiqueta] })
    setNuevaEtiqueta('')
  }

  const removerEtiqueta = (etiqueta: string) => {
    onActualizar({ 
      ...foto, 
      etiquetas: foto.etiquetas.filter(e => e !== etiqueta) 
    })
  }

  const agregarComentario = () => {
    if (!nuevoComentario.trim()) return
    
    const comentario: ComentarioFoto = {
      id: Date.now(),
      usuario: 'Usuario Actual',
      comentario: nuevoComentario.trim(),
      fecha: new Date().toISOString()
    }
    
    onActualizar({ 
      ...foto, 
      comentarios: [...foto.comentarios, comentario] 
    })
    setNuevoComentario('')
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES')
  }

  const formatearTamaño = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{foto.nombre}</span>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = foto.url
                  link.download = foto.nombre
                  link.click()
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Imagen Principal */}
          <div className="lg:col-span-2">
            <div className="relative border rounded-lg overflow-hidden bg-gray-100">
              <img
                src={foto.url}
                alt={foto.nombre}
                className="w-full h-auto max-h-[60vh] object-contain"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
              />
              
              {/* Controles de Zoom */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border p-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs min-w-[3rem] text-center">{zoom}%</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoom(100)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Detalles */}
          <div className="space-y-4">
            <Tabs defaultValue="detalles" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detalles">Detalles</TabsTrigger>
                <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
                <TabsTrigger value="comentarios">
                  Comentarios {foto.comentarios.length > 0 && `(${foto.comentarios.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="detalles">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Descripción</Label>
                    <Textarea
                      value={descripcionLocal}
                      onChange={(e) => setDescripcionLocal(e.target.value)}
                      onBlur={guardarDescripcion}
                      placeholder="Agregar descripción..."
                      className="mt-1"
                      readOnly={readonly}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Tamaño</Label>
                      <p>{formatearTamaño(foto.tamaño)}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Dimensiones</Label>
                      <p>{foto.metadata.ancho} × {foto.metadata.alto}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Formato</Label>
                      <p>{foto.metadata.formato}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Fecha</Label>
                      <p>{formatearFecha(foto.fecha_subida)}</p>
                    </div>
                  </div>

                  {foto.metadata.camara && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Cámara</Label>
                      <p className="text-sm">{foto.metadata.camara}</p>
                    </div>
                  )}

                  {foto.ubicacion && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Ubicación</Label>
                      <p className="text-sm">
                        {foto.ubicacion.latitud.toFixed(6)}, {foto.ubicacion.longitud.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="etiquetas">
                <div className="space-y-4">
                  {!readonly && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nueva etiqueta..."
                          value={nuevaEtiqueta}
                          onChange={(e) => setNuevaEtiqueta(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && agregarEtiqueta(nuevaEtiqueta)}
                        />
                        <Button 
                          onClick={() => agregarEtiqueta(nuevaEtiqueta)}
                          disabled={!nuevaEtiqueta.trim()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {etiquetasPredefinidas.filter(e => !foto.etiquetas.includes(e)).slice(0, 6).map(etiqueta => (
                          <Button
                            key={etiqueta}
                            variant="outline"
                            size="sm"
                            onClick={() => agregarEtiqueta(etiqueta)}
                            className="h-6 px-2 text-xs"
                          >
                            {etiqueta}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Etiquetas actuales</Label>
                    <div className="flex flex-wrap gap-2">
                      {foto.etiquetas.map(etiqueta => (
                        <Badge 
                          key={etiqueta} 
                          variant="secondary" 
                          className="flex items-center gap-1"
                        >
                          {etiqueta}
                          {!readonly && (
                            <button
                              onClick={() => removerEtiqueta(etiqueta)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                      {foto.etiquetas.length === 0 && (
                        <p className="text-sm text-gray-500">Sin etiquetas</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comentarios">
                <div className="space-y-4">
                  {!readonly && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Agregar comentario..."
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <Button 
                          onClick={agregarComentario}
                          disabled={!nuevoComentario.trim()}
                          className="self-end"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {foto.comentarios.map(comentario => (
                      <div key={comentario.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comentario.usuario}</span>
                          <span className="text-xs text-gray-500">
                            {formatearFecha(comentario.fecha)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comentario.comentario}</p>
                      </div>
                    ))}
                    {foto.comentarios.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Sin comentarios
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}