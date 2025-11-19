'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SolicitudQueryParams, ESTADOS_SOLICITUD, NOMBRES_ESTADOS } from '@/lib/api/solicitudes';
import { 
  Filter, 
  X, 
  Calendar,
  Search,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface FiltrosAvanzadosProps {
  filtros: SolicitudQueryParams;
  onFiltrosChange: (filtros: SolicitudQueryParams) => void;
  onAplicarFiltros: () => void;
  loading?: boolean;
}

const SERVICIOS_MOCK = [
  { id: 1, servicio: 'Preventivo' },
  { id: 2, servicio: 'Correctivo' },
  { id: 3, servicio: 'Instalación' },
  { id: 4, servicio: 'Garantía' },
  { id: 5, servicio: 'Diagnóstico' },
  { id: 6, servicio: 'Calibración' },
  { id: 7, servicio: 'Control de Calidad' },
  { id: 8, servicio: 'Remisión' },
  { id: 9, servicio: 'Recambio' },
  { id: 10, servicio: 'Alistamiento' },
  { id: 11, servicio: 'Recolección' },
  { id: 12, servicio: 'Venta' },
  { id: 13, servicio: 'Pre-instalación' },
  { id: 14, servicio: 'Alistamiento y Entregado' },
  { id: 15, servicio: 'Informe de Baja' },
  { id: 16, servicio: 'Informe' }
];

export default function FiltrosAvanzados({ 
  filtros, 
  onFiltrosChange, 
  onAplicarFiltros, 
  loading = false 
}: FiltrosAvanzadosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosTemporales, setFiltrosTemporales] = useState<SolicitudQueryParams>(filtros);

  useEffect(() => {
    setFiltrosTemporales(filtros);
  }, [filtros]);

  const handleInputChange = (campo: keyof SolicitudQueryParams, valor: string | number | undefined) => {
    setFiltrosTemporales(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = () => {
    onFiltrosChange(filtrosTemporales);
    onAplicarFiltros();
  };

  const limpiarFiltros = () => {
    const filtrosLimpios: SolicitudQueryParams = {
      page: 1,
      limit: 10
    };
    setFiltrosTemporales(filtrosLimpios);
    onFiltrosChange(filtrosLimpios);
    onAplicarFiltros();
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.estado) count++;
    if (filtros.id_servicio) count++;
    if (filtros.fecha_desde) count++;
    if (filtros.fecha_hasta) count++;
    if (filtros.aviso) count++;
    if (filtros.id_creador) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y controles principales */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por aviso o observación..."
              value={filtrosTemporales.aviso || ''}
              onChange={(e) => handleInputChange('aviso', e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {filtrosActivos > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filtrosActivos}
              </Badge>
            )}
          </Button>
          
          <Button
            onClick={aplicarFiltros}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {mostrarFiltros && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Filtros Avanzados</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrarFiltros(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Estado */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={filtrosTemporales.estado?.toString() || ''}
                  onValueChange={(value) => handleInputChange('estado', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value={ESTADOS_SOLICITUD.PENDIENTE.toString()}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        {NOMBRES_ESTADOS[ESTADOS_SOLICITUD.PENDIENTE]}
                      </div>
                    </SelectItem>
                    <SelectItem value={ESTADOS_SOLICITUD.APROBADA.toString()}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {NOMBRES_ESTADOS[ESTADOS_SOLICITUD.APROBADA]}
                      </div>
                    </SelectItem>
                    <SelectItem value={ESTADOS_SOLICITUD.RECHAZADA.toString()}>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        {NOMBRES_ESTADOS[ESTADOS_SOLICITUD.RECHAZADA]}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Servicio */}
              <div className="space-y-2">
                <Label>Tipo de Servicio</Label>
                <Select
                  value={filtrosTemporales.id_servicio?.toString() || ''}
                  onValueChange={(value) => handleInputChange('id_servicio', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los servicios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los servicios</SelectItem>
                    {SERVICIOS_MOCK.map((servicio) => (
                      <SelectItem key={servicio.id} value={servicio.id.toString()}>
                        {servicio.servicio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ID Creador */}
              <div className="space-y-2">
                <Label>ID Creador</Label>
                <Input
                  type="number"
                  placeholder="ID del usuario creador"
                  value={filtrosTemporales.id_creador || ''}
                  onChange={(e) => handleInputChange('id_creador', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              {/* Fecha Desde */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Fecha Desde
                </Label>
                <Input
                  type="date"
                  value={filtrosTemporales.fecha_desde || ''}
                  onChange={(e) => handleInputChange('fecha_desde', e.target.value)}
                />
              </div>

              {/* Fecha Hasta */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Fecha Hasta
                </Label>
                <Input
                  type="date"
                  value={filtrosTemporales.fecha_hasta || ''}
                  onChange={(e) => handleInputChange('fecha_hasta', e.target.value)}
                />
              </div>

              {/* Ordenamiento */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select
                  value={`${filtrosTemporales.sortBy || 'creacion'}-${filtrosTemporales.sortOrder || 'DESC'}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-');
                    handleInputChange('sortBy', sortBy);
                    handleInputChange('sortOrder', sortOrder as 'ASC' | 'DESC');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creacion-DESC">Fecha creación (más reciente)</SelectItem>
                    <SelectItem value="creacion-ASC">Fecha creación (más antiguo)</SelectItem>
                    <SelectItem value="id-DESC">ID (mayor a menor)</SelectItem>
                    <SelectItem value="id-ASC">ID (menor a mayor)</SelectItem>
                    <SelectItem value="id_estado-ASC">Estado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={limpiarFiltros}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar Filtros
              </Button>
              <Button
                onClick={aplicarFiltros}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mostrar filtros activos */}
      {filtrosActivos > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {filtros.estado && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Estado: {NOMBRES_ESTADOS[filtros.estado as keyof typeof NOMBRES_ESTADOS]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const nuevosFiltros = { ...filtros };
                  delete nuevosFiltros.estado;
                  onFiltrosChange(nuevosFiltros);
                  onAplicarFiltros();
                }}
              />
            </Badge>
          )}
          {filtros.id_servicio && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Servicio: {SERVICIOS_MOCK.find(s => s.id === filtros.id_servicio)?.servicio || filtros.id_servicio}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const nuevosFiltros = { ...filtros };
                  delete nuevosFiltros.id_servicio;
                  onFiltrosChange(nuevosFiltros);
                  onAplicarFiltros();
                }}
              />
            </Badge>
          )}
          {filtros.fecha_desde && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Desde: {filtros.fecha_desde}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const nuevosFiltros = { ...filtros };
                  delete nuevosFiltros.fecha_desde;
                  onFiltrosChange(nuevosFiltros);
                  onAplicarFiltros();
                }}
              />
            </Badge>
          )}
          {filtros.fecha_hasta && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Hasta: {filtros.fecha_hasta}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const nuevosFiltros = { ...filtros };
                  delete nuevosFiltros.fecha_hasta;
                  onFiltrosChange(nuevosFiltros);
                  onAplicarFiltros();
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}