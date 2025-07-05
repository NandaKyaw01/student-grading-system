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
import { useEffect, useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getAcademicYears } from '@/actions/academic-year';
import { getClasses } from '@/actions/class';
import {
  createEnrollment,
  EnrollmentWithDetails,
  updateEnrollment
} from '@/actions/enrollment';
import { getSemesters } from '@/actions/semester';
import { getAllStudents } from '@/actions/student';
import { Combobox } from '@/components/combo-box';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  classId: z.string().min(1, 'Class is required'),
  semesterId: z.string().min(1, 'Semester is required'),
  academicYearId: z.string().min(1, 'Academic year is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  isActive: z.boolean()
});

interface EnrollmentFormProps {
  enrollment?: EnrollmentWithDetails;
  onSuccess?: () => void;
}

export function EnrollmentForm({ enrollment, onSuccess }: EnrollmentFormProps) {
  const [loading, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: enrollment?.studentId?.toString() || '',
      classId: enrollment?.classId?.toString() || '',
      semesterId: enrollment?.semesterId?.toString() || '',
      academicYearId: enrollment?.semester?.academicYearId?.toString() || '',
      rollNumber: enrollment?.rollNumber || '',
      isActive: enrollment?.isActive || false
    }
  });

  // Watch form values for filtering
  const selectedAcademicYearId = form.watch('academicYearId');
  const selectedSemesterId = form.watch('semesterId');

  // Fetch academic years
  const { data: academicYearsData, isLoading: academicYearsLoading } = useQuery(
    {
      queryKey: ['academicYears'],
      queryFn: async () => {
        const result = await getAcademicYears();
        return result.years;
      }
    }
  );

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
      const result = await getSemesters();
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

  // Filter semesters based on selected academic year
  const filteredSemesters = useMemo(
    () =>
      semestersData?.filter(
        (semester) =>
          !selectedAcademicYearId ||
          semester.academicYearId === Number(selectedAcademicYearId)
      ) || [],
    [selectedAcademicYearId, semestersData]
  );

  // Filter classes based on selected semester
  const filteredClasses = useMemo(
    () =>
      classesData?.filter(
        (cls) =>
          !selectedSemesterId || cls.semesterId === Number(selectedSemesterId)
      ) || [],
    [classesData, selectedSemesterId]
  );

  useEffect(() => {
    if (enrollment) {
      form.reset({
        studentId: enrollment.studentId?.toString() || '',
        classId: enrollment.classId?.toString() || '',
        semesterId: enrollment.semesterId?.toString() || '',
        academicYearId: enrollment.semester?.academicYearId?.toString() || '',
        rollNumber: enrollment.rollNumber || '',
        isActive: enrollment.isActive || false
      });
    }
  }, [enrollment, form]);

  useEffect(() => {
    if (selectedAcademicYearId && !enrollment) {
      // Only clear if NOT in edit mode
      const currentSemester = form.getValues('semesterId');
      const isCurrentSemesterValid = filteredSemesters.some(
        (s) => s.id === Number(currentSemester)
      );

      if (!isCurrentSemesterValid) {
        form.setValue('semesterId', '');
        form.setValue('classId', '');
      }
    }
  }, [selectedAcademicYearId, filteredSemesters, form, enrollment]);

  useEffect(() => {
    if (selectedSemesterId && !enrollment) {
      // Only clear if NOT in edit mode
      const currentClass = form.getValues('classId');
      const isCurrentClassValid = filteredClasses.some(
        (c) => c.id === Number(currentClass)
      );

      if (!isCurrentClassValid) {
        form.setValue('classId', '');
      }
    }
  }, [selectedSemesterId, filteredClasses, form, enrollment]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const submitData = {
          studentId: Number(values.studentId),
          classId: Number(values.classId),
          semesterId: Number(values.semesterId),
          rollNumber: values.rollNumber,
          isActive: values.isActive
        };

        let result;
        if (enrollment) {
          result = await updateEnrollment(enrollment.id, submitData);
        } else {
          result = await createEnrollment(submitData);
        }

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success('Success', {
          description: enrollment
            ? 'Enrollment updated successfully'
            : 'Enrollment created successfully'
        });

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error ? error.message : 'Something went wrong'
        });
      }
    });
  }

  const isDataLoading =
    academicYearsLoading ||
    studentsLoading ||
    semestersLoading ||
    classesLoading;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6 grid grid-cols-2 gap-4'
      >
        <FormField
          control={form.control}
          name='studentId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Combobox
                options={
                  studentsData?.map((student) => ({
                    value: student.id.toString(),
                    label: student.studentName
                  })) || []
                }
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                placeholder='Select a student...'
                searchPlaceholder='Search student...'
                disabled={loading || studentsLoading}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='academicYearId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Year</FormLabel>
              <Combobox
                options={
                  academicYearsData?.map((year) => ({
                    value: year.id.toString(),
                    label: `${year.yearRange} ${year.isCurrent ? '(Current)' : ''}`
                  })) || []
                }
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                placeholder='Select academic year...'
                searchPlaceholder='Search academic year...'
                disabled={loading || academicYearsLoading}
              />
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
              <Combobox
                options={filteredSemesters.map((semester) => ({
                  value: semester.id.toString(),
                  label: `${semester.semesterName} ${semester.isCurrent ? '(Current)' : ''}`
                }))}
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                placeholder={
                  selectedAcademicYearId
                    ? 'Select a semester...'
                    : 'Select academic year first'
                }
                searchPlaceholder='Search semester...'
                disabled={
                  loading || semestersLoading || !selectedAcademicYearId
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='classId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <Combobox
                options={filteredClasses.map((cls) => ({
                  value: cls.id.toString(),
                  label: `${cls.className} (${cls.departmentCode})`
                }))}
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                placeholder={
                  selectedSemesterId
                    ? 'Select a class...'
                    : 'Select semester first'
                }
                searchPlaceholder='Search class...'
                disabled={loading || classesLoading || !selectedSemesterId}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='rollNumber'
          render={({ field }) => (
            <FormItem className='col-span-2'>
              <FormLabel>Roll Number</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter roll number'
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='col-span-2 flex justify-end gap-4'>
          <Button
            type='submit'
            disabled={loading || isDataLoading}
            className='w-full sm:w-auto'
          >
            {loading && <Loader className='h-4 w-4 animate-spin' />}
            {loading ? 'Saving Erollment...' : 'Save Enrollment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
