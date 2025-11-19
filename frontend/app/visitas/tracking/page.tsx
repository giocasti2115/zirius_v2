'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MapaVisitas from '@/components/visitas/MapaVisitas'
import QRCheckInOut from '@/components/visitas/QRCheckInOut'
import GaleriaFotosVisita from '@/components/visitas/GaleriaFotosVisita'
import { 
  MapPin, QrCode, Camera, ArrowLeft, 
  Calendar, User, Clock, Settings 
} from 'lucide-react'
import Link from 'next/link'

interface VisitaDetalles {
  id: number
  numero_visita: string
  cliente_nombre: string
  sede_nombre: string
  direccion: string
  equipo_id?: number
  sede_id: number
  tecnico_nombre: string
  estado: string
  tipo_visita: string
  fecha_programada: string
  descripcion: string
  latitud?: number
  longitud?: number
}

export default function VisitaTrackingPage() {
  const [visita, setVisita] = useState<VisitaDetalles | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabActiva, setTabActiva] = useState('tracking')

  // Datos de ejemplo
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setVisita({
        id: 1,
        numero_visita: 'VST-2024-001',
        cliente_nombre: 'Hospital San Juan',
        sede_nombre: 'Sede Principal',
        direccion: 'Calle 127 #15-20, Bogotá',
        equipo_id: 123,
        sede_id: 45,
        tecnico_nombre: 'Juan Pérez',
        estado: 'en_curso',
        tipo_visita: 'mantenimiento',
        fecha_programada: new Date().toISOString(),
        descripcion: 'Mantenimiento preventivo de ventilador mecánico',
        latitud: 4.7110,
        longitud: -74.0721
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando detalles de la visita...</p>
        </div>
      </div>
    )
  }

  if (!visita) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">No se pudo cargar la información de la visita</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/visitas">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Visitas
            </Button>
          </Link>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tracking de Visita - {visita.numero_visita}
            </h1>
            <p className="text-gray-600 mt-1">
              {visita.cliente_nombre} • {visita.tecnico_nombre}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Finalizar Visita
          </Button>
        </div>
      </div>

      {/* Información de la Visita */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Fecha</p>
                <p className="font-medium">
                  {new Date(visita.fecha_programada).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Hora</p>
                <p className="font-medium">
                  {new Date(visita.fecha_programada).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Técnico</p>
                <p className="font-medium">{visita.tecnico_nombre}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Ubicación</p>
                <p className="font-medium truncate">{visita.direccion}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Funcionalidades */}
      <Tabs value={tabActiva} onValueChange={setTabActiva} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Tracking GPS</span>
            <span className="sm:hidden">GPS</span>
          </TabsTrigger>
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Check-in/out</span>
            <span className="sm:hidden">QR</span>
          </TabsTrigger>
          <TabsTrigger value="fotos" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Galería</span>
            <span className="sm:hidden">Fotos</span>
          </TabsTrigger>
          <TabsTrigger value="mapa" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Mapa</span>
            <span className="sm:hidden">Vista</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Tracking en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <h4 className="font-medium text-blue-900 mb-2">Estado Actual</h4>
                  <p className="text-2xl font-bold text-blue-600 capitalize">
                    {visita.estado.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Última actualización: hace 2 minutos
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border">
                  <h4 className="font-medium text-green-900 mb-2">Ubicación GPS</h4>
                  <p className="text-sm font-mono text-green-700">
                    {visita.latitud?.toFixed(6)}, {visita.longitud?.toFixed(6)}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Precisión: ±5 metros
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border">
                  <h4 className="font-medium text-orange-900 mb-2">Tiempo en Sitio</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    2h 15m
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Tiempo estimado restante: 45m
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Historial de Actividad</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Check-in realizado</p>
                      <p className="text-xs text-gray-600">Hace 2 horas 15 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Mantenimiento iniciado</p>
                      <p className="text-xs text-gray-600">Hace 2 horas 10 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Fotos de evidencia subidas</p>
                      <p className="text-xs text-gray-600">Hace 45 minutos</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkin">
          <QRCheckInOut
            visitaId={visita.id}
            equipoId={visita.equipo_id}
            sedeId={visita.sede_id}
            onCheckIn={(data) => {
              console.log('Check-in realizado:', data)
              // Aquí se actualizaría el estado de la visita
            }}
            onCheckOut={(data) => {
              console.log('Check-out realizado:', data)
              // Aquí se actualizaría el estado de la visita
            }}
          />
        </TabsContent>

        <TabsContent value="fotos">
          <GaleriaFotosVisita
            visitaId={visita.id}
            onFotosChange={(fotos) => {
              console.log('Fotos actualizadas:', fotos.length)
              // Aquí se sincronizarían las fotos con el backend
            }}
          />
        </TabsContent>

        <TabsContent value="mapa">
          <MapaVisitas
            visitas={[{
              id: visita.id,
              numero_visita: visita.numero_visita,
              cliente_nombre: visita.cliente_nombre,
              sede_nombre: visita.sede_nombre,
              direccion: visita.direccion,
              latitud: visita.latitud,
              longitud: visita.longitud,
              tecnico_nombre: visita.tecnico_nombre,
              estado: visita.estado,
              tipo_visita: visita.tipo_visita,
              fecha_programada: visita.fecha_programada,
              hora_estimada: '2:30',
              prioridad: 'media' as const
            }]}
            mostrarTecnicos={true}
            altura="500px"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}