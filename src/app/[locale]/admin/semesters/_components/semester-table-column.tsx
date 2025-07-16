'use client';
import { SemesterWithDetails } from '@/actions/semester';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { AcademicYear } from '@/generated/prisma';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { CalendarCheck, Text } from 'lucide-react';
import { SemesterCellAction } from './semester-cell-action';

export function getSemesterColumns({
  academicYear,
  t
}: {
  academicYear: AcademicYear[];
  t: ReturnType<typeof useTranslations<'SemestersPage.table'>>;
}): ColumnDef<SemesterWithDetails>[] {
  return [
    {
      id: 'No.',
      accessorKey: 'id',
      header: t('no'),
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = row.index;
        return pageIndex * pageSize + rowIndex + 1;
      },
      meta: {
        label: t('no')
      },
      size: 60
    },
    {
      id: 'search',
      accessorKey: 'semesterName',
      header: t('semester_name'),
      meta: {
        label: t('semester_name'),
        placeholder: t('search_placeholder'),
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'academicYearId',
      accessorFn: (row) => row.academicYear?.yearRange,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('academic_year')} />
      ),
      meta: {
        label: t('academic_year'),
        variant: 'multiSelect',
        options: academicYear.map((year) => ({
          label: `${year.yearRange} ${year.isCurrent ? `(${t('current')})` : ''}`,
          value: year.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'isCurrent',
      accessorKey: 'isCurrent',
      header: t('status'),
      cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <Badge variant={'default'}>{t('current')}</Badge>
        ) : null,
      meta: {
        label: t('status'),
        variant: 'select',
        options: [
          { label: t('current'), value: 'true' }
          // { label: 'Inactive', value: 'false' }
        ],
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <SemesterCellAction data={row.original} academicYear={academicYear} />
      ),
      size: 40
    }
  ];
}
