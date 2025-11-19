import { CotizacionesFilteredPage } from '@/components/cotizaciones/CotizacionesFilteredPage';

export default function CotizacionesRechazadasPage() {
  return (
    <CotizacionesFilteredPage
      title="Cotizaciones Rechazadas"
      estado="rechazada"
      description="Historial de cotizaciones rechazadas"
      badgeVariant="destructive"
      emptyMessage="No hay cotizaciones rechazadas en este momento"
    />
  );
}