'use client';

import { AcademicYearResultWithDetails } from '@/actions/academic-result';
import { AcademicYearWithDetails } from '@/actions/academic-year';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Class, Status } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, CalendarIcon, FileSearch2, Text } from 'lucide-react';
import Link from 'next/link';
import { AcademicResultCellAction } from './academic-result-cell-action';
import { Badge } from '@/components/ui/badge';

export function getAcademicResultColumns({
  academicYears,
  classes
}: {
  academicYears: AcademicYearWithDetails[];
  classes: Class[];
}): ColumnDef<AcademicYearResultWithDetails>[] {
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
      accessorFn: (row) => row.student?.studentName,
      header: 'Student',
      meta: {
        label: 'Student',
        placeholder: 'Search Result...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'academicYearId',
      accessorFn: (row) => `${row.academicYear?.yearRange}`,
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
      id: 'totalGp',
      accessorKey: 'totalGp',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Total GP' />
      ),
      meta: {
        label: 'Total GP'
      },
      enableSorting: true
    },
    // {
    //   id: 'totalCredits',
    //   accessorKey: 'totalCredits',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title='Total Credits' />
    //   ),
    //   meta: {
    //     label: 'Total Credits'
    //   },
    //   enableSorting: true
    // },
    {
      id: 'overallGpa',
      accessorKey: 'overallGpa',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Overall GPA' />
      ),
      meta: {
        label: 'Overall GPA'
      },
      enableSorting: true
    },
    {
      id: 'classId',
      accessorKey: 'semesterCount',
      header: 'Semester',
      cell: ({ cell }) => (
        <div>
          {cell.getValue<Status>()} /{' '}
          {
            academicYears.find(
              (year) => year.id === cell.row.original.academicYearId
            )?.semesters.length
          }
        </div>
      ),
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
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ cell }) => (
        <>
          {cell.getValue<Status>() === Status.PASS ? (
            <Badge>{cell.getValue<Status>()}</Badge>
          ) : (
            <Badge className='bg-destructive'>{cell.getValue<Status>()}</Badge>
          )}
        </>
      ),
      meta: {
        label: 'Status',
        variant: 'multiSelect',
        options: [
          { label: 'Pass', value: Status.PASS },
          { label: 'Fail', value: Status.FAIL },
          { label: 'Incomplete', value: Status.INCOMPLETE }
        ],
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
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
          <Link href={`/admin/academic-year-results/${row.original.id}`}>
            <FileSearch2 className='h-5 w-5 text-primary' />
          </Link>
          <AcademicResultCellAction data={row.original} />
        </div>
      ),
      size: 40
    }
  ];
}
