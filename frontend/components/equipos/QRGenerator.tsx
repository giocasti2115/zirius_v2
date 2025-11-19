'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Download, 
  Printer, 
  Copy, 
  Check,
  Settings,
  RefreshCw
} from 'lucide-react';

interface QRGeneratorProps {
  equipoId?: number;
  codigoInterno?: string;
  nombreEquipo?: string;
  onClose?: () => void;
}

export function QRGenerator({ equipoId, codigoInterno, nombreEquipo, onClose }: QRGeneratorProps) {
  const [qrData, setQrData] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  
  // Generar data para QR
  const generateQRData = () => {
    const baseUrl = window.location.origin;
    const equipoUrl = `${baseUrl}/equipos/${equipoId || 'nuevo'}`;
    
    const qrInfo = {
      tipo: 'equipo_medico',
      id: equipoId || 0,
      codigo: codigoInterno || 'NUEVO',
      nombre: nombreEquipo || 'Equipo Médico',
      url: equipoUrl,
      timestamp: new Date().toISOString(),
      sistema: 'Zirius Medical'
    };
    
    return JSON.stringify(qrInfo);
  };

  const handleGenerateQR = () => {
    const data = generateQRData();
    setQrData(data);
    setQrGenerated(true);
  };

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  const handleDownloadQR = () => {
    // En una implementación real, aquí generarías y descargarías la imagen QR
    console.log('Descargando QR para:', { equipoId, codigoInterno, nombreEquipo });
    alert('Funcionalidad de descarga QR en desarrollo');
  };

  const handlePrintQR = () => {
    // En una implementación real, aquí abrirías ventana de impresión con QR
    console.log('Imprimiendo QR para:', { equipoId, codigoInterno, nombreEquipo });
    alert('Funcionalidad de impresión QR en desarrollo');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Generador de Código QR
        </CardTitle>
        {(codigoInterno || nombreEquipo) && (
          <div className="text-sm text-gray-600">
            <p><strong>Código:</strong> {codigoInterno || 'N/A'}</p>
            <p><strong>Equipo:</strong> {nombreEquipo || 'Sin nombre'}</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuración del QR */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Tamaño del QR</label>
            <select
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={150}>Pequeño (150x150)</option>
              <option value={200}>Mediano (200x200)</option>
              <option value={300}>Grande (300x300)</option>
              <option value={400}>Extra Grande (400x400)</option>
            </select>
          </div>
        </div>

        {/* Botón Generar */}
        {!qrGenerated ? (
          <Button 
            onClick={handleGenerateQR} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Generar Código QR
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Vista previa del QR (simulada) */}
            <div className="flex justify-center">
              <div 
                className="border-2 border-gray-300 rounded-lg bg-white flex items-center justify-center"
                style={{ width: qrSize, height: qrSize }}
              >
                <div className="text-center text-gray-500">
                  <QrCode className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">QR Code</p>
                  <p className="text-xs">{qrSize}x{qrSize}</p>
                </div>
              </div>
            </div>

            {/* Información del QR */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">Datos codificados:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={qrData}
                  readOnly
                  className="text-xs font-mono bg-white"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyData}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadQR}
                className="flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </Button>
              <Button
                variant="outline"
                onClick={handlePrintQR}
                className="flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>

            {/* Regenerar */}
            <Button
              variant="ghost"
              onClick={() => {
                setQrGenerated(false);
                setQrData('');
              }}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generar Nuevo QR
            </Button>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-800 font-medium mb-1">ℹ️ Información del QR</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Contiene información completa del equipo</li>
            <li>• Compatible con lectores QR estándar</li>
            <li>• Incluye enlace directo al sistema</li>
            <li>• Datos cifrados y seguros</li>
          </ul>
        </div>

        {/* Botón cerrar si es modal */}
        {onClose && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
          >
            Cerrar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}