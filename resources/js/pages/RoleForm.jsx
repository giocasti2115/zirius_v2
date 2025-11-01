
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function RoleForm() {
    return (
        <MainLayout>
            <Head title="Crear/Editar Rol" />
            <form className="space-y-4 max-w-lg mx-auto mt-8">
                <Input type="text" placeholder="Nombre del rol" />
                <Input type="text" placeholder="Descripción" />
                <Button type="submit">Guardar</Button>
            </form>
        </MainLayout>
    );
}
