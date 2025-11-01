import React from 'react';
import { useForm, router } from '@inertiajs/react';

export default function PermissionForm({ permission = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: permission?.name || '',
        slug: permission?.slug || '',
        description: permission?.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (permission) {
            put(route('permissions.update', permission.id), {
                onSuccess: () => router.visit(route('permissions.index')),
            });
        } else {
            post(route('permissions.store'), {
                onSuccess: () => router.visit(route('permissions.index')),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">{permission ? 'Editar Permiso' : 'Crear Permiso'}</h2>
            <div className="mb-4">
                <label className="block mb-1">Nombre</label>
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Slug</label>
                <input type="text" value={data.slug} onChange={e => setData('slug', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.slug && <div className="text-red-500 text-xs">{errors.slug}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Descripción</label>
                <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.description && <div className="text-red-500 text-xs">{errors.description}</div>}
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={processing}>
                {permission ? 'Actualizar' : 'Crear'}
            </button>
        </form>
    );
}
