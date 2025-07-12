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
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useTransition, useState } from 'react';
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
  rollNumberPrefix: z.string().min(1, 'Roll number prefix is required'),
  rollNumberSuffix: z
    .string()
    .min(1, 'Roll number is required')
    .regex(
      /^[1-9]\d*$/,
      'Roll number must be a positive number and cannot start with 0'
    ),
  isActive: z.boolean()
});

interface EnrollmentFormProps {
  enrollment?: EnrollmentWithDetails;
  onSuccess?: () => void;
}

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

export function EnrollmentForm({ enrollment, onSuccess }: EnrollmentFormProps) {
  const [loading, startTransition] = useTransition();
  const [autoSelectCurrentYear, setAutoSelectCurrentYear] = useState(false);
  const [autoSelectCurrentSemester, setAutoSelectCurrentSemester] =
    useState(false);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);

  // Parse existing roll number if in edit mode
  const parseRollNumber = (rollNumber?: string) => {
    if (!rollNumber) return { prefix: '', suffix: '' };

    const match = rollNumber.match(/^(.+)-(\d+)$/);
    if (match) {
      return { prefix: match[1], suffix: match[2] };
    }
    return { prefix: '', suffix: '' };
  };

  const { prefix: initialPrefix, suffix: initialSuffix } = parseRollNumber(
    enrollment?.rollNumber
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: enrollment?.studentId?.toString() || '',
      classId: enrollment?.classId?.toString() || '',
      semesterId: enrollment?.semesterId?.toString() || '',
      academicYearId: enrollment?.semester?.academicYearId?.toString() || '',
      rollNumberPrefix: initialPrefix,
      rollNumberSuffix: initialSuffix,
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

  // Auto-select current academic year
  useEffect(() => {
    if (autoSelectCurrentYear && academicYearsData) {
      const currentYear = academicYearsData.find((year) => year.isCurrent);
      if (currentYear) {
        setIsAutoSelecting(true);
        form.setValue('academicYearId', currentYear.id.toString());
        setIsAutoSelecting(false);
      }
    }
  }, [autoSelectCurrentYear, academicYearsData, form]);

  // Auto-select current semester
  useEffect(() => {
    if (autoSelectCurrentSemester && filteredSemesters.length > 0) {
      const currentSemester = filteredSemesters.find(
        (semester) => semester.isCurrent
      );
      if (currentSemester) {
        setIsAutoSelecting(true);
        form.setValue('semesterId', currentSemester.id.toString());
        setIsAutoSelecting(false);
      }
    }
  }, [autoSelectCurrentSemester, filteredSemesters, form]);

  // Handle academic year change - uncheck auto-select if manually changed
  const handleAcademicYearChange = (value: string) => {
    if (!isAutoSelecting && autoSelectCurrentYear) {
      setAutoSelectCurrentYear(false);
    }
    form.setValue('academicYearId', value);
  };

  // Handle semester change - uncheck auto-select if manually changed
  const handleSemesterChange = (value: string) => {
    if (!isAutoSelecting && autoSelectCurrentSemester) {
      setAutoSelectCurrentSemester(false);
    }
    form.setValue('semesterId', value);
  };

  useEffect(() => {
    if (enrollment) {
      const { prefix, suffix } = parseRollNumber(enrollment.rollNumber);
      form.reset({
        studentId: enrollment.studentId?.toString() || '',
        classId: enrollment.classId?.toString() || '',
        semesterId: enrollment.semesterId?.toString() || '',
        academicYearId: enrollment.semester?.academicYearId?.toString() || '',
        rollNumberPrefix: prefix,
        rollNumberSuffix: suffix,
        isActive: enrollment.isActive || false
      });
    }
  }, [enrollment, form]);

  useEffect(() => {
    if (selectedAcademicYearId) {
      const currentSemester = form.getValues('semesterId');
      const isCurrentSemesterValid = filteredSemesters.some(
        (s) => s.id === Number(currentSemester)
      );

      if (!isCurrentSemesterValid) {
        form.setValue('semesterId', '');
        form.setValue('classId', '');
      }
    }
  }, [selectedAcademicYearId, filteredSemesters, form]);

  useEffect(() => {
    if (selectedSemesterId) {
      const currentClass = form.getValues('classId');
      const isCurrentClassValid = filteredClasses.some(
        (c) => c.id === Number(currentClass)
      );

      if (!isCurrentClassValid) {
        form.setValue('classId', '');
      }
    }
  }, [selectedSemesterId, filteredClasses, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const submitData = {
          studentId: Number(values.studentId),
          classId: Number(values.classId),
          semesterId: Number(values.semesterId),
          rollNumber: `${values.rollNumberPrefix}-${values.rollNumberSuffix}`,
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
              <div className='flex items-center gap-2'>
                <FormLabel>Academic Year</FormLabel>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='auto-select-year'
                    checked={autoSelectCurrentYear}
                    onCheckedChange={(checked) =>
                      setAutoSelectCurrentYear(checked as boolean)
                    }
                    disabled={loading || academicYearsLoading}
                  />
                  <label
                    htmlFor='auto-select-year'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed
                      peer-disabled:opacity-70'
                  >
                    Current
                  </label>
                </div>
              </div>
              <Combobox
                options={
                  academicYearsData?.map((year) => ({
                    value: year.id.toString(),
                    label: `${year.yearRange} ${year.isCurrent ? '(Current)' : ''}`
                  })) || []
                }
                value={field.value}
                onValueChange={handleAcademicYearChange}
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
              <div className='flex items-center gap-2'>
                <FormLabel>Semester</FormLabel>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='auto-select-semester'
                    checked={autoSelectCurrentSemester}
                    onCheckedChange={(checked) =>
                      setAutoSelectCurrentSemester(checked as boolean)
                    }
                    disabled={
                      loading || semestersLoading || !selectedAcademicYearId
                    }
                  />
                  <label
                    htmlFor='auto-select-semester'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed
                      peer-disabled:opacity-70'
                  >
                    Current
                  </label>
                </div>
              </div>
              <Combobox
                options={filteredSemesters.map((semester) => ({
                  value: semester.id.toString(),
                  label: `${semester.semesterName} ${semester.isCurrent ? '(Current)' : ''}`
                }))}
                value={field.value}
                onValueChange={handleSemesterChange}
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
                    ? filteredClasses.length > 0
                      ? 'Select a class...'
                      : 'No classes available'
                    : 'Select semester first'
                }
                searchPlaceholder='Search class...'
                disabled={
                  loading ||
                  classesLoading ||
                  !selectedSemesterId ||
                  filteredClasses.length === 0
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='rollNumberPrefix'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roll Number Prefix</FormLabel>
              <Combobox
                options={rollNumberPrefixes}
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                placeholder='Select prefix...'
                searchPlaceholder='Search prefix...'
                disabled={loading}
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
              <FormLabel>Roll Number</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Enter number'
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

        <div className='col-span-2 flex justify-end gap-4'>
          <Button
            type='submit'
            disabled={loading || isDataLoading || !form.watch('classId')}
            className='w-full sm:w-auto'
          >
            {loading && <Loader className='h-4 w-4 animate-spin' />}
            {loading ? 'Saving Enrollment...' : 'Save Enrollment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
