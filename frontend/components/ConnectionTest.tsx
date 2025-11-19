'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { warehouseApi } from '@/lib/api/warehouse'
import { api } from '@/lib/api/client'

type TestStatus = 'idle' | 'loading' | 'success' | 'error'

interface TestResult {
  name: string
  status: TestStatus
  message: string
  details?: any
}

export function ConnectionTest() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const tests = [
    {
      name: 'Backend Health Check',
      test: async () => {
        const response = await fetch('http://localhost:3002/health')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        return { message: 'Backend is healthy', details: data }
      }
    },
    {
      name: 'API Client Connection',
      test: async () => {
        try {
          const response = await api.get('/test')
          return { message: 'API client working', details: response }
        } catch (error: any) {
          // Expect 401 or 404, which means the API is reachable
          if (error.response?.status === 401 || error.response?.status === 404) {
            return { message: 'API accessible (authentication required)', details: error.response.data }
          }
          throw error
        }
      }
    },
    {
      name: 'Warehouse API Endpoints',
      test: async () => {
        try {
          const response = await warehouseApi.getAllRequests()
          return { message: 'Warehouse endpoints accessible', details: response }
        } catch (error: any) {
          if (error.response?.status === 401) {
            return { message: 'Warehouse API accessible (authentication required)', details: error.response.data }
          }
          throw error
        }
      }
    },
    {
      name: 'Environment Variables',
      test: async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'
        return { 
          message: `API URL configured: ${apiUrl}`, 
          details: { 
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            resolved: apiUrl
          } 
        }
      }
    }
  ]

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    for (const testCase of tests) {
      const result: TestResult = {
        name: testCase.name,
        status: 'loading',
        message: 'Running...'
      }
      
      setResults(prev => [...prev, result])

      try {
        const testResult = await testCase.test()
        result.status = 'success'
        result.message = testResult.message
        result.details = testResult.details
      } catch (error: any) {
        result.status = 'error'
        result.message = error.message || 'Test failed'
        result.details = error.response?.data || error
      }

      setResults(prev => prev.map(r => r.name === result.name ? result : r))
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'loading':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case 'loading':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Running</Badge>
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Backend Connection Test
        </CardTitle>
        <p className="text-sm text-gray-600">
          Verify that the frontend can communicate with the backend API
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={result.name} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                
                <p className="text-sm text-gray-600">{result.message}</p>
                
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      Show details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && !isRunning && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Test Summary</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>✅ Success: {results.filter(r => r.status === 'success').length}/{results.length}</p>
              <p>❌ Failed: {results.filter(r => r.status === 'error').length}/{results.length}</p>
              {results.filter(r => r.status === 'error').length === 0 && (
                <p className="text-green-600 font-medium">All tests passed! Frontend can communicate with backend.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}