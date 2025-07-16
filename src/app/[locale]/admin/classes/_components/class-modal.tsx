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
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const classFormSchema = (
  t: ReturnType<typeof useTranslations<'ClassPage.form'>>
) =>
  z.object({
    className: z.string().min(1, {
      message: t('validation.class_name_required')
    }),
    departmentCode: z.string().min(1, {
      message: t('validation.class_code_required')
    }),
    semesterId: z.string().min(1, {
      message: t('validation.semester_required')
    })
  });

type ClassFormValues = z.infer<ReturnType<typeof classFormSchema>>;

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
  const t = useTranslations('ClassPage.form');

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
    departmentCode: classData?.departmentCode || '',
    semesterId: classData?.semesterId.toString() || ''
  };

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema(t)),
    defaultValues
  });

  useEffect(() => {
    if (open) {
      form.reset({
        className: classData?.className || '',
        departmentCode: classData?.departmentCode || '',
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
          toast.success(t('success'), {
            description: t(
              mode === 'new' ? 'created_successfully' : 'updated_successfully'
            )
          });

          setOpen(false);
          form.reset();
          setSelectedAcademicYearId('');
          if (onSuccess) onSuccess();
        } else {
          toast.error(t('error'), {
            description: result?.error ? result.error : t('error_occurred')
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
            {mode === 'new' ? t('add_title') : t('edit_title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? t('add_title') : t('edit_title')}
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
                  <FormLabel>{t('class_name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('class_name_placeholder')}
                      {...field}
                    />
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
                  <FormLabel>{t('class_code')}</FormLabel>
                  <Input placeholder={t('class_code_placeholder')} {...field} />
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
                {t('academic_year')}
              </label>
              <div className='mt-1 mb-2'>
                {isLoadingAcademicYears ? (
                  <Skeleton className='h-10 w-full' />
                ) : academicYears && academicYears.length > 0 ? (
                  <Combobox
                    options={academicYears.map((s) => ({
                      value: s.id.toString(),
                      label: `${s.yearRange} ${s.isCurrent ? `(${t('current')})` : ''}`
                    }))}
                    value={selectedAcademicYearId}
                    onValueChange={handleAcademicYearChange}
                    placeholder={t('select_year_placeholder')}
                    searchPlaceholder={t('search_year_placeholder')}
                    disabled={isLoadingAcademicYears}
                  />
                ) : (
                  <div className='px-2 py-1 text-sm text-muted-foreground'>
                    {t('no_academic_year_available')}
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name='semesterId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('semester')}</FormLabel>

                  {isLoadingSemesters ? (
                    <Skeleton className='h-10 w-full' />
                  ) : filteredSemesters.length > 0 ? (
                    <Combobox
                      options={filteredSemesters.map((s) => ({
                        value: s.id.toString(),
                        label: `${s.semesterName} ${s.isCurrent ? `(${t('current')})` : ''}`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        !selectedAcademicYearId
                          ? t('select_academic_year_first')
                          : t('select_semester_placeholder')
                      }
                      searchPlaceholder={t('search_semester_placeholder')}
                      disabled={isLoadingSemesters || !selectedAcademicYearId}
                    />
                  ) : (
                    <div className='px-2 py-1 text-sm text-muted-foreground'>
                      {t('no_semesters_available')}
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
                {t('cancel')}
              </Button>
              <Button
                type='submit'
                disabled={
                  isLoadingSemesters || isLoadingAcademicYears || isPending
                }
              >
                {isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'new' ? t('create') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
