
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'description', label: 'Descripción', sortable: true },
];

const mockData = [
    { id: 1, name: 'Admin', description: 'Rol de administrador' },
    { id: 2, name: 'User', description: 'Rol de usuario' },
];

export default function RolesList() {
    return (
        <MainLayout>
            <Head title="Roles" />
            <DataTable title="Roles" data={mockData} columns={columns} />
        </MainLayout>
    );
}
