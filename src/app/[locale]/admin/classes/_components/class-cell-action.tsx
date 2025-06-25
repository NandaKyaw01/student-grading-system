import { Button } from '@/components/ui/button';
import { ClassDialog } from './class-modal';
import { Edit, Trash } from 'lucide-react';
import { DeleteClassDialog } from './delete-class-modal';
import { ClassWithDetails } from '@/actions/class';

interface CellActionProps {
  data: ClassWithDetails;
}

export const ClassCellAction = ({ data }: CellActionProps) => {
  return (
    <>
      <ClassDialog mode='edit' classData={data}>
        <Button variant='ghost' size='sm'>
          <Edit className='h-4 w-4' />
        </Button>
      </ClassDialog>
      <DeleteClassDialog
        classData={{
          id: data.id,
          className: data.className
        }}
      >
        <Button variant='destructive' size='sm'>
          <Trash className='h-4 w-4' />
        </Button>
      </DeleteClassDialog>
    </>
  );
};
