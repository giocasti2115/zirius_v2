'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { solicitudApi, CreateSolicitudData } from '@/lib/api/solicitudes';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface NuevaSolicitudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Servicio {
  id: number;
  servicio: string;
}

const SERVICIOS_MOCK: Servicio[] = [
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

export default function NuevaSolicitudModal({ open, onOpenChange, onSuccess }: NuevaSolicitudModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CreateSolicitudData>({
    id_servicio: 0,
    aviso: '',
    observacion: '',
    id_equipo: undefined
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        id_servicio: 0,
        aviso: '',
        observacion: '',
        id_equipo: undefined
      });
      setFormErrors({});
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.id_servicio || formData.id_servicio === 0) {
      errors.id_servicio = 'Debe seleccionar un tipo de servicio';
    }

    if (!formData.aviso.trim()) {
      errors.aviso = 'El aviso es requerido';
    } else if (formData.aviso.length > 20) {
      errors.aviso = 'El aviso no puede exceder 20 caracteres';
    }

    if (!formData.observacion.trim()) {
      errors.observacion = 'La observación es requerida';
    } else if (formData.observacion.length < 10) {
      errors.observacion = 'La observación debe tener al menos 10 caracteres';
    } else if (formData.observacion.length > 2000) {
      errors.observacion = 'La observación no puede exceder 2000 caracteres';
    }

    if (formData.id_equipo && formData.id_equipo <= 0) {
      errors.id_equipo = 'El ID del equipo debe ser un número positivo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        id_equipo: formData.id_equipo || undefined
      };

      const response = await solicitudApi.create(dataToSend);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
        }, 1500);
      } else {
        setError('Error al crear la solicitud');
      }
    } catch (err) {
      console.error('Error creating solicitud:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateSolicitudData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Solicitud Creada!
            </h3>
            <p className="text-green-600">
              La solicitud se ha registrado exitosamente en el sistema.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nueva Solicitud de Servicio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Servicio */}
              <div className="space-y-2">
                <Label htmlFor="id_servicio">Tipo de Servicio *</Label>
                <Select
                  value={formData.id_servicio.toString()}
                  onValueChange={(value) => handleInputChange('id_servicio', parseInt(value))}
                >
                  <SelectTrigger className={formErrors.id_servicio ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccione el tipo de servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICIOS_MOCK.map((servicio) => (
                      <SelectItem key={servicio.id} value={servicio.id.toString()}>
                        {servicio.servicio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.id_servicio && (
                  <p className="text-sm text-red-500">{formErrors.id_servicio}</p>
                )}
              </div>

              {/* Aviso */}
              <div className="space-y-2">
                <Label htmlFor="aviso">Aviso *</Label>
                <Input
                  id="aviso"
                  value={formData.aviso}
                  onChange={(e) => handleInputChange('aviso', e.target.value)}
                  placeholder="Código o identificador del aviso (máx. 20 caracteres)"
                  maxLength={20}
                  className={formErrors.aviso ? 'border-red-500' : ''}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formErrors.aviso && <span className="text-red-500">{formErrors.aviso}</span>}</span>
                  <span>{formData.aviso.length}/20</span>
                </div>
              </div>

              {/* ID Equipo (Opcional) */}
              <div className="space-y-2">
                <Label htmlFor="id_equipo">ID del Equipo (Opcional)</Label>
                <Input
                  id="id_equipo"
                  type="number"
                  value={formData.id_equipo || ''}
                  onChange={(e) => handleInputChange('id_equipo', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Ingrese el ID del equipo si aplica"
                  min="1"
                  className={formErrors.id_equipo ? 'border-red-500' : ''}
                />
                {formErrors.id_equipo && (
                  <p className="text-sm text-red-500">{formErrors.id_equipo}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observacion">Observación *</Label>
                <Textarea
                  id="observacion"
                  value={formData.observacion}
                  onChange={(e) => handleInputChange('observacion', e.target.value)}
                  placeholder="Describa detalladamente la solicitud de servicio, el problema o los requerimientos específicos..."
                  rows={5}
                  maxLength={2000}
                  className={formErrors.observacion ? 'border-red-500' : ''}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formErrors.observacion && <span className="text-red-500">{formErrors.observacion}</span>}</span>
                  <span>{formData.observacion.length}/2000</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  Creando...
                </>
              ) : (
                'Crear Solicitud'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}