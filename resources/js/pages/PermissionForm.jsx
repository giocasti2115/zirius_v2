
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function PermissionForm() {
    return (
        <MainLayout>
            <Head title="Crear/Editar Permiso" />
            <form className="space-y-4 max-w-lg mx-auto mt-8">
                <Input type="text" placeholder="Nombre del permiso" />
                <Input type="text" placeholder="Descripción" />
                <Button type="submit">Guardar</Button>
            </form>
        </MainLayout>
    );
}
