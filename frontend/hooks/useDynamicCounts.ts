'use client'

import { useMemo } from 'react'

// Mock data structure that simulates database counts
const mockCounts = {
  warehouse: {
    total: 428,
    pending: 197,
    approved: 45,
    dispatched: 7,
    finished: 156,
    rejected: 23,
    'spare-parts': 34,
    additional: 12
  },
  decommission: {
    total: 852,
    pending: 718,
    approved: 89,
    rejected: 45
  },
  quotes: {
    total: 480,
    pending: 268,
    approved: 134,
    rejected: 78
  },
  service: {
    total: 1247,
    'pending-preventive': 234,
    'pending-cig': 156,
    approved: 445,
    rejected: 89,
    new: 0 // No count for new requests
  },
  orders: {
    total: 4928,
    'open-preventive': 1858,
    'open-cig': 914,
    closed: 2156,
    changes: 67
  },
  visits: {
    total: 443,
    pending: 52,
    open: 104,
    closed: 287,
    calendar: 0, // No count for calendar view
    activities: 0 // No count for activities view
  },
  config: {
    clients: 89,
    locations: 156,
    equipment: 1247,
    users: 45,
    analysts: 12,
    technicians: 23,
    coordinators: 8,
    sales: 15,
    admins: 5,
    permissions: 0,
    'user-clients': 0,
    'user-locations': 0,
    'spare-parts': 234,
    'equipment-classes': 12,
    'equipment-brands': 34,
    'equipment-models': 89,
    'equipment-areas': 8,
    'equipment-types': 15,
    'order-substates': 23,
    'failure-systems': 45,
    'failure-modes': 67,
    'failure-causes': 89,
    'failure-actions': 34,
    sessions: 0,
    fields: 0,
    preventive: 0,
    legacy: 0
  }
}

export function useDynamicCounts() {
  const getCountForRoute = useMemo(() => {
    return (route: string): number => {
      // Parse route to extract type and status
      const parts = route.split('-')
      const type = parts[0]
      const status = parts.slice(1).join('-')
      
      // Handle special cases
      if (route === 'dashboard') return 0
      if (route.startsWith('config-')) {
        const configKey = route.replace('config-', '')
        return mockCounts.config[configKey as keyof typeof mockCounts.config] || 0
      }
      
      // Get counts from mock data
      const typeCounts = mockCounts[type as keyof typeof mockCounts] as Record<string, number>
      if (!typeCounts) return 0
      
      // Return specific status count or total
      return typeCounts[status] || typeCounts.total || 0
    }
  }, [])

  const getTotalForType = useMemo(() => {
    return (type: string): number => {
      const typeCounts = mockCounts[type as keyof typeof mockCounts] as Record<string, number>
      return typeCounts?.total || 0
    }
  }, [])

  return {
    getCountForRoute,
    getTotalForType,
    mockCounts
  }
}