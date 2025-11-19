'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  Clock, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  MapPin,
  Wrench,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

interface EquipoMetrica {
  id: number;
  nombre: string;
  serie: string;
  tipo: string;
  estado: 'operativo' | 'mantenimiento' | 'fuera_servicio' | 'calibracion';
  ubicacion: string;
  disponibilidad: number; // %
  mtbf: number; // horas - Mean Time Between Failures
  mttr: number; // horas - Mean Time To Repair
  horasOperacion: number;
  proximoMantenimiento: string;
  garantia: {
    activa: boolean;
    vencimiento: string;
    diasRestantes: number;
  };
  alertasActivas: number;
  costoMantenimiento: number;
  ultimaFalla?: {
    fecha: string;
    tipo: string;
    duracion: number;
  };
  rendimiento: {
    utilizacion: number; // %
    eficiencia: number; // %
    consumoEnergia: number; // kWh
  };
  mantenimientos: Array<{
    fecha: string;
    tipo: 'preventivo' | 'correctivo' | 'calibracion';
    costo: number;
    duracion: number;
  }>;
}

interface DashboardEquiposRealTimeProps {
  equipos?: EquipoMetrica[];
  intervaloActualizacion?: number; // milliseconds
  filtros?: {
    tipo?: string;
    estado?: string;
    ubicacion?: string;
  };
}

