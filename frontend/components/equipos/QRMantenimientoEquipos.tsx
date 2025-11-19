'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Wrench,
  MapPin,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Save,
  X,
  Play,
  Square,
  CheckSquare,
  Settings
} from 'lucide-react';

interface Checkpoint {
  id: number;
  nombre: string;
  descripcion: string;
  requerido: boolean;
  tipo: 'visual' | 'medicion' | 'prueba' | 'limpieza';
  completado: boolean;
  observaciones?: string;
  medicion?: {
    valor: number;
    unidad: string;
    min?: number;
    max?: number;
  };
}

interface MantenimientoSesion {
  id: string;
  equipoId: number;
  equipoNombre: string;
  equipoCodigo: string;
  tecnicoId: number;
  tecnicoNombre: string;
  tipo: 'preventivo' | 'correctivo' | 'calibracion';
  estado: 'iniciado' | 'en_progreso' | 'completado' | 'suspendido';
  fechaInicio: string;
  fechaFin?: string;
  ubicacionInicio: { lat: number; lng: number };
  checkpoints: Checkpoint[];
  observacionesGenerales: string;
  tiempoEstimado: number; // minutos
  tiempoReal?: number; // minutos
}

interface QRMantenimientoEquiposProps {
  modoDemo?: boolean;
  onMantenimientoComplete?: (data: MantenimientoSesion) => void;
}

