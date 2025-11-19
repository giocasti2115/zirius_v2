import { MainLayout } from '@/components/layout/MainLayout'

export default function DarBajaLayout({
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