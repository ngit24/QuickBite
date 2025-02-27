import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface AnalyticsData {
  date: string;
  value: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
  type: 'revenue' | 'orders';
}

export default function AnalyticsChart({ data, type }: AnalyticsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map(item => new Date(item.date).toLocaleDateString());
    const values = data.map(item => item.value);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: type === 'revenue' ? 'Revenue (₹)' : 'Orders',
            data: values,
            fill: true,
            borderColor: type === 'revenue' ? '#10B981' : '#8B5CF6',
            backgroundColor: type === 'revenue' 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: type === 'revenue' ? '#10B981' : '#8B5CF6',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (type === 'revenue') {
                    label += '₹' + context.parsed.y.toLocaleString();
                  } else {
                    label += context.parsed.y;
                  }
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              callback: (value) => {
                if (type === 'revenue') {
                  return '₹' + value.toLocaleString();
                }
                return value;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type]);

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
}
