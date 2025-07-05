'use client';

import CopyableIdCell from '@/components/copyable-id-cell';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Student } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarIcon, Text } from 'lucide-react';
import { StudentCellAction } from './student-cell-action';

export function getStudentColumns(): ColumnDef<Student>[] {
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
          aria-label='Select all'
          className='translate-y-0.5'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
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
      header: 'No.',
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = row.index;
        return pageIndex * pageSize + rowIndex + 1;
      },
      meta: {
        label: 'Search',
        placeholder: 'Search Student...',
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
        <DataTableColumnHeader column={column} title='Name' />
      )
    },
    {
      id: 'admissionId',
      accessorKey: 'admissionId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Admission ID' />
      )
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Created At' />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: 'Created At',
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
