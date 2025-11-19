'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertTriangle,
  Settings,
  CheckCircle2,
  TrendingUp,
  Star,
  Grid3X3,
  List,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { visitasService, Visita } from '@/lib/services/visitas.service';

export default function CalendarioVisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState<'mes' | 'semana' | 'dia'>('mes');

  useEffect(() => {
    cargarVisitas();
  }, [fechaSeleccionada]);

  const cargarVisitas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando visitas para calendario...');
      
      // Obtener visitas del mes actual
      const inicioMes = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1);
      const finMes = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0);
      
      const visitasData = await visitasService.obtenerVisitas({ 
        limit: 200,
        page: 1,
        fecha_desde: inicioMes.toISOString().split('T')[0],
        fecha_hasta: finMes.toISOString().split('T')[0],
        sortBy: 'fecha_programada',
        sortOrder: 'ASC'
      });

      if (visitasData.success) {
        setVisitas(visitasData.data.visitas);
        console.log('✅ Visitas para calendario cargadas:', visitasData.data.visitas.length);
      } else {
        setError('Error cargando visitas para calendario');
      }

    } catch (err) {
      console.error('❌ Error cargando visitas:', err);
      setError('Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const obtenerDiasDelMes = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasPrevios = primerDia.getDay();
    const diasEnMes = ultimoDia.getDate();
    
    const dias = [];
    
    // Días del mes anterior
    for (let i = diasPrevios - 1; i >= 0; i--) {
      const dia = new Date(año, mes, -i);
      dias.push({
        fecha: dia,
        esDelMesActual: false,
        numero: dia.getDate()
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      const dia = new Date(año, mes, i);
      dias.push({
        fecha: dia,
        esDelMesActual: true,
        numero: i
      });
    }
    
    // Días del mes siguiente para completar la grilla
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = new Date(año, mes + 1, i);
      dias.push({
        fecha: dia,
        esDelMesActual: false,
        numero: i
      });
    }
    
    return dias;
  };

  const obtenerVisitasDelDia = (fecha: Date) => {
    return visitas.filter(visita => {
      const fechaVisita = new Date(visita.fecha_programada);
      return fechaVisita.toDateString() === fecha.toDateString();
    });
  };

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    const nuevaFecha = new Date(fechaSeleccionada);
    if (direccion === 'anterior') {
      nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    } else {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    }
    setFechaSeleccionada(nuevaFecha);
  };

  const getTipoBadge = (tipo: string, pequeño: boolean = true) => {
    const config = {
      instalacion: { color: 'bg-blue-500', text: 'Inst.' },
      mantenimiento: { color: 'bg-green-500', text: 'Mant.' },
      reparacion: { color: 'bg-orange-500', text: 'Rep.' },
      inspeccion: { color: 'bg-purple-500', text: 'Insp.' },
      calibracion: { color: 'bg-indigo-500', text: 'Cal.' },
      garantia: { color: 'bg-red-500', text: 'Gar.' }
    };
    
    const { color, text } = config[tipo as keyof typeof config] || 
      { color: 'bg-gray-500', text: 'Mant.' };
    
    return (
      <Badge 
        variant="default" 
        className={`${color} text-white ${pequeño ? 'text-xs px-1' : ''}`}
      >
        {pequeño ? text : tipo?.charAt(0).toUpperCase() + tipo?.slice(1)}
      </Badge>
    );
  };

  const formatearFechaHeader = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error de Conexión</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={cargarVisitas} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const diasDelMes = obtenerDiasDelMes(fechaSeleccionada);
  const hoy = new Date();

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/visitas">
              <Button variant="ghost" size="sm" className="p-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Calendario de Visitas</h1>
          </div>
          <p className="text-sm text-gray-600">
            Programación y gestión visual de visitas técnicas
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Hoy
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Visita
          </Button>
        </div>
      </div>

      {/* Controles de Navegación */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarMes('anterior')}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[200px] text-center">
                  {formatearFechaHeader(fechaSeleccionada)}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarMes('siguiente')}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-1">
              {(['mes', 'semana', 'dia'] as const).map((vista) => (
                <Button
                  key={vista}
                  variant={vistaCalendario === vista ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVistaCalendario(vista)}
                  className="capitalize"
                >
                  {vista}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del Mes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Este Mes</p>
                <p className="text-xl font-bold text-blue-600">
                  {visitas.filter(v => {
                    const fechaV = new Date(v.fecha_programada);
                    return fechaV.getMonth() === fechaSeleccionada.getMonth() && 
                           fechaV.getFullYear() === fechaSeleccionada.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Hoy</p>
                <p className="text-xl font-bold text-green-600">
                  {obtenerVisitasDelDia(hoy).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Técnicos</p>
                <p className="text-xl font-bold text-orange-600">
                  {new Set(visitas.map(v => v.tecnico_nombre).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Sedes</p>
                <p className="text-xl font-bold text-purple-600">
                  {new Set(visitas.map(v => v.sede_nombre).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendario */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando calendario...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Headers de los días */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
                  <div key={dia} className="p-2 text-center text-sm font-medium text-gray-600">
                    {dia}
                  </div>
                ))}
              </div>
              
              {/* Grilla del calendario */}
              <div className="grid grid-cols-7 gap-1">
                {diasDelMes.map((dia, index) => {
                  const visitasDelDia = obtenerVisitasDelDia(dia.fecha);
                  const esHoy = dia.fecha.toDateString() === hoy.toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[120px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                        ${dia.esDelMesActual ? 'bg-white' : 'bg-gray-50'}
                        ${esHoy ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-2
                        ${dia.esDelMesActual ? 'text-gray-900' : 'text-gray-400'}
                        ${esHoy ? 'text-blue-600' : ''}
                      `}>
                        {dia.numero}
                      </div>
                      
                      <div className="space-y-1">
                        {visitasDelDia.slice(0, 3).map((visita, vIndex) => (
                          <div
                            key={vIndex}
                            className="text-xs p-1 rounded bg-white border border-gray-200 hover:border-blue-300 cursor-pointer"
                            title={`${visita.numero_visita} - ${visita.cliente_nombre} - ${formatearHora(visita.fecha_programada)}`}
                          >
                            <div className="flex items-center gap-1 justify-between">
                              <span className="truncate font-medium text-gray-900">
                                {formatearHora(visita.fecha_programada)}
                              </span>
                              {getTipoBadge(visita.tipo_visita, true)}
                            </div>
                            <div className="text-gray-600 truncate">
                              {visita.cliente_nombre || 'Cliente no asignado'}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <User className="w-2 h-2" />
                              <span className="truncate">
                                {visita.tecnico_nombre || 'Sin técnico'}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {visitasDelDia.length > 3 && (
                          <div className="text-xs text-center p-1 text-blue-600 font-medium">
                            +{visitasDelDia.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agenda del Día Seleccionado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Agenda de Hoy - {hoy.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {obtenerVisitasDelDia(hoy).length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay visitas programadas para hoy</p>
              </div>
            ) : (
              obtenerVisitasDelDia(hoy).map((visita) => (
                <div 
                  key={visita.id} 
                  className="p-4 border-l-4 border-l-blue-500 bg-gray-50 rounded-r-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {visita.numero_visita}
                        </h4>
                        {getTipoBadge(visita.tipo_visita, false)}
                        <Badge variant="outline">
                          Estado: {visita.estado}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{visita.cliente_nombre || 'Cliente no asignado'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{visita.tecnico_nombre || 'Sin técnico asignado'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatearHora(visita.fecha_programada)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{visita.sede_nombre || 'Sede no especificada'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leyenda de Tipos de Visita</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {[
              { tipo: 'instalacion', label: 'Instalación' },
              { tipo: 'mantenimiento', label: 'Mantenimiento' },
              { tipo: 'reparacion', label: 'Reparación' },
              { tipo: 'inspeccion', label: 'Inspección' },
              { tipo: 'calibracion', label: 'Calibración' },
              { tipo: 'garantia', label: 'Garantía' }
            ].map(({ tipo, label }) => (
              <div key={tipo} className="flex items-center gap-2">
                {getTipoBadge(tipo, false)}
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}