
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

export default function UsersList() {
    return (
        <MainLayout>
            <Head title="Usuarios" />
            <DataTable title="Usuarios" />
        </MainLayout>
    );
}
