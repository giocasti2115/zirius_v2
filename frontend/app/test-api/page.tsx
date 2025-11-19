'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestApiPage() {
  const [status, setStatus] = useState<{
    backend: string;
    ordenes: string;
    stats: string;
    error: string | null;
  }>({
    backend: 'Checking...',
    ordenes: 'Checking...',
    stats: 'Checking...',
    error: null
  })

  const testConnections = async () => {
    setStatus({
      backend: 'Testing...',
      ordenes: 'Testing...',
      stats: 'Testing...',
      error: null
    })

    try {
      // Test 1: Backend base
      const backendResponse = await fetch('http://localhost:3002/api/v1/real/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      // Test 2: Órdenes endpoint
      const ordenesResponse = await fetch('http://localhost:3002/api/v1/real/ordenes?limit=1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      // Test 3: Stats endpoint
      const statsResponse = await fetch('http://localhost:3002/api/v1/real/ordenes/stats/general', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      setStatus({
        backend: backendResponse.ok ? `✅ ${backendResponse.status}` : `❌ ${backendResponse.status}`,
        ordenes: ordenesResponse.ok ? `✅ ${ordenesResponse.status}` : `❌ ${ordenesResponse.status}`,
        stats: statsResponse.ok ? `✅ ${statsResponse.status}` : `❌ ${statsResponse.status}`,
        error: null
      })

      // Log responses
      if (ordenesResponse.ok) {
        const ordenesData = await ordenesResponse.json()
        console.log('📋 Órdenes data:', ordenesData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('📊 Stats data:', statsData)
      }

    } catch (error) {
      console.error('❌ Test error:', error)
      setStatus({
        backend: '❌ Error',
        ordenes: '❌ Error',
        stats: '❌ Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  useEffect(() => {
    testConnections()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">API Connection Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <h3 className="font-semibold">Backend Base</h3>
              <p className="text-lg">{status.backend}</p>
            </div>
            <div className="text-center p-4 border rounded">
              <h3 className="font-semibold">Órdenes API</h3>
              <p className="text-lg">{status.ordenes}</p>
            </div>
            <div className="text-center p-4 border rounded">
              <h3 className="font-semibold">Stats API</h3>
              <p className="text-lg">{status.stats}</p>
            </div>
          </div>
          
          {status.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-red-800">Error:</h4>
              <p className="text-red-700">{status.error}</p>
            </div>
          )}
          
          <Button onClick={testConnections} className="w-full">
            Test Again
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><strong>Backend URL:</strong> http://localhost:3002</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
            <p><strong>Browser:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Server-side'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}