'use client';
import { AcademicYearWithDetails } from '@/actions/academic-year';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, Text } from 'lucide-react';
import { AcademicYearCellAction } from './academic-year-cell-action';
import { Semester } from '@/generated/prisma';

export function getAcademicYearColumns(): ColumnDef<AcademicYearWithDetails>[] {
  return [
    {
      id: 'no',
      header: 'No.',
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = row.index;
        return pageIndex * pageSize + rowIndex + 1;
      },
      enableSorting: false,
      enableColumnFilter: false
      // size: 60
    },
    {
      id: 'yearRange',
      accessorKey: 'yearRange',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Academic Year' />
      ),
      meta: {
        label: 'Search',
        placeholder: 'Search Year...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'isCurrent',
      accessorKey: 'isCurrent',
      header: 'Status',
      cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <Badge variant={'default'}>Current</Badge>
        ) : null,
      meta: {
        label: 'Status',
        variant: 'select',
        options: [
          { label: 'Current', value: 'true' }
          // { label: 'Inactive', value: 'false' }
        ],
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'semester',
      accessorKey: 'semesters',
      header: 'Semesters',
      cell: ({ cell }) => {
        const semesters = cell.getValue<Semester[]>();
        return <div>{semesters?.length || 0}</div>;
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
