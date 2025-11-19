'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Componente de gráfico de barras simple usando CSS
interface SimpleBarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
}

export function SimpleBarChart({ data, title }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm font-medium truncate">{item.name}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || '#3b82f6',
                    minWidth: '30px'
                  }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de gráfico de pie simple usando CSS
interface SimplePieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
}

export function SimplePieChart({ data, title }: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Gráfico circular simulado */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-gray-200"></div>
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold">{total}</span>
              </div>
            </div>
          </div>
          
          {/* Leyenda */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color || '#3b82f6' }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}