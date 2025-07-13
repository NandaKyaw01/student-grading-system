'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LoadingSpinner2 } from '../loading-spinner';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

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
      const parsed = loginSchema.safeParse(data);

      if (!parsed.success) {
        return setError('Invalid email or password');
      }

      const { email, password } = parsed.data;

      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
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
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className='pr-10'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700
                focus:outline-none'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
          {errors.password && (
            <p className='text-sm text-red-500'>{errors.password.message}</p>
          )}
        </div>
        {error && <p className='text-sm text-red-500'>{error}</p>}
        <Button type='submit' className='w-full' disabled={isPending}>
          {isPending ? (
            <>
              <LoadingSpinner2 /> {t('logging_in')}
            </>
          ) : (
            t('login')
          )}
        </Button>
      </div>
    </form>
  );
}
