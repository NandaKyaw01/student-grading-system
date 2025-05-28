import { LoginForm } from '@/components/auth/login-form';
import { ModeToggle } from '@/components/mode-toggle';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  const searchParams = new URLSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-between'>
          <a href='#' className='flex items-center gap-2 font-medium'>
            <div className='flex h-6 w-6 items-center justify-center rounded-md text-primary-foreground'>
              <Image
                src='/assets/image/logo.png'
                alt='logo'
                width={200}
                height={200}
              />
            </div>
            University of Computer Studies, Hinthada
          </a>
          <ModeToggle />
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className='relative hidden bg-muted lg:block'>
        <Image
          src='/assets/image/ucsh1.jpg'
          alt='Image'
          width={1000}
          height={1000}
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
        />
      </div>
    </div>
  );
}
