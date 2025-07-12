'use client';
import { ClassWithDetails } from '@/actions/class';
import { AcademicYear, Class, Semester } from '@/generated/prisma';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, Text } from 'lucide-react';
import { ClassCellAction } from './class-cell-action';

export function getClassColumns({
  academicYears,
  semesters,
  classes
}: {
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: Class[];
}): ColumnDef<ClassWithDetails>[] {
  return [
    {
      id: 'id',
      accessorKey: 'id',
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
      size: 40
    },
    {
      id: 'search',
      accessorKey: 'className',
      header: 'Class Name',
      meta: {
        label: 'Class Name',
        placeholder: 'Search Class...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'academicYearId',
      accessorFn: (row) => row.semester?.academicYear?.yearRange,
      header: 'Academic Year',
      meta: {
        label: 'Academic Year',
        variant: 'multiSelect',
        options: academicYears.map((year) => ({
          label: `${year.yearRange} ${year.isCurrent ? '(Current)' : ''}`,
          value: year.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'semesterId',
      accessorFn: (row) => row.semester?.semesterName,
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
      id: 'departmentCode',
      accessorKey: 'departmentCode',
      header: 'Class Code',
      meta: {
        label: 'Class Code',
        variant: 'multiSelect',
        options: classes.map((c) => ({
          label: c.departmentCode,
          value: c.departmentCode
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'actions',
      cell: ({ row }) => <ClassCellAction data={row.original} />,
      size: 40
    }
  ];
}
