'use client';

import { ResultWithDetails } from '@/actions/result';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AcademicYear, Class, Semester, Status } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, CalendarIcon, FileSearch2, Text } from 'lucide-react';
import Link from 'next/link';
import { ResultCellAction } from './result-cell-action';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export function getResultColumns({
  academicYears,
  semesters,
  classes,
  t
}: {
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: Class[];
  t: ReturnType<typeof useTranslations<'ResultsBySemester'>>;
}): ColumnDef<ResultWithDetails>[] {
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
      header: () => <div className='text-center'>{t('table.no')}</div>,
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
        label: t('table.no')
      },
      enableSorting: false,
      enableColumnFilter: false,
      size: 60
    },
    {
      id: 'search',
      accessorFn: (row) => row.enrollment?.student?.studentName,
      header: t('table.student_name'),
      meta: {
        label: t('table.student_name'),
        placeholder: t('search_placeholder'),
        variant: 'text',
        icon: Text
      },
      size: 100,
      enableColumnFilter: true
    },
    {
      id: 'admissionId',
      accessorFn: (row) => `${row.enrollment?.student?.admissionId}`,
      header: t('table.admission_id'),
      meta: {
        label: t('table.admission_id')
      }
    },
    {
      id: 'rollnumber',
      accessorFn: (row) => `${row.enrollment?.rollNumber}`,
      header: t('table.roll_no'),
      meta: {
        label: t('table.roll_no')
      }
    },
    {
      id: 'academicYearId',
      accessorFn: (row) =>
        `${row.enrollment?.semester?.academicYear?.yearRange}`,
      header: t('table.academic_year'),
      meta: {
        label: t('table.academic_year'),
        variant: 'multiSelect',
        options: academicYears.map((year) => ({
          label: `${year.yearRange} ${year.isCurrent ? `(${t('table.current')})` : ''}`,
          value: year.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'semesterId',
      accessorFn: (row) => `${row.enrollment?.semester?.semesterName}`,
      header: t('table.semester'),
      meta: {
        label: t('table.semester'),
        variant: 'multiSelect',
        options: semesters.map((seme) => ({
          label: `${seme.semesterName} ${seme.isCurrent ? `(${t('table.current')})` : ''}`,
          value: seme.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'classId',
      accessorFn: (row) =>
        `${row.enrollment?.class?.className} (${row.enrollment?.class?.departmentCode})`,
      header: t('table.class'),
      meta: {
        label: t('table.class'),
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
      id: 'gpa',
      accessorKey: 'gpa',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.gpa')} />
      ),
      cell: ({ cell }) => cell.getValue<number>().toFixed(2),
      meta: {
        label: t('table.gpa')
      }
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ cell }) => (
        <>
          {cell.getValue<Status>() === Status.PASS ? (
            <Badge>{t('table.pass')}</Badge>
          ) : (
            <Badge className='bg-destructive'>{t('table.fail')}</Badge>
          )}
        </>
      ),
      meta: {
        label: t('table.status'),
        variant: 'multiSelect',
        options: [
          { label: t('table.pass'), value: Status.PASS },
          { label: t('table.fail'), value: Status.FAIL }
          // { label: 'Incomplete', value: Status.INCOMPLETE }
        ],
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.created_at')} />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: t('table.created_at'),
        variant: 'dateRange',
        icon: CalendarIcon
      },
      enableColumnFilter: true
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex justify-center gap-2 items-center'>
          <Link
            href={`/admin/results/${row.original.enrollmentId}/view`}
            className={buttonVariants()}
          >
            <FileSearch2 className='h-5 w-5' />
          </Link>
          <ResultCellAction data={row.original} />
        </div>
      ),
      size: 40
    }
  ];
}
