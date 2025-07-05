'use client';

import CopyableIdCell from '@/components/copyable-id-cell';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AcademicYear, Class, Enrollment, Semester } from '@/generated/prisma';
import { formatDate } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarCheck, CalendarIcon, Text } from 'lucide-react';
import { EnrollmentCellAction } from './enrollment-cell-action';
import { EnrollmentWithDetails } from '@/actions/enrollment';

const Code = ['CS', 'CT', 'CST'];

export function getEnrollmentColumns({
  academicYears,
  semesters,
  classes
}: {
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: Class[];
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
      id: 'id',
      accessorKey: 'id',
      header: 'No.',
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = row.index;
        return pageIndex * pageSize + rowIndex + 1;
      },
      meta: {
        label: 'No.'
      },
      size: 40
    },
    {
      id: 'rollNumber',
      accessorKey: 'rollNumber',
      header: 'Roll Number',
      meta: {
        label: 'Roll Number'
      }
    },
    {
      id: 'search',
      accessorFn: (row) => row.student?.studentName,
      header: 'Student Name',
      meta: {
        label: 'Student Name',
        placeholder: 'Search ...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true
    },
    {
      id: 'academicYearId',
      accessorFn: (row) => `${row.semester?.academicYear?.yearRange}`,
      header: 'Academic Year',
      meta: {
        label: 'Academic Year',
        variant: 'multiSelect',
        options: academicYears.map((year) => ({
          label: `${year.yearRange} ${year.isCurrent ? '(Current)' : ''}`,
          value: year.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'semesterId',
      accessorFn: (row) => `${row.semester?.semesterName}`,
      header: 'Semester',
      meta: {
        label: 'Semester',
        variant: 'multiSelect',
        options: semesters.map((seme) => ({
          label: `${seme.semesterName} ${seme.isCurrent ? '(Current)' : ''}`,
          value: seme.id.toString()
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true
    },
    {
      id: 'classId',
      accessorFn: (row) => row.class.className,
      header: 'Class',
      meta: {
        label: 'Class',
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
      header: 'Code',
      meta: {
        label: 'Code',
        variant: 'multiSelect',
        options: Code.map((c) => ({
          label: c,
          value: c
        })),
        icon: () => <CalendarCheck className='mr-2 h-4 w-4' />
      },
      enableColumnFilter: true,
      size: 80
    },
    // {
    //   id: 'isActive',
    //   accessorKey: 'isActive',
    //   header: 'Status',
    //   cell: ({ cell }) => (
    //     <Badge variant={cell.getValue() ? 'default' : 'destructive'}>
    //       {cell.getValue() ? 'Active' : 'Inactive'}
    //     </Badge>
    //   ),
    //   meta: {
    //     label: 'Status'
    //   }
    // },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Created At' />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: 'Created At',
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
