import { CotizacionesFilteredPage } from '@/components/cotizaciones/CotizacionesFilteredPage';

export default function CotizacionesPendientesPage() {
  return (
    <CotizacionesFilteredPage
      title="Cotizaciones Pendientes"
      estado="pendiente"
      description="Gestión de cotizaciones pendientes de aprobación"
      badgeVariant="outline"
      emptyMessage="No hay cotizaciones pendientes en este momento"
    />
  );
}