import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function GeneralConfigForm() {
  return (
    <MainLayout>
      <Head title="Nueva Configuración" />
      <form className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Nueva Configuración</h2>
        <Input type="text" placeholder="Nombre" />
        <Input type="text" placeholder="Tipo" />
        <Button type="submit">Guardar Configuración</Button>
      </form>
    </MainLayout>
  );
}
