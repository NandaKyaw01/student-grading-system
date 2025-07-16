'use client';

import { EnrollmentWithDetails } from '@/actions/enrollment';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { AcademicYear, Class, Semester } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, CalendarIcon, Text } from 'lucide-react';
import { EnrollmentCellAction } from './enrollment-cell-action';
import { useTranslations } from 'next-intl';

export function getEnrollmentColumns({
  academicYears,
  semesters,
  classes,
  t
}: {
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: Class[];
  t: ReturnType<typeof useTranslations<'EnrollmentsPage.table'>>;
}): ColumnDef<EnrollmentWithDetails>[] {
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
          aria-label={t('select_all')}
          className='translate-y-0.5'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('select_row')}
          className='translate-y-0.5'
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: t('no'),
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = row.index;
        return pageIndex * pageSize + rowIndex + 1;
      },
      meta: {
        label: t('no')
      },
      size: 40
    },
    {
      id: 'rollNumber',
      accessorKey: 'rollNumber',
      header: t('roll_number'),
      meta: {
        label: t('roll_number')
      }
    },
    {
      id: 'search',
      accessorFn: (row) => row.student?.studentName,
      header: t('student_name'),
      meta: {
        label: t('student_name'),
        placeholder: t('search_placeholder'),
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'academicYearId',
      accessorFn: (row) => `${row.semester?.academicYear?.yearRange}`,
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
      id: 'semesterId',
      accessorFn: (row) => `${row.semester?.semesterName}`,
      header: t('semester'),
      meta: {
        label: t('semester'),
        variant: 'multiSelect',
        options: semesters.map((seme) => ({
          label: `${seme.semesterName} ${seme.isCurrent ? `(${t('current')})` : ''}`,
          value: seme.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'classId',
      accessorFn: (row) => row.class.className,
      header: t('class_name'),
      meta: {
        label: t('class_name'),
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
      id: 'departmentCode',
      accessorFn: (row) => row.class?.departmentCode,
      header: t('class_code'),
      meta: {
        label: t('class_code')
      },
      enableColumnFilter: true,
      size: 80
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
      cell: ({ row }) => <EnrollmentCellAction data={row.original} />,
      size: 40
    }
  ];
}
