import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function WarehouseRequestForm() {
  return (
    <MainLayout>
      <Head title="Nueva Solicitud de Bodega" />
      <form className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Nueva Solicitud de Bodega</h2>
        <Input type="text" placeholder="Servicio" />
        <Input type="date" placeholder="Fecha de creación" />
        <Input type="text" placeholder="Equipo" />
        <Input type="text" placeholder="Estado" />
        <Input type="text" placeholder="Sede" />
        <Button type="submit">Guardar Solicitud</Button>
      </form>
    </MainLayout>
  );
}
