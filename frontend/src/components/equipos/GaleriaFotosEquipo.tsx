'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Edit3, 
  Save, 
  Trash2,
  Calendar,
  User,
  MapPin,
  Tag,
  FileText,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye
} from 'lucide-react';

interface FotoEquipo {
  id: string;
  url: string;
  thumbnail: string;
  nombre: string;
  tipo: 'instalacion' | 'estado' | 'dano' | 'reparacion' | 'calibracion' | 'limpieza' | 'certificado';
  fecha: string;
  usuario: {
    id: number;
    nombre: string;
    role: string;
  };
  ubicacion?: {
    lat: number;
    lng: number;
    direccion: string;
  };
  metadata: {
    equipoId: number;
    equipoNombre: string;
    equipoSerie: string;
    mantenimientoId?: string;
    ordenTrabajoId?: string;
    dimensiones: {
      width: number;
      height: number;
    };
    tamano: number; // en bytes
    formato: string;
    calidad: number; // 1-100
  };
  anotaciones?: Array<{
    id: string;
    x: number; // porcentaje
    y: number; // porcentaje
    tipo: 'problema' | 'mejora' | 'info' | 'critico';
    titulo: string;
    descripcion: string;
    usuario: string;
    fecha: string;
  }>;
  tags: string[];
  observaciones?: string;
  esPublica: boolean;
  versionAnterior?: string; // ID de foto anterior para comparaciones
}

interface GaleriaFotosEquipoProps {
  equipoId: number;
  equipoNombre: string;
  equipoSerie: string;
  mantenimientoId?: string;
  onFotoUpload?: (foto: FotoEquipo) => void;
  modoVisualizacion?: 'galeria' | 'timeline' | 'comparacion';
  soloLectura?: boolean;
}

