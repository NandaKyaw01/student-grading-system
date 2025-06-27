'use client';

import {
  checkExistingResult,
  createResult,
  getAcademicYears,
  getEnrollmentsByStudentAndSemester,
  getSemestersByAcademicYear,
  getStudents,
  getSubjectsByEnrollment,
  updateResult
} from '@/actions/result';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreateResultFormData,
  createResultSchema,
  createResultSchemaWithSubjects,
  UpdateResultFormData,
  updateResultSchema
} from '@/lib/zod/result';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Combobox } from './result-combobox';
import ExistingResultDialog from './result-existing-alert';

export interface ResultFormProps {
  initialData?: UpdateResultFormData | CreateResultFormData | null;
  onSuccess?: () => void;
}

// Loading skeleton components
const ComboboxSkeleton = () => (
  <div className='space-y-2'>
    <Skeleton className='h-10 w-full' />
  </div>
);

const SubjectGradeSkeleton = () => (
  <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg'>
    <div className='md:col-span-1 space-y-2'>
      <Skeleton className='h-4 w-32' />
      <Skeleton className='h-3 w-40' />
    </div>
    <div className='space-y-2'>
      <Skeleton className='h-4 w-16' />
      <Skeleton className='h-10 w-full' />
    </div>
    <div className='space-y-2'>
      <Skeleton className='h-4 w-24' />
      <Skeleton className='h-10 w-full' />
    </div>
    <div className='flex items-end'>
      <div className='space-y-1'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-5 w-12' />
      </div>
    </div>
  </div>
);

const SubjectGradesCardSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>Subject Marks</CardTitle>
    </CardHeader>
    <CardContent className='space-y-4'>
      {[...Array(3)].map((_, index) => (
        <SubjectGradeSkeleton key={index} />
      ))}
    </CardContent>
  </Card>
);

