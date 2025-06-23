'use client';

import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use } from 'react';
import { getSemesterColumns } from './semester-table-column';

interface AcademicYearTableProps {
  semesters: Promise<Awaited<ReturnType<typeof getSemesters>>>;
  academicYear: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}

const SemestersTable = ({
  semesters,
  academicYear
}: AcademicYearTableProps) => {
  const { semester, pageCount } = use(semesters);
  const { years } = use(academicYear);

  const columns = React.useMemo(
    () => getSemesterColumns({ academicYear: years }),
    [years]
  );
  const { table } = useDataTable({
    data: semester,
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

export default SemestersTable;
