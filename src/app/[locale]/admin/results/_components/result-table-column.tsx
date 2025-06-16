'use client';

import CopyableIdCell from '@/components/copyable-id-cell';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Result } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarIcon, Text } from 'lucide-react';
import { ResultCellAction } from './result-cell-action';
import { ResultWithDetails } from '@/actions/result';

export function getResultColumns(): ColumnDef<ResultWithDetails>[] {
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
      id: 'enrollmentId',
      accessorKey: 'enrollmentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Enrollment ID' />
      ),
      cell: ({ cell }) => <CopyableIdCell value={cell.getValue<string>()} />,
      meta: {
        label: 'Search',
        placeholder: 'Search Result...',
        variant: 'text',
        icon: Text
      },
      enableSorting: true,
      enableColumnFilter: true
    },
    {
      id: 'studentId',
      accessorFn: (row) => row.enrollment?.studentId,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Student ID' />
      ),
      cell: ({ cell }) => <CopyableIdCell value={cell.getValue<string>()} />,
      enableSorting: true,
      enableColumnFilter: true
    },
    {
      id: 'student',
      accessorFn: (row) => row.enrollment?.student?.studentName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Student' />
      )
    },
    {
      id: 'class',
      accessorFn: (row) => row.enrollment?.class?.className,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Class' />
      )
    },
    {
      id: 'year',
      accessorFn: (row) =>
        `${row.enrollment?.semester?.academicYear?.yearRange}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Year' />
      )
    },
    {
      id: 'gpa',
      accessorKey: 'gpa',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='GPA' />
      ),
      cell: ({ cell }) => cell.getValue<number>().toFixed(2)
    },
    {
      id: 'totalCredits',
      accessorKey: 'totalCredits',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Total Credits' />
      ),
      cell: ({ cell }) => cell.getValue<number>().toFixed(1)
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
      id: 'rank',
      accessorKey: 'rank',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Rank' />
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => <ResultCellAction data={row.original} />,
      size: 40
    }
  ];
}