export default function QRMantenimientoEquipos({ 
  modoDemo = false,
  onMantenimientoComplete 
}: QRMantenimientoEquiposProps) {
  const [modoActual, setModoActual] = useState<'scanner' | 'mantenimiento' | 'completado'>('scanner');
  const [sesionActual, setSesionActual] = useState<MantenimientoSesion | null>(null);
  const [checkpointActual, setCheckpointActual] = useState<number>(0);
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);
  const [ubicacionActual, setUbicacionActual] = useState<{ lat: number; lng: number } | null>(null);
  
  // Estados del scanner QR
  const [escanerActivo, setEscanerActivo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock data para modo demo
  const equipoDemo = {
    id: 1,
    nombre: 'Ventilador Draeger V500',
    codigo: 'VEN001',
    qrCode: 'QR_VEN001_MANT_2024'
  };

  const checkpointsDemo: Checkpoint[] = [
    {
      id: 1,
      nombre: 'Inspección Visual Exterior',
      descripcion: 'Verificar estado general, cables, conexiones y carcasa',
      requerido: true,
      tipo: 'visual',
      completado: false
    },
    {
      id: 2,
      nombre: 'Prueba de Calibración',
      descripcion: 'Verificar precisión de volúmenes y presiones',
      requerido: true,
      tipo: 'medicion',
      completado: false,
      medicion: { valor: 0, unidad: 'cmH2O', min: 10, max: 50 }
    },
    {
      id: 3,
      nombre: 'Limpieza de Filtros',
      descripcion: 'Limpiar y reemplazar filtros según protocolo',
      requerido: true,
      tipo: 'limpieza',
      completado: false
    },
    {
      id: 4,
      nombre: 'Prueba Funcional',
      descripcion: 'Ejecutar ciclo completo de funcionamiento',
      requerido: true,
      tipo: 'prueba',
      completado: false
    },
    {
      id: 5,
      nombre: 'Verificación de Alarmas',
      descripcion: 'Probar todas las alarmas de seguridad',
      requerido: true,
      tipo: 'prueba',
      completado: false
    },
    {
      id: 6,
      nombre: 'Documentación y Etiquetado',
      descripción: 'Actualizar registros y colocar etiquetas de mantenimiento',
      requerido: true,
      tipo: 'visual',
      completado: false
    }
  ];

  useEffect(() => {
    if (modoDemo) {
      // Simular obtención de ubicación
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          setUbicacionActual({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback a coordenadas de Santiago
          setUbicacionActual({ lat: -33.4569, lng: -70.6483 });
        }
      );
    }
  }, [modoDemo]);

  const iniciarMantenimiento = (qrData?: string) => {
    const nuevaSesion: MantenimientoSesion = {
      id: `MANT_${Date.now()}`,
      equipoId: equipoDemo.id,
      equipoNombre: equipoDemo.nombre,
      equipoCodigo: equipoDemo.codigo,
      tecnicoId: 1,
      tecnicoNombre: 'Juan Pérez',
      tipo: 'preventivo',
      estado: 'iniciado',
      fechaInicio: new Date().toISOString(),
      ubicacionInicio: ubicacionActual || { lat: -33.4569, lng: -70.6483 },
      checkpoints: [...checkpointsDemo],
      observacionesGenerales: '',
      tiempoEstimado: 120
    };

    setSesionActual(nuevaSesion);
    setTiempoInicio(new Date());
    setModoActual('mantenimiento');
    setCheckpointActual(0);
  };

  const completarCheckpoint = (checkpointId: number, datos: any) => {
    if (!sesionActual) return;

    const checkpointsActualizados = sesionActual.checkpoints.map(cp => 
      cp.id === checkpointId 
        ? { ...cp, completado: true, ...datos }
        : cp
    );

    setSesionActual({
      ...sesionActual,
      checkpoints: checkpointsActualizados
    });

    // Avanzar al siguiente checkpoint si existe
    const siguienteIndex = sesionActual.checkpoints.findIndex(cp => !cp.completado && cp.id !== checkpointId);
    if (siguienteIndex !== -1) {
      setCheckpointActual(siguienteIndex);
    } else {
      // Todos los checkpoints completados
      finalizarMantenimiento();
    }
  };

  const finalizarMantenimiento = () => {
    if (!sesionActual || !tiempoInicio) return;

    const tiempoReal = Math.floor((new Date().getTime() - tiempoInicio.getTime()) / 60000);
    
    const sesionFinalizada: MantenimientoSesion = {
      ...sesionActual,
      estado: 'completado',
      fechaFin: new Date().toISOString(),
      tiempoReal
    };

    setSesionActual(sesionFinalizada);
    setModoActual('completado');
    
    onMantenimientoComplete?.(sesionFinalizada);
  };

  const iniciarEscaner = async () => {
    try {
      setEscanerActivo(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      // En modo demo, simular escaneo exitoso
      if (modoDemo) {
        setTimeout(() => {
          iniciarMantenimiento('DEMO_QR');
        }, 2000);
      }
    }
  };

  const detenerEscaner = () => {
    setEscanerActivo(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const getCheckpointIcon = (tipo: string) => {
    switch (tipo) {
      case 'visual': return <CheckCircle2 className="w-5 h-5" />;
      case 'medicion': return <Settings className="w-5 h-5" />;
      case 'prueba': return <Play className="w-5 h-5" />;
      case 'limpieza': return <Wrench className="w-5 h-5" />;
      default: return <CheckSquare className="w-5 h-5" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'bg-green-500';
      case 'en_progreso': return 'bg-blue-500';
      case 'iniciado': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // **VISTA: SCANNER QR**
  if (modoActual === 'scanner') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-blue-600" />
              Scanner QR - Check-in de Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!escanerActivo ? (
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Escanear Código QR del Equipo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Apunta la cámara al código QR del equipo para iniciar el mantenimiento
                  </p>
                  <div className="space-y-3">
                    <Button onClick={iniciarEscaner} className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Iniciar Escáner
                    </Button>
                    {modoDemo && (
                      <Button 
                        variant="outline" 
                        onClick={() => iniciarMantenimiento('DEMO')}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Modo Demo (Sin Cámara)
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-white opacity-50" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={detenerEscaner} variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  {modoDemo && (
                    <Button 
                      onClick={() => iniciarMantenimiento('DEMO')} 
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Simular Escaneo
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">1</div>
                <div>
                  <div className="font-medium">Localizar el código QR</div>
                  <div className="text-gray-600">Busca la etiqueta QR en el equipo médico</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">2</div>
                <div>
                  <div className="font-medium">Escanear código</div>
                  <div className="text-gray-600">Apunta la cámara al código hasta que se detecte</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">3</div>
                <div>
                  <div className="font-medium">Iniciar mantenimiento</div>
                  <div className="text-gray-600">El sistema cargará automáticamente los checkpoints</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // **VISTA: MANTENIMIENTO EN PROGRESO**
  if (modoActual === 'mantenimiento' && sesionActual) {
    const checkpointActivo = sesionActual.checkpoints[checkpointActual];
    const progreso = (sesionActual.checkpoints.filter(cp => cp.completado).length / sesionActual.checkpoints.length) * 100;

    return (
      <div className="space-y-6">
        {/* Header de la sesión */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{sesionActual.equipoNombre}</h2>
                <p className="text-gray-600">{sesionActual.equipoCodigo} • {sesionActual.tipo}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${getEstadoColor(sesionActual.estado)}`}></div>
                  <span className="font-medium capitalize">{sesionActual.estado.replace('_', ' ')}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {tiempoInicio && Math.floor((new Date().getTime() - tiempoInicio.getTime()) / 60000)} min
                </div>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso del mantenimiento</span>
                <span>{Math.round(progreso)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkpoint actual */}
        {checkpointActivo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getCheckpointIcon(checkpointActivo.tipo)}
                Checkpoint {checkpointActual + 1} de {sesionActual.checkpoints.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{checkpointActivo.nombre}</h3>
                  <p className="text-gray-600">{checkpointActivo.descripcion}</p>
                  {checkpointActivo.requerido && (
                    <Badge variant="destructive" className="mt-2">Obligatorio</Badge>
                  )}
                </div>

                {/* Campo de medición si aplica */}
                {checkpointActivo.tipo === 'medicion' && checkpointActivo.medicion && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <label className="block text-sm font-medium mb-2">
                      Valor medido ({checkpointActivo.medicion.unidad})
                    </label>
                    <Input 
                      type="number"
                      placeholder={`Entre ${checkpointActivo.medicion.min} y ${checkpointActivo.medicion.max}`}
                      className="mb-2"
                    />
                    <div className="text-xs text-gray-600">
                      Rango aceptable: {checkpointActivo.medicion.min} - {checkpointActivo.medicion.max} {checkpointActivo.medicion.unidad}
                    </div>
                  </div>
                )}

                {/* Campo de observaciones */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Observaciones
                  </label>
                  <Textarea 
                    placeholder="Anota cualquier observación importante..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => completarCheckpoint(checkpointActivo.id, { observaciones: '' })}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completar Checkpoint
                  </Button>
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Foto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de todos los checkpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Checkpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sesionActual.checkpoints.map((checkpoint, index) => (
                <div 
                  key={checkpoint.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    checkpoint.completado 
                      ? 'bg-green-50 border-green-200' 
                      : index === checkpointActual
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    checkpoint.completado
                      ? 'bg-green-500 text-white'
                      : index === checkpointActual
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {checkpoint.completado ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{checkpoint.nombre}</div>
                    <div className="text-sm text-gray-600">{checkpoint.tipo}</div>
                  </div>
                  {checkpoint.requerido && (
                    <Badge variant="outline" size="sm">Obligatorio</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // **VISTA: MANTENIMIENTO COMPLETADO**
  if (modoActual === 'completado' && sesionActual) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              ¡Mantenimiento Completado!
            </h2>
            <p className="text-green-600 mb-4">
              Todos los checkpoints han sido verificados exitosamente
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {sesionActual.tiempoReal || 0} min
                </div>
                <div className="text-sm text-gray-600">Tiempo total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {sesionActual.checkpoints.length}
                </div>
                <div className="text-sm text-gray-600">Checkpoints</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen del mantenimiento */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Equipo</label>
                <p className="font-medium">{sesionActual.equipoNombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Código</label>
                <p className="font-medium">{sesionActual.equipoCodigo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Técnico</label>
                <p className="font-medium">{sesionActual.tecnicoNombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo</label>
                <p className="font-medium capitalize">{sesionActual.tipo}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Observaciones Generales</label>
              <Textarea 
                value={sesionActual.observacionesGenerales}
                onChange={(e) => setSesionActual({
                  ...sesionActual,
                  observacionesGenerales: e.target.value
                })}
                placeholder="Agregar observaciones finales..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Guardar y Finalizar
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botón para nuevo mantenimiento */}
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => {
              setSesionActual(null);
              setModoActual('scanner');
              setCheckpointActual(0);
              setTiempoInicio(null);
            }}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Nuevo Mantenimiento
          </Button>
        </div>
      </div>
    );
  }

  return null;
}