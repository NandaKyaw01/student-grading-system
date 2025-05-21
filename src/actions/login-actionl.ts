import { signIn } from 'next-auth/react';

export const loginAction = async (formData: FormData) => {
  'use server';
  await signIn('credentials', {
    email: formData.get('email'),
    password: formData.get('password')
  });
};
