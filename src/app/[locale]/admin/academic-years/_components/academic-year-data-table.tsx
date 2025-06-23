'use client';
import { getAcademicYears } from '@/actions/academic-year';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import { Plus } from 'lucide-react';
import React, { use, useState } from 'react';
import { AcademicYearDialog } from './academic-year-modal';
import { getAcademicYearColumns } from './academic-year-table-column';

interface AcademicYearTableProps {
  academicYears: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}

const AcademicYearsDataTable = ({ academicYears }: AcademicYearTableProps) => {
  const { years, pageCount } = use(academicYears);
  const [dialogOpen, setDialogOpen] = useState(false);
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
      <DataTableToolbar table={table}>
        <AcademicYearDialog
          mode='new'
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />

        <Button
          // className='text-xs md:text-sm'
          // variant='outline'
          size='sm'
          className='h-8'
          onClick={() => setDialogOpen(true)}
        >
          <Plus className='mr-2 h-4 w-4' /> Add New
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
};

export default AcademicYearsDataTable;
