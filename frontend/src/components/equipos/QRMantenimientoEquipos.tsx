'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, MapPin, Clock, CheckCircle, XCircle, Camera, Wrench, Activity, AlertTriangle, Battery, Thermometer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';

interface MantenimientoData {
  id: string;
  equipoId: number;
  equipoNombre: string;
  equipoSerie: string;
  tipoMantenimiento: 'preventivo' | 'correctivo' | 'calibracion' | 'instalacion';
  tecnico: {
    id: number;
    nombre: string;
    especialidad: string;
    certificaciones: string[];
  };
  ubicacion: {
    lat: number;
    lng: number;
    direccion: string;
  };
  fechaInicio: string;
  fechaFin?: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  checkpoints: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    requerido: boolean;
    completado: boolean;
    timestamp?: string;
    observaciones?: string;
    fotos?: string[];
    mediciones?: { [key: string]: any };
  }>;
  condicionesPreMantenimiento?: {
    estadoVisual: string;
    funcionamiento: string;
    alertas: string[];
  };
  condicionesPostMantenimiento?: {
    estadoVisual: string;
    funcionamiento: string;
    pruebasFuncionales: { [key: string]: boolean };
    certificacionCalidad: boolean;
  };
}

interface QRMantenimientoEquiposProps {
  onMantenimientoComplete?: (data: MantenimientoData) => void;
  equipoId?: number;
  modoDemo?: boolean;
}

