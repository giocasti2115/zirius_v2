import { MainLayout } from '@/components/layout/MainLayout'

export default function EquiposLayout({
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