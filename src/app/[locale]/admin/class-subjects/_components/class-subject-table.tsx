'use client';
import { getClasses } from '@/actions/class';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use, useCallback, useTransition } from 'react';
import { getClassSubjectColumns } from './class-subject-table-column';
import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';
import { Loader, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { revalidateClassSubjects } from '@/actions/class-subject';

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

  const columns = React.useMemo(
    () =>
      getClassSubjectColumns({
        academicYears: years,
        semesters,
        classes: classForSelect
      }),
    [years, semesters, classForSelect]
  );
  const { table } = useDataTable({
    data: classes,
    columns,
    pageCount,
    initialState: {
      // sorting: [{ id: 'id', desc: true }],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true
  });

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      await revalidateClassSubjects();
    });
  }, []);

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <Button size='sm' variant='outline' onClick={handleRefresh}>
          {isPending ? <Loader className='animate-spin' /> : <RefreshCcw />}
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
};

export default ClassSubjectsTable;
