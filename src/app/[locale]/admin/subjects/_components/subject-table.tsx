'use client';

import { getSubjects } from '@/actions/subject';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use } from 'react';
import { getSubjectColumns } from './subject-table-column';

const SubjectsTable = ({
  subjectProp
}: {
  subjectProp: Promise<Awaited<ReturnType<typeof getSubjects>>>;
}) => {
  const { subjects, pageCount } = use(subjectProp);

  const columns = React.useMemo(() => getSubjectColumns(), []);
  const { table } = useDataTable({
    data: subjects,
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

export default SubjectsTable;
