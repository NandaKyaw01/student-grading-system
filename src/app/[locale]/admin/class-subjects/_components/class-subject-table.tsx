'use client';
import { getAcademicYears } from '@/actions/academic-year';
import { getClasses } from '@/actions/class';
import { revalidateClassSubjects } from '@/actions/class-subject';
import { getSemesters } from '@/actions/semester';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use, useEffect, useTransition } from 'react';
import { getClassSubjectColumns } from './class-subject-table-column';
import { useTranslations } from 'next-intl';

interface ClassTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getClasses<true>>>,
      Awaited<ReturnType<typeof getAcademicYears<false>>>,
      Awaited<ReturnType<typeof getSemesters<false>>>,
      Awaited<ReturnType<typeof getClasses<false>>>
    ]
  >;
}

const ClassSubjectsTable = ({ promises }: ClassTableProps) => {
  const [
    { classes, pageCount },
    { years },
    { semesters },
    { classes: classForSelect }
  ] = use(promises);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('ClassSubjectPage.table');

  const columns = React.useMemo(
    () =>
      getClassSubjectColumns({
        academicYears: years,
        semesters,
        classes: classForSelect,
        t
      }),
    [years, semesters, classForSelect, t]
  );

  const { table } = useDataTable({
    data: classes,
    columns,
    pageCount,
    initialState: {
      // sorting: [{ id: 'id', desc: true }],
      // columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true
  });

  useEffect(() => {
    startTransition(async () => {
      await revalidateClassSubjects();
    });
  }, []);

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
};

export default ClassSubjectsTable;
