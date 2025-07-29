'use client';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Subject } from '@/generated/prisma';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Text } from 'lucide-react';
import { SubjectCellAction } from './subject-cell-action';

export function getSubjectColumns(
  t: ReturnType<typeof useTranslations<'SubjectPage.table'>>
): ColumnDef<Subject>[] {
  return [
    {
      id: 'No.',
      accessorKey: 'id',
      header: () => <div className='text-center'>{t('no')}</div>,
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
        label: t('no')
      },
      enableSorting: false,
      enableColumnFilter: false,
      size: 80
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('subject_code')} />
      ),
      meta: {
        label: t('subject_code')
      },
      enableSorting: true
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: t('priority')
    },
    {
      id: 'search',
      accessorKey: 'subjectName',
      header: t('subject_name'),
      meta: {
        label: t('subject_name'),
        placeholder: t('search_placeholder'),
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'creditHours',
      accessorKey: 'creditHours',
      header: t('credit_hours'),
      meta: {
        label: t('credit_hours')
      }
    },
    {
      id: 'examWeight',
      accessorKey: 'examWeight',
      header: t('exam_weight'),
      meta: {
        label: t('exam_weight')
      }
    },
    {
      id: 'assignWeight',
      accessorKey: 'assignWeight',
      header: t('assessment_weight'),
      meta: {
        label: t('assessment_weight')
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => <SubjectCellAction data={row.original} />,
      size: 40
    }
  ];
}