const QRMantenimientoEquipos: React.FC<QRMantenimientoEquiposProps> = ({
  onMantenimientoComplete,
  equipoId,
  modoDemo = false
}) => {
  const [scanning, setScanning] = useState(false);
  const [mantenimientoActual, setMantenimientoActual] = useState<MantenimientoData | null>(null);
  const [checkpointActual, setCheckpointActual] = useState<number>(0);
  const [ubicacionActual, setUbicacionActual] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [mediciones, setMediciones] = useState<{ [key: string]: any }>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Datos de demostración para mantenimiento
  const mantenimientoDemo: MantenimientoData = {
    id: 'MANT-2024-001',
    equipoId: 1,
    equipoNombre: 'Ventilador Draeger V500',
    equipoSerie: 'VEN001',
    tipoMantenimiento: 'preventivo',
    tecnico: {
      id: 1,
      nombre: 'Ing. Carlos Rodriguez',
      especialidad: 'Equipos Respiratorios',
      certificaciones: ['ISO 13485', 'IEC 60601', 'Draeger Certified']
    },
    ubicacion: {
      lat: -34.6037,
      lng: -58.3816,
      direccion: 'Hospital Central - UCI Adultos - Sala 3'
    },
    fechaInicio: new Date().toISOString(),
    estado: 'en_progreso',
    checkpoints: [
      {
        id: 'cp1',
        nombre: 'Inspección Visual',
        descripcion: 'Verificar estado físico externo del equipo',
        requerido: true,
        completado: false
      },
      {
        id: 'cp2',
        nombre: 'Pruebas Funcionales',
        descripcion: 'Verificar funcionamiento de todos los modos ventilatorios',
        requerido: true,
        completado: false
      },
      {
        id: 'cp3',
        nombre: 'Calibración Sensores',
        descripcion: 'Calibrar sensores de presión, flujo y oxígeno',
        requerido: true,
        completado: false
      },
      {
        id: 'cp4',
        nombre: 'Limpieza y Desinfección',
        descripcion: 'Limpieza profunda y desinfección según protocolo',
        requerido: true,
        completado: false
      },
      {
        id: 'cp5',
        nombre: 'Documentación',
        descripcion: 'Completar certificado de mantenimiento',
        requerido: true,
        completado: false
      }
    ],
    condicionesPreMantenimiento: {
      estadoVisual: 'Bueno - sin daños aparentes',
      funcionamiento: 'Operativo con alarmas menores',
      alertas: ['Filtro de aire próximo a vencer', 'Calibración de O2 vencida']
    }
  };

  // Obtener ubicación actual
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionActual({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación:', error);
          // Ubicación por defecto (Buenos Aires)
          setUbicacionActual({ lat: -34.6037, lng: -58.3816 });
        }
      );
    }
  }, []);

  // Inicializar cámara para QR
  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanning(true);
      setError('');
    } catch (err) {
      setError('Error al acceder a la cámara. Usando modo demo.');
      // En modo demo, simular escaneo exitoso
      setTimeout(() => {
        iniciarMantenimiento(mantenimientoDemo);
      }, 1000);
    }
  };

  // Detener cámara
  const detenerCamara = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setScanning(false);
  };

  // Escanear QR Code
  const escanearQR = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        try {
          const mantenimientoData = JSON.parse(code.data);
          iniciarMantenimiento(mantenimientoData);
          detenerCamara();
        } catch (err) {
          setError('QR Code no válido para mantenimiento');
        }
      }
    }

    if (scanning) {
      requestAnimationFrame(escanearQR);
    }
  };

  // Iniciar proceso de mantenimiento
  const iniciarMantenimiento = (data: MantenimientoData) => {
    setMantenimientoActual(data);
    setCheckpointActual(0);
    setSuccess(`Mantenimiento iniciado: ${data.id}`);
  };

  // Completar checkpoint
  const completarCheckpoint = (checkpointIndex: number, observaciones?: string) => {
    if (!mantenimientoActual) return;

    const nuevoMantenimiento = { ...mantenimientoActual };
    nuevoMantenimiento.checkpoints[checkpointIndex] = {
      ...nuevoMantenimiento.checkpoints[checkpointIndex],
      completado: true,
      timestamp: new Date().toISOString(),
      observaciones,
      mediciones: { ...mediciones }
    };

    setMantenimientoActual(nuevoMantenimiento);
    setMediciones({});

    // Avanzar al siguiente checkpoint
    if (checkpointIndex < nuevoMantenimiento.checkpoints.length - 1) {
      setCheckpointActual(checkpointIndex + 1);
    } else {
      // Mantenimiento completado
      nuevoMantenimiento.estado = 'completado';
      nuevoMantenimiento.fechaFin = new Date().toISOString();
      
      if (onMantenimientoComplete) {
        onMantenimientoComplete(nuevoMantenimiento);
      }
      
      setSuccess('¡Mantenimiento completado exitosamente!');
    }
  };

  // Generar QR para mantenimiento (para demo)
  const generarQRMantenimiento = () => {
    return JSON.stringify(mantenimientoDemo);
  };

  // Efectos para escaneo automático
  useEffect(() => {
    if (scanning && videoRef.current) {
      const timer = setTimeout(() => {
        escanearQR();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  if (!mantenimientoActual) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <QrCode className="w-8 h-8 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Mantenimiento de Equipos QR
            </h3>
          </div>

          {/* Modo Demo - Mostrar QR generado */}
          {modoDemo && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">QR Code Demo</h4>
              <div className="flex justify-center mb-3">
                <QRCodeSVG 
                  value={generarQRMantenimiento()} 
                  size={200}
                  level="M"
                />
              </div>
              <p className="text-sm text-blue-700">
                Escanea este QR para iniciar mantenimiento demo
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {!scanning ? (
            <div>
              <p className="text-gray-600 mb-6">
                Escanea el código QR del equipo para iniciar el proceso de mantenimiento
              </p>
              <button
                onClick={iniciarCamara}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <Camera className="w-5 h-5" />
                <span>Iniciar Escaneo QR</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-300"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Overlay de escaneo */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg"></div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Coloca el código QR dentro del marco para escanearlo
              </p>
              
              <button
                onClick={detenerCamara}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar Escaneo
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const checkpoint = mantenimientoActual.checkpoints[checkpointActual];
  const progreso = ((checkpointActual) / mantenimientoActual.checkpoints.length) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header del mantenimiento */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wrench className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {mantenimientoActual.equipoNombre}
              </h3>
              <p className="text-gray-600">Serie: {mantenimientoActual.equipoSerie}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Orden: {mantenimientoActual.id}</div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              mantenimientoActual.estado === 'completado' ? 'bg-green-100 text-green-800' :
              mantenimientoActual.estado === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {mantenimientoActual.estado.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso del Mantenimiento</span>
            <span>{Math.round(progreso)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Información del técnico y ubicación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Técnico Asignado</h4>
          <p className="font-semibold text-blue-800">{mantenimientoActual.tecnico.nombre}</p>
          <p className="text-sm text-blue-700">{mantenimientoActual.tecnico.especialidad}</p>
          <div className="mt-2">
            <p className="text-xs text-blue-600">Certificaciones:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {mantenimientoActual.tecnico.certificaciones.map((cert, idx) => (
                <span key={idx} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Ubicación</h4>
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-800">{mantenimientoActual.ubicacion.direccion}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">
              Iniciado: {new Date(mantenimientoActual.fechaInicio).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Checkpoint actual */}
      {mantenimientoActual.estado !== 'completado' && (
        <div className="border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Paso {checkpointActual + 1}: {checkpoint.nombre}
            </h4>
            <div className="flex items-center space-x-2">
              {checkpoint.requerido && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  REQUERIDO
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-600 mb-4">{checkpoint.descripcion}</p>

          {/* Campos específicos según el checkpoint */}
          {checkpoint.id === 'cp2' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presión Máxima (cmH2O)
                </label>
                <input
                  type="number"
                  value={mediciones.presionMaxima || ''}
                  onChange={(e) => setMediciones({...mediciones, presionMaxima: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="35"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flujo Máximo (L/min)
                </label>
                <input
                  type="number"
                  value={mediciones.flujoMaximo || ''}
                  onChange={(e) => setMediciones({...mediciones, flujoMaximo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="120"
                />
              </div>
            </div>
          )}

          {checkpoint.id === 'cp3' && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oxígeno (%)
                </label>
                <input
                  type="number"
                  value={mediciones.oxigeno || ''}
                  onChange={(e) => setMediciones({...mediciones, oxigeno: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="21-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temp. Interna (°C)
                </label>
                <input
                  type="number"
                  value={mediciones.temperatura || ''}
                  onChange={(e) => setMediciones({...mediciones, temperatura: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="22-26"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Humedad (%)
                </label>
                <input
                  type="number"
                  value={mediciones.humedad || ''}
                  onChange={(e) => setMediciones({...mediciones, humedad: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="40-60"
                />
              </div>
            </div>
          )}

          {/* Campo de observaciones */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              id={`obs-${checkpoint.id}`}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Registra cualquier observación relevante..."
            />
          </div>

          {/* Botón completar checkpoint */}
          <button
            onClick={() => {
              const observaciones = (document.getElementById(`obs-${checkpoint.id}`) as HTMLTextAreaElement)?.value;
              completarCheckpoint(checkpointActual, observaciones);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Completar {checkpoint.nombre}</span>
          </button>
        </div>
      )}

      {/* Lista de checkpoints */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Lista de Verificación</h4>
        <div className="space-y-3">
          {mantenimientoActual.checkpoints.map((cp, index) => (
            <div
              key={cp.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                cp.completado 
                  ? 'border-green-300 bg-green-50' 
                  : index === checkpointActual 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  cp.completado 
                    ? 'bg-green-600 text-white' 
                    : index === checkpointActual 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  {cp.completado ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : index === checkpointActual ? (
                    <Activity className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{cp.nombre}</h5>
                  <p className="text-sm text-gray-600">{cp.descripcion}</p>
                  {cp.completado && cp.timestamp && (
                    <p className="text-xs text-green-600 mt-1">
                      Completado: {new Date(cp.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>

                {cp.requerido && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    REQUERIDO
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de mantenimiento completado */}
      {mantenimientoActual.estado === 'completado' && (
        <div className="mt-6 p-6 bg-green-50 border border-green-300 rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="text-lg font-semibold text-green-900">
                ¡Mantenimiento Completado!
              </h4>
              <p className="text-green-700">
                Finalizado: {mantenimientoActual.fechaFin && new Date(mantenimientoActual.fechaFin).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-green-900 mb-2">Certificación</h5>
              <p className="text-sm text-green-800">
                El equipo ha sido mantenido según los estándares técnicos establecidos
                y está certificado para operación segura.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-green-900 mb-2">Próximo Mantenimiento</h5>
              <p className="text-sm text-green-800">
                Programado para: {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRMantenimientoEquipos;