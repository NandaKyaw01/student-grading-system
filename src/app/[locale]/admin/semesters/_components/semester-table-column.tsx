'use client';
import { SemesterWithDetails } from '@/actions/semester';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { SemesterCellAction } from './semester-cell-action';
import { Badge } from '@/components/ui/badge';

export function getSemesterColumns(): ColumnDef<SemesterWithDetails>[] {
  return [
    {
      id: 'id',
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='No.' />
      ),
      enableSorting: false
    },
    {
      id: 'semesterName',
      accessorKey: 'semesterName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Semester Name' />
      ),
      enableSorting: false
    },
    {
      id: 'academicYearId',
      accessorKey: 'academicYear.yearRange',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Academic Year' />
      )
    },
    {
      id: 'isCurrent',
      accessorKey: 'isCurrent',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <Badge variant={'default'}>Current</Badge>
        ) : null,
      enableSorting: false
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Action' />
      ),
      cell: ({ row }) => <SemesterCellAction data={row.original} />,
      size: 40
    }
  ];
}
