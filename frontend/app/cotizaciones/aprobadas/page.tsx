import { CotizacionesFilteredPage } from '@/components/cotizaciones/CotizacionesFilteredPage';

export default function CotizacionesAprobadasPage() {
  return (
    <CotizacionesFilteredPage
      title="Cotizaciones Aprobadas"
      estado="aprobada"
      description="Gestión de cotizaciones aprobadas y en proceso"
      badgeVariant="default"
      emptyMessage="No hay cotizaciones aprobadas en este momento"
    />
  );
}