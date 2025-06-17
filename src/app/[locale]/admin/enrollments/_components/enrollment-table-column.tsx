'use client';

import CopyableIdCell from '@/components/copyable-id-cell';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Enrollment } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarIcon, Text } from 'lucide-react';
import { EnrollmentCellAction } from './enrollment-cell-action';
import { EnrollmentWithDetails } from '@/actions/enrollment';

export function getEnrollmentColumns(): ColumnDef<EnrollmentWithDetails>[] {
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ cell }) => <CopyableIdCell value={cell.getValue<string>()} />,
      enableSorting: true,
      enableColumnFilter: true
    },
    {
      id: 'rollNumber',
      accessorKey: 'rollNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Roll Number' />
      )
    },
    {
      id: 'search',
      accessorFn: (row) => row.student?.studentName,
      header: 'Student',
      meta: {
        label: 'Search',
        placeholder: 'Search ...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'className',
      accessorFn: (row) => row.class.className,
      header: 'Class'
    },
    {
      id: 'semester',
      accessorFn: (row) =>
        `${row.semester?.semesterName} (${row.semester?.academicYear?.yearRange})`,
      header: 'Semester'
    },
    {
      id: 'isActive',
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ cell }) => (
        <Badge variant={cell.getValue() ? 'default' : 'destructive'}>
          {cell.getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        return row.getValue(id) === (value === 'active');
      }
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
      cell: ({ row }) => <EnrollmentCellAction data={row.original} />,
      size: 40
    }
  ];
}
