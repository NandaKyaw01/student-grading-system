'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations('AlertModal');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={t('title')}
      description={t('description')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button disabled={loading} variant='destructive' onClick={onConfirm}>
          {loading && (
            <Loader className='mr-2 size-4 animate-spin' aria-hidden='true' />
          )}
          {t('delete')}
        </Button>
      </div>
    </Modal>
  );
};
