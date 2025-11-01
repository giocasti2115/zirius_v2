
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function MainLayout({ children }) {
    const { auth } = usePage().props;
    const userPermissions = auth.user?.permissions || [];
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Ejemplo de navegación adaptada
        const navigation = [
            { name: 'Dashboard', route: route('dashboard'), icon: 'dashboard' },
            {
                name: 'Solicitudes de Bodega', route: route('warehouse.requests.index'), icon: 'inventory', badge: 249,
                submodules: [
                    { name: 'Todas las Solicitudes', route: route('warehouse.requests.index') },
                    { name: 'Pendientes', route: route('warehouse.requests.pending'), badge: 197 },
                    { name: 'Aprobadas', route: route('warehouse.requests.approved'), badge: 45 },
                    { name: 'Despachadas', route: route('warehouse.requests.dispatched'), badge: 7 },
                    { name: 'Terminadas', route: route('warehouse.requests.finished') },
                    { name: 'Rechazadas', route: route('warehouse.requests.rejected') },
                    { name: 'Repuesto de Solicitudes', route: route('warehouse.requests.spare') },
                    { name: 'Items Adicionales', route: route('warehouse.requests.items') },
                ]
            },
            {
                name: 'Cotizaciones', route: route('quotes.index'), icon: 'request_quote', badge: 268,
                submodules: [
                    { name: 'Todas las Cotizaciones', route: route('quotes.index') },
                    { name: 'Pendientes', route: route('quotes.pending'), badge: 268 },
                    { name: 'Aprobadas', route: route('quotes.approved') },
                    { name: 'Rechazadas', route: route('quotes.rejected') },
                ]
            },
            {
                name: 'Órdenes de Servicio', route: route('service.orders.index'), icon: 'assignment', badge: 2772,
                submodules: [
                    { name: 'Órdenes de Servicio', route: route('service.orders.index') },
                    { name: 'Abiertas Preventivo', route: route('service.orders.open.preventive'), badge: 1858 },
                    { name: 'Abiertas CIG', route: route('service.orders.open.cig'), badge: 914 },
                    { name: 'Cerradas', route: route('service.orders.closed') },
                ]
            },
            {
                name: 'Visitas', route: route('visits.index'), icon: 'location_on', badge: 104,
                submodules: [
                    { name: 'Todas las Visitas', route: route('visits.index') },
                    { name: 'Pendientes', route: route('visits.pending') },
                    { name: 'Abiertas', route: route('visits.open'), badge: 104 },
                    { name: 'Cerradas', route: route('visits.closed') },
                    { name: 'Calendario', route: route('visits.calendar') },
                ]
            },
            { name: 'Informes', route: route('reports.index'), icon: 'bar_chart' },
            {
                name: 'Configuración General', route: route('general.config.index'), icon: 'settings',
                submodules: [
                    { name: 'Usuarios y Accesos', route: route('general.config.users.access') },
                    { name: 'Equipos y Repuestos', route: route('general.config.equipment') },
                    { name: 'Mantenimiento', route: route('general.config.maintenance') },
                ]
            },
            userPermissions.includes('view-users') && { name: 'Usuarios', route: route('users.index'), icon: 'group' },
            userPermissions.includes('view-roles') && { name: 'Roles', route: route('roles.index'), icon: 'admin_panel_settings' },
            userPermissions.includes('view-permissions') && { name: 'Permisos', route: route('permissions.index'), icon: 'vpn_key' },
        ].filter(Boolean);

        const [expandedMenu, setExpandedMenu] = useState(null);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm flex items-center justify-between px-8 py-4 border-b sticky top-0 z-20">
                <div className="font-extrabold text-2xl text-blue-700 tracking-tight">Zirius V2</div>
                <div className="flex items-center gap-6">
                    <span className="material-icons text-gray-400 text-2xl cursor-pointer hover:text-blue-500">menu</span>
                    <input type="text" placeholder="Buscar..." className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-64 text-gray-700" />
                    <span className="material-icons text-gray-400 text-2xl cursor-pointer hover:text-blue-500">notifications</span>
                    <span className="material-icons text-gray-400 text-2xl cursor-pointer hover:text-blue-500">person</span>
                    <Link href={route('logout')} method="post" as="button" className="text-gray-500 hover:text-blue-600 font-medium">Logout</Link>
                </div>
            </header>
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-72 bg-white border-r min-h-screen py-8 px-6 flex flex-col shadow-sm">
                    <nav className="flex flex-col gap-1">
                        {navigation.map((item) => (
                            <div key={item.name} className="mb-1">
                                <button
                                    type="button"
                                    className={`flex items-center px-4 py-2 rounded-lg w-full transition-colors duration-150 text-gray-700 font-semibold hover:bg-blue-50 ${expandedMenu === item.name ? 'bg-blue-100 text-blue-700' : ''}`}
                                    onClick={() => setExpandedMenu(expandedMenu === item.name ? null : item.name)}
                                >
                                    <span className="mr-3 text-blue-500 text-xl flex items-center justify-center">
                                        <span className="material-icons">
                                            {item.icon ? item.icon : 'folder'}
                                        </span>
                                    </span>
                                    <span className="flex-1 text-left">{item.name}</span>
                                    {item.badge && <span className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">{item.badge}</span>}
                                    {item.submodules && (
                                        <span className="material-icons ml-2 text-gray-400">{expandedMenu === item.name ? 'expand_less' : 'expand_more'}</span>
                                    )}
                                </button>
                                {item.submodules && expandedMenu === item.name && (
                                    <div className="ml-8 mt-2 flex flex-col gap-1 animate-fade-in">
                                        {item.submodules.map((sub) => (
                                            <Link key={sub.name} href={sub.route} className="flex items-center px-3 py-1.5 text-sm rounded-lg hover:bg-blue-50 text-gray-600 font-normal transition-colors">
                                                <span>{sub.name}</span>
                                                {sub.badge && <span className="ml-2 bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5 font-semibold">{sub.badge}</span>}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </aside>
                {/* Main Content */}
                <main className="flex-1 p-10 bg-gray-50 min-h-screen rounded-tl-3xl shadow-inner">
                    {children}
                </main>
            </div>
        </div>
    );
}
