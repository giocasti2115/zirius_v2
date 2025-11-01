
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function UserForm() {
    return (
        <MainLayout>
            <Head title="Crear/Editar Usuario" />
            <form className="space-y-4 max-w-lg mx-auto mt-8">
                <Input type="text" placeholder="Nombre" />
                <Input type="email" placeholder="Email" />
                <Input type="password" placeholder="Contraseña" />
                <Button type="submit">Guardar</Button>
            </form>
        </MainLayout>
    );
}
