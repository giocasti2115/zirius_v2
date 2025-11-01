import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'cliente', label: 'Cliente', sortable: true },
  { key: 'fecha', label: 'Fecha', sortable: true },
  { key: 'monto', label: 'Monto', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'validez', label: 'Validez', sortable: true },
];

const mockData = [
  { id: 1, cliente: 'Sede Norte', fecha: '2025-10-01', monto: '$1,000,000', estado: 'Pendiente', validez: '30 días' },
  { id: 2, cliente: 'Sede Sur', fecha: '2025-10-02', monto: '$2,500,000', estado: 'Aprobada', validez: '15 días' },
];

export default function QuotesList() {
  return (
    <MainLayout>
      <Head title="Cotizaciones" />
      <DataTable title="Cotizaciones" data={mockData} columns={columns} />
    </MainLayout>
  );
}
