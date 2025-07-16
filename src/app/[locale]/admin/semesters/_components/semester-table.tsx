'use client';

import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use } from 'react';
import { getSemesterColumns } from './semester-table-column';
import { useTranslations } from 'next-intl';

interface AcademicYearTableProps {
  semester: Promise<Awaited<ReturnType<typeof getSemesters<true>>>>;
  academicYear: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}

const SemestersTable = ({ semester, academicYear }: AcademicYearTableProps) => {
  const { semesters, pageCount } = use(semester);
  const { years } = use(academicYear);
  const t = useTranslations('SemestersPage.table');

  const columns = React.useMemo(
    () => getSemesterColumns({ academicYear: years, t }),
    [years, t]
  );
  const { table } = useDataTable({
    data: semesters,
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
