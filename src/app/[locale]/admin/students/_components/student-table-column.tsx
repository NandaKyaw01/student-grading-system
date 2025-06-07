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
      id: 'search',
      accessorKey: 'id',
      header: 'ID',
      cell: ({ cell }) => <CopyableIdCell value={cell.getValue<string>()} />,
      meta: {
        label: 'Search',
        placeholder: 'Search Student...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'name',
      accessorKey: 'studentName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      )
    },
    // {
    //   id: 'rollNumber',
    //   accessorKey: 'rollNumber',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title='Roll Number' />
    //   ),
    //   enableSorting: false
    // },
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
