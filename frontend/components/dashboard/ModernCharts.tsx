'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface ChartProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'pie' | 'line';
}

export function ModernChart({ data, title, type }: ChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Cargando gráfico...
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color || '#3b82f6'),
        borderColor: data.map(item => item.color || '#3b82f6'),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: type !== 'pie' ? {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    } : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}

// Componentes específicos para diferentes tipos de gráficos
export function BarChart({ data, title }: { data: ChartData[]; title: string }) {
  return <ModernChart data={data} title={title} type="bar" />;
}

export function PieChart({ data, title }: { data: ChartData[]; title: string }) {
  return <ModernChart data={data} title={title} type="pie" />;
}

export function LineChart({ data, title }: { data: ChartData[]; title: string }) {
  return <ModernChart data={data} title={title} type="line" />;
}