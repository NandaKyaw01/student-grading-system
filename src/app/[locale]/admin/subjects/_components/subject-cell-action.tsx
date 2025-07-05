import { Button } from '@/components/ui/button';
import { Subject } from '@/generated/prisma';
import { Edit, Trash2 } from 'lucide-react';
import { DeleteSubjectDialog } from './delete-subject-modal';
import { SubjectDialog } from './subject-modal';

export const SubjectCellAction = ({ data }: { data: Subject }) => {
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
        <Button variant='ghost' size='sm'>
          <Trash2 className='h-4 w-4 text-destructive' />
        </Button>
      </DeleteSubjectDialog>
    </>
  );
};
