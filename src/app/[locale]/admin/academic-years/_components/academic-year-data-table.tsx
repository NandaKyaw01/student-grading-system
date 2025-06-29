'use client';
import { getAcademicYears } from '@/actions/academic-year';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use } from 'react';
import { getAcademicYearColumns } from './academic-year-table-column';

interface AcademicYearTableProps {
  academicYears: Promise<Awaited<ReturnType<typeof getAcademicYears<true>>>>;
}

const AcademicYearsDataTable = ({ academicYears }: AcademicYearTableProps) => {
  const { years, pageCount } = use(academicYears);
  const columns = React.useMemo(() => getAcademicYearColumns(), []);
  const { table } = useDataTable({
    data: years,
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

export default AcademicYearsDataTable;
