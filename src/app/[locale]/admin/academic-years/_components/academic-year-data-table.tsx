'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { AcademicYear } from '@/generated/prisma';
import { getAcademicYears } from '@/actions/academic-year';
import { Edit, Trash } from 'lucide-react';
import { use } from 'react';
import { AcademicYearDialog } from './academic-year-modal';
import { DeleteAcademicYearDialog } from './delete-academic-year-modal';
import React from 'react';
import { getAcademicYearColumns } from './academic-year-table-column';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { getCommonPinningStyles } from '@/lib/data-table';
import { flexRender } from '@tanstack/react-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

interface AcademicYearTableProps {
  academicYears: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}

const AcademicYearsDataTable = ({ academicYears }: AcademicYearTableProps) => {
  const { years, pageCount } = use(academicYears);
  const columns = React.useMemo(() => getAcademicYearColumns(), []);
  const { table } = useDataTable({
    data: years,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'id', desc: true }],
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
