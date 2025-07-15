'use client';

import { createStudent, updateStudent } from '@/actions/student';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

type SchemaKeys = ReturnType<typeof useTranslations<'StudentsPage.form'>>;
const studentFormSchema = (t: SchemaKeys) =>
  z.object({
    studentName: z.string().min(2, { message: t('name_min_char') }),
    admissionId: z.string().min(2, {
      message: t('admission_id_min_char')
    })
  });

type StudentFormValues = z.infer<ReturnType<typeof studentFormSchema>>;

interface StudentWithDetails {
  id: number;
  studentName: string;
  admissionId: string;
}

interface StudentDialogProps {
  mode?: 'new' | 'edit';
  studentData?: StudentWithDetails;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function StudentDialog({
  mode = 'new',
  studentData,
  onSuccess,
  children
}: StudentDialogProps) {
  const t = useTranslations('StudentsPage.form');
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultValues: Partial<StudentFormValues> = {
    studentName: studentData?.studentName || '',
    admissionId: studentData?.admissionId || ''
  };

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema(t)),
    defaultValues
  });

  useEffect(() => {
    if (open) {
      form.reset({
        studentName: studentData?.studentName || '',
        admissionId: studentData?.admissionId || ''
      });
    }
  }, [open, studentData, form]);

  function onSubmit(data: StudentFormValues) {
    startTransition(async () => {
      try {
        const payload = {
          studentName: data.studentName,
          admissionId: data.admissionId
        };

        let result;
        if (mode === 'new') {
          result = await createStudent(payload);
        } else if (studentData?.id) {
          result = await updateStudent({ id: studentData.id, ...payload });
        }

        if (result?.success || !result?.error) {
          toast.success(t('success'), {
            description:
              mode === 'new'
                ? t('created_successfully')
                : t('updated_successfully')
          });

          form.reset();
          setOpen(false);
          if (onSuccess) onSuccess();
        } else {
          toast.error(t('error'), {
            description: result?.error || t('error_occurred')
          });
        }
      } catch (error) {
        toast.error(t('error'), {
          description:
            error instanceof Error ? error.message : t('error_occurred')
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={mode === 'new' ? 'default' : 'outline'}>
            {mode === 'new' ? t('add_student') : t('edit_student')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? t('add_new_student') : t('edit_student')}
          </DialogTitle>
          <DialogDescription className='sr-only' />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='studentName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('student_name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('student_name_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='admissionId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admission_id')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('admission_id_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'new' ? t('create_student') : t('save_changes')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
