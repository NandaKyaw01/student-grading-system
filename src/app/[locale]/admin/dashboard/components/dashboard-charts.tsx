'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BarChart3, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface DashboardChartsProps {
  gradeDistribution: Array<{
    grade: string;
    count: number;
  }>;
  departmentDistribution: Array<{
    department: string;
    count: number;
  }>;
  colors: string[];
}

export function DashboardCharts({
  gradeDistribution,
  departmentDistribution,
  colors
}: DashboardChartsProps) {
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {/* Grade Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <BarChart3 className='h-5 w-5 mr-2' />
            Grade Distribution
          </CardTitle>
          <CardDescription>Current semester grade breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='grade' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='count' fill='#8884d8' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subject Performance Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Users className='h-5 w-5 mr-2' />
            Department Distribution
          </CardTitle>
          <CardDescription>Student enrollment by department</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={departmentDistribution}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ department, count, percent }) =>
                  `${department}: ${count} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='count'
              >
                {departmentDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
