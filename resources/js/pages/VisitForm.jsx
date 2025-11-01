import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function VisitForm() {
  return (
    <MainLayout>
      <Head title="Nueva Visita" />
      <form className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Nueva Visita</h2>
        <Input type="date" placeholder="Fecha" />
        <Input type="text" placeholder="Sede" />
        <Input type="text" placeholder="Técnico" />
        <Input type="text" placeholder="Estado" />
        <Input type="text" placeholder="Duración" />
        <Button type="submit">Guardar Visita</Button>
      </form>
    </MainLayout>
  );
}
