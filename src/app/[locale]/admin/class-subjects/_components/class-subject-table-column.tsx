'use client';
import { ClassWithDetails } from '@/actions/class';
import { ColumnDef } from '@tanstack/react-table';
// import { ClassCellAction } from './class-cell-action';
import { CalendarCheck, Text } from 'lucide-react';
import { ClassSubjectManager } from './class-subject-manager';
import { AcademicYear, Semester } from '@/generated/prisma';

const Code = ['CS', 'CT', 'CST'];

export function getClassSubjectColumns({
  academicYears,
  semesters
}: {
  academicYears: AcademicYear[];
  semesters: Semester[];
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
      id: 'departmentCode',
      accessorKey: 'departmentCode',
      header: 'Code',
      meta: {
        label: 'Code',
        variant: 'multiSelect',
        options: Code.map((c) => ({
          label: c,
          value: c
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
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
      enableColumnFilter: true
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
      id: 'assignSubjects',
      accessorFn: (row) => row.subjects?.length || 0,
      header: 'Assigned Subjects',
      meta: {
        label: 'Assigned Subjects'
      }
    },

    {
      id: 'actions',
      cell: ({ row }) => (
        <ClassSubjectManager
          classId={row.original.id}
          className={row.original.className}
        />
      ),

      size: 40
    }
  ];
}
