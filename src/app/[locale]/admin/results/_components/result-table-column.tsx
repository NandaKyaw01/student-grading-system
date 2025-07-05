'use client';

import { ResultWithDetails } from '@/actions/result';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AcademicYear, Class, Semester, Status } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, CalendarIcon, FileSearch2, Text } from 'lucide-react';
import Link from 'next/link';
import { ResultCellAction } from './result-cell-action';

export function getResultColumns({
  academicYears,
  semesters,
  classes
}: {
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: Class[];
}): ColumnDef<ResultWithDetails>[] {
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
      id: 'no',
      accessorKey: 'enrollmentId',
      header: () => <div className='text-center'>No.</div>,
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = row.index;
        return (
          <div className='text-center'>
            {pageIndex * pageSize + rowIndex + 1}
          </div>
        );
      },
      meta: {
        label: 'No.'
      },
      enableSorting: false,
      enableColumnFilter: false,
      size: 60
    },
    {
      id: 'search',
      accessorFn: (row) => row.enrollment?.student?.studentName,
      header: 'Student',
      meta: {
        label: 'Student',
        placeholder: 'Search Result...',
        variant: 'text',
        icon: Text
      },
      size: 100,
      enableColumnFilter: true
    },
    {
      id: 'rollnumber',
      accessorFn: (row) => `${row.enrollment?.rollNumber}`,
      header: 'Roll No.'
    },
    {
      id: 'academicYearId',
      accessorFn: (row) =>
        `${row.enrollment?.semester?.academicYear?.yearRange}`,
      header: 'Year',
      meta: {
        label: 'Academic Year',
        variant: 'multiSelect',
        options: academicYears.map((year) => ({
          label: `${year.yearRange} ${year.isCurrent ? '(Current)' : ''}`,
          value: year.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'semesterId',
      accessorFn: (row) => `${row.enrollment?.semester?.semesterName}`,
      header: 'Semester',
      meta: {
        label: 'Semester',
        variant: 'multiSelect',
        options: semesters.map((seme) => ({
          label: `${seme.semesterName} ${seme.isCurrent ? '(Current)' : ''}`,
          value: seme.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'classId',
      accessorFn: (row) =>
        `${row.enrollment?.class?.className} (${row.enrollment?.class?.departmentCode})`,
      header: 'Class',
      meta: {
        label: 'Class',
        variant: 'multiSelect',
        options: classes.map((cls) => ({
          label: `${cls.className} (${cls.departmentCode})`,
          value: cls.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
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
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ cell }) => cell.getValue<Status>()
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
      cell: ({ row }) => (
        <div className='flex justify-center gap-2 items-center'>
          <Link href={`/admin/results/${row.original.enrollmentId}/view`}>
            <FileSearch2 className='h-5 w-5 text-primary' />
          </Link>
          <ResultCellAction data={row.original} />
        </div>
      ),
      size: 40
    }
  ];
}
