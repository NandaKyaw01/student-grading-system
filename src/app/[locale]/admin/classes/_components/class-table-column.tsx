'use client';
import { ClassWithDetails } from '@/actions/class';
import { AcademicYear, Class, Semester } from '@/generated/prisma';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { CalendarCheck, Text } from 'lucide-react';
import { ClassCellAction } from './class-cell-action';

export function getClassColumns({
  academicYears,
  semesters,
  classes,
  t
}: {
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: Class[];
  t: ReturnType<typeof useTranslations<'ClassPage.table'>>;
}): ColumnDef<ClassWithDetails>[] {
  return [
    {
      id: 'id',
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
      size: 40
    },
    {
      id: 'search',
      accessorKey: 'className',
      header: t('class_name'),
      meta: {
        label: t('class_name'),
        placeholder: t('search_placeholder'),
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'academicYearId',
      accessorFn: (row) => row.semester?.academicYear?.yearRange,
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
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'semesterId',
      accessorFn: (row) => row.semester?.semesterName,
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
      id: 'departmentCode',
      accessorKey: 'departmentCode',
      header: t('class_code'),
      meta: {
        label: t('class_code'),
        variant: 'multiSelect',
        options: classes.map((c) => ({
          label: c.departmentCode,
          value: c.departmentCode
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'actions',
      cell: ({ row }) => <ClassCellAction data={row.original} />,
      size: 40
    }
  ];
}
