import { Loader, LoaderCircle, LucideProps } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface IProps extends LucideProps {
  className?: string;
}

export const LoadingSpinner = ({ className, ...props }: IProps) => {
  return <LoaderCircle className={cn('animate-spin', className)} {...props} />;
};

export const LoadingSpinner2 = ({ className, ...props }: IProps) => {
  return <Loader className={cn('animate-spin', className)} {...props} />;
};
