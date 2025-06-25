'use client';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { ClassWithDetails } from '@/actions/class';
import { ClassCellAction } from './class-cell-action';
export function getClassColumns(): ColumnDef<ClassWithDetails>[] {
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
      id: 'Class Name',
      accessorKey: 'className',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Class Name' />
      ),
      enableSorting: false
    },
    {
      id: 'Department Code',
      accessorKey: 'departmentCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Department Code' />
      ),
      enableSorting: false
    },
    {
      id: 'Semester',
      accessorKey: 'semester.semesterName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Semester' />
      ),
      enableSorting: false
    },
    {
      id: 'Academic Year',
      accessorKey: 'semester.academicYear.yearRange',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Academic Year' />
      )
    },
    {
      id: 'Actions',
      cell: ({ row }) => <ClassCellAction data={row.original} />,
      size: 40
    }
  ];
}
