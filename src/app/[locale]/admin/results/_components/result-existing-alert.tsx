import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { checkExistingResult } from '@/actions/result';
import { useTranslations } from 'next-intl';

interface ExistingResultDialogProps {
  enrollmentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const ExistingResultDialog = ({
  enrollmentId,
  open,
  onOpenChange,
  onEditClick,
  onCancel,
  onClose
}: ExistingResultDialogProps) => {
  const { data: existingResultData, isLoading } = useQuery({
    queryKey: ['existing-result', enrollmentId],
    queryFn: () => checkExistingResult(enrollmentId),
    enabled: !!enrollmentId && enrollmentId > 0 && open
  });
  const t = useTranslations(
    'ResultsBySemester.ResultForm.ExistingResultDialog'
  );

  const handleEditClick = () => {
    onEditClick();
    // onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      onClose?.();
    }
  };

  if (!existingResultData?.success || !existingResultData.data) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-amber-700'>
            <AlertTriangle className='h-5 w-5' />
            {t('title')}
          </DialogTitle>
          <DialogDescription className='text-gray-600'>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='font-medium text-gray-700'>
                {t('fields.student')}:
              </span>
              <span className='text-gray-900'>
                {existingResultData.data.enrollment.student.studentName}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium text-gray-700'>
                {t('fields.class')}:
              </span>
              <span className='text-gray-900'>
                {existingResultData.data.enrollment.class.className}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium text-gray-700'>
                {t('fields.roll_number')}:
              </span>
              <span className='text-gray-900'>
                {existingResultData.data.enrollment.rollNumber}
              </span>
            </div>
            {existingResultData.data.createdAt && (
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700'>
                  {t('fields.created')}:
                </span>
                <span className='text-gray-900'>
                  {new Date(
                    existingResultData.data.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={handleCancel}
            className='flex-1'
          >
            <X className='h-4 w-4 mr-2' />
            {t('actions.cancel')}
          </Button>
          <Button
            type='button'
            onClick={handleEditClick}
            className='flex-1 bg-amber-600 hover:bg-amber-700'
          >
            <Edit className='h-4 w-4 mr-2' />
            {t('actions.edit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExistingResultDialog;
