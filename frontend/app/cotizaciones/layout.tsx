import { MainLayout } from '@/components/layout/MainLayout'

export default function CotizacionesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  )
}