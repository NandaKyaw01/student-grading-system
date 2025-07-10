'use client';

import { getClasses } from '@/actions/class';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use } from 'react';
import { getClassColumns } from './class-table-column';
import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';

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

const ClassesTable = ({ promises }: ClassTableProps) => {
  const [
    { classes, pageCount },
    { years },
    { semesters },
    { classes: classForSelect }
  ] = use(promises);
  const columns = React.useMemo(
    () =>
      getClassColumns({
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
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
};

export default ClassesTable;
