'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MapaOrdenes from "@/components/ordenes/MapaOrdenes"
import QRCheckInOutOrdenes from "@/components/ordenes/QRCheckInOutOrdenes"
import GaleriaFotosOrden from "@/components/ordenes/GaleriaFotosOrden"
import DashboardOrdenesRealTime from "@/components/ordenes/DashboardOrdenesRealTime"

export default function OrdenesServicioPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Órdenes de Servicio</h1>
        <p className="text-gray-600">
          Sistema completo de gestión y tracking de órdenes de servicio médico
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tracking">Tracking GPS</TabsTrigger>
          <TabsTrigger value="checkin">Check-In/Out</TabsTrigger>
          <TabsTrigger value="fotos">Galería Fotos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardOrdenesRealTime />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <MapaOrdenes />
        </TabsContent>

        <TabsContent value="checkin" className="space-y-6">
          <QRCheckInOutOrdenes />
        </TabsContent>

        <TabsContent value="fotos" className="space-y-6">
          <GaleriaFotosOrden />
        </TabsContent>
      </Tabs>
    </div>
  )
}