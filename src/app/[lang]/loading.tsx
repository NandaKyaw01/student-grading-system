import { LoadingSpinner2 } from '@/components/loading-spinner';

const loading = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <LoadingSpinner2 className='h-10 w-10 text-primary' />
    </div>
  );
};

export default loading;
