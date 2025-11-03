import { MainLayout } from '@/components/layout/MainLayout'

export default function OrdenesLayout({
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