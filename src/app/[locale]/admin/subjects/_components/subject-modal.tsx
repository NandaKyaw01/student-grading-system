'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { createSubject, updateSubject } from '@/actions/subject';
import { toast } from 'sonner';
import { useState } from 'react';
import { SubjectWithDetails } from '@/actions/subject';
import { Subject } from '@/generated/prisma';

const subjectFormSchema = z.object({
  id: z.string().min(1, {
    message: 'Subject ID is required'
  }),
  subjectName: z.string().min(1, {
    message: 'Subject name is required'
  }),
  creditHours: z.number().min(0.5).max(10),
  examWeight: z.number().min(0).max(1),
  assignWeight: z.number().min(0).max(1)
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

  async function onSubmit(data: SubjectFormValues) {
    try {
      if (mode === 'new') {
        await createSubject(data);
      } else if (subject?.id) {
        await updateSubject(subject.id, data);
      }

      toast.success('Success', {
        description: `Subject ${mode === 'new' ? 'created' : 'updated'} successfully.`
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'An error occurred'
      });
    }
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
                    <FormLabel>Exam Weight</FormLabel>
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
                    <FormLabel>Assignment Weight</FormLabel>
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

            <Button type='submit'>
              {mode === 'new' ? 'Create Subject' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
