import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function QuoteForm() {
  return (
    <MainLayout>
      <Head title="Nueva Cotización" />
      <form className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Nueva Cotización</h2>
        <Input type="text" placeholder="Cliente" />
        <Input type="date" placeholder="Fecha" />
        <Input type="text" placeholder="Monto" />
        <Input type="text" placeholder="Estado" />
        <Input type="text" placeholder="Validez" />
        <Button type="submit">Guardar Cotización</Button>
      </form>
    </MainLayout>
  );
}
