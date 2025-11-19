'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline, Circle } from '@react-google-maps/api';
import { 
  MapPin, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Settings, 
  Battery,
  Shield,
  TrendingUp,
  Navigation
} from 'lucide-react';

interface Equipo {
  id: number;
  nombre: string;
  tipo: string;
  serie: string;
  ubicacion: {
    lat: number;
    lng: number;
  };
  estado: 'operativo' | 'mantenimiento' | 'fuera_servicio' | 'calibracion';
  bateria?: number;
  ultimaActualizacion: string;
  tecnicoAsignado?: string;
  alertas: Array<{
    tipo: 'ubicacion' | 'bateria' | 'mantenimiento' | 'falla';
    mensaje: string;
    nivel: 'info' | 'warning' | 'error';
  }>;
  historialUbicaciones?: Array<{
    lat: number;
    lng: number;
    timestamp: string;
  }>;
  zonaAutorizada?: {
    centro: { lat: number; lng: number };
    radio: number; // en metros
  };
}

interface MapaEquiposProps {
  equipos?: Equipo[];
  onEquipoSelect?: (equipo: Equipo) => void;
  showZonasAutorizadas?: boolean;
  trackingMode?: 'realtime' | 'historical';
}

const MapaEquipos: React.FC<MapaEquiposProps> = ({ 
  equipos = [], 
  onEquipoSelect,
  showZonasAutorizadas = true,
  trackingMode = 'realtime'
}) => {
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [equiposData, setEquiposData] = useState<Equipo[]>(equipos);
  const [showHistorial, setShowHistorial] = useState<{ [key: number]: boolean }>({});
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [alertasActivas, setAlertasActivas] = useState<number>(0);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Configuración del mapa
  const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px'
  };

  const center = {
    lat: -34.6037,  // Buenos Aires por defecto
    lng: -58.3816
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  // Función para obtener color del marcador según estado
  const getMarkerColor = (equipo: Equipo): string => {
    const { estado, alertas } = equipo;
    
    // Si hay alertas críticas, color rojo
    if (alertas.some(a => a.nivel === 'error')) return '#ef4444';
    
    // Si hay alertas de advertencia, color amarillo
    if (alertas.some(a => a.nivel === 'warning')) return '#f59e0b';
    
    // Color según estado
    switch (estado) {
      case 'operativo': return '#10b981';
      case 'mantenimiento': return '#3b82f6';
      case 'calibracion': return '#8b5cf6';
      case 'fuera_servicio': return '#6b7280';
      default: return '#10b981';
    }
  };

  // Función para obtener icono según tipo de equipo
  const getEquipoIcon = (tipo: string): string => {
    const iconMap: { [key: string]: string } = {
      'ventilador': '🫁',
      'monitor': '📺',
      'bomba': '🔄',
      'desfibrilador': '⚡',
      'ecografo': '🔍',
      'rayos_x': '📷',
      'default': '🏥'
    };
    return iconMap[tipo.toLowerCase()] || iconMap.default;
  };

  // Simulación de datos de equipos (en producción vendría de la API)
  useEffect(() => {
    const equiposSimulados: Equipo[] = [
      {
        id: 1,
        nombre: 'Ventilador Draeger V500',
        tipo: 'ventilador',
        serie: 'VEN001',
        ubicacion: { lat: -34.6018, lng: -58.3845 },
        estado: 'operativo',
        bateria: 85,
        ultimaActualizacion: new Date().toISOString(),
        tecnicoAsignado: 'Dr. García',
        alertas: [
          { tipo: 'bateria', mensaje: 'Batería en buen estado', nivel: 'info' }
        ],
        historialUbicaciones: [
          { lat: -34.6018, lng: -58.3845, timestamp: new Date(Date.now() - 3600000).toISOString() },
          { lat: -34.6020, lng: -58.3840, timestamp: new Date(Date.now() - 1800000).toISOString() },
        ],
        zonaAutorizada: {
          centro: { lat: -34.6018, lng: -58.3845 },
          radio: 200
        }
      },
      {
        id: 2,
        nombre: 'Monitor Philips MX40',
        tipo: 'monitor',
        serie: 'MON002',
        ubicacion: { lat: -34.6025, lng: -58.3820 },
        estado: 'mantenimiento',
        bateria: 45,
        ultimaActualizacion: new Date().toISOString(),
        tecnicoAsignado: 'Téc. Rodriguez',
        alertas: [
          { tipo: 'bateria', mensaje: 'Batería baja - requiere carga', nivel: 'warning' },
          { tipo: 'mantenimiento', mensaje: 'Mantenimiento preventivo en curso', nivel: 'info' }
        ],
        zonaAutorizada: {
          centro: { lat: -34.6025, lng: -58.3820 },
          radio: 150
        }
      },
      {
        id: 3,
        nombre: 'Bomba Infusión Baxter',
        tipo: 'bomba',
        serie: 'BOM003',
        ubicacion: { lat: -34.6050, lng: -58.3900 },
        estado: 'fuera_servicio',
        ultimaActualizacion: new Date().toISOString(),
        alertas: [
          { tipo: 'falla', mensaje: 'Equipo fuera de zona autorizada', nivel: 'error' },
          { tipo: 'ubicacion', mensaje: 'Última ubicación: hace 2 horas', nivel: 'warning' }
        ],
        zonaAutorizada: {
          centro: { lat: -34.6018, lng: -58.3845 },
          radio: 100
        }
      }
    ];

    setEquiposData(equiposSimulados);
    
    // Contar alertas activas
    const totalAlertas = equiposSimulados.reduce((total, equipo) => 
      total + equipo.alertas.filter(a => a.nivel === 'error' || a.nivel === 'warning').length, 0
    );
    setAlertasActivas(totalAlertas);
  }, []);

  // Filtrar equipos según estado seleccionado
  const equiposFiltrados = equiposData.filter(equipo => 
    filterEstado === 'todos' || equipo.estado === filterEstado
  );

  // Función para alternar historial de ubicaciones
  const toggleHistorial = (equipoId: number) => {
    setShowHistorial(prev => ({
      ...prev,
      [equipoId]: !prev[equipoId]
    }));
  };

  // Función para centrar mapa en equipo
  const centerOnEquipo = (equipo: Equipo) => {
    if (mapRef.current) {
      mapRef.current.panTo(equipo.ubicacion);
      mapRef.current.setZoom(16);
    }
    setSelectedEquipo(equipo);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header con controles */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Tracking GPS Equipos
            </h3>
          </div>
          
          {alertasActivas > 0 && (
            <div className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{alertasActivas} alertas activas</span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-3">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="calibracion">Calibración</option>
            <option value="fuera_servicio">Fuera de servicio</option>
          </select>
          
          <button
            onClick={() => setShowZonasAutorizadas(!showZonasAutorizadas)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showZonasAutorizadas 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Zonas Autorizadas
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Operativos</p>
              <p className="text-xl font-bold text-green-700">
                {equiposData.filter(e => e.estado === 'operativo').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Mantenimiento</p>
              <p className="text-xl font-bold text-blue-700">
                {equiposData.filter(e => e.estado === 'mantenimiento').length}
              </p>
            </div>
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Fuera Servicio</p>
              <p className="text-xl font-bold text-red-700">
                {equiposData.filter(e => e.estado === 'fuera_servicio').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Calibración</p>
              <p className="text-xl font-bold text-purple-700">
                {equiposData.filter(e => e.estado === 'calibracion').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Mapa */}
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          options={mapOptions}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {/* Marcadores de equipos */}
          {equiposFiltrados.map((equipo) => (
            <React.Fragment key={equipo.id}>
              {/* Marcador principal */}
              <Marker
                position={equipo.ubicacion}
                onClick={() => setSelectedEquipo(equipo)}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="${getMarkerColor(equipo)}" stroke="white" stroke-width="2"/>
                      <text x="20" y="25" text-anchor="middle" fill="white" font-size="16" font-weight="bold">
                        ${getEquipoIcon(equipo.tipo)}
                      </text>
                    </svg>
                  `)}`,
                  scaledSize: new google.maps.Size(40, 40)
                }}
              />

              {/* Zona autorizada */}
              {showZonasAutorizadas && equipo.zonaAutorizada && (
                <Circle
                  center={equipo.zonaAutorizada.centro}
                  radius={equipo.zonaAutorizada.radio}
                  options={{
                    fillColor: getMarkerColor(equipo),
                    fillOpacity: 0.1,
                    strokeColor: getMarkerColor(equipo),
                    strokeOpacity: 0.5,
                    strokeWeight: 2
                  }}
                />
              )}

              {/* Historial de ubicaciones */}
              {showHistorial[equipo.id] && equipo.historialUbicaciones && (
                <Polyline
                  path={equipo.historialUbicaciones.map(h => ({ lat: h.lat, lng: h.lng }))}
                  options={{
                    strokeColor: getMarkerColor(equipo),
                    strokeOpacity: 0.7,
                    strokeWeight: 3
                  }}
                />
              )}
            </React.Fragment>
          ))}

          {/* Info Window del equipo seleccionado */}
          {selectedEquipo && (
            <InfoWindow
              position={selectedEquipo.ubicacion}
              onCloseClick={() => setSelectedEquipo(null)}
            >
              <div className="p-3 max-w-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{getEquipoIcon(selectedEquipo.tipo)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedEquipo.nombre}</h4>
                    <p className="text-sm text-gray-600">Serie: {selectedEquipo.serie}</p>
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getMarkerColor(selectedEquipo) }}
                  />
                  <span className="text-sm font-medium capitalize">
                    {selectedEquipo.estado.replace('_', ' ')}
                  </span>
                </div>

                {/* Batería */}
                {selectedEquipo.bateria && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Battery className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Batería: {selectedEquipo.bateria}%</span>
                  </div>
                )}

                {/* Técnico asignado */}
                {selectedEquipo.tecnicoAsignado && (
                  <div className="text-sm text-gray-600 mb-2">
                    Técnico: {selectedEquipo.tecnicoAsignado}
                  </div>
                )}

                {/* Alertas */}
                {selectedEquipo.alertas.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Alertas:</p>
                    {selectedEquipo.alertas.slice(0, 2).map((alerta, idx) => (
                      <div key={idx} className={`text-xs p-2 rounded mb-1 ${
                        alerta.nivel === 'error' ? 'bg-red-100 text-red-700' :
                        alerta.nivel === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alerta.mensaje}
                      </div>
                    ))}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => centerOnEquipo(selectedEquipo)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Centrar</span>
                  </button>
                  
                  <button
                    onClick={() => toggleHistorial(selectedEquipo.id)}
                    className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>{showHistorial[selectedEquipo.id] ? 'Ocultar' : 'Historial'}</span>
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Lista lateral de equipos */}
      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-900 mb-2">
          Equipos Monitoreados ({equiposFiltrados.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {equiposFiltrados.map((equipo) => (
            <div
              key={equipo.id}
              onClick={() => centerOnEquipo(equipo)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getEquipoIcon(equipo.tipo)}</span>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm">{equipo.nombre}</h5>
                  <p className="text-xs text-gray-600">{equipo.serie}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getMarkerColor(equipo) }}
                    />
                    <span className="text-xs capitalize text-gray-600">
                      {equipo.estado.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {equipo.alertas.filter(a => a.nivel !== 'info').length > 0 && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapaEquipos;