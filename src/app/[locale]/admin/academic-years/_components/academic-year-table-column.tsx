'use client';
import { ColumnDef } from '@tanstack/react-table';
import { AcademicYear } from '@/generated/prisma';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { AcademicYearCellAction } from './academic-year-cell-action';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export function getAcademicYearColumns(): ColumnDef<AcademicYear>[] {
  return [
    {
      id: 'id',
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='No.' />
      ),
      enableSorting: true
    },
    {
      id: 'yearRange',
      accessorKey: 'yearRange',
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
        ) : null
    },
    {
      id: 'actions',
      cell: ({ row }) => <AcademicYearCellAction data={row.original} />,
      size: 40
    }
  ];
}
