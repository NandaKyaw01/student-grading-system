'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  colors: string[];
}

export function DashboardCharts({
  gradeDistribution,
  statusDistribution,
  colors
}: DashboardChartsProps) {
  const t = useTranslations('DashboardPage.charts');

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {/* Grade Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <BarChart3 className='h-5 w-5 mr-2' />
            {t('grade_distribution.title')}
          </CardTitle>
          <CardDescription>{t('grade_distribution.description')}</CardDescription>
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

      {/* Student Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <PieChartIcon className='h-5 w-5 mr-2' />
            {t('status_distribution.title')}
          </CardTitle>
          <CardDescription>
            {t('status_distribution.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ status, count, percent }) =>
                  `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='count'
              >
                {statusDistribution.map((entry, index) => (
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
