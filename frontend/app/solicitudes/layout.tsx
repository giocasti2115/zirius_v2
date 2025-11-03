import { MainLayout } from '@/components/layout/MainLayout'

export default function SolicitudesLayout({
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