'use client';

import { Button } from '@/components/ui/button';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getClasses } from '@/actions/class';
import { createEnrollment } from '@/actions/enrollment';
import { getSemesters } from '@/actions/semester';
import { getAllStudents } from '@/actions/student';
import { Combobox } from '@/components/combo-box';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type SchemaKeys = ReturnType<
  typeof useTranslations<'EnrollmentsPage.EnrollmentModal.EnrollmentForm'>
>;

const formSchema = (t: SchemaKeys) =>
  z.object({
    studentId: z.string().min(1, t('student_required')),
    classId: z.string().min(1, t('class_required')),
    semesterId: z.string().min(1, t('semester_required')),
    rollNumberPrefix: z.string().min(1, t('roll_number_prefix_required')),
    rollNumberSuffix: z
      .string()
      .min(1, t('roll_number_required'))
      .regex(/^[1-9]\d*$/, t('roll_number_positive')),
    isActive: z.boolean()
  });

const ComboboxSkeleton = () => (
  <div className='space-y-2'>
    <Skeleton className='h-10 w-full' />
  </div>
);

// Roll number prefix options
const rollNumberPrefixes = [
  { value: '1CST', label: '1CST' },
  { value: '2CS', label: '2CS' },
  { value: '2CT', label: '2CT' },
  { value: '3CS', label: '3CS' },
  { value: '3CT', label: '3CT' },
  { value: '4CS', label: '4CS' },
  { value: '4CT', label: '4CT' },
  { value: '5CS', label: '5CS' },
  { value: '5CT', label: '5CT' }
];

export default function CreateEnrollmentForm() {
  const [loading, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('EnrollmentsPage.EnrollmentModal.EnrollmentForm');

  // Get query parameters
  const studentId = searchParams.get('studentId');
  const semesterId = searchParams.get('semesterId');

  // Redirect if required query parameters are missing
  useEffect(() => {
    if (!studentId || !semesterId) {
      router.push('/admin/enrollments');
    }
  }, [studentId, semesterId, router]);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      studentId: studentId || '',
      classId: '',
      semesterId: semesterId || '',
      rollNumberPrefix: '',
      rollNumberSuffix: '',
      isActive: false
    }
  });

  // Watch form values for filtering
  const selectedSemesterId = form.watch('semesterId');

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const result = await getAllStudents();
      return result.students;
    }
  });

  // Fetch semesters
  const { data: semestersData, isLoading: semestersLoading } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const result = await getSemesters(undefined, { includeDetails: true });
      return result.semesters;
    }
  });

  // Fetch classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const result = await getClasses();
      return result.classes;
    }
  });

  // Ensure students is always an array
  const students = useMemo(() => {
    return Array.isArray(studentsData) ? studentsData : [];
  }, [studentsData]);

  // Ensure semesters is always an array
  const semesters = useMemo(() => {
    return Array.isArray(semestersData) ? semestersData : [];
  }, [semestersData]);

  // Filter classes based on selected semester
  const filteredClasses = useMemo(
    () =>
      Array.isArray(classesData)
        ? classesData.filter(
          (cls) =>
            selectedSemesterId &&
            cls.semesterId === Number(selectedSemesterId)
        )
        : [],
    [classesData, selectedSemesterId]
  );

  // Get selected student and semester for display
  const selectedStudent = students.find((s) => s.id === Number(studentId));
  const selectedSemester = semesters.find((s) => s.id === Number(semesterId));

  function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
    startTransition(async () => {
      try {
        const submitData = {
          studentId: Number(values.studentId),
          classId: Number(values.classId),
          semesterId: Number(values.semesterId),
          rollNumber: `${values.rollNumberPrefix}-${values.rollNumberSuffix}`,
          isActive: values.isActive
        };

        const result = await createEnrollment(submitData);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success(t('success'), {
          description: t('create_success')
        });

        router.push(
          `/admin/results/new?semesterId=${values.semesterId}&studentId=${values.studentId}&academicYearId=${selectedSemester?.academicYearId}`
        );
      } catch (error) {
        toast.error(t('error'), {
          description:
            error instanceof Error ? error.message : t('something_went_wrong')
        });
      }
    });
  }

  const isDataLoading = studentsLoading || semestersLoading || classesLoading;

  // Don't render form if required params are missing
  if (!studentId || !semesterId) {
    return null;
  }

  return (
    <div className='space-y-6'>
      <div className='bg-muted/50 p-4 rounded-lg'>
        <h3 className='font-medium mb-2'>{t('creating_enrollment_for')}</h3>
        <div className='space-y-1 text-sm'>
          <p>
            <strong>{t('student_label')}</strong>{' '}
            {selectedStudent?.studentName || t('loading')}
          </p>
          <p>
            <strong>{t('academic_year_label')}</strong>{' '}
            {selectedSemester?.academicYear?.yearRange || t('loading')}
          </p>
          <p>
            <strong>{t('semester_label')}</strong>{' '}
            {selectedSemester?.semesterName || t('loading')}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4'
        >
          {/* Hidden fields for student and semester */}
          <input type='hidden' {...form.register('studentId')} />
          <input type='hidden' {...form.register('semesterId')} />

          <FormField
            control={form.control}
            name='classId'
            render={({ field }) => (
              <FormItem className='col-span-1 md:col-span-2'>
                <FormLabel>{t('class')}</FormLabel>
                {classesLoading ? (
                  <ComboboxSkeleton />
                ) : filteredClasses.length === 0 ? (
                  <Alert className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950'>
                    <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                    <AlertDescription className='text-amber-800 dark:text-amber-200'>
                      {t('no_class_found')}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(
                            `/admin/classes?academicYearId=${selectedSemester?.academicYearId}&semesterId=${selectedSemester?.id}`
                          );
                        }}
                        className='text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700
                          hover:text-amber-900 dark:hover:text-amber-100'
                      >
                        {t('create_class')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Combobox
                    options={filteredClasses.map((cls) => ({
                      value: cls.id.toString(),
                      label: `${cls.className} (${cls.departmentCode})`
                    }))}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    placeholder={t('select_class')}
                    searchPlaceholder={t('search_class')}
                    disabled={loading || classesLoading}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='rollNumberPrefix'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('roll_number_prefix')}</FormLabel>
                <Input
                  type='text'
                  placeholder={t('select_prefix')}
                  {...field}
                  disabled={loading}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    field.onChange(target.value);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='rollNumberSuffix'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('roll_number')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder={t('enter_number')}
                    {...field}
                    disabled={loading}
                    min='1'
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      // Remove leading zeros
                      if (
                        target.value.startsWith('0') &&
                        target.value.length > 1
                      ) {
                        target.value = target.value.replace(/^0+/, '');
                        field.onChange(target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='col-span-1 md:col-span-2 flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/admin/results')}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              type='submit'
              disabled={loading || isDataLoading || !form.watch('classId')}
            >
              {loading && <Loader className='h-4 w-4 animate-spin mr-2' />}
              {loading ? t('saving_enrollment') : t('save_enrollment')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
