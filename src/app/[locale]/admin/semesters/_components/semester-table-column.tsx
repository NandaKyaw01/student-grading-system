'use client';
import { SemesterWithDetails } from '@/actions/semester';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { AcademicYear } from '@/generated/prisma';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, Text } from 'lucide-react';
import { SemesterCellAction } from './semester-cell-action';

export function getSemesterColumns({
  academicYear
}: {
  academicYear: AcademicYear[];
}): ColumnDef<SemesterWithDetails>[] {
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
      size: 60
    },
    {
      id: 'search',
      accessorKey: 'semesterName',
      header: 'Semester Name',
      meta: {
        label: 'Semester Name',
        placeholder: 'Search Semester...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'academicYearId',
      accessorKey: 'academicYear.yearRange',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Academic Year' />
      ),
      meta: {
        label: 'Academic Year',
        variant: 'multiSelect',
        options: academicYear.map((year) => ({
          label: year.yearRange,
          value: year.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
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
      enableColumnFilter: true
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <SemesterCellAction data={row.original} academicYear={academicYear} />
      ),
      size: 40
    }
  ];
}
