'use client'

import React from 'react'
import { MasterLayout } from './layout/MasterLayout'

interface NavigableDashboardLayoutProps {
  children: React.ReactNode
}

export function NavigableDashboardLayout({ children }: NavigableDashboardLayoutProps) {
  // This component now simply wraps the new MasterLayout
  // to maintain compatibility with existing imports
  return (
    <MasterLayout>
      {children}
    </MasterLayout>
  )
}