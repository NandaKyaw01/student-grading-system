'use client';

import {
  createSubject,
  SubjectWithDetails,
  updateSubject
} from '@/actions/subject';
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
import { Subject } from '@/generated/prisma';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const subjectFormSchema = z
  .object({
    id: z.string().min(1, {
      message: 'Subject ID is required'
    }),
    subjectName: z.string().min(1, {
      message: 'Subject name is required'
    }),
    creditHours: z.number().min(0.5).max(10),
    examWeight: z.number().min(0).max(1),
    assignWeight: z.number().min(0).max(1)
  })
  .refine((data) => Number(data.examWeight) + Number(data.assignWeight) === 1, {
    message: 'Combination of exam and assessment must be equal to 1',
    path: ['examWeight']
  });

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

interface SubjectDialogProps {
  mode?: 'new' | 'edit';
  subject?: SubjectWithDetails | Subject;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function SubjectDialog({
  mode = 'new',
  subject,
  onSuccess,
  children
}: SubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultValues: Partial<SubjectFormValues> = {
    id: subject?.id || '',
    subjectName: subject?.subjectName || '',
    creditHours: subject?.creditHours || 3.0,
    examWeight: subject?.examWeight || 0.6,
    assignWeight: subject?.assignWeight || 0.4
  };

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id: subject?.id || '',
        subjectName: subject?.subjectName || '',
        creditHours: subject?.creditHours || 3.0,
        examWeight: subject?.examWeight || 0.6,
        assignWeight: subject?.assignWeight || 0.4
      });
    }
  }, [open, subject, form]);

  function onSubmit(data: SubjectFormValues) {
    startTransition(async () => {
      try {
        let result;
        if (mode === 'new') {
          result = await createSubject(data);
        } else if (subject?.id) {
          result = await updateSubject(subject.id, data);
        }

        if (result?.success) {
          toast.success('Success', {
            description: `Subject ${mode === 'new' ? 'created' : 'updated'} successfully.`
          });

          setOpen(false);
          form.reset();
          if (onSuccess) onSuccess();
        } else {
          toast.error('Error', {
            description: result?.error ? result.error : 'An error occurred'
          });
        }
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error ? error.message : 'An error occurred'
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={mode === 'new' ? 'default' : 'outline'}>
            {mode === 'new' ? 'Add Subject' : 'Edit'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? 'Add New Subject' : 'Edit Subject'}
          </DialogTitle>
          <DialogDescription className='sr-only' />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject ID</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., M-101' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='subjectName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Mathematics' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='creditHours'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Hours</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.5'
                        min='0.5'
                        max='10'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='examWeight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        min='0'
                        max='1'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='assignWeight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        min='0'
                        max='1'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button type='submit' disabled={isPending}>
                {isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'new' ? 'Create Subject' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
