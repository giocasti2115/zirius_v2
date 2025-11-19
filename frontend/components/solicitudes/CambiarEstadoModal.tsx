'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { solicitudApi, Solicitud, ESTADOS_SOLICITUD, NOMBRES_ESTADOS, COLORES_ESTADOS } from '@/lib/api/solicitudes';
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface CambiarEstadoModalProps {
  solicitud: Solicitud | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CambiarEstadoModal({ solicitud, open, onOpenChange, onSuccess }: CambiarEstadoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<number>(0);
  const [observaciones, setObservaciones] = useState('');

  // Reset form when modal opens/closes
  useState(() => {
    if (open && solicitud) {
      setNuevoEstado(solicitud.id_estado);
      setObservaciones('');
      setError(null);
      setSuccess(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!solicitud) return;

    if (nuevoEstado === 0) {
      setError('Debe seleccionar un estado');
      return;
    }

    if (nuevoEstado === solicitud.id_estado) {
      setError('Debe seleccionar un estado diferente al actual');
      return;
    }

    if (!observaciones.trim()) {
      setError('Las observaciones son requeridas para el cambio de estado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await solicitudApi.cambiarEstado(solicitud.id, nuevoEstado, observaciones);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
        }, 1500);
      } else {
        setError('Error al cambiar el estado de la solicitud');
      }
    } catch (err) {
      console.error('Error changing estado:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado: number) => {
    switch (estado) {
      case ESTADOS_SOLICITUD.PENDIENTE:
        return <Clock className="h-4 w-4" />;
      case ESTADOS_SOLICITUD.APROBADA:
        return <CheckCircle className="h-4 w-4" />;
      case ESTADOS_SOLICITUD.RECHAZADA:
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEstadoBadge = (estado: number) => {
    const nombre = NOMBRES_ESTADOS[estado as keyof typeof NOMBRES_ESTADOS] || 'Desconocido';
    const color = COLORES_ESTADOS[estado as keyof typeof COLORES_ESTADOS] || 'bg-gray-100 text-gray-800';
    
    return (
      <Badge className={`${color} border-0 flex items-center gap-1`}>
        {getEstadoIcon(estado)}
        {nombre}
      </Badge>
    );
  };

  if (!solicitud) return null;

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Estado Actualizado!
            </h3>
            <p className="text-green-600">
              El estado de la solicitud se ha cambiado exitosamente.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Cambiar Estado de Solicitud</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la solicitud */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Solicitud #{solicitud.id}</h4>
                <p className="text-sm text-gray-600">
                  {solicitud.aviso && `Aviso: ${solicitud.aviso}`}
                </p>
              </div>
              <div>
                {getEstadoBadge(solicitud.id_estado)}
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {solicitud.observacion}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Nuevo Estado */}
            <div className="space-y-2">
              <Label htmlFor="nuevo_estado">Nuevo Estado *</Label>
              <Select
                value={nuevoEstado.toString()}
                onValueChange={(value) => setNuevoEstado(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ESTADOS_SOLICITUD.PENDIENTE.toString()}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Pendiente
                    </div>
                  </SelectItem>
                  <SelectItem value={ESTADOS_SOLICITUD.APROBADA.toString()}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Aprobada
                    </div>
                  </SelectItem>
                  <SelectItem value={ESTADOS_SOLICITUD.RECHAZADA.toString()}>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Rechazada
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones del Cambio *</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Explique el motivo del cambio de estado..."
                rows={4}
                maxLength={600}
                required
              />
              <div className="text-right text-xs text-gray-500">
                {observaciones.length}/600
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Estado'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}