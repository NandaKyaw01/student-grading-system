'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '../loading-spinner';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .min(5, 'Password must be more than 5 characters')
    .max(32, 'Password must be less than 32 characters')
});

export type LoginFormInput = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const t = useTranslations('LoginForm');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const router = useRouter();

  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormInput) => {
    setError('');
    startTransition(async () => {
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else if (res?.ok && res.url) {
        router.push(res.url);
        router.refresh();
      }
    });
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>{t('subtitle')}</h1>
        <p className='text-balance text-sm text-muted-foreground'>
          {t('description')}
        </p>
      </div>
      <div className='grid gap-6'>
        <div className='grid gap-2'>
          <Label htmlFor='email'>{t('email')}</Label>
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
            <Label htmlFor='password'>{t('password')}</Label>
          </div>
          <Input id='password' type='password' {...register('password')} />
          {errors.password && (
            <p className='text-sm text-red-500'>{errors.password.message}</p>
          )}
        </div>
        {error && <p className='text-sm text-red-500'>{error}</p>}
        <Button type='submit' className='w-full' disabled={isPending}>
          {isPending ? (
            <>
              <LoadingSpinner /> {'Logging in...'}
            </>
          ) : (
            t('login')
          )}
        </Button>
      </div>
    </form>
  );
}
