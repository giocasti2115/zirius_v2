'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MasterLayout } from './MasterLayout'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const [isProtectedRoute, setIsProtectedRoute] = useState(false)

  useEffect(() => {
    // Routes that don't need the master layout
    const publicRoutes = ['/login', '/']
    setIsProtectedRoute(!publicRoutes.includes(pathname))
  }, [pathname])

  // If it's a public route (like login), render without master layout
  if (!isProtectedRoute) {
    return <>{children}</>
  }

  // For protected routes, wrap with master layout
  return <MasterLayout>{children}</MasterLayout>
}