const GaleriaFotosEquipo: React.FC<GaleriaFotosEquipoProps> = ({
  equipoId,
  equipoNombre,
  equipoSerie,
  mantenimientoId,
  onFotoUpload,
  modoVisualizacion = 'galeria',
  soloLectura = false
}) => {
  const [fotos, setFotos] = useState<FotoEquipo[]>([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<FotoEquipo | null>(null);
  const [mostrarViewer, setMostrarViewer] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('todos');
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const [editandoAnotaciones, setEditandoAnotaciones] = useState(false);
  const [nuevaAnotacion, setNuevaAnotacion] = useState<{x: number, y: number} | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotacion, setRotacion] = useState(0);
  const [comparandoFotos, setComparandoFotos] = useState<FotoEquipo[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Tipos de foto disponibles
  const tiposFoto = [
    { value: 'instalacion', label: 'Instalación', color: 'bg-blue-500', icon: '🔧' },
    { value: 'estado', label: 'Estado General', color: 'bg-green-500', icon: '📋' },
    { value: 'dano', label: 'Daño/Problema', color: 'bg-red-500', icon: '⚠️' },
    { value: 'reparacion', label: 'Reparación', color: 'bg-yellow-500', icon: '🔨' },
    { value: 'calibracion', label: 'Calibración', color: 'bg-purple-500', icon: '⚖️' },
    { value: 'limpieza', label: 'Limpieza', color: 'bg-cyan-500', icon: '🧽' },
    { value: 'certificado', label: 'Certificado', color: 'bg-indigo-500', icon: '📜' }
  ];

  // Cargar fotos demo
  useEffect(() => {
    const fotosDemo: FotoEquipo[] = [
      {
        id: 'foto1',
        url: '/api/fotos/equipo1_instalacion.jpg',
        thumbnail: '/api/fotos/thumbs/equipo1_instalacion.jpg',
        nombre: 'Instalación Inicial',
        tipo: 'instalacion',
        fecha: '2024-01-15T10:30:00Z',
        usuario: { id: 1, nombre: 'Ing. García', role: 'Técnico Senior' },
        ubicacion: {
          lat: -34.6037,
          lng: -58.3816,
          direccion: 'UCI Adultos - Sala 3'
        },
        metadata: {
          equipoId,
          equipoNombre,
          equipoSerie,
          mantenimientoId: 'MANT-2024-001',
          dimensiones: { width: 1920, height: 1080 },
          tamano: 2456789,
          formato: 'JPEG',
          calidad: 95
        },
        tags: ['instalacion', 'ventilador', 'uci'],
        observaciones: 'Instalación completada según protocolo. Equipo posicionado correctamente.',
        esPublica: true,
        anotaciones: [
          {
            id: 'ann1',
            x: 25,
            y: 30,
            tipo: 'info',
            titulo: 'Panel de Control',
            descripcion: 'Panel principal operativo y calibrado',
            usuario: 'Ing. García',
            fecha: '2024-01-15T10:35:00Z'
          }
        ]
      },
      {
        id: 'foto2',
        url: '/api/fotos/equipo1_mantenimiento.jpg',
        thumbnail: '/api/fotos/thumbs/equipo1_mantenimiento.jpg',
        nombre: 'Mantenimiento Preventivo',
        tipo: 'estado',
        fecha: '2024-02-15T14:20:00Z',
        usuario: { id: 2, nombre: 'Téc. Rodriguez', role: 'Técnico' },
        metadata: {
          equipoId,
          equipoNombre,
          equipoSerie,
          mantenimientoId: 'MANT-2024-015',
          dimensiones: { width: 1920, height: 1080 },
          tamano: 1856432,
          formato: 'JPEG',
          calidad: 90
        },
        tags: ['mantenimiento', 'filtros', 'limpieza'],
        observaciones: 'Estado general excelente. Filtros reemplazados.',
        esPublica: true,
        versionAnterior: 'foto1'
      },
      {
        id: 'foto3',
        url: '/api/fotos/equipo1_problema.jpg',
        thumbnail: '/api/fotos/thumbs/equipo1_problema.jpg',
        nombre: 'Problema en Sensor',
        tipo: 'dano',
        fecha: '2024-03-10T09:15:00Z',
        usuario: { id: 1, nombre: 'Ing. García', role: 'Técnico Senior' },
        metadata: {
          equipoId,
          equipoNombre,
          equipoSerie,
          ordenTrabajoId: 'OT-2024-089',
          dimensiones: { width: 1920, height: 1080 },
          tamano: 2145678,
          formato: 'JPEG',
          calidad: 100
        },
        tags: ['problema', 'sensor', 'urgente'],
        observaciones: 'Sensor de presión mostrando lecturas inconsistentes.',
        esPublica: false,
        anotaciones: [
          {
            id: 'ann2',
            x: 60,
            y: 45,
            tipo: 'critico',
            titulo: 'Sensor Defectuoso',
            descripcion: 'Sensor de presión requiere reemplazo inmediato',
            usuario: 'Ing. García',
            fecha: '2024-03-10T09:20:00Z'
          }
        ]
      }
    ];

    setFotos(fotosDemo);
  }, [equipoId, equipoNombre, equipoSerie]);

  // Manejar carga de archivos
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        procesarFoto(file);
      }
    });
  }, []);

  // Procesar foto subida
  const procesarFoto = useCallback((file: File) => {
    setCargandoFoto(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          // Crear thumbnail
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxThumbnailSize = 200;
          const ratio = Math.min(maxThumbnailSize / img.width, maxThumbnailSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          
          const nuevaFoto: FotoEquipo = {
            id: `foto_${Date.now()}`,
            url: e.target.result as string,
            thumbnail,
            nombre: file.name.replace(/\.[^/.]+$/, ""),
            tipo: 'estado',
            fecha: new Date().toISOString(),
            usuario: { id: 1, nombre: 'Usuario Actual', role: 'Técnico' },
            metadata: {
              equipoId,
              equipoNombre,
              equipoSerie,
              mantenimientoId,
              dimensiones: { width: img.width, height: img.height },
              tamano: file.size,
              formato: file.type.split('/')[1].toUpperCase(),
              calidad: 90
            },
            tags: [],
            observaciones: '',
            esPublica: true
          };
          
          setFotos(prev => [nuevaFoto, ...prev]);
          if (onFotoUpload) {
            onFotoUpload(nuevaFoto);
          }
          setCargandoFoto(false);
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }, [equipoId, equipoNombre, equipoSerie, mantenimientoId, onFotoUpload]);

  // Filtrar fotos
  const fotosFiltradas = fotos.filter(foto => {
    if (filtroTipo !== 'todos' && foto.tipo !== filtroTipo) return false;
    
    if (filtroFecha !== 'todos') {
      const fechaFoto = new Date(foto.fecha);
      const ahora = new Date();
      
      switch (filtroFecha) {
        case 'hoy':
          return fechaFoto.toDateString() === ahora.toDateString();
        case 'semana':
          const semanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
          return fechaFoto >= semanaAtras;
        case 'mes':
          const mesAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
          return fechaFoto >= mesAtras;
        default:
          return true;
      }
    }
    
    return true;
  });

  // Abrir visor de foto
  const abrirViewer = (foto: FotoEquipo) => {
    setFotoSeleccionada(foto);
    setMostrarViewer(true);
    setZoom(1);
    setRotacion(0);
  };

  // Cerrar visor
  const cerrarViewer = () => {
    setMostrarViewer(false);
    setFotoSeleccionada(null);
    setEditandoAnotaciones(false);
    setNuevaAnotacion(null);
  };

  // Manejar click para nueva anotación
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!editandoAnotaciones || !fotoSeleccionada) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    setNuevaAnotacion({ x, y });
  };

  // Guardar nueva anotación
  const guardarAnotacion = (titulo: string, descripcion: string, tipo: string) => {
    if (!fotoSeleccionada || !nuevaAnotacion) return;
    
    const anotacion = {
      id: `ann_${Date.now()}`,
      x: nuevaAnotacion.x,
      y: nuevaAnotacion.y,
      tipo: tipo as any,
      titulo,
      descripcion,
      usuario: 'Usuario Actual',
      fecha: new Date().toISOString()
    };
    
    const fotosActualizadas = fotos.map(foto => 
      foto.id === fotoSeleccionada.id 
        ? { ...foto, anotaciones: [...(foto.anotaciones || []), anotacion] }
        : foto
    );
    
    setFotos(fotosActualizadas);
    setFotoSeleccionada({
      ...fotoSeleccionada,
      anotaciones: [...(fotoSeleccionada.anotaciones || []), anotacion]
    });
    setNuevaAnotacion(null);
  };

  // Formatear tamaño de archivo
  const formatearTamano = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener estadísticas
  const estadisticas = {
    total: fotos.length,
    porTipo: tiposFoto.map(tipo => ({
      tipo: tipo.value,
      cantidad: fotos.filter(f => f.tipo === tipo.value).length,
      label: tipo.label
    })),
    tamanosTotal: fotos.reduce((total, foto) => total + foto.metadata.tamano, 0),
    conAnotaciones: fotos.filter(f => f.anotaciones && f.anotaciones.length > 0).length
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Camera className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Galería de Fotos - {equipoNombre}
              </h3>
              <p className="text-gray-600">Serie: {equipoSerie}</p>
            </div>
          </div>

          {/* Controles de carga */}
          {!soloLectura && (
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={cargandoFoto}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{cargandoFoto ? 'Subiendo...' : 'Subir Fotos'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Fotos</p>
                <p className="text-xl font-bold text-blue-700">{estadisticas.total}</p>
              </div>
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Con Anotaciones</p>
                <p className="text-xl font-bold text-green-700">{estadisticas.conAnotaciones}</p>
              </div>
              <Edit3 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Almacenamiento</p>
                <p className="text-lg font-bold text-purple-700">
                  {formatearTamano(estadisticas.tamanosTotal)}
                </p>
              </div>
              <Save className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Problemas</p>
                <p className="text-xl font-bold text-yellow-700">
                  {fotos.filter(f => f.tipo === 'dano').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Foto
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los tipos</option>
                {tiposFoto.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.icon} {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas las fechas</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Mostrando {fotosFiltradas.length} de {fotos.length} fotos
          </div>
        </div>
      </div>

      {/* Galería */}
      <div className="p-6">
        {fotosFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No hay fotos para mostrar
            </h4>
            <p className="text-gray-600 mb-4">
              {fotos.length === 0 
                ? 'Sube la primera foto de este equipo'
                : 'Ajusta los filtros para ver más fotos'
              }
            </p>
            {!soloLectura && fotos.length === 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Subir Primera Foto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotosFiltradas.map((foto) => {
              const tipoFoto = tiposFoto.find(t => t.value === foto.tipo);
              return (
                <div
                  key={foto.id}
                  className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => abrirViewer(foto)}
                >
                  {/* Preview de imagen */}
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={foto.thumbnail}
                      alt={foto.nombre}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay con info */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Badge de tipo */}
                    <div className={`absolute top-2 left-2 ${tipoFoto?.color} text-white px-2 py-1 rounded text-xs font-medium`}>
                      {tipoFoto?.icon} {tipoFoto?.label}
                    </div>

                    {/* Indicador de anotaciones */}
                    {foto.anotaciones && foto.anotaciones.length > 0 && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {foto.anotaciones.length}
                      </div>
                    )}

                    {/* Indicador de privacidad */}
                    {!foto.esPublica && (
                      <div className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full p-1">
                        <Eye className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Info de la foto */}
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                      {foto.nombre}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(foto.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{foto.usuario.nombre}</span>
                    </div>
                    {foto.observaciones && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {foto.observaciones}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visor de fotos modal */}
      {mostrarViewer && fotoSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="w-full h-full max-w-7xl mx-auto p-4 flex">
            {/* Panel izquierdo - Imagen */}
            <div className="flex-1 flex items-center justify-center relative">
              <div
                ref={viewerRef}
                className="relative max-w-full max-h-full"
                style={{
                  transform: `scale(${zoom}) rotate(${rotacion}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              >
                <img
                  src={fotoSeleccionada.url}
                  alt={fotoSeleccionada.nombre}
                  className="max-w-full max-h-full object-contain cursor-crosshair"
                  onClick={handleImageClick}
                />
                
                {/* Anotaciones */}
                {fotoSeleccionada.anotaciones?.map((anotacion) => (
                  <div
                    key={anotacion.id}
                    className={`absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                      anotacion.tipo === 'critico' ? 'bg-red-500' :
                      anotacion.tipo === 'problema' ? 'bg-yellow-500' :
                      anotacion.tipo === 'mejora' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                    style={{
                      left: `${anotacion.x}%`,
                      top: `${anotacion.y}%`
                    }}
                    title={`${anotacion.titulo}: ${anotacion.descripcion}`}
                  />
                ))}

                {/* Nueva anotación en progreso */}
                {nuevaAnotacion && (
                  <div
                    className="absolute w-4 h-4 rounded-full bg-blue-500 border-2 border-white transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                    style={{
                      left: `${nuevaAnotacion.x}%`,
                      top: `${nuevaAnotacion.y}%`
                    }}
                  />
                )}
              </div>

              {/* Controles de imagen overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-full px-4 py-2">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  
                  <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
                  
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  
                  <div className="w-px h-6 bg-gray-600"></div>
                  
                  <button
                    onClick={() => setRotacion((rotacion + 90) % 360)}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setEditandoAnotaciones(!editandoAnotaciones)}
                    className={`transition-colors ${
                      editandoAnotaciones ? 'text-blue-400' : 'text-white hover:text-blue-400'
                    }`}
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Panel derecho - Información */}
            <div className="w-80 bg-white h-full overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Información de Foto
                  </h3>
                  <button
                    onClick={cerrarViewer}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Información básica */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{fotoSeleccionada.nombre}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(fotoSeleccionada.fecha).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{fotoSeleccionada.usuario.nombre}</span>
                      </div>
                      {fotoSeleccionada.ubicacion && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{fotoSeleccionada.ubicacion.direccion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata técnica */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Metadata Técnica</h5>
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                      <div>Resolución: {fotoSeleccionada.metadata.dimensiones.width} × {fotoSeleccionada.metadata.dimensiones.height}</div>
                      <div>Formato: {fotoSeleccionada.metadata.formato}</div>
                      <div>Tamaño: {formatearTamano(fotoSeleccionada.metadata.tamano)}</div>
                      <div>Calidad: {fotoSeleccionada.metadata.calidad}%</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {fotoSeleccionada.tags.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Tags</h5>
                      <div className="flex flex-wrap gap-2">
                        {fotoSeleccionada.tags.map((tag, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observaciones */}
                  {fotoSeleccionada.observaciones && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Observaciones</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {fotoSeleccionada.observaciones}
                      </p>
                    </div>
                  )}

                  {/* Anotaciones */}
                  {fotoSeleccionada.anotaciones && fotoSeleccionada.anotaciones.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Anotaciones ({fotoSeleccionada.anotaciones.length})
                      </h5>
                      <div className="space-y-3">
                        {fotoSeleccionada.anotaciones.map((anotacion) => (
                          <div key={anotacion.id} className="border border-gray-200 rounded p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`w-3 h-3 rounded-full ${
                                anotacion.tipo === 'critico' ? 'bg-red-500' :
                                anotacion.tipo === 'problema' ? 'bg-yellow-500' :
                                anotacion.tipo === 'mejora' ? 'bg-blue-500' :
                                'bg-green-500'
                              }`} />
                              <span className="font-medium text-sm">{anotacion.titulo}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{anotacion.descripcion}</p>
                            <div className="text-xs text-gray-500">
                              {anotacion.usuario} - {new Date(anotacion.fecha).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nueva anotación */}
                  {nuevaAnotacion && (
                    <div className="border-2 border-blue-300 rounded p-4 bg-blue-50">
                      <h5 className="font-medium text-blue-900 mb-3">Nueva Anotación</h5>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        guardarAnotacion(
                          formData.get('titulo') as string,
                          formData.get('descripcion') as string,
                          formData.get('tipo') as string
                        );
                      }}>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo
                            </label>
                            <select name="tipo" className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                              <option value="info">Información</option>
                              <option value="problema">Problema</option>
                              <option value="mejora">Mejora</option>
                              <option value="critico">Crítico</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Título
                            </label>
                            <input
                              name="titulo"
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="Título de la anotación"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción
                            </label>
                            <textarea
                              name="descripcion"
                              rows={3}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="Descripción detallada..."
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center space-x-1"
                            >
                              <Save className="w-4 h-4" />
                              <span>Guardar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setNuevaAnotacion(null)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaFotosEquipo;