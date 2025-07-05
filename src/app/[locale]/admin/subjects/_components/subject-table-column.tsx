'use client';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Subject } from '@/generated/prisma';
import { ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { SubjectCellAction } from './subject-cell-action';

export function getSubjectColumns(): ColumnDef<Subject>[] {
  return [
    {
      id: 'No.',
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
      size: 80
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Subject Code' />
      ),
      meta: {
        label: 'Subject Code'
      },
      enableSorting: true
    },
    {
      id: 'search',
      accessorKey: 'subjectName',
      header: 'Subject Name',
      meta: {
        label: 'Subject Name',
        placeholder: 'Search Subject...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'creditHours',
      accessorKey: 'creditHours',
      header: 'Credit Hours',
      meta: {
        label: 'Credit Hours'
      }
    },
    {
      id: 'examWeight',
      accessorKey: 'examWeight',
      header: 'Exam Weight',
      meta: {
        label: 'Exam Weight'
      }
    },
    {
      id: 'assignWeight',
      accessorKey: 'assignWeight',
      header: 'Assessment Weight',
      meta: {
        label: 'Assessment Weight'
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => <SubjectCellAction data={row.original} />,
      size: 40
    }
  ];
}
