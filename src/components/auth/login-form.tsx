'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/schema';
import { LoadingSpinner } from '../loading-spinner';

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const session = useSession();
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    async function fetchCsrfToken() {
      const result = await getCsrfToken();
      if (!result) {
        throw new Error('Can not sign in without a CSRF token');
      }
      setCsrfToken(result);
    }

    if (session.status !== 'loading') {
      fetchCsrfToken();
    }
  }, [session.status]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl
    });

    if (res?.error) {
      setLoading(false);
      setError('Invalid email or password');
    } else if (res?.ok && res.url) {
      router.push(res.url);
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Login to your account</h1>
        <p className='text-balance text-sm text-muted-foreground'>
          Enter your credentials below to login to your account
        </p>
      </div>
      <div className='grid gap-6'>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='m@example.com'
            {...register('email')}
          />
          {errors.email && (
            <p className='text-sm text-red-500'>{errors.email.message}</p>
          )}
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='password'>Password</Label>
          </div>
          <Input id='password' type='password' {...register('password')} />
          {errors.password && (
            <p className='text-sm text-red-500'>{errors.password.message}</p>
          )}
        </div>
        {error && <p className='text-sm text-red-500'>{error}</p>}
        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner /> {'Logging in...'}
            </>
          ) : (
            'Login'
          )}
        </Button>
      </div>
    </form>
  );
}
