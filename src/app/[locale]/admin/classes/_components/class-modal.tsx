'use client';

import { getAcademicYears } from '@/actions/academic-year'; // Assuming you have this action
import { ClassWithDetails, createClass, updateClass } from '@/actions/class';
import { getSemesters, SemesterWithDetails } from '@/actions/semester';
import { Combobox } from '@/components/combo-box';
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
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
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
  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState<string>('');
  const [filteredSemesters, setFilteredSemester] = useState<
    SemesterWithDetails[] | []
  >([]);
  const [isPending, startTransition] = useTransition();

  // Fetch academic years
  const { data: academicYears, isLoading: isLoadingAcademicYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { years: academicYears } = await getAcademicYears<true>();
      return academicYears;
    }
  });

  // Fetch all semesters
  const { data: allSemesters, isLoading: isLoadingSemesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const { semesters } = await getSemesters<true>();
      return semesters;
    }
  });

  useEffect(() => {
    if (open && mode === 'edit' && classData) {
      if (classData.semester) {
        setSelectedAcademicYearId(classData.semester.academicYearId.toString());
      }
    }
  }, [open, mode, classData]);

  useEffect(() => {
    if (!allSemesters || !selectedAcademicYearId) {
      setFilteredSemester(allSemesters || []);
    } else {
      const filtered = allSemesters.filter(
        (semester) =>
          semester.academicYearId.toString() === selectedAcademicYearId
      );
      setFilteredSemester(filtered);
    }
  }, [allSemesters, selectedAcademicYearId]);

  const defaultValues: Partial<ClassFormValues> = {
    className: classData?.className || '',
    departmentCode: (classData?.departmentCode as DepartmentCode) || undefined,
    semesterId: classData?.semesterId.toString() || ''
  };

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (open) {
      form.reset({
        className: classData?.className || '',
        departmentCode:
          (classData?.departmentCode as DepartmentCode) || undefined,
        semesterId: classData?.semesterId.toString() || ''
      });
    }
  }, [open, classData, form]);

  // Reset semester selection when academic year changes
  const handleAcademicYearChange = (academicYearId: string) => {
    setSelectedAcademicYearId(academicYearId);
    form.setValue('semesterId', ''); // Reset semester selection
    form.clearErrors('semesterId'); // Clear any validation errors
  };

  function onSubmit(data: ClassFormValues) {
    startTransition(async () => {
      try {
        const payload = {
          className: data.className,
          departmentCode: data.departmentCode,
          semesterId: parseInt(data.semesterId)
        };

        let result;
        if (mode === 'new') {
          result = await createClass(payload);
        } else if (classData?.id) {
          result = await updateClass(classData.id, payload);
        }

        if (result?.success) {
          toast.success('Success', {
            description: `Class ${mode === 'new' ? 'created' : 'updated'} successfully.`
          });

          setOpen(false);
          form.reset();
          setSelectedAcademicYearId('');
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
            {mode === 'new' ? 'Add Class' : 'Edit'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? 'Add New Class' : 'Edit Class'}
          </DialogTitle>
          <DialogDescription className='sr-only' />
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
                    <Input placeholder='e.g., First Year' {...field} />
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
                  <Combobox
                    options={Object.values(DepartmentCode).map((code) => ({
                      value: code,
                      label: code
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select department'
                    searchPlaceholder='Search department...'
                    // disabled={isLoadingAcademicYears}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Academic Year Filter */}
            <div className='space-y-2'>
              <label
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed
                  peer-disabled:opacity-70'
              >
                Academic Year
              </label>
              <div className='mt-1 mb-2'>
                {isLoadingAcademicYears ? (
                  <Skeleton className='h-10 w-full' />
                ) : academicYears && academicYears.length > 0 ? (
                  <Combobox
                    options={academicYears.map((s) => ({
                      value: s.id.toString(),
                      label: `${s.yearRange} ${s.isCurrent ? '(Current)' : ''}`
                    }))}
                    value={selectedAcademicYearId}
                    onValueChange={handleAcademicYearChange}
                    placeholder='Select academic year to filter semesters'
                    searchPlaceholder='Search academic year...'
                    disabled={isLoadingAcademicYears}
                  />
                ) : (
                  <div className='px-2 py-1 text-sm text-muted-foreground'>
                    No Academic Year available
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name='semesterId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>

                  {isLoadingSemesters ? (
                    <Skeleton className='h-10 w-full' />
                  ) : filteredSemesters.length > 0 ? (
                    <Combobox
                      options={filteredSemesters.map((s) => ({
                        value: s.id.toString(),
                        label: `${s.semesterName} ${s.isCurrent ? '(Current)' : ''}`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        !selectedAcademicYearId
                          ? 'Select academic year first'
                          : 'Select semester'
                      }
                      searchPlaceholder='Search semester...'
                      disabled={isLoadingSemesters || !selectedAcademicYearId}
                    />
                  ) : (
                    <div className='px-2 py-1 text-sm text-muted-foreground'>
                      No semesters available for this academic year
                    </div>
                  )}

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
              <Button
                type='submit'
                disabled={
                  isLoadingSemesters || isLoadingAcademicYears || isPending
                }
              >
                {isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'new' ? 'Create Class' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
