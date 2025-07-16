'use client';
import { AcademicYearWithDetails } from '@/actions/academic-year';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, Text } from 'lucide-react';
import { AcademicYearCellAction } from './academic-year-cell-action';
import { Semester } from '@/generated/prisma';
import { useTranslations } from 'next-intl';

export function getAcademicYearColumns(
  t: ReturnType<typeof useTranslations<'AcademicYearsPage.table'>>
): ColumnDef<AcademicYearWithDetails>[] {
  return [
    {
      id: 'No.',
      header: t('no'),
      accessorKey: 'id',
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = row.index;
        return pageIndex * pageSize + rowIndex + 1;
      },
      meta: {
        label: t('no')
      },
      enableSorting: false,
      enableColumnFilter: false
      // size: 60
    },
    {
      id: 'yearRange',
      accessorKey: 'yearRange',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('academic_year')} />
      ),
      meta: {
        label: t('academic_year'),
        placeholder: t('search_placeholder'),
        variant: 'text',
        icon: Text
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
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'Semester',
      accessorKey: 'semesters',
      header: t('semesters'),
      cell: ({ cell }) => {
        const semesters = cell.getValue<Semester[]>();
        return <div>{semesters?.length || 0}</div>;
      },
      meta: {
        label: t('semesters')
      },
      enableColumnFilter: false,
      enableSorting: false
    },
    {
      id: 'actions',
      cell: ({ row }) => <AcademicYearCellAction data={row.original} />,
      size: 40
    }
  ];
}
