'use client';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { GradeScale } from '@/generated/prisma';
import { ColumnDef } from '@tanstack/react-table';
import { GradeScaleCellAction } from './grade-scale-table-cell-action';
import { Text } from 'lucide-react';

export function getGradeScaleColumns(): ColumnDef<GradeScale>[] {
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
      id: 'minMark',
      accessorFn: (row) => `${row.minMark} - ${row.maxMark}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mark Range' />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.minMark} — {row.original.maxMark}
        </span>
      ),
      meta: {
        label: 'Mark Range',
        placeholder: 'Search Grade Scale...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true,
      size: 120
    },
    {
      id: 'grade',
      accessorKey: 'grade',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Grade' />
      ),
      meta: {
        label: 'Grade'
      },
      size: 80
    },
    {
      id: 'score',
      accessorKey: 'score',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Grade Point' />
      ),
      cell: ({ cell }) => cell.getValue<number>().toFixed(2),
      meta: {
        label: 'Score'
      },
      size: 80
    },
    {
      id: 'actions',
      cell: ({ row }) => <GradeScaleCellAction data={row.original} />,
      size: 40
    }
  ];
}
