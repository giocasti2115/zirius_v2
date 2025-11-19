'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Zap, 
  Clock,
  Filter,
  Settings,
  Radio
} from 'lucide-react';

interface EquipoLocation {
  id: number;
  nombre: string;
  codigo_interno?: string;
  lat: number;
  lng: number;
  estado: 'activo' | 'mantenimiento' | 'inactivo';
  ultima_actualizacion: string;
  zona_autorizada: boolean;
  bateria?: number;
  velocidad?: number;
}

interface ZonaAutorizada {
  id: number;
  nombre: string;
  coordenadas: { lat: number; lng: number }[];
  color: string;
  activa: boolean;
}

interface MapaEquiposProps {
  equipos: EquipoLocation[];
  showZonasAutorizadas?: boolean;
  trackingMode?: 'realtime' | 'historico';
}

export default function MapaEquipos({ 
  equipos = [], 
  showZonasAutorizadas = true,
  trackingMode = 'realtime'
}: MapaEquiposProps) {
  const [equiposDemo] = useState<EquipoLocation[]>([
    {
      id: 1,
      nombre: 'Ventilador Draeger V500',
      codigo_interno: 'VEN001',
      lat: -33.4569,
      lng: -70.6483,
      estado: 'activo',
      ultima_actualizacion: new Date().toISOString(),
      zona_autorizada: true,
      bateria: 85,
      velocidad: 0
    },
    {
      id: 2,
      nombre: 'Monitor Philips IntelliVue',
      codigo_interno: 'MON002',
      lat: -33.4580,
      lng: -70.6500,
      estado: 'activo',
      ultima_actualizacion: new Date(Date.now() - 300000).toISOString(),
      zona_autorizada: true,
      bateria: 92,
      velocidad: 5
    },
    {
      id: 3,
      nombre: 'Desfibrilador ZOLL',
      codigo_interno: 'DEF003',
      lat: -33.4600,
      lng: -70.6520,
      estado: 'mantenimiento',
      ultima_actualizacion: new Date(Date.now() - 900000).toISOString(),
      zona_autorizada: false,
      bateria: 45,
      velocidad: 0
    }
  ]);

  const [zonasDemo] = useState<ZonaAutorizada[]>([
    {
      id: 1,
      nombre: 'UCI Adultos',
      coordenadas: [
        { lat: -33.4560, lng: -70.6470 },
        { lat: -33.4570, lng: -70.6470 },
        { lat: -33.4570, lng: -70.6490 },
        { lat: -33.4560, lng: -70.6490 }
      ],
      color: '#10B981',
      activa: true
    },
    {
      id: 2,
      nombre: 'Urgencias',
      coordenadas: [
        { lat: -33.4575, lng: -70.6495 },
        { lat: -33.4585, lng: -70.6495 },
        { lat: -33.4585, lng: -70.6515 },
        { lat: -33.4575, lng: -70.6515 }
      ],
      color: '#F59E0B',
      activa: true
    }
  ]);

  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [mostrarAlertas, setMostrarAlertas] = useState(true);
  const [intervaloActualizacion, setIntervaloActualizacion] = useState(30);

  const equiposActivos = (equipos.length > 0 ? equipos : equiposDemo);
  const equiposFiltrados = equiposActivos.filter(equipo => 
    filtroEstado === 'todos' || equipo.estado === filtroEstado
  );

  const equiposFueraZona = equiposFiltrados.filter(e => !e.zona_autorizada);
  const equiposBateriaBaja = equiposFiltrados.filter(e => (e.bateria || 0) < 50);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return '#10B981';
      case 'mantenimiento': return '#F59E0B';
      case 'inactivo': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo': return 'default';
      case 'mantenimiento': return 'destructive';
      case 'inactivo': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTiempo = (fecha: string) => {
    const ahora = new Date();
    const fechaEquipo = new Date(fecha);
    const diferencia = Math.floor((ahora.getTime() - fechaEquipo.getTime()) / 1000 / 60);
    
    if (diferencia < 1) return 'Ahora mismo';
    if (diferencia < 60) return `Hace ${diferencia} min`;
    if (diferencia < 1440) return `Hace ${Math.floor(diferencia / 60)} hrs`;
    return `Hace ${Math.floor(diferencia / 1440)} días`;
  };

  return (
    <div className="space-y-6">
      {/* **HEADER CON CONTROLES** */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              Tracking GPS - {trackingMode === 'realtime' ? 'Tiempo Real' : 'Histórico'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Estado:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Actualización:</label>
                <select
                  value={intervaloActualizacion}
                  onChange={(e) => setIntervaloActualizacion(Number(e.target.value))}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value={10}>10 seg</option>
                  <option value={30}>30 seg</option>
                  <option value={60}>1 min</option>
                  <option value={300}>5 min</option>
                </select>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMostrarAlertas(!mostrarAlertas)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {mostrarAlertas ? 'Ocultar' : 'Mostrar'} Alertas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* **PANEL DE ALERTAS** */}
        {mostrarAlertas && (equiposFueraZona.length > 0 || equiposBateriaBaja.length > 0) && (
          <Card className="lg:w-80 border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Alertas Críticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {equiposFueraZona.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">
                    🚨 Equipos fuera de zona ({equiposFueraZona.length})
                  </h4>
                  {equiposFueraZona.map(equipo => (
                    <div key={equipo.id} className="text-sm text-red-700">
                      • {equipo.nombre} ({equipo.codigo_interno})
                    </div>
                  ))}
                </div>
              )}
              
              {equiposBateriaBaja.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-2">
                    🔋 Batería baja ({equiposBateriaBaja.length})
                  </h4>
                  {equiposBateriaBaja.map(equipo => (
                    <div key={equipo.id} className="text-sm text-orange-700">
                      • {equipo.nombre}: {equipo.bateria}%
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* **MAPA SIMULADO** */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-[500px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden">
            {/* Simulación del mapa */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center space-y-4">
                <MapPin className="w-16 h-16 text-blue-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">
                    Mapa GPS Interactivo
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Vista satelital con equipos en tiempo real
                  </p>
                  <div className="text-sm text-gray-400 mt-1">
                    Google Maps API requerido para vista completa
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay con controles del mapa */}
            <div className="absolute top-4 left-4 space-y-2">
              <Button size="sm" variant="outline" className="bg-white">
                <Navigation className="w-4 h-4 mr-2" />
                Centrar
              </Button>
              <Button size="sm" variant="outline" className="bg-white">
                <Settings className="w-4 h-4 mr-2" />
                Capas
              </Button>
            </div>

            {/* Status en tiempo real */}
            <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">En vivo</span>
                <span className="text-gray-500">
                  Actualizado hace {Math.floor(Math.random() * 30)} seg
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* **LISTADO DE EQUIPOS CON UBICACIONES** */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-green-600" />
              Equipos Activos ({equiposFiltrados.filter(e => e.estado === 'activo').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {equiposFiltrados
              .filter(equipo => equipo.estado === 'activo')
              .map(equipo => (
                <div key={equipo.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="font-medium text-green-800">
                      {equipo.nombre}
                    </div>
                    <div className="text-sm text-green-600">
                      {equipo.codigo_interno} • {formatTiempo(equipo.ultima_actualizacion)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Lat: {equipo.lat.toFixed(4)}, Lng: {equipo.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={equipo.zona_autorizada ? 'default' : 'destructive'}>
                      {equipo.zona_autorizada ? 'Zona OK' : 'Fuera zona'}
                    </Badge>
                    {equipo.bateria && (
                      <div className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3" />
                        {equipo.bateria}%
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Zonas Autorizadas ({zonasDemo.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {zonasDemo.map(zona => (
              <div key={zona.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-1">
                  <div className="font-medium text-orange-800">
                    {zona.nombre}
                  </div>
                  <div className="text-sm text-orange-600">
                    {zona.coordenadas.length} puntos de perímetro
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: zona.color }}
                  ></div>
                  <Badge variant={zona.activa ? 'default' : 'secondary'}>
                    {zona.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* **MÉTRICAS DE TRACKING** */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {equiposFiltrados.length}
            </div>
            <div className="text-sm text-gray-600">Equipos Rastreados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {equiposFiltrados.filter(e => e.zona_autorizada).length}
            </div>
            <div className="text-sm text-gray-600">En Zona Autorizada</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {equiposFueraZona.length}
            </div>
            <div className="text-sm text-gray-600">Fuera de Zona</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(equiposFiltrados.reduce((acc, e) => acc + (e.bateria || 0), 0) / equiposFiltrados.length) || 0}%
            </div>
            <div className="text-sm text-gray-600">Batería Promedio</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}