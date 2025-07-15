'use client';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Student } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarIcon, Text } from 'lucide-react';
import { StudentCellAction } from './student-cell-action';
import { useTranslations } from 'next-intl';

export function getStudentColumns(
  t: ReturnType<typeof useTranslations<'StudentsPage.table'>>
): ColumnDef<Student>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('select_all')}
          className='translate-y-0.5'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('select_row')}
          className='translate-y-0.5'
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: t('no'),
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = row.index;
        return pageIndex * pageSize + rowIndex + 1;
      },
      meta: {
        label: t('no'),
        placeholder: t('search_placeholder'),
        variant: 'text',
        icon: Text
      },
      enableSorting: true,
      enableColumnFilter: true,
      size: 40
    },
    {
      id: 'studentName',
      accessorKey: 'studentName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('name')} />
      ),
      meta: {
        label: t('name')
      }
    },
    {
      id: 'admissionId',
      accessorKey: 'admissionId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admission_id')} />
      ),
      meta: {
        label: t('admission_id')
      }
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('created_at')} />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: t('created_at'),
        variant: 'dateRange',
        icon: CalendarIcon
      },
      enableColumnFilter: true
    },
    {
      id: 'actions',
      cell: ({ row }) => <StudentCellAction data={row.original} />,
      size: 40
    }
  ];
}
