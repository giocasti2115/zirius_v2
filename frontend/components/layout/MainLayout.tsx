'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  BarChart3, Monitor, FileText, Wrench, Calendar, 
  DollarSign, Users, Settings, Menu, LogOut
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Resumen general y métricas'
  },
  {
    name: 'Equipos',
    href: '/equipos',
    icon: Monitor,
    description: 'Gestión de equipos médicos'
  },
  {
    name: 'Solicitudes',
    href: '/solicitudes',
    icon: FileText,
    description: 'Solicitudes de servicio'
  },
  {
    name: 'Órdenes de Trabajo',
    href: '/ordenes',
    icon: Wrench,
    description: 'Órdenes de trabajo técnico'
  },
  {
    name: 'Visitas',
    href: '/visitas',
    icon: Calendar,
    description: 'Programación de visitas'
  },
  {
    name: 'Cotizaciones',
    href: '/cotizaciones',
    icon: DollarSign,
    description: 'Gestión de cotizaciones'
  }
]

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const NavigationContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="font-semibold text-lg">ZIRIUZ</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Usuario Admin</p>
            <p className="text-xs text-muted-foreground">admin@ziriuz.com</p>
          </div>
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-muted/40">
        <NavigationContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 sm:px-6 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
                <span className="sr-only">Abrir sidebar</span>
              </Button>
            </SheetTrigger>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">Z</span>
            </div>
            <span className="font-semibold">ZIRIUZ</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}