'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { getAcademicYears } from '@/actions/academic-year';

function YearFilter({
  selectedYear,
  onYearChange,
  availableYears,
  currentYear = '2024-2025'
}: {
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: string[];
  currentYear?: string;
}) {
  const t = useTranslations('DashboardPage.filters');

  return (
    <div className='flex items-center space-x-2'>
      <label htmlFor='year-select' className='text-sm font-medium'>
        {t('academic_year')}:
      </label>
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className='w-[200px]' id='year-select'>
          <SelectValue placeholder={t('select_year')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='current'>
            {t('current_year', { year: currentYear })}
          </SelectItem>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const DashboardFilter = () => {
  const t = useTranslations('DashboardPage');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [currentYear, setCurrentYear] = useState<string>('2024-2025');

  const [selectedYear, setSelectedYear] = useQueryState('year', {
    defaultValue: 'current',
    shallow: false
  });

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await getAcademicYears();
        if (response?.years && response?.years.length > 0) {
          const currentYearData = response.years.find((year) => year.isCurrent);
          const otherYears = response.years.filter((year) => !year.isCurrent);

          setAvailableYears(otherYears.map((year) => year.yearRange));
          if (currentYearData) {
            setCurrentYear(currentYearData.yearRange);
          }
        }
      } catch (error) {
        console.error('Error fetching years:', error);
        // Fallback years
        setAvailableYears(['2022-2023', '2023-2024', '2025-2026']);
      }
    };

    fetchYears();
  }, []);

  return (
    <YearFilter
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
      availableYears={availableYears}
      currentYear={currentYear}
    />
  );
};

export default DashboardFilter;