const DashboardEquiposRealTime: React.FC<DashboardEquiposRealTimeProps> = ({
  equipos = [],
  intervaloActualizacion = 30000, // 30 segundos
  filtros = {}
}) => {
  const [equiposData, setEquiposData] = useState<EquipoMetrica[]>(equipos);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());
  const [vistaActiva, setVistaActiva] = useState<'resumen' | 'disponibilidad' | 'mantenimiento' | 'costos'>('resumen');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [periodoDatos, setPeriodoDatos] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [actualizandoAutomatico, setActualizandoAutomatico] = useState(true);

  // Datos simulados para demostración
  useEffect(() => {
    const equiposSimulados: EquipoMetrica[] = [
      {
        id: 1,
        nombre: 'Ventilador Draeger V500',
        serie: 'VEN001',
        tipo: 'ventilador',
        estado: 'operativo',
        ubicacion: 'UCI Adultos - Sala 3',
        disponibilidad: 94.5,
        mtbf: 2160, // 90 días
        mttr: 4.2,
        horasOperacion: 15680,
        proximoMantenimiento: '2024-04-15',
        garantia: {
          activa: true,
          vencimiento: '2025-06-30',
          diasRestantes: 456
        },
        alertasActivas: 1,
        costoMantenimiento: 12500,
        ultimaFalla: {
          fecha: '2024-02-28',
          tipo: 'Sensor presión',
          duracion: 3.5
        },
        rendimiento: {
          utilizacion: 78,
          eficiencia: 92,
          consumoEnergia: 145.5
        },
        mantenimientos: [
          { fecha: '2024-01-15', tipo: 'preventivo', costo: 850, duracion: 2.5 },
          { fecha: '2024-02-28', tipo: 'correctivo', costo: 1200, duracion: 3.5 },
          { fecha: '2024-03-10', tipo: 'calibracion', costo: 450, duracion: 1.5 }
        ]
      },
      {
        id: 2,
        nombre: 'Monitor Philips MX40',
        serie: 'MON002',
        tipo: 'monitor',
        estado: 'mantenimiento',
        ubicacion: 'UCI Pediátrica - Sala 1',
        disponibilidad: 89.2,
        mtbf: 1440, // 60 días
        mttr: 6.1,
        horasOperacion: 12350,
        proximoMantenimiento: '2024-04-02',
        garantia: {
          activa: true,
          vencimiento: '2024-12-31',
          diasRestantes: 287
        },
        alertasActivas: 3,
        costoMantenimiento: 8750,
        ultimaFalla: {
          fecha: '2024-03-15',
          tipo: 'Pantalla táctil',
          duracion: 8.2
        },
        rendimiento: {
          utilizacion: 85,
          eficiencia: 88,
          consumoEnergia: 78.3
        },
        mantenimientos: [
          { fecha: '2024-01-20', tipo: 'preventivo', costo: 650, duracion: 2.0 },
          { fecha: '2024-03-15', tipo: 'correctivo', costo: 1800, duracion: 8.2 }
        ]
      },
      {
        id: 3,
        nombre: 'Bomba Infusión Baxter',
        serie: 'BOM003',
        tipo: 'bomba',
        estado: 'fuera_servicio',
        ubicacion: 'Quirófano 4',
        disponibilidad: 72.8,
        mtbf: 720, // 30 días
        mttr: 12.5,
        horasOperacion: 9875,
        proximoMantenimiento: '2024-03-28',
        garantia: {
          activa: false,
          vencimiento: '2023-08-15',
          diasRestantes: -228
        },
        alertasActivas: 5,
        costoMantenimiento: 18500,
        ultimaFalla: {
          fecha: '2024-03-18',
          tipo: 'Motor principal',
          duracion: 24.0
        },
        rendimiento: {
          utilizacion: 45,
          eficiencia: 65,
          consumoEnergia: 32.1
        },
        mantenimientos: [
          { fecha: '2024-02-01', tipo: 'correctivo', costo: 3200, duracion: 12.0 },
          { fecha: '2024-03-18', tipo: 'correctivo', costo: 4500, duracion: 24.0 }
        ]
      },
      {
        id: 4,
        nombre: 'Desfibrilador Zoll X-Series',
        serie: 'DEF004',
        tipo: 'desfibrilador',
        estado: 'operativo',
        ubicacion: 'Emergencias',
        disponibilidad: 98.7,
        mtbf: 4320, // 180 días
        mttr: 2.1,
        horasOperacion: 5420,
        proximoMantenimiento: '2024-05-20',
        garantia: {
          activa: true,
          vencimiento: '2026-03-15',
          diasRestantes: 723
        },
        alertasActivas: 0,
        costoMantenimiento: 3200,
        rendimiento: {
          utilizacion: 25,
          eficiencia: 99,
          consumoEnergia: 15.8
        },
        mantenimientos: [
          { fecha: '2024-02-20', tipo: 'preventivo', costo: 380, duracion: 1.5 }
        ]
      }
    ];

    setEquiposData(equiposSimulados);
  }, []);

  // Actualización automática
  useEffect(() => {
    if (!actualizandoAutomatico) return;

    const interval = setInterval(() => {
      // Simular pequeños cambios en los datos
      setEquiposData(prev => prev.map(equipo => ({
        ...equipo,
        disponibilidad: Math.max(0, Math.min(100, equipo.disponibilidad + (Math.random() - 0.5) * 2)),
        rendimiento: {
          ...equipo.rendimiento,
          utilizacion: Math.max(0, Math.min(100, equipo.rendimiento.utilizacion + (Math.random() - 0.5) * 5)),
          eficiencia: Math.max(0, Math.min(100, equipo.rendimiento.eficiencia + (Math.random() - 0.5) * 2)),
          consumoEnergia: Math.max(0, equipo.rendimiento.consumoEnergia + (Math.random() - 0.5) * 10)
        }
      })));
      
      setUltimaActualizacion(new Date());
    }, intervaloActualizacion);

    return () => clearInterval(interval);
  }, [actualizandoAutomatico, intervaloActualizacion]);

  // Filtrar equipos
  const equiposFiltrados = equiposData.filter(equipo => {
    if (filtroTipo !== 'todos' && equipo.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && equipo.estado !== filtroEstado) return false;
    return true;
  });

  // Calcular métricas generales
  const metricas = {
    totalEquipos: equiposFiltrados.length,
    equiposOperativos: equiposFiltrados.filter(e => e.estado === 'operativo').length,
    disponibilidadPromedio: equiposFiltrados.reduce((sum, e) => sum + e.disponibilidad, 0) / equiposFiltrados.length || 0,
    mtbfPromedio: equiposFiltrados.reduce((sum, e) => sum + e.mtbf, 0) / equiposFiltrados.length || 0,
    alertasTotales: equiposFiltrados.reduce((sum, e) => sum + e.alertasActivas, 0),
    costoTotalMantenimiento: equiposFiltrados.reduce((sum, e) => sum + e.costoMantenimiento, 0),
    garantiasVencidas: equiposFiltrados.filter(e => !e.garantia.activa).length,
    proximosMantenimientos: equiposFiltrados.filter(e => {
      const dias = Math.ceil((new Date(e.proximoMantenimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return dias <= 7;
    }).length
  };

  // Datos para gráficos
  const datosDisponibilidad = equiposFiltrados.map(equipo => ({
    nombre: equipo.nombre.split(' ')[0],
    disponibilidad: equipo.disponibilidad,
    mtbf: equipo.mtbf / 24, // convertir a días
    estado: equipo.estado
  }));

  const datosRendimiento = equiposFiltrados.map(equipo => ({
    nombre: equipo.nombre.split(' ')[0],
    utilizacion: equipo.rendimiento.utilizacion,
    eficiencia: equipo.rendimiento.eficiencia,
    consumo: equipo.rendimiento.consumoEnergia
  }));

  const distribucioEstados = [
    { name: 'Operativo', value: equiposFiltrados.filter(e => e.estado === 'operativo').length, color: '#10b981' },
    { name: 'Mantenimiento', value: equiposFiltrados.filter(e => e.estado === 'mantenimiento').length, color: '#3b82f6' },
    { name: 'Fuera Servicio', value: equiposFiltrados.filter(e => e.estado === 'fuera_servicio').length, color: '#ef4444' },
    { name: 'Calibración', value: equiposFiltrados.filter(e => e.estado === 'calibracion').length, color: '#8b5cf6' }
  ].filter(item => item.value > 0);

  const datosHistoricos = [
    { fecha: '2024-03-01', disponibilidad: 92.1 },
    { fecha: '2024-03-02', disponibilidad: 91.8 },
    { fecha: '2024-03-03', disponibilidad: 93.5 },
    { fecha: '2024-03-04', disponibilidad: 94.2 },
    { fecha: '2024-03-05', disponibilidad: 89.7 },
    { fecha: '2024-03-06', disponibilidad: 91.3 },
    { fecha: '2024-03-07', disponibilidad: 93.8 }
  ];

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Dashboard Equipos - Tiempo Real
              </h3>
              <p className="text-gray-600">
                Última actualización: {ultimaActualizacion.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActualizandoAutomatico(!actualizandoAutomatico)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                actualizandoAutomatico 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${actualizandoAutomatico ? 'animate-spin' : ''}`} />
              <span>{actualizandoAutomatico ? 'Auto' : 'Manual'}</span>
            </button>

            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Pestañas de vista */}
        <div className="flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'resumen', label: 'Resumen', icon: BarChart3 },
            { key: 'disponibilidad', label: 'Disponibilidad', icon: Activity },
            { key: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
            { key: 'costos', label: 'Costos', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setVistaActiva(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActiva === key 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los tipos</option>
                <option value="ventilador">Ventiladores</option>
                <option value="monitor">Monitores</option>
                <option value="bomba">Bombas</option>
                <option value="desfibrilador">Desfibriladores</option>
              </select>
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="operativo">Operativo</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera_servicio">Fuera Servicio</option>
              <option value="calibracion">Calibración</option>
            </select>

            <select
              value={periodoDatos}
              onChange={(e) => setPeriodoDatos(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="dia">Últimas 24h</option>
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {equiposFiltrados.length} equipos mostrados
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Disponibilidad Promedio</p>
                <p className="text-2xl font-bold text-blue-700">
                  {metricas.disponibilidadPromedio.toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+2.3% vs mes pasado</span>
                </div>
              </div>
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Equipos Operativos</p>
                <p className="text-2xl font-bold text-green-700">
                  {metricas.equiposOperativos}/{metricas.totalEquipos}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">
                    {((metricas.equiposOperativos / metricas.totalEquipos) * 100).toFixed(0)}% operativo
                  </span>
                </div>
              </div>
              <Zap className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">MTBF Promedio</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {(metricas.mtbfPromedio / 24).toFixed(0)} días
                </p>
                <div className="flex items-center mt-1">
                  <Clock className="w-3 h-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-600">
                    {metricas.mtbfPromedio.toFixed(0)} horas
                  </span>
                </div>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Alertas Activas</p>
                <p className="text-2xl font-bold text-red-700">{metricas.alertasTotales}</p>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-600">
                    {metricas.proximosMantenimientos} mantenimientos próximos
                  </span>
                </div>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Contenido según vista activa */}
        {vistaActiva === 'resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de estados */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Distribución por Estado</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={distribucioEstados}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distribucioEstados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {distribucioEstados.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tendencia de disponibilidad */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Tendencia Disponibilidad</h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={datosHistoricos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis domain={[85, 100]} />
                  <Tooltip labelFormatter={(value) => `Fecha: ${new Date(value).toLocaleDateString()}`} />
                  <Area type="monotone" dataKey="disponibilidad" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {vistaActiva === 'disponibilidad' && (
          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Disponibilidad por Equipo</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosDisponibilidad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="disponibilidad" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lista detallada */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Detalle por Equipo</h4>
              {equiposFiltrados.map((equipo) => (
                <div key={equipo.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        equipo.estado === 'operativo' ? 'bg-green-500' :
                        equipo.estado === 'mantenimiento' ? 'bg-blue-500' :
                        equipo.estado === 'calibracion' ? 'bg-purple-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <h5 className="font-medium text-gray-900">{equipo.nombre}</h5>
                        <p className="text-sm text-gray-600">{equipo.ubicacion}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Disponibilidad</p>
                        <p className={`font-semibold ${
                          equipo.disponibilidad >= 95 ? 'text-green-600' :
                          equipo.disponibilidad >= 85 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {equipo.disponibilidad.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">MTBF</p>
                        <p className="font-semibold text-gray-900">
                          {(equipo.mtbf / 24).toFixed(0)}d
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Horas Op.</p>
                        <p className="font-semibold text-gray-900">
                          {equipo.horasOperacion.toLocaleString()}h
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Alertas</p>
                        <p className={`font-semibold ${
                          equipo.alertasActivas === 0 ? 'text-green-600' :
                          equipo.alertasActivas <= 2 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {equipo.alertasActivas}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vistaActiva === 'mantenimiento' && (
          <div className="space-y-6">
            {/* Próximos mantenimientos */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-4">Mantenimientos Próximos (7 días)</h4>
              <div className="space-y-3">
                {equiposFiltrados
                  .filter(e => {
                    const dias = Math.ceil((new Date(e.proximoMantenimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return dias <= 7;
                  })
                  .map((equipo) => {
                    const dias = Math.ceil((new Date(equipo.proximoMantenimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={equipo.id} className="flex items-center justify-between bg-white p-3 rounded">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-gray-900">{equipo.nombre}</p>
                            <p className="text-sm text-gray-600">{equipo.ubicacion}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            dias <= 1 ? 'text-red-600' :
                            dias <= 3 ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {dias <= 0 ? 'Vencido' : `${dias} días`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(equipo.proximoMantenimiento).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Garantías */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-4">Garantías Vencidas</h4>
              <div className="space-y-3">
                {equiposFiltrados
                  .filter(e => !e.garantia.activa)
                  .map((equipo) => (
                    <div key={equipo.id} className="flex items-center justify-between bg-white p-3 rounded">
                      <div className="flex items-center space-x-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900">{equipo.nombre}</p>
                          <p className="text-sm text-gray-600">{equipo.serie}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">Vencida</p>
                        <p className="text-sm text-gray-600">
                          {new Date(equipo.garantia.vencimiento).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'costos' && (
          <div className="space-y-6">
            {/* Resumen de costos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Costo Total Mantenimiento</h5>
                <p className="text-2xl font-bold text-blue-700">
                  {formatearMoneda(metricas.costoTotalMantenimiento)}
                </p>
                <p className="text-sm text-blue-600 mt-1">Este período</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">Costo Promedio por Equipo</h5>
                <p className="text-2xl font-bold text-green-700">
                  {formatearMoneda(metricas.costoTotalMantenimiento / metricas.totalEquipos)}
                </p>
                <p className="text-sm text-green-600 mt-1">Por equipo</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="font-medium text-purple-900 mb-2">Equipos Fuera Garantía</h5>
                <p className="text-2xl font-bold text-purple-700">{metricas.garantiasVencidas}</p>
                <p className="text-sm text-purple-600 mt-1">Requieren seguro extendido</p>
              </div>
            </div>

            {/* Detalle de costos por equipo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Costos por Equipo</h4>
              <div className="space-y-3">
                {equiposFiltrados
                  .sort((a, b) => b.costoMantenimiento - a.costoMantenimiento)
                  .map((equipo) => (
                    <div key={equipo.id} className="flex items-center justify-between bg-white p-3 rounded">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900">{equipo.nombre}</p>
                          <p className="text-sm text-gray-600">{equipo.serie} - {equipo.ubicacion}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-right">
                        <div>
                          <p className="text-sm text-gray-600">Mantenimiento</p>
                          <p className="font-semibold text-gray-900">
                            {formatearMoneda(equipo.costoMantenimiento)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Costo/Hora</p>
                          <p className="font-semibold text-gray-900">
                            {formatearMoneda(equipo.costoMantenimiento / equipo.horasOperacion)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estado Garantía</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            equipo.garantia.activa 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {equipo.garantia.activa ? 'Activa' : 'Vencida'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardEquiposRealTime;