'use client';

import { getGradeScales } from '@/actions/grade-scale';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React from 'react';
import { GradeScalesTableActionBar } from './grade-scale-action-bar';
import { getGradeScaleColumns } from './grade-scale-table-column';
import { useTranslations } from 'next-intl';

interface GradeScalesTableProps {
  promises: Promise<Awaited<ReturnType<typeof getGradeScales>>>;
}

export function GradeScaleDataTable({ promises }: GradeScalesTableProps) {
  const { gradeScales, pageCount } = React.use(promises);
  const t = useTranslations('GpaSettingPage.table');

  const columns = React.useMemo(() => getGradeScaleColumns(t), [t]);

  const { table } = useDataTable({
    data: gradeScales,
    columns,
    pageCount: pageCount,
    initialState: {
      // sorting: [{ id: 'minMark', desc: false }],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true
  });

  return (
    <DataTable
      table={table}
      actionBar={<GradeScalesTableActionBar table={table} />}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
