'use client';

import { ClassWithDetails, createClass, updateClass } from '@/actions/class';
import { getSemesters, SemesterWithDetails } from '@/actions/semester';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Define the enum values for TypeScript
enum DepartmentCode {
  CS = 'CS',
  CT = 'CT',
  CST = 'CST'
}

const classFormSchema = z.object({
  className: z.string().min(1, {
    message: 'Class name is required'
  }),
  departmentCode: z.nativeEnum(DepartmentCode, {
    required_error: 'Department code is required'
  }),
  semesterId: z.string().min(1, {
    message: 'Semester is required'
  })
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassDialogProps {
  mode?: 'new' | 'edit';
  classData?: ClassWithDetails;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function ClassDialog({
  mode = 'new',
  classData,
  onSuccess,
  children
}: ClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // const { semester, pageCount } = use(semesters);
  const [semester, setSemester] = useState<SemesterWithDetails[] | []>([]);
  // const { semester, pageCount } = use(semesters);

  useEffect(() => {
    startTransition(async () => {
      const { semester } = await getSemesters();
      setSemester(semester);
    });
  }, []);

  const defaultValues: Partial<ClassFormValues> = {
    className: classData?.className || '',
    departmentCode: (classData?.departmentCode as DepartmentCode) || undefined,
    semesterId: classData?.semesterId.toString() || ''
  };

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues
  });

  async function onSubmit(data: ClassFormValues) {
    try {
      const payload = {
        className: data.className,
        departmentCode: data.departmentCode,
        semesterId: parseInt(data.semesterId)
      };

      if (mode === 'new') {
        await createClass(payload);
      } else if (classData?.id) {
        await updateClass(classData.id, payload);
      }

      toast.success('Success', {
        description: `Class ${mode === 'new' ? 'created' : 'updated'} successfully.`
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
            {mode === 'new' ? 'Add Class' : 'Edit'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? 'Add New Class' : 'Edit Class'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='className'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., First Year CS' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='departmentCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Code</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select department' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DepartmentCode).map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='semesterId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select semester' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {semester.map((semester) => (
                        <SelectItem
                          key={semester.id}
                          value={semester.id.toString()}
                        >
                          {semester.semesterName} (
                          {semester.academicYear?.yearRange})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit'>
              {mode === 'new' ? 'Create Class' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
