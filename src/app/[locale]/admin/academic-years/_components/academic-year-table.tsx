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

const AcademicYearsTable = ({
  academicYears
}: {
  academicYears: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}) => {
  const years = use(academicYears);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No.</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {years.map((year: AcademicYear) => (
          <TableRow key={year.id}>
            <TableCell className='font-medium'>{year.id}</TableCell>
            <TableCell className='font-medium'>{year.yearRange}</TableCell>

            <TableCell>
              <Badge
                variant={year.isCurrent === true ? 'default' : 'secondary'}
              >
                {year.isCurrent === true ? 'Current' : null}
              </Badge>
            </TableCell>
            <TableCell className='text-right'>
              <div className='flex justify-end gap-2'>
                <AcademicYearDialog mode='edit' academicYear={year}>
                  <Button variant='ghost' size='sm'>
                    <Edit className='h-4 w-4' />
                  </Button>
                </AcademicYearDialog>
                <DeleteAcademicYearDialog
                  academicYear={{ id: year.id, yearRange: year.yearRange }}
                >
                  <Button variant='destructive' size='sm'>
                    <Trash className='h-4 w-4' />
                  </Button>
                </DeleteAcademicYearDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AcademicYearsTable;
