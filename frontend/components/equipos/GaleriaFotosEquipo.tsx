'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Camera, 
  Image as ImageIcon, 
  Upload, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Filter,
  Calendar,
  Tag,
  FileImage,
  Grid3X3,
  List,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin
} from 'lucide-react';

interface FotoEquipo {
  id: number;
  equipoId: number;
  nombre: string;
  descripcion: string;
  url: string;
  fechaCaptura: string;
  tecnicoId: number;
  tecnicoNombre: string;
  tipo: 'estado_inicial' | 'mantenimiento' | 'reparacion' | 'incidente' | 'instalacion';
  etiquetas: string[];
  ubicacion?: {
    lat: number;
    lng: number;
    descripcion: string;
  };
  metadatos: {
    tamaño: number;
    resolucion: string;
    formato: string;
    dispositivo?: string;
  };
  anotaciones?: {
    x: number;
    y: number;
    texto: string;
    color: string;
  }[];
}

interface GaleriaFotosEquipoProps {
  equipoId: number;
  equipoNombre: string;
  equipoSerie: string;
  modoVisualizacion?: 'galeria' | 'lista' | 'timeline';
  onFotoUpload?: (foto: FotoEquipo) => void;
}

export default function GaleriaFotosEquipo({
  equipoId,
  equipoNombre,
  equipoSerie,
  modoVisualizacion = 'galeria',
  onFotoUpload
}: GaleriaFotosEquipoProps) {
  const [fotos, setFotos] = useState<FotoEquipo[]>([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<FotoEquipo | null>(null);
  const [vistaActual, setVistaActual] = useState<'galeria' | 'visor' | 'upload'>('galeria');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Estados del visor de fotos
  const [zoom, setZoom] = useState(1);
  const [rotacion, setRotacion] = useState(0);
  const [anotaciones, setAnotaciones] = useState<any[]>([]);
  const [modoAnotacion, setModoAnotacion] = useState(false);

  // Datos demo
  const fotosDemo: FotoEquipo[] = [
    {
      id: 1,
      equipoId: equipoId,
      nombre: 'Estado inicial - Instalación',
      descripcion: 'Foto del equipo recién instalado en UCI',
      url: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Ventilador+Instalado',
      fechaCaptura: '2024-11-01T10:30:00Z',
      tecnicoId: 1,
      tecnicoNombre: 'Carlos Mendoza',
      tipo: 'instalacion',
      etiquetas: ['instalacion', 'uci', 'inicial'],
      ubicacion: {
        lat: -33.4569,
        lng: -70.6483,
        descripcion: 'UCI Adultos - Cama 12'
      },
      metadatos: {
        tamaño: 2.4,
        resolucion: '1920x1080',
        formato: 'JPG',
        dispositivo: 'iPhone 14 Pro'
      }
    },
    {
      id: 2,
      equipoId: equipoId,
      nombre: 'Mantenimiento preventivo - Panel frontal',
      descripcion: 'Inspección del panel de control durante mantenimiento',
      url: 'https://via.placeholder.com/800x600/059669/FFFFFF?text=Panel+Control',
      fechaCaptura: '2024-11-10T14:15:00Z',
      tecnicoId: 2,
      tecnicoNombre: 'Ana García',
      tipo: 'mantenimiento',
      etiquetas: ['mantenimiento', 'panel', 'controles'],
      metadatos: {
        tamaño: 3.2,
        resolucion: '2048x1536',
        formato: 'JPG',
        dispositivo: 'Samsung Galaxy S23'
      },
      anotaciones: [
        { x: 200, y: 150, texto: 'Display funcionando correctamente', color: '#10B981' },
        { x: 400, y: 300, texto: 'Botones de alarma OK', color: '#3B82F6' }
      ]
    },
    {
      id: 3,
      equipoId: equipoId,
      nombre: 'Reparación - Filtro reemplazado',
      descripcion: 'Filtro HEPA después del reemplazo',
      url: 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Filtro+Nuevo',
      fechaCaptura: '2024-11-15T09:45:00Z',
      tecnicoId: 1,
      tecnicoNombre: 'Carlos Mendoza',
      tipo: 'reparacion',
      etiquetas: ['reparacion', 'filtro', 'hepa'],
      metadatos: {
        tamaño: 1.8,
        resolucion: '1600x1200',
        formato: 'JPG'
      }
    },
    {
      id: 4,
      equipoId: equipoId,
      nombre: 'Incidente - Derrame de líquido',
      descripcion: 'Documentación de incidente con derrame',
      url: 'https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Incidente+Documentado',
      fechaCaptura: '2024-11-16T16:20:00Z',
      tecnicoId: 3,
      tecnicoNombre: 'Laura Ruiz',
      tipo: 'incidente',
      etiquetas: ['incidente', 'derrame', 'limpieza'],
      metadatos: {
        tamaño: 2.1,
        resolucion: '1920x1080',
        formato: 'JPG'
      }
    }
  ];

  useEffect(() => {
    setFotos(fotosDemo);
  }, [equipoId]);

  const tiposIconos = {
    estado_inicial: '📋',
    mantenimiento: '🔧',
    reparacion: '⚙️',
    incidente: '⚠️',
    instalacion: '🏥'
  };

  const tiposColores = {
    estado_inicial: 'bg-blue-500',
    mantenimiento: 'bg-green-500',
    reparacion: 'bg-orange-500',
    incidente: 'bg-red-500',
    instalacion: 'bg-purple-500'
  };

  const fotosFiltradas = fotos.filter(foto => {
    const matchTipo = filtroTipo === 'todos' || foto.tipo === filtroTipo;
    const matchFecha = !filtroFecha || foto.fechaCaptura.includes(filtroFecha);
    const matchBusqueda = !busqueda || 
      foto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      foto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      foto.etiquetas.some(etiqueta => etiqueta.toLowerCase().includes(busqueda.toLowerCase()));
    
    return matchTipo && matchFecha && matchBusqueda;
  });

  const handleUploadFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Simular upload de foto
    const nuevaFoto: FotoEquipo = {
      id: Date.now(),
      equipoId: equipoId,
      nombre: `Nueva foto - ${new Date().toLocaleDateString()}`,
      descripcion: 'Foto subida por el usuario',
      url: URL.createObjectURL(files[0]),
      fechaCaptura: new Date().toISOString(),
      tecnicoId: 1,
      tecnicoNombre: 'Usuario Actual',
      tipo: 'estado_inicial',
      etiquetas: ['nueva', 'upload'],
      metadatos: {
        tamaño: files[0].size / (1024 * 1024), // MB
        resolucion: '1920x1080',
        formato: files[0].type.split('/')[1].toUpperCase()
      }
    };

    setFotos([nuevaFoto, ...fotos]);
    onFotoUpload?.(nuevaFoto);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // **VISTA: GALERÍA PRINCIPAL**
  if (vistaActual === 'galeria') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-purple-600" />
                  Galería de Fotos - {equipoNombre}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  {equipoSerie} • {fotosFiltradas.length} fotos encontradas
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" onClick={() => setVistaActual('upload')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Subir Foto
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Controles y Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar fotos por nombre, descripción o etiquetas..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="instalacion">Instalación</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="reparacion">Reparación</option>
                  <option value="incidente">Incidente</option>
                  <option value="estado_inicial">Estado Inicial</option>
                </select>
                
                <Input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(tiposIconos).map(([tipo, icono]) => {
            const cantidad = fotos.filter(f => f.tipo === tipo).length;
            return (
              <Card key={tipo}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{icono}</div>
                  <div className="text-2xl font-bold">{cantidad}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {tipo.replace('_', ' ')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Galería de Fotos */}
        {fotosFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fotosFiltradas.map((foto) => (
              <Card key={foto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={foto.url}
                    alt={foto.nombre}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => {
                      setFotoSeleccionada(foto);
                      setVistaActual('visor');
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${tiposColores[foto.tipo]} text-white`}>
                      {tiposIconos[foto.tipo]} {foto.tipo.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button size="sm" variant="outline" className="bg-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 truncate">{foto.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {foto.descripcion}
                  </p>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {formatearFecha(foto.fechaCaptura)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      {foto.tecnicoNombre}
                    </div>
                    {foto.ubicacion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {foto.ubicacion.descripcion}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {foto.etiquetas.slice(0, 3).map((etiqueta) => (
                      <Badge key={etiqueta} variant="outline" className="text-xs">
                        {etiqueta}
                      </Badge>
                    ))}
                    {foto.etiquetas.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{foto.etiquetas.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No se encontraron fotos
              </h3>
              <p className="text-gray-500 mb-4">
                No hay fotos que coincidan con los filtros aplicados
              </p>
              <Button onClick={() => setVistaActual('upload')}>
                <Plus className="w-4 h-4 mr-2" />
                Subir Primera Foto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // **VISTA: VISOR DE FOTO**
  if (vistaActual === 'visor' && fotoSeleccionada) {
    return (
      <div className="space-y-6">
        {/* Header del visor */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVistaActual('galeria')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Volver a Galería
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotacion((rotacion + 90) % 360)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModoAnotacion(!modoAnotacion)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visor principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-gray-100 overflow-hidden" style={{ height: '600px' }}>
                  <img
                    src={fotoSeleccionada.url}
                    alt={fotoSeleccionada.nombre}
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotacion}deg)`,
                      transformOrigin: 'center'
                    }}
                  />
                  
                  {/* Anotaciones */}
                  {fotoSeleccionada.anotaciones?.map((anotacion, index) => (
                    <div
                      key={index}
                      className="absolute bg-white px-2 py-1 rounded shadow-lg text-sm border-l-4"
                      style={{
                        left: anotacion.x,
                        top: anotacion.y,
                        borderColor: anotacion.color,
                        transform: `scale(${zoom}) rotate(${rotacion}deg)`,
                        transformOrigin: 'top left'
                      }}
                    >
                      {anotacion.texto}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de información */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de la Foto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="font-medium">{fotoSeleccionada.nombre}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-sm">{fotoSeleccionada.descripcion}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <div className="mt-1">
                    <Badge className={`${tiposColores[fotoSeleccionada.tipo]} text-white`}>
                      {tiposIconos[fotoSeleccionada.tipo]} {fotoSeleccionada.tipo.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha</label>
                  <p className="text-sm">{formatearFecha(fotoSeleccionada.fechaCaptura)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Técnico</label>
                  <p className="text-sm">{fotoSeleccionada.tecnicoNombre}</p>
                </div>
                
                {fotoSeleccionada.ubicacion && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ubicación</label>
                    <p className="text-sm">{fotoSeleccionada.ubicacion.descripcion}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metadatos Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tamaño:</span>
                  <span>{fotoSeleccionada.metadatos.tamaño.toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolución:</span>
                  <span>{fotoSeleccionada.metadatos.resolucion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Formato:</span>
                  <span>{fotoSeleccionada.metadatos.formato}</span>
                </div>
                {fotoSeleccionada.metadatos.dispositivo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dispositivo:</span>
                    <span>{fotoSeleccionada.metadatos.dispositivo}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {fotoSeleccionada.etiquetas.map((etiqueta) => (
                    <Badge key={etiqueta} variant="outline">
                      {etiqueta}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // **VISTA: SUBIR FOTO**
  if (vistaActual === 'upload') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-blue-600" />
                Subir Nueva Foto
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setVistaActual('galeria')}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Área de drop */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Subir Foto del Equipo</h3>
              <p className="text-gray-600 mb-4">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFoto}
                className="hidden"
                id="foto-upload"
              />
              <label htmlFor="foto-upload">
                <Button className="cursor-pointer">
                  <FileImage className="w-4 h-4 mr-2" />
                  Seleccionar Archivo
                </Button>
              </label>
            </div>

            {/* Formulario de metadatos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre de la foto
                </label>
                <Input placeholder="Ej: Mantenimiento preventivo - Panel frontal" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo de foto
                </label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option value="estado_inicial">Estado Inicial</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="reparacion">Reparación</option>
                  <option value="incidente">Incidente</option>
                  <option value="instalacion">Instalación</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <Textarea 
                placeholder="Describe qué muestra la foto y su propósito..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Etiquetas (separadas por comas)
              </label>
              <Input placeholder="mantenimiento, filtro, limpieza" />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Guardar Foto
              </Button>
              <Button variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Tomar Foto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}