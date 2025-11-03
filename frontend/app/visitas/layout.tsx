import { MainLayout } from '@/components/layout/MainLayout'

export default function VisitasLayout({
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