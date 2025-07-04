import { ClassWithDetails } from '@/actions/class';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { ClassDialog } from './class-modal';
import { DeleteClassDialog } from './delete-class-modal';

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
        <Button variant='ghost' size='sm'>
          <Trash2 className='h-4 w-4 text-destructive' />
        </Button>
      </DeleteClassDialog>
    </>
  );
};
