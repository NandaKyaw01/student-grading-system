'use client';
import { ClassWithDetails } from '@/actions/class';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { CalendarCheck, Text } from 'lucide-react';
import { ClassSubjectManager } from './class-subject-manager';
import { AcademicYear, Class, Semester } from '@/generated/prisma';

export function getClassSubjectColumns({
  academicYears,
  semesters,
  classes,
  t
}: {
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: Class[];
  t: ReturnType<typeof useTranslations<'ClassSubjectPage.table'>>;
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
      enableColumnFilter: true
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
      enableColumnFilter: true
    },
    {
      id: 'assignSubjects',
      accessorFn: (row) => row.subjects?.length || 0,
      header: t('assigned_subjects'),
      meta: {
        label: t('assigned_subjects')
      }
    },

    {
      id: 'actions',
      cell: ({ row }) => (
        <ClassSubjectManager
          classId={row.original.id}
          className={row.original.className}
        />
      ),

      size: 40
    }
  ];
}
