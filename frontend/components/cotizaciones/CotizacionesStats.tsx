'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cotizacionesService } from '@/lib/services/cotizaciones.service';

interface CotizacionesStatsProps {
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

export function CotizacionesStats({ estado }: CotizacionesStatsProps) {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const response = await cotizacionesService.obtenerEstadisticas();
        
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          // Mock data basado en el estado
          setStats(generateMockStats(estado));
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        setStats(generateMockStats(estado));
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, [estado]);

  const generateMockStats = (estado: string) => {
    const baseStats = {
      pendiente: {
        total: 15,
        valor_total: 45000000,
        promedio_dias: 5,
        esta_semana: 8,
        mes_anterior: 22,
        tendencia: 'up'
      },
      aprobada: {
        total: 28,
        valor_total: 125000000,
        promedio_dias: 12,
        esta_semana: 12,
        mes_anterior: 18,
        tendencia: 'up'
      },
      rechazada: {
        total: 7,
        valor_total: 18500000,
        promedio_dias: 8,
        esta_semana: 2,
        mes_anterior: 11,
        tendencia: 'down'
      }
    };

    return baseStats[estado as keyof typeof baseStats] || baseStats.pendiente;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getIcon = () => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'aprobada':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rechazada':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const getColorClasses = () => {
    switch (estado) {
      case 'pendiente':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800'
        };
      case 'aprobada':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          text: 'text-green-800'
        };
      case 'rechazada':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          text: 'text-red-800'
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          text: 'text-gray-800'
        };
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const colors = getColorClasses();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className={`${colors.border} ${colors.bg}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {stats.total || 0}
              </p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            {getIcon()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.valor_total || 0)}
              </p>
              <p className="text-sm text-gray-600">Valor Total</p>
            </div>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.esta_semana || 0}
              </p>
              <p className="text-sm text-gray-600">Esta Semana</p>
            </div>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.promedio_dias || 0}
              </p>
              <p className="text-sm text-gray-600">Días Promedio</p>
            </div>
            <div className="flex items-center">
              {stats.tendencia === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}