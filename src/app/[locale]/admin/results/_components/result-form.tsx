'use client';

import {
  checkExistingResult,
  createResult,
  getAcademicYears,
  getEnrollmentsByStudentAndSemester,
  getGradeScale,
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
import { AlertTriangle, Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Combobox } from './result-combobox';
import ExistingResultDialog from './result-existing-alert';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      <Skeleton className='h-4 w-20' />
      <Skeleton className='h-10 w-full' />
    </div>
    <div className='space-y-2'>
      <Skeleton className='h-4 w-24' />
      <Skeleton className='h-10 w-full' />
    </div>
    <div className='flex items-end'>
      <div className='space-y-1'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-3 w-12' />
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
  const t = useTranslations('ResultsBySemester.ResultForm');

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
    // isEditMode || !hasQueryParams
    false
  );
  const [autoSelectCurrentSemester, setAutoSelectCurrentSemester] = useState(
    // isEditMode || !hasQueryParams
    false
  );
  const [showExistingResultDialog, setShowExistingResultDialog] =
    useState(false);

  const [dynamicSchema, setDynamicSchema] = useState(
    isEditMode ? updateResultSchema(t) : createResultSchema(t)
  );

  // Use refs to track if we've already initialized form values
  const initialDataProcessed = useRef(false);
  const currentYearProcessed = useRef(false);
  const currentSemesterProcessed = useRef(false);
  const subjectsProcessed = useRef(false);

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

  // Initialize form with initial data - only once
  useEffect(() => {
    if (initialData && !initialDataProcessed.current) {
      form.reset(initialData);
      initialDataProcessed.current = true;
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

  const { data: gradeScalesData } = useQuery({
    queryKey: ['grade-scales'],
    queryFn: getGradeScale // You'll need to create this action
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

  const hasExistingResult = useMemo(
    () => existingResultData?.success && existingResultData.data,
    [existingResultData]
  );

  const gradeScales = useMemo(
    () => (gradeScalesData?.success ? (gradeScalesData.data ?? []) : []),
    [gradeScalesData]
  );

  // Update schema when subjects change - only once per subjects array
  useEffect(() => {
    if (subjects.length > 0 && !subjectsProcessed.current) {
      const newSchema = createResultSchemaWithSubjects(subjects, t);
      setDynamicSchema(newSchema);
      subjectsProcessed.current = true;
    } else if (subjects.length === 0) {
      subjectsProcessed.current = false;
    }
  }, [subjects, t]);

  // Auto-selection effects - use refs to prevent multiple executions
  useEffect(() => {
    if (
      autoSelectCurrentYear &&
      !academicYearsLoading &&
      !isEditMode &&
      studentId > 0 &&
      !hasQueryParams &&
      !currentYearProcessed.current
    ) {
      const currentAcademicYear = academicYears.find((ay) => ay.isCurrent);
      if (currentAcademicYear && academicYearId !== currentAcademicYear.id) {
        form.setValue('academicYearId', currentAcademicYear.id);
        currentYearProcessed.current = true;
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
      !hasQueryParams &&
      !currentSemesterProcessed.current
    ) {
      const currentSemester = semesters.find((s) => s.isCurrent);
      if (currentSemester && semesterId !== currentSemester.id) {
        form.setValue('semesterId', currentSemester.id);
        currentSemesterProcessed.current = true;
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

  // Setup grade fields when subjects are loaded - memoize the grade fields creation
  const gradeFields = useMemo(() => {
    if (subjects.length === 0) return [];

    if (isEditMode && initialData?.grades?.length > 0) {
      return subjects.map((subject) => {
        const existingGrade = initialData.grades.find(
          (grade) => grade.classSubjectId === subject.classSubjectId
        );
        return {
          classSubjectId: subject.classSubjectId,
          baseMark: existingGrade?.baseMark?.toString() ?? '', // This will be the input field
          assignMark: existingGrade?.assignMark?.toString() ?? ''
        };
      });
    } else {
      return subjects.map((subject) => ({
        classSubjectId: subject.classSubjectId,
        baseMark: '', // This will be the input field
        assignMark: ''
      }));
    }
  }, [subjects, isEditMode, initialData?.grades]);

  useEffect(() => {
    if (gradeFields.length > 0) {
      replace(gradeFields);
    }
  }, [gradeFields, replace]);

  // Handle existing result
  useEffect(() => {
    if (hasExistingResult && !isEditMode) {
      setShowExistingResultDialog(true);
      form.setError('enrollmentId', {
        type: 'manual',
        message: t('messages.manual_error')
      });
    } else {
      form.clearErrors('enrollmentId');
    }
  }, [hasExistingResult, isEditMode, form, t]);

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
            ? t('messages.update_success')
            : t('messages.create_success')
        );

        if (!isEditMode) {
          form.reset();
          setAutoSelectCurrentYear(false);
          setAutoSelectCurrentSemester(false);
          currentYearProcessed.current = false;
          currentSemesterProcessed.current = false;
          subjectsProcessed.current = false;
          router.push('/admin/results');
        }

        onSuccess?.();
      } else {
        toast.error(
          isEditMode
            ? t('messages.update_error', { message: result.error ?? '' })
            : t('messages.create_error')
        );
      }
    },
    onError: () => {
      toast.error(t('messages.generic_error'));
    }
  });

  // Event handlers - use useCallback to prevent recreation
  const handleFieldChange = useCallback(
    (fieldName: string) => (value: string) => {
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
          // Reset processed flags
          currentYearProcessed.current = false;
          currentSemesterProcessed.current = false;
          subjectsProcessed.current = false;
        } else if (fieldName === 'academicYearId') {
          form.setValue('semesterId', 0);
          form.setValue('enrollmentId', 0);
          setAutoSelectCurrentYear(false);
          replace([]);
          currentSemesterProcessed.current = false;
          subjectsProcessed.current = false;
        } else if (fieldName === 'semesterId') {
          form.setValue('enrollmentId', 0);
          setAutoSelectCurrentSemester(false);
          replace([]);
          subjectsProcessed.current = false;
        } else if (fieldName === 'enrollmentId') {
          replace([]);
          subjectsProcessed.current = false;
        }
      }
    },
    [form, isEditMode, replace]
  );

  const handleEditExisting = useCallback(() => {
    if (existingResultData?.data) {
      router.push(`/admin/results/${existingResultData.data.enrollmentId}`);
    }
  }, [existingResultData?.data, router]);

  const handleCancelExisting = useCallback(() => {
    form.setValue('enrollmentId', 0);
    form.clearErrors('enrollmentId');
  }, [form]);

  const onSubmit = useCallback(
    (data: CreateResultFormData | UpdateResultFormData) => {
      resultMutation.mutate(data);
    },
    [resultMutation]
  );

  // const calculateFinalMark = useCallback(
  //   (index: number) => {
  //     const subject = subjects[index];
  //     if (!subject) return '0.00';

  //     const examMarkValue = form.watch(`grades.${index}.examMark`);
  //     const assignMarkValue = form.watch(`grades.${index}.assignMark`);

  //     const examMark =
  //       typeof examMarkValue === 'string'
  //         ? parseFloat(examMarkValue) || 0
  //         : examMarkValue || 0;
  //     const assignMark =
  //       typeof assignMarkValue === 'string'
  //         ? parseFloat(assignMarkValue) || 0
  //         : assignMarkValue || 0;

  //     const finalMark = examMark * subject.examWeight + assignMark;
  //     return finalMark.toFixed(2);
  //   },
  //   [subjects, form]
  // );
  const calculateGradeInfo = useCallback(
    (index: number) => {
      const subject = subjects[index];
      if (!subject)
        return {
          examMark: '0.00',
          finalMark: '0.00',
          grade: '',
          score: 0,
          gp: 0
        };

      const baseMarkValue = form.watch(`grades.${index}.baseMark`);
      const assignMarkValue = form.watch(`grades.${index}.assignMark`);

      const baseMark =
        typeof baseMarkValue === 'string'
          ? parseFloat(baseMarkValue) || 0
          : baseMarkValue || 0;
      const assignMark =
        typeof assignMarkValue === 'string'
          ? parseFloat(assignMarkValue) || 0
          : assignMarkValue || 0;

      // Calculate exam mark from base mark
      const examMark = baseMark * subject.examWeight;

      // Calculate final mark
      const finalMark = examMark + assignMark;

      const roundedFinalMark = Math.ceil(finalMark);

      // Find grade from grade scale
      const gradeScale = gradeScales.find(
        (scale) =>
          roundedFinalMark >= scale.minMark && roundedFinalMark <= scale.maxMark
      );

      const gp = (gradeScale?.score || 0) * subject.creditHours;

      return {
        examMark: examMark.toFixed(2),
        finalMark: roundedFinalMark.toFixed(2),
        grade: gradeScale?.grade || '',
        score: gradeScale?.score || 0,
        gp: gp.toFixed(2) // Assuming GP is same as score
      };
    },
    [subjects, form, gradeScales]
  );

  const isSubmitDisabled = useMemo(
    () =>
      resultMutation.isPending ||
      !enrollmentId ||
      subjects.length === 0 ||
      subjectsLoading ||
      (Boolean(hasExistingResult) && !isEditMode),
    [
      resultMutation.isPending,
      enrollmentId,
      subjects.length,
      subjectsLoading,
      hasExistingResult,
      isEditMode
    ]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          {/* Student Selection */}
          <FormField
            control={form.control}
            name='studentId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.student.label')}</FormLabel>
                <FormControl>
                  {studentsLoading ? (
                    <ComboboxSkeleton />
                  ) : (
                    <Combobox
                      options={students.map((s) => ({
                        value: s.id.toString(),
                        label: `${s.studentName} (${s.admissionId})`
                      }))}
                      value={field.value > 0 ? field.value.toString() : ''}
                      onValueChange={handleFieldChange('studentId')}
                      placeholder={t('fields.student.placeholder')}
                      searchPlaceholder={t('fields.student.search')}
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
                  <FormLabel>{t('fields.academic_year.label')}</FormLabel>
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
                      <Label htmlFor='auto-year'>
                        {t('fields.academic_year.current')}
                      </Label>
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
                        label: `${ay.yearRange} ${ay.isCurrent ? `(${t('fields.academic_year.current')})` : ''}`
                      }))}
                      value={field.value > 0 ? field.value.toString() : ''}
                      onValueChange={handleFieldChange('academicYearId')}
                      placeholder={t('fields.academic_year.placeholder')}
                      searchPlaceholder={t('fields.academic_year.search')}
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
                  <FormLabel>{t('fields.semester.label')}</FormLabel>
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
                      <Label htmlFor='auto-semester'>
                        {t('fields.semester.current')}
                      </Label>
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
                        label: `${s.semesterName} ${s.isCurrent ? `(${t('fields.semester.current')})` : ''}`
                      }))}
                      value={field.value > 0 ? field.value.toString() : ''}
                      onValueChange={handleFieldChange('semesterId')}
                      placeholder={t('fields.semester.placeholder')}
                      searchPlaceholder={t('fields.semester.search')}
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
                <FormLabel>{t('fields.enrollment.label')}</FormLabel>
                <FormControl>
                  {enrollmentsLoading && studentId && semesterId ? (
                    <ComboboxSkeleton />
                  ) : studentId > 0 &&
                    semesterId > 0 &&
                    enrollments.length === 0 &&
                    !enrollmentsLoading ? (
                    <Alert className='border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50'>
                      <AlertTriangle className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                      <AlertDescription className='text-blue-800 dark:text-blue-200'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                          <span>
                            {t('fields.enrollment.no_enrollment_message', {
                              defaultValue:
                                'No enrollment found for this student in the selected semester. Please create an enrollment first.'
                            })}
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(
                                `/admin/enrollments/create?studentId=${studentId}&semesterId=${semesterId}`
                              );
                            }}
                            className='text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700
                              hover:bg-blue-100 dark:hover:bg-blue-900/50'
                          >
                            {t('fields.enrollment.create_enrollment_button', {
                              defaultValue: 'Create Enrollment'
                            })}
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Combobox
                      options={enrollments.map((e) => ({
                        value: e.id.toString(),
                        label: `${e.class.departmentCode} ${e.class.className} - ${e.rollNumber}`
                      }))}
                      value={field.value > 0 ? field.value.toString() : ''}
                      onValueChange={handleFieldChange('enrollmentId')}
                      placeholder={t('fields.enrollment.placeholder')}
                      searchPlaceholder={t('fields.enrollment.search')}
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
            ) : enrollmentId > 0 && subjects.length === 0 ? (
              // Show alert when enrollment is selected but no subjects found
              <Alert className='border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50'>
                <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                <AlertDescription className='text-amber-800 dark:text-amber-200'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <span>
                      {t('subjects.no_subjects_message', {
                        defaultValue:
                          'No subjects found for this enrollment. Please create subjects first.'
                      })}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const selectedEnrollment = enrollments.find(
                          (e) => e.id === enrollmentId
                        );
                        if (selectedEnrollment) {
                          router.push(
                            `/admin/class-subjects?departmentCode=${selectedEnrollment.class.departmentCode}`
                          );
                        }
                      }}
                      className='text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700
                        hover:bg-amber-100 dark:hover:bg-amber-900/50'
                    >
                      {t('subjects.create_subjects_button', {
                        defaultValue: 'Create Subjects'
                      })}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : subjects.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t('subjects.title')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {fields.map((field, index) => {
                    const subject = subjects[index];
                    if (!subject) return null;

                    return (
                      <div
                        key={field.id}
                        className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg items-center'
                      >
                        <div className='md:col-span-1'>
                          <Label className='font-medium'>
                            {subject.subjectName}
                          </Label>
                          <div className='text-sm text-muted-foreground flex flex-row gap-1 flex-wrap'>
                            <div>
                              {t('subjects.credits', {
                                count: subject.creditHours
                              })}
                            </div>
                            <div>|</div>
                            <div>
                              {t('subjects.exam_weight', {
                                weight: (subject.examWeight * 100).toFixed(0)
                              })}
                            </div>
                            <div>|</div>
                            <div>
                              {t('subjects.assign_weight', {
                                weight: (subject.assignWeight * 100).toFixed(0)
                              })}
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name={`grades.${index}.baseMark`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t('subjects.base_mark.label')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='0'
                                  max='100'
                                  step='0.01'
                                  placeholder={t(
                                    'subjects.base_mark.placeholder'
                                  )}
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
                              <FormLabel>
                                {t('subjects.assign_mark.label')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='0'
                                  max={subject.assignWeight * 100}
                                  step='0.01'
                                  placeholder={t(
                                    'subjects.assign_mark.placeholder',
                                    {
                                      max: subject.assignWeight * 100
                                    }
                                  )}
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
                          <div className='text-sm space-y-1'>
                            {(() => {
                              const gradeInfo = calculateGradeInfo(index);
                              return (
                                <>
                                  <div className='flex gap-1'>
                                    <div>
                                      {t('subjects.grade_info.exam', {
                                        mark: gradeInfo.examMark
                                      })}
                                    </div>
                                    <div>|</div>
                                    <div>
                                      {t('subjects.grade_info.final', {
                                        mark: gradeInfo.finalMark
                                      })}
                                    </div>
                                    <div>|</div>
                                  </div>
                                  <div className='flex gap-1 flex-wrap h-5'>
                                    <div>
                                      {t('subjects.grade_info.grade', {
                                        value: gradeInfo.grade
                                      })}
                                    </div>
                                    <div>|</div>
                                    <div>
                                      {t('subjects.grade_info.score', {
                                        value: gradeInfo.score
                                      })}
                                    </div>
                                    <div>|</div>
                                    <div>
                                      {t('subjects.grade_info.gp', {
                                        value: gradeInfo.gp
                                      })}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
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
          {t(`actions.${isEditMode ? 'update' : 'create'}`)}
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
