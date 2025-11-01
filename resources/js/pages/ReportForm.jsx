import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function ReportForm() {
  return (
    <MainLayout>
      <Head title="Nuevo Informe" />
      <form className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Nuevo Informe</h2>
        <Input type="text" placeholder="Equipo" />
        <Input type="text" placeholder="Modelo" />
        <Input type="text" placeholder="Sede" />
        <Input type="text" placeholder="Correctivos" />
        <Input type="text" placeholder="Promedio" />
        <Input type="text" placeholder="Total" />
        <Button type="submit">Guardar Informe</Button>
      </form>
    </MainLayout>
  );
}
