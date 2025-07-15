'use client';

import { getAcademicYears } from '@/actions/academic-year';
import { getClasses } from '@/actions/class';
import { getAllEnrollments } from '@/actions/enrollment';
import { getSemesters } from '@/actions/semester';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useTranslations } from 'next-intl';
import React from 'react';
import { EnrollmentsTableActionBar } from './enrollment-table-action-bar';
import { getEnrollmentColumns } from './enrollment-table-column';

interface EnrollmentsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAllEnrollments<true>>>,
      Awaited<ReturnType<typeof getAcademicYears<false>>>,
      Awaited<ReturnType<typeof getSemesters<false>>>,
      Awaited<ReturnType<typeof getClasses<false>>>
    ]
  >;
}

export function EnrollmentDataTable({ promises }: EnrollmentsTableProps) {
  const [{ enrollments, pageCount }, { years }, { semesters }, { classes }] =
    React.use(promises);
  const t = useTranslations('EnrollmentsPage.table');

  const columns = React.useMemo(
    () =>
      getEnrollmentColumns({
        academicYears: years,
        semesters,
        classes,
        t
      }),
    [years, semesters, classes, t]
  );

  const { table } = useDataTable({
    data: enrollments,
    columns,
    pageCount,
    initialState: {
      // sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true
  });

  return (
    <DataTable
      table={table}
      actionBar={<EnrollmentsTableActionBar table={table} />}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
