import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'tipo', label: 'Tipo', sortable: true },
];

const mockData = [
  { id: 1, nombre: 'Clientes', tipo: 'Configuración' },
  { id: 2, nombre: 'Sedes', tipo: 'Configuración' },
  { id: 3, nombre: 'Equipos', tipo: 'Configuración' },
];

export default function GeneralConfigList() {
  return (
    <MainLayout>
      <Head title="Configuración General" />
      <DataTable title="Configuración General" data={mockData} columns={columns} />
    </MainLayout>
  );
}
