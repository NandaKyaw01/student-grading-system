'use client';

import { AcademicYearResultWithDetails } from '@/actions/academic-result';
import { AcademicYearWithDetails } from '@/actions/academic-year';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Class, Status } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, CalendarIcon, FileSearch2, Text } from 'lucide-react';
import Link from 'next/link';
import { AcademicResultCellAction } from './academic-result-cell-action';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

export function getAcademicResultColumns({
  academicYears,
  classes,
  t
}: {
  academicYears: AcademicYearWithDetails[];
  classes: Class[];
  t: ReturnType<typeof useTranslations<'AcademicYearResultsPage.table'>>;
}): ColumnDef<AcademicYearResultWithDetails>[] {
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
      id: 'no',
      accessorKey: 'enrollmentId',
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
      size: 60
    },
    {
      id: 'search',
      accessorFn: (row) => row.student?.studentName,
      header: t('student'),
      meta: {
        label: t('student'),
        placeholder: t('search_placeholder'),
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'admissionId',
      accessorFn: (row) => `${row.student?.admissionId}`,
      header: t('admission_id'),
      meta: {
        label: t('admission_id')
      }
    },
    {
      id: 'academicYearId',
      accessorFn: (row) => `${row.academicYear?.yearRange}`,
      header: t('academic_year'),
      meta: {
        label: t('academic_year'),
        variant: 'multiSelect',
        options: academicYears.map((year) => ({
          label: `${year.yearRange} ${year.isCurrent ? `(${t('current')})` : ''}`,
          value: year.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'totalGp',
      accessorKey: 'totalGp',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('total_gp')} />
      ),
      meta: {
        label: t('total_gp')
      },
      enableSorting: true
    },
    {
      id: 'overallGpa',
      accessorKey: 'overallGpa',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('overall_gpa')} />
      ),
      meta: {
        label: t('overall_gpa')
      },
      enableSorting: true
    },
    {
      id: 'classId',
      accessorKey: 'semesterCount',
      header: t('semester'),
      cell: ({ cell }) => (
        <div>
          {cell.getValue<Status>()} /{' '}
          {
            academicYears.find(
              (year) => year.id === cell.row.original.academicYearId
            )?.semesters.length
          }
        </div>
      ),
      meta: {
        label: t('class'),
        variant: 'multiSelect',
        options: classes.map((cls) => ({
          label: `${cls.className} (${cls.departmentCode})`,
          value: cls.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('status'),
      cell: ({ cell }) => (
        <>
          {cell.getValue<Status>() === Status.PASS ? (
            <Badge>{t('pass')}</Badge>
          ) : cell.getValue<Status>() === Status.INCOMPLETE ? (
            <Badge className='bg-chart-4'>{t('incomplete')}</Badge>
          ) : (
            <Badge className='bg-destructive'>{t('fail')}</Badge>
          )}
        </>
      ),
      meta: {
        label: t('status'),
        variant: 'multiSelect',
        options: [
          { label: t('pass'), value: Status.PASS },
          { label: t('fail'), value: Status.FAIL },
          { label: t('incomplete'), value: Status.INCOMPLETE }
        ],
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('created_at')} />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: t('created_at'),
        variant: 'dateRange',
        icon: CalendarIcon
      },
      enableColumnFilter: true
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex justify-center gap-2 items-center'>
          <Link href={`/admin/academic-year-results/${row.original.id}`}>
            <FileSearch2 className='h-5 w-5 text-primary' />
          </Link>
          <AcademicResultCellAction data={row.original} />
        </div>
      ),
      size: 40
    }
  ];
}
