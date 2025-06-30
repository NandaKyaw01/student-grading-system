'use client';
import { SubjectWithDetails } from '@/actions/subject';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { SubjectCellAction } from './subject-cell-action';

export function getSubjectColumns(): ColumnDef<SubjectWithDetails>[] {
  return [
    {
      id: 'ID',
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      enableSorting: false
    },
    {
      id: 'Subject Name',
      accessorKey: 'subjectName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Subject Name' />
      )
    },
    {
      id: 'Credit Hours',
      accessorKey: 'creditHours',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Credit Hours' />
      ),
      enableSorting: false
    },
    {
      id: 'Exam Weight',
      accessorKey: 'examWeight',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Exam Weight' />
      ),
      enableSorting: false
    },
    {
      id: 'Assignment Weight',
      accessorKey: 'assignWeight',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Assignment Weight' />
      ),
      enableSorting: false
    },
    {
      id: 'Actions',
      cell: ({ row }) => <SubjectCellAction data={row.original} />,
      size: 40
    }
  ];
}
