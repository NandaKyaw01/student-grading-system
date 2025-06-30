import { SubjectWithDetails } from '@/actions/subject';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { DeleteSubjectDialog } from './delete-subject-modal';
import { SubjectDialog } from './subject-modal';

export const SubjectCellAction = ({ data }: { data: SubjectWithDetails }) => {
  return (
    <>
      <SubjectDialog mode='edit' subject={data}>
        <Button variant='ghost' size='sm'>
          <Edit className='h-4 w-4' />
        </Button>
      </SubjectDialog>
      <DeleteSubjectDialog
        subject={{
          id: data.id,
          subjectName: data.subjectName
        }}
      >
        <Button variant='destructive' size='sm'>
          <Trash className='h-4 w-4' />
        </Button>
      </DeleteSubjectDialog>
    </>
  );
};
