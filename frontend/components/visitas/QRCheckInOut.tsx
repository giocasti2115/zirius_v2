'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  QrCode, MapPin, Clock, Camera, CheckCircle2, 
  AlertTriangle, Navigation, User, Calendar,
  Upload, X, Eye, Download, Share, Smartphone
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface CheckInData {
  ubicacion: {
    latitud: number
    longitud: number
    precision: number
    direccion?: string
  }
  fecha_hora: string
  observaciones: string
  fotos: File[]
  firma_digital?: string
}

interface QRCheckProps {
  visitaId: number
  equipoId?: number
  sedeId?: number
  onCheckIn?: (data: CheckInData) => void
  onCheckOut?: (data: CheckInData) => void
}

export default function QRCheckInOut({ 
  visitaId, 
  equipoId, 
  sedeId, 
  onCheckIn, 
  onCheckOut 
}: QRCheckProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [qrData, setQrData] = useState<string | null>(null)
  const [checkInData, setCheckInData] = useState<CheckInData>({
    ubicacion: { latitud: 0, longitud: 0, precision: 0 },
    fecha_hora: new Date().toISOString(),
    observaciones: '',
    fotos: []
  })
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])

  // Obtener ubicación al montar el componente
  useEffect(() => {
    obtenerUbicacion()
  }, [])

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalización no soportada en este dispositivo')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setCheckInData(prev => ({
          ...prev,
          ubicacion: {
            latitud: latitude,
            longitud: longitude,
            precision: accuracy
          }
        }))
        
        // Obtener dirección aproximada (simulado)
        obtenerDireccion(latitude, longitude)
        setLoading(false)
      },
      (error) => {
        setLocationError(`Error obteniendo ubicación: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const obtenerDireccion = async (lat: number, lng: number) => {
    // Simulación de geocoding inverso
    setTimeout(() => {
      const direcciones = [
        'Calle 127 #15-20, Bogotá',
        'Carrera 7 #32-45, Bogotá',
        'Avenida 68 #45-60, Bogotá',
        'Calle 100 #19-30, Bogotá'
      ]
      const direccionAleatoria = direcciones[Math.floor(Math.random() * direcciones.length)]
      
      setCheckInData(prev => ({
        ...prev,
        ubicacion: {
          ...prev.ubicacion,
          direccion: direccionAleatoria
        }
      }))
    }, 1000)
  }

  const generarQRCode = (data: any) => {
    // En una implementación real, aquí se generaría el QR con una librería como qrcode
    const qrString = JSON.stringify({
      visita_id: visitaId,
      equipo_id: equipoId,
      sede_id: sedeId,
      timestamp: Date.now(),
      ...data
    })
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="none" stroke="black" stroke-width="2"/>
        <rect x="30" y="30" width="20" height="20" fill="black"/>
        <rect x="60" y="30" width="20" height="20" fill="black"/>
        <rect x="90" y="30" width="20" height="20" fill="black"/>
        <rect x="150" y="30" width="20" height="20" fill="black"/>
        <rect x="30" y="60" width="20" height="20" fill="black"/>
        <rect x="150" y="60" width="20" height="20" fill="black"/>
        <rect x="30" y="90" width="20" height="20" fill="black"/>
        <rect x="60" y="90" width="20" height="20" fill="black"/>
        <rect x="120" y="90" width="20" height="20" fill="black"/>
        <rect x="150" y="90" width="20" height="20" fill="black"/>
        <rect x="30" y="150" width="20" height="20" fill="black"/>
        <rect x="60" y="150" width="20" height="20" fill="black"/>
        <rect x="90" y="150" width="20" height="20" fill="black"/>
        <rect x="150" y="150" width="20" height="20" fill="black"/>
        <text x="100" y="190" text-anchor="middle" font-size="10" fill="black">VST-${visitaId}</text>
      </svg>
    `)}`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    setCheckInData(prev => ({
      ...prev,
      fotos: [...prev.fotos, ...files]
    }))

    // Crear previsualizaciones
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setCheckInData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }))
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      // Validar que tengamos ubicación
      if (!checkInData.ubicacion.latitud || !checkInData.ubicacion.longitud) {
        throw new Error('Ubicación requerida para el check-in')
      }

      // Simular envío al servidor
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsCheckedIn(true)
      onCheckIn?.(checkInData)
      
      console.log('Check-in exitoso:', checkInData)
    } catch (error) {
      console.error('Error en check-in:', error)
      alert('Error realizando check-in')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      // Actualizar timestamp para check-out
      const checkOutData = {
        ...checkInData,
        fecha_hora: new Date().toISOString()
      }

      // Simular envío al servidor
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsCheckedIn(false)
      onCheckOut?.(checkOutData)
      
      console.log('Check-out exitoso:', checkOutData)
    } catch (error) {
      console.error('Error en check-out:', error)
      alert('Error realizando check-out')
    } finally {
      setLoading(false)
    }
  }

  const iniciarEscaneoQR = () => {
    setIsScanning(true)
    
    // Simulación de escaneo QR
    setTimeout(() => {
      const codigoSimulado = `QR-EQUIPO-${equipoId || 'SEDE'}-${sedeId || visitaId}`
      setQrData(codigoSimulado)
      setIsScanning(false)
    }, 3000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Check-in/out con QR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado Actual */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isCheckedIn ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {isCheckedIn ? 'Visitando' : 'Fuera de sitio'}
              </span>
            </div>
            <Badge variant={isCheckedIn ? 'default' : 'outline'}>
              {isCheckedIn ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          {/* Información de Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ubicación Actual</Label>
              {locationError ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{locationError}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={obtenerUbicacion}
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <div className="p-3 border rounded-lg">
                  {loading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                      <span className="text-sm">Obteniendo ubicación...</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>
                          {checkInData.ubicacion.latitud.toFixed(6)}, {checkInData.ubicacion.longitud.toFixed(6)}
                        </span>
                      </div>
                      {checkInData.ubicacion.direccion && (
                        <div className="text-xs text-gray-600">
                          {checkInData.ubicacion.direccion}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Precisión: ±{Math.round(checkInData.ubicacion.precision)}m
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Información de Visita</Label>
              <div className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span>Visita #{visitaId}</span>
                </div>
                {equipoId && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Equipo:</span>
                    <span>EQ-{equipoId}</span>
                  </div>
                )}
                {sedeId && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span>Sede #{sedeId}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>
                    {new Date(checkInData.fecha_hora).toLocaleString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Escáner QR */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Verificación QR</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={iniciarEscaneoQR}
                disabled={isScanning}
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Escanear QR del Equipo
                  </>
                )}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Código QR de la Visita</DialogTitle>
                  </DialogHeader>
                  <div className="text-center space-y-4">
                    <img 
                      src={generarQRCode(checkInData)} 
                      alt="QR Code" 
                      className="mx-auto border"
                    />
                    <p className="text-sm text-gray-600">
                      Presenta este código para verificación
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar QR
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {qrData && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">QR Escaneado: {qrData}</span>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Registra observaciones sobre la visita..."
              value={checkInData.observaciones}
              onChange={(e) => setCheckInData(prev => ({
                ...prev,
                observaciones: e.target.value
              }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Fotos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fotos de la Visita</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="foto-upload"
                />
                <label htmlFor="foto-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      Agregar Fotos
                    </span>
                  </Button>
                </label>
                <span className="text-xs text-gray-500">
                  {checkInData.fotos.length} foto(s) seleccionada(s)
                </span>
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {previewImages.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-4">
            {!isCheckedIn ? (
              <Button
                onClick={handleCheckIn}
                disabled={loading || locationError !== null}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Hacer Check-in
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCheckOut}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Hacer Check-out
                  </>
                )}
              </Button>
            )}
            
            <Button variant="outline" disabled={loading}>
              <Share className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>

          {/* Información Adicional */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Instrucciones:</div>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Asegúrate de estar en la ubicación correcta</li>
                  <li>Escanea el código QR del equipo o sede</li>
                  <li>Toma fotos de referencia si es necesario</li>
                  <li>Completa las observaciones relevantes</li>
                  <li>Haz check-out al finalizar la visita</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}