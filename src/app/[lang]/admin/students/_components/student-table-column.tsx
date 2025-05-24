'use client';

import CopyableIdCell from '@/components/copyable-id-cell';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { AcademicYear, Class, Student } from '@/types/prisma';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarIcon, Text } from 'lucide-react';
import { StudentCellAction } from './student-cell-action';
import { formatDate } from '@/lib/format';

export function getStudentColumns(
  classes: Class[],
  academicYears: AcademicYear[]
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      )
    },
    {
      id: 'rollNumber',
      accessorKey: 'rollNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Roll Number' />
      ),
      enableSorting: false
    },
    {
      id: 'classId',
      accessorKey: 'classId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Class' />
      ),
      cell: ({ row }) => row.original.class.className,
      enableColumnFilter: true,
      meta: {
        label: 'Class',
        variant: 'multiSelect',
        options: classes.map((cls) => ({
          label: cls.className,
          value: cls.id
        }))
      },
      enableSorting: false
    },
    {
      id: 'academicYearId',
      accessorKey: 'academicYearId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Academic Year' />
      ),
      cell: ({ row }) => row.original.academicYear.year,
      meta: {
        label: 'Academic Year',
        variant: 'multiSelect',
        options: academicYears.map((yr) => ({
          label: yr.year,
          value: yr.id
        }))
      },
      enableColumnFilter: true,
      enableSorting: false
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