export default function ResultForm({
  initialData,
  onSuccess
}: ResultFormProps) {
  const router = useRouter();

  // Check if this is edit mode by looking for enrollmentId in initialData
  const isEditMode = !!(
    initialData &&
    'enrollmentId' in initialData &&
    initialData.enrollmentId > 0
  );

  // Check if we have query parameters for pre-filling
  const hasQueryParams = !!(
    initialData &&
    !isEditMode &&
    (initialData.studentId > 0 ||
      initialData.academicYearId > 0 ||
      initialData.semesterId > 0)
  );

  const [autoSelectCurrentYear, setAutoSelectCurrentYear] = useState(
    isEditMode || !hasQueryParams
  );
  const [autoSelectCurrentSemester, setAutoSelectCurrentSemester] = useState(
    isEditMode || !hasQueryParams
  );
  const [showExistingResultDialog, setShowExistingResultDialog] =
    useState(false);

  const [dynamicSchema, setDynamicSchema] = useState(
    isEditMode ? updateResultSchema : createResultSchema
  );

  const form = useForm<CreateResultFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      studentId: initialData?.studentId || 0,
      academicYearId: initialData?.academicYearId || 0,
      semesterId: initialData?.semesterId || 0,
      enrollmentId: initialData?.enrollmentId || 0,
      grades: initialData?.grades || []
    }
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'grades'
  });

  // Watch form values
  const watchedValues = form.watch([
    'studentId',
    'academicYearId',
    'semesterId',
    'enrollmentId'
  ]);
  const [studentId, academicYearId, semesterId, enrollmentId] = watchedValues;

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // Data fetching queries
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents
  });

  const { data: academicYearsData, isLoading: academicYearsLoading } = useQuery(
    {
      queryKey: ['academic-years'],
      queryFn: getAcademicYears
    }
  );

  const { data: semestersData, isLoading: semestersLoading } = useQuery({
    queryKey: ['semesters', academicYearId],
    queryFn: () => getSemestersByAcademicYear(academicYearId),
    enabled: academicYearId > 0
  });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', studentId, semesterId],
    queryFn: () => getEnrollmentsByStudentAndSemester(studentId, semesterId),
    enabled: studentId > 0 && semesterId > 0
  });

  const { data: existingResultData } = useQuery({
    queryKey: ['existing-result', enrollmentId],
    queryFn: () => checkExistingResult(enrollmentId),
    enabled: enrollmentId > 0 && !isEditMode
  });

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects', enrollmentId],
    queryFn: () => getSubjectsByEnrollment(enrollmentId),
    enabled: enrollmentId > 0
  });

  // Memoized data transformations
  const students = useMemo(
    () => (studentsData?.success ? (studentsData.data ?? []) : []),
    [studentsData]
  );

  const academicYears = useMemo(
    () => (academicYearsData?.success ? (academicYearsData.data ?? []) : []),
    [academicYearsData]
  );

  const semesters = useMemo(
    () => (semestersData?.success ? (semestersData.data ?? []) : []),
    [semestersData]
  );

  const enrollments = useMemo(
    () => (enrollmentsData?.success ? (enrollmentsData.data ?? []) : []),
    [enrollmentsData]
  );

  const subjects = useMemo(
    () => (subjectsData?.success ? (subjectsData.data ?? []) : []),
    [subjectsData]
  );

  const hasExistingResult =
    existingResultData?.success && existingResultData.data;

  useEffect(() => {
    if (subjects.length > 0) {
      const newSchema = createResultSchemaWithSubjects(subjects);
      setDynamicSchema(newSchema);

      // Get current form values
      const currentValues = form.getValues();

      // Recreate form with new schema
      form.reset(currentValues);
    }
  }, [subjects, form]);

  // Auto-selection effects
  useEffect(() => {
    if (
      autoSelectCurrentYear &&
      !academicYearsLoading &&
      !isEditMode &&
      studentId > 0 &&
      !hasQueryParams
    ) {
      const currentAcademicYear = academicYears.find((ay) => ay.isCurrent);
      if (currentAcademicYear && academicYearId !== currentAcademicYear.id) {
        form.setValue('academicYearId', currentAcademicYear.id);
      }
    }
  }, [
    autoSelectCurrentYear,
    academicYears,
    academicYearsLoading,
    isEditMode,
    studentId,
    academicYearId,
    hasQueryParams,
    form
  ]);

  useEffect(() => {
    if (
      autoSelectCurrentSemester &&
      !semestersLoading &&
      !isEditMode &&
      academicYearId > 0 &&
      !hasQueryParams
    ) {
      const currentSemester = semesters.find((s) => s.isCurrent);
      if (currentSemester && semesterId !== currentSemester.id) {
        form.setValue('semesterId', currentSemester.id);
      }
    }
  }, [
    autoSelectCurrentSemester,
    semesters,
    semestersLoading,
    isEditMode,
    academicYearId,
    semesterId,
    hasQueryParams,
    form
  ]);

  // Setup grade fields when subjects are loaded
  useEffect(() => {
    if (subjects.length > 0) {
      let gradeFields;

      if (isEditMode && initialData?.grades?.length > 0) {
        gradeFields = subjects.map((subject) => {
          const existingGrade = initialData.grades.find(
            (grade) => grade.classSubjectId === subject.classSubjectId
          );
          return {
            classSubjectId: subject.classSubjectId,
            examMark: existingGrade?.examMark?.toString() ?? '',
            assignMark: existingGrade?.assignMark?.toString() ?? ''
          };
        });
      } else {
        gradeFields = subjects.map((subject) => ({
          classSubjectId: subject.classSubjectId,
          examMark: '',
          assignMark: ''
        }));
      }

      replace(gradeFields);
    }
  }, [subjects, replace, isEditMode, initialData?.grades]);

  // Handle existing result
  useEffect(() => {
    if (hasExistingResult && !isEditMode) {
      setShowExistingResultDialog(true);
      form.setError('enrollmentId', {
        type: 'manual',
        message: 'A result already exists for this enrollment'
      });
    } else {
      form.clearErrors('enrollmentId');
    }
  }, [hasExistingResult, isEditMode, form]);

  // Create/Update result mutation
  const resultMutation = useMutation({
    mutationFn: async (data: CreateResultFormData | UpdateResultFormData) => {
      return isEditMode
        ? await updateResult(data as UpdateResultFormData)
        : await createResult(data as CreateResultFormData);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          isEditMode
            ? 'Result updated successfully!'
            : 'Result created successfully!'
        );

        if (!isEditMode) {
          form.reset();
          setAutoSelectCurrentYear(false);
          setAutoSelectCurrentSemester(false);
          router.push('/admin/results');
        }

        onSuccess?.();
      } else {
        toast.error(
          result.error || `Failed to ${isEditMode ? 'update' : 'create'} result`
        );
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Event handlers
  const handleFieldChange = (fieldName: string) => (value: string) => {
    const numValue = Number(value) || 0;
    form.setValue(
      fieldName as
        | 'studentId'
        | 'academicYearId'
        | 'semesterId'
        | 'enrollmentId',
      numValue
    );

    if (!isEditMode) {
      // Reset dependent fields in create mode
      if (fieldName === 'studentId') {
        form.setValue('academicYearId', 0);
        form.setValue('semesterId', 0);
        form.setValue('enrollmentId', 0);
        replace([]);
      } else if (fieldName === 'academicYearId') {
        form.setValue('semesterId', 0);
        form.setValue('enrollmentId', 0);
        setAutoSelectCurrentYear(false);
        replace([]);
      } else if (fieldName === 'semesterId') {
        form.setValue('enrollmentId', 0);
        setAutoSelectCurrentSemester(false);
        replace([]);
      } else if (fieldName === 'enrollmentId') {
        replace([]);
      }
    }
  };

  const handleEditExisting = () => {
    if (existingResultData?.data) {
      router.push(`/admin/results/${existingResultData.data.enrollmentId}`);
    }
  };

  const handleCancelExisting = () => {
    form.setValue('enrollmentId', 0);
    form.clearErrors('enrollmentId');
  };

  const onSubmit = (data: CreateResultFormData | UpdateResultFormData) => {
    resultMutation.mutate(data);
  };

  const calculateFinalMark = (index: number) => {
    const subject = subjects[index];
    if (!subject) return '0.00';

    const examMarkValue = form.watch(`grades.${index}.examMark`);
    const assignMarkValue = form.watch(`grades.${index}.assignMark`);

    const examMark =
      typeof examMarkValue === 'string'
        ? parseFloat(examMarkValue) || 0
        : examMarkValue || 0;
    const assignMark =
      typeof assignMarkValue === 'string'
        ? parseFloat(assignMarkValue) || 0
        : assignMarkValue || 0;

    const finalMark = examMark * subject.examWeight + assignMark;
    return finalMark.toFixed(2);
  };

  const isSubmitDisabled =
    resultMutation.isPending ||
    !enrollmentId ||
    subjects.length === 0 ||
    subjectsLoading ||
    (Boolean(hasExistingResult) && !isEditMode);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-2 gap-5'>
          {/* Student Selection */}
          <FormField
            control={form.control}
            name='studentId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <FormControl>
                  {studentsLoading ? (
                    <ComboboxSkeleton />
                  ) : (
                    <Combobox
                      options={students.map((s) => ({
                        value: s.id.toString(),
                        label: s.studentName
                      }))}
                      value={field.value > 0 ? field.value.toString() : ''}
                      onValueChange={handleFieldChange('studentId')}
                      placeholder='Select a student...'
                      searchPlaceholder='Search students...'
                      disabled={studentsLoading || isEditMode}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Academic Year Selection */}
          <FormField
            control={form.control}
            name='academicYearId'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center space-x-2'>
                  <FormLabel>Academic Year</FormLabel>
                  {!isEditMode && (
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='auto-year'
                        checked={autoSelectCurrentYear}
                        onCheckedChange={(checked) =>
                          setAutoSelectCurrentYear(!!checked)
                        }
                        disabled={!studentId}
                      />
                      <Label htmlFor='auto-year'>Current</Label>
                    </div>
                  )}
                </div>
                <FormControl>
                  {academicYearsLoading ? (
                    <ComboboxSkeleton />
                  ) : (
                    <Combobox
                      options={academicYears.map((ay) => ({
                        value: ay.id.toString(),
                        label: `${ay.yearRange} ${ay.isCurrent ? '(Current)' : ''}`
                      }))}
                      value={field.value > 0 ? field.value.toString() : ''}
                      onValueChange={handleFieldChange('academicYearId')}
                      placeholder='Select academic year...'
                      disabled={
                        academicYearsLoading ||
                        (!studentId && !isEditMode) ||
                        isEditMode
                      }
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Semester Selection */}
          <FormField
            control={form.control}
            name='semesterId'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center space-x-2'>
                  <FormLabel>Semester</FormLabel>
                  {!isEditMode && (
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='auto-semester'
                        checked={autoSelectCurrentSemester}
                        onCheckedChange={(checked) =>
                          setAutoSelectCurrentSemester(!!checked)
                        }
                        disabled={!academicYearId}
                      />
                      <Label htmlFor='auto-semester'>Current</Label>
                    </div>
                  )}
                </div>
                <FormControl>
                  {semestersLoading && academicYearId ? (
                    <ComboboxSkeleton />
                  ) : (
                    <Combobox
                      options={semesters.map((s) => ({
                        value: s.id.toString(),
                        label: `${s.semesterName} ${s.isCurrent ? '(Current)' : ''}`
                      }))}
                      value={field.value > 0 ? field.value.toString() : ''}
                      onValueChange={handleFieldChange('semesterId')}
                      placeholder='Select semester...'
                      disabled={
                        semestersLoading ||
                        (!academicYearId && !isEditMode) ||
                        isEditMode
                      }
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Enrollment Selection */}
          <FormField
            control={form.control}
            name='enrollmentId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enrollment (Class + Roll Number)</FormLabel>
                <FormControl>
                  {enrollmentsLoading && studentId && semesterId ? (
                    <ComboboxSkeleton />
                  ) : (
                    <Combobox
                      options={enrollments.map((e) => ({
                        value: e.id.toString(),
                        label: `${e.class.departmentCode} ${e.class.className} - ${e.rollNumber}`
                      }))}
                      value={field.value > 0 ? field.value.toString() : ''}
                      onValueChange={handleFieldChange('enrollmentId')}
                      placeholder='Select enrollment...'
                      disabled={
                        enrollmentsLoading ||
                        (!semesterId && !isEditMode) ||
                        isEditMode
                      }
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subject Grades */}
        {!hasExistingResult || isEditMode ? (
          <>
            {subjectsLoading && enrollmentId ? (
              isEditMode ? (
                <SubjectGradesCardSkeleton />
              ) : null
            ) : subjects.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Subject Marks</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {fields.map((field, index) => {
                    const subject = subjects[index];
                    if (!subject) return null;

                    return (
                      <div
                        key={field.id}
                        className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg'
                      >
                        <div className='md:col-span-1'>
                          <Label className='font-medium'>
                            {subject.subjectName}
                          </Label>
                          <p className='text-sm text-muted-foreground'>
                            Credits: {subject.creditHours} | Exam:{' '}
                            {(subject.examWeight * 100).toFixed(0)}% |
                            Assignment:{' '}
                            {(subject.assignWeight * 100).toFixed(0)}%
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name={`grades.${index}.examMark`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exam Mark *</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='0'
                                  max='100'
                                  step='0.01'
                                  placeholder='0-100'
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (['e', 'E', '+', '-'].includes(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`grades.${index}.assignMark`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assignment Mark *</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='0'
                                  max={subject.assignWeight * 100}
                                  step='0.01'
                                  placeholder={`0-${subject.assignWeight * 100}`}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (['e', 'E', '+', '-'].includes(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='flex items-end'>
                          <div className='text-sm'>
                            <div>Final Mark:</div>
                            <div className='font-semibold'>
                              {calculateFinalMark(index)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}

        {/* Submit Button */}
        <Button type='submit' className='w-full' disabled={isSubmitDisabled}>
          {resultMutation.isPending && (
            <Loader className='mr-2 h-4 w-4 animate-spin' />
          )}
          {isEditMode ? 'Update Result' : 'Create Result'}
        </Button>

        {/* Existing Result Dialog */}
        <ExistingResultDialog
          enrollmentId={enrollmentId}
          open={showExistingResultDialog}
          onOpenChange={setShowExistingResultDialog}
          onEditClick={handleEditExisting}
          onCancel={handleCancelExisting}
          onClose={() => {
            form.setValue('enrollmentId', 0);
            form.clearErrors('enrollmentId');
          }}
        />
      </form>
    </Form>
  );
}
