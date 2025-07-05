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
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const studentFormSchema = z.object({
  studentName: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' }),
  admissionId: z.string().min(6, {
    message: 'Admission ID must be at least 6 characters'
  })
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

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
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultValues: Partial<StudentFormValues> = {
    studentName: studentData?.studentName || '',
    admissionId: studentData?.admissionId || ''
  };

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
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
          toast.success('Success', {
            description: `Student ${mode === 'new' ? 'created' : 'updated'} successfully.`
          });

          form.reset();
          setOpen(false);
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
            {mode === 'new' ? 'Add Student' : 'Edit'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? 'Add New Student' : 'Edit Student'}
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
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., John Doe' {...field} />
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
                  <FormLabel>Admission ID</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., STU202400001' {...field} />
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
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'new' ? 'Create Student' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
