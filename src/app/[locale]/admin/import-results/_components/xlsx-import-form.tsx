'use client';

import {
  generateStudentTemplate,
  importStudentResults
} from '@/actions/import-result';
import { Combobox } from '@/components/combo-box';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  useAcademicYears,
  useClasses,
  useClassSubjects,
  useSemesters
} from '@/hooks/use-academic-data';
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Loader,
  Upload,
  X
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition
} from 'react';
import { toast } from 'sonner';

interface SelectionState {
  academicYearId: number | null;
  semesterId: number | null;
  classId: number | null;
}

// Update UploadError interface to include column info
interface UploadError {
  row: number;
  column: string;
  field: string;
  message: string;
  value?: unknown;
}

const XlsxImportForm = () => {
  const t = useTranslations('ImportResultsPage.form');
  const [selection, setSelection] = useState<SelectionState>({
    academicYearId: null,
    semesterId: null,
    classId: null
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingTemplate, startDownloadTransition] = useTransition();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [errorDetails, setErrorDetails] = useState<UploadError[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Add new state for error sheet
  const [showErrorSheet, setShowErrorSheet] = useState(false);
  const [errorData, setErrorData] = useState<Record<string, unknown>[]>([]);
  const [errorHeaders, setErrorHeaders] = useState<string[]>([]);

  const [autoSelectYear, setAutoSelectYear] = useState(false);
  const [autoSelectSemester, setAutoSelectSemester] = useState(false);

  // Queries with proper dependency chain
  const { data: academicYears = [], isLoading: loadingYears } =
    useAcademicYears();
  const { data: semesters = [], isLoading: loadingSemesters } = useSemesters(
    selection.academicYearId || undefined
  );
  const { data: classes = [], isLoading: loadingClasses } = useClasses(
    selection.semesterId || undefined
  );
  const { data: classSubjects = [], isLoading: loadingclassSubjects } =
    useClassSubjects(selection.classId || undefined);

  // Memoized computed values to prevent re-renders
  const selectedAcademicYear = useMemo(
    () => academicYears.find((year) => year.id === selection.academicYearId),
    [academicYears, selection.academicYearId]
  );

  const selectedSemester = useMemo(
    () => semesters.find((sem) => sem.id === selection.semesterId),
    [semesters, selection.semesterId]
  );

  const selectedClass = useMemo(
    () => classes.find((cls) => cls.id === selection.classId),
    [classes, selection.classId]
  );

  const yearKeywordMap: Record<string, number> = useMemo(() => {
    return {
      '1st': 1,
      first: 1,
      '1': 1,
      '2nd': 2,
      second: 2,
      '2': 2,
      '3rd': 3,
      third: 3,
      '3': 3,
      '4th': 4,
      fourth: 4,
      '4': 4,
      '5th': 5,
      fifth: 5,
      '5': 5
    };
  }, []);

  const sortedClasses = useMemo(
    () =>
      classes.sort((a, b) => {
        // Extract the year keyword (case-insensitive)
        const getYearValue = (str: string) => {
          const match = str
            .toLowerCase()
            .match(/(1st|2nd|3rd|\d+th|first|second|third|fourth|fifth|\d+)/);
          return match ? yearKeywordMap[match[0].toLowerCase()] : Infinity;
        };

        // Compare years first
        const yearCompare =
          getYearValue(a.className) - getYearValue(b.className);
        if (yearCompare !== 0) return yearCompare;

        // If same year, sort by department code
        return a.departmentCode.localeCompare(b.departmentCode);
      }),
    [classes, yearKeywordMap]
  );

  const canDownloadTemplate = useMemo(
    () =>
      !!(
        selection.academicYearId &&
        selection.semesterId &&
        selection.classId &&
        classSubjects.length > 0
      ),
    [selection, classSubjects.length]
  );

  const showNoSubjectsError = useMemo(
    () => selection.classId && classSubjects.length === 0,
    [selection.classId, classSubjects.length]
  );

  const canSubmit = useMemo(
    () => canDownloadTemplate && uploadedFile && !isUploading && !fileError,
    [canDownloadTemplate, uploadedFile, isUploading, fileError]
  );

  // Clear errors when selection changes
  const clearErrors = useCallback(() => {
    setUploadedFile(null);
    setUploadStatus(null);
    setErrorDetails([]);
    setFileError(null);
  }, []);

  // Auto-select current academic year when checkbox is checked
  useEffect(() => {
    if (autoSelectYear && academicYears.length > 0) {
      const currentYear = academicYears.find((year) => year.isCurrent);
      if (currentYear && currentYear.id !== selection.academicYearId) {
        setSelection((prev) => ({
          ...prev,
          academicYearId: currentYear.id,
          semesterId: null,
          classId: null
        }));
        clearErrors();
      }
    }
  }, [autoSelectYear, academicYears, selection.academicYearId, clearErrors]);

  // Auto-select current semester when checkbox is checked
  useEffect(() => {
    if (autoSelectSemester && semesters.length > 0) {
      const currentSemester = semesters.find((semester) => semester.isCurrent);
      if (currentSemester && currentSemester.id !== selection.semesterId) {
        setSelection((prev) => ({
          ...prev,
          semesterId: currentSemester.id,
          classId: null
        }));
        clearErrors();
      }
    }
  }, [autoSelectSemester, semesters, selection.semesterId, clearErrors]);

  const handleAcademicYearChange = useCallback(
    (value: string) => {
      const academicYearId = parseInt(value);
      setSelection((prev) => ({
        academicYearId,
        semesterId: null,
        classId: null
      }));
      setAutoSelectYear(false);
      clearErrors();
    },
    [clearErrors]
  );

  const handleSemesterChange = useCallback(
    (value: string) => {
      const semesterId = parseInt(value);
      setSelection((prev) => ({
        ...prev,
        semesterId,
        classId: null
      }));
      setAutoSelectSemester(false);
      clearErrors();
    },
    [clearErrors]
  );

  const handleClassChange = useCallback(
    (value: string) => {
      const classId = parseInt(value);
      setSelection((prev) => ({
        ...prev,
        classId
      }));
      clearErrors();
    },
    [clearErrors]
  );

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (
        file.type !==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        return t('valid_xlsx_file_error');
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return t('file_size_error');
      }

      // Check file name extension
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        return t('xlsx_extension_error');
      }

      return null;
    },
    [t]
  );

  const handleFileUpload = useCallback(
    (files: File[]) => {
      setFileError(null);

      if (!files.length) {
        return;
      }

      const file = files[0];
      const validationError = validateFile(file);

      if (validationError) {
        setFileError(validationError);
        toast.error(t('invalid_file_toast_title'), {
          description: validationError
        });
        return;
      }

      setUploadedFile(file);
      setUploadStatus(null);
      setErrorDetails([]);
      toast.success(t('file_selected_toast_title'), {
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      });
    },
    [validateFile, t]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFileUpload(files);
      // Reset input value to allow re-selecting the same file
      e.target.value = '';
    },
    [handleFileUpload]
  );

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setUploadStatus(null);
    setErrorDetails([]);
    setFileError(null);
    toast.info(t('file_removed_toast_title'), {
      description: t('file_removed_toast_description')
    });
  }, [t]);

  const downloadTemplate = useCallback(() => {
    if (!canDownloadTemplate) {
      toast.error(t('selection_required_toast_title'), {
        description: t('selection_required_toast_description')
      });
      return;
    }

    if (classSubjects.length === 0) {
      toast.error(t('download_failed_toast_title'), {
        description: t('no_subjects_toast_description')
      });
      return;
    }

    startDownloadTransition(async () => {
      try {
        // Create template with class subjects
        const templateData = {
          academicYear: selectedAcademicYear!.yearRange,
          semester: selectedSemester!.semesterName,
          class: selectedClass!.className,
          classCode: selectedClass!.departmentCode,
          subjects: classSubjects.map((cs) => ({
            id: cs.subject.id,
            name: cs.subject.subjectName,
            creditHours: cs.subject.creditHours,
            assignWeight: cs.subject.assignWeight,
            examWeight: cs.subject.examWeight
          }))
        };

        // Call server action
        const result = await generateStudentTemplate(
          selection.classId!,
          templateData
        );

        if (result.success) {
          // Convert base64 to blob and download
          const binaryString = atob(result.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: result.mimeType });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename!;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          toast.success(t('template_download_success_toast_title'), {
            description: t('template_download_success_toast_description', {
              filename: result.filename!
            })
          });
        } else {
          toast.error(t('download_failed_toast_title'), {
            description: t('template_download_failed_toast_description', {
              error: result.error || t('generate_template_button')
            })
          });
        }
      } catch (error) {
        console.error('Template download error:', error);
        const errorMessage =
          error instanceof Error ? error.message : t('something_went_wrong');

        toast.error(t('download_failed_toast_title'), {
          description: t('template_download_failed_toast_description', {
            error: errorMessage
          })
        });
      }
    });
  }, [
    canDownloadTemplate,
    selection.classId,
    selectedAcademicYear,
    selectedSemester,
    selectedClass,
    classSubjects,
    t
  ]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      if (!canDownloadTemplate) {
        toast.error(t('selection_required_toast_title'), {
          description: t('selection_required_toast_description')
        });
      } else if (!uploadedFile) {
        toast.error(t('file_required_toast_title'), {
          description: t('file_required_toast_description')
        });
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    setErrorDetails([]);
    setErrorData([]);
    setErrorHeaders([]);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile!);
      formData.append('academicYearId', selection.academicYearId!.toString());
      formData.append('semesterId', selection.semesterId!.toString());
      formData.append('classId', selection.classId!.toString());

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await importStudentResults(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadStatus('success');
        setErrorDetails([]); // Clear any previous errors
        setErrorData([]); // Clear error data
        setErrorHeaders([]); // Clear error headers
        toast.success(t('import_success_toast_title'), {
          description: t('import_success_toast_description', {
            count: result.processedCount!
          })
        });
      } else {
        setUploadStatus('error');
        const errors = result.errors || [];
        setErrorDetails(errors);

        // Only set error data if there are actual errors
        if (errors.length > 0 && result.errorData) {
          setErrorData(result.errorData);
          setErrorHeaders(result.headers || []);
        }

        const errorCount = errors.length;
        if (errorCount > 0) {
          toast.error(t('import_failed_toast_title'), {
            description: t('import_failed_with_errors_toast_description', {
              errorCount,
              plural: errorCount !== 1 ? 's' : ''
            })
          });
        } else {
          toast.error(t('import_failed_toast_title'), {
            description:
              result.message || t('import_failed_unknown_toast_description')
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('something_went_wrong');

      setUploadStatus('error');
      setErrorDetails([
        {
          row: 0,
          column: 'general',
          field: 'general',
          message: `${t('upload_failed_toast_title')}: ${errorMessage}`
        }
      ]);

      toast.error(t('upload_failed_toast_title'), {
        description: t('upload_failed_toast_description')
      });
    } finally {
      setIsUploading(false);
    }
  }, [canSubmit, canDownloadTemplate, uploadedFile, selection, t]);

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Selection Form */}
      <Card>
        <CardHeader className='space-y-3'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>{t('header_title')}</h1>
            <p className='text-muted-foreground'>{t('header_description')}</p>
          </div>
          <Separator />
          <CardTitle className='flex items-center gap-2'>
            <FileSpreadsheet className='h-5 w-5' />
            {t('select_academic_context_title')}
          </CardTitle>
          <CardDescription>
            {t('select_academic_context_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Academic Year Selection */}
            <div className='space-y-3'>
              <div className='flex items-center gap-3 mb-2'>
                <Label htmlFor='academic-year' className='flex items-center'>
                  {t('academic_year_label')}
                  {loadingYears && (
                    <Loader className='ml-2 size-4 animate-spin' />
                  )}
                </Label>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='auto-select-year'
                    checked={autoSelectYear}
                    onCheckedChange={(checked) =>
                      setAutoSelectYear(checked as boolean)
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <Label
                    htmlFor='auto-select-year'
                    className='text-sm text-muted-foreground'
                  >
                    {t('current_checkbox_label')}
                  </Label>
                </div>
              </div>
              {loadingYears ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <Combobox
                  options={academicYears.map((s) => ({
                    value: s.id.toString(),
                    label: `${s.yearRange} ${s.isCurrent ? t('current_checkbox_label') : ''}`
                  }))}
                  value={selection.academicYearId?.toString() || ''}
                  onValueChange={handleAcademicYearChange}
                  placeholder={t('select_year_placeholder')}
                  searchPlaceholder={t('search_year_placeholder')}
                  disabled={loadingYears}
                />
              )}
            </div>

            {/* Semester Selection */}
            <div className='space-y-3'>
              <div className='flex items-center gap-3 mb-2'>
                <Label htmlFor='semester' className='flex items-center'>
                  {t('semester_label')}
                  {loadingSemesters && (
                    <Loader className='ml-2 size-4 animate-spin' />
                  )}
                </Label>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='auto-select-semester'
                    checked={autoSelectSemester}
                    onCheckedChange={(checked) =>
                      setAutoSelectSemester(checked as boolean)
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    disabled={!selection.academicYearId}
                  />
                  <Label
                    htmlFor='auto-select-semester'
                    className='text-sm text-muted-foreground'
                  >
                    {t('current_checkbox_label')}
                  </Label>
                </div>
              </div>
              {loadingSemesters ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <Combobox
                  options={semesters.map((s) => ({
                    value: s.id.toString(),
                    label: `${s.semesterName} ${s.isCurrent ? t('current_checkbox_label') : ''}`
                  }))}
                  value={selection.semesterId?.toString() || ''}
                  onValueChange={handleSemesterChange}
                  placeholder={t('select_semester_placeholder')}
                  searchPlaceholder={t('search_semester_placeholder')}
                  disabled={loadingSemesters}
                />
              )}
            </div>

            {/* Class Selection */}
            <div className='space-y-3'>
              <Label htmlFor='class' className='mb-[0.9rem]'>
                {t('class_label')}
                {loadingClasses && (
                  <Loader className='ml-2 size-4 animate-spin' />
                )}
              </Label>
              {loadingClasses ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <Combobox
                  options={sortedClasses.map((s) => ({
                    value: s.id.toString(),
                    label: `${s.className} (${s.departmentCode})`
                  }))}
                  value={selection.classId?.toString() || ''}
                  onValueChange={handleClassChange}
                  placeholder={t('select_class_placeholder')}
                  searchPlaceholder={t('search_class_placeholder')}
                  disabled={loadingClasses}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            {t('download_template_title')}
          </CardTitle>
          <CardDescription>
            {t('download_template_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!loadingclassSubjects && showNoSubjectsError && (
            <Alert className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mb-4'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-800 dark:text-red-200'>
                {t('no_subjects_error')}
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={downloadTemplate}
            disabled={!canDownloadTemplate || isDownloadingTemplate}
            className='w-full md:w-auto'
          >
            {isDownloadingTemplate ? (
              <>
                <Loader className='h-4 w-4 mr-2 animate-spin' />
                {t('generate_template_button')}
              </>
            ) : (
              <>
                <Download className='h-4 w-4 mr-2' />
                {t('download_template_button')}
              </>
            )}
          </Button>
          {!loadingclassSubjects && !canDownloadTemplate && (
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
              {!selection.academicYearId ||
              !selection.semesterId ||
              !selection.classId
                ? t('selection_prompt')
                : classSubjects.length === 0
                  ? t('no_subjects_prompt')
                  : t('complete_selection_prompt')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            {t('import_excel_title')}
          </CardTitle>
          <CardDescription>{t('import_excel_description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : uploadedFile && !fileError
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : fileError
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : `border-gray-300 hover:border-gray-400 dark:border-gray-600
                      dark:hover:border-gray-500`
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className='space-y-2'>
                <FileSpreadsheet
                  className={`h-8 w-8 mx-auto ${fileError ? 'text-red-600 ' : 'text-green-600'}`}
                />
                <div className='flex items-center justify-center gap-2'>
                  <span
                    className={`text-sm font-medium
                      ${fileError ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}
                  >
                    {uploadedFile.name}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={removeFile}
                    className='h-6 w-6 p-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                <p className='text-xs text-gray-500'>
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {fileError && (
                  <Alert className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mt-2'>
                    <AlertCircle className='h-4 w-4 text-red-600' />
                    <AlertDescription className='text-red-800 dark:text-red-200 text-sm'>
                      {fileError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className='space-y-2'>
                <Upload className='h-8 w-8 mx-auto text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {t('drop_file_prompt')}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {t('browse_file_prompt')}
                  </p>
                </div>
                <input
                  type='file'
                  accept='.xlsx'
                  onChange={handleFileSelect}
                  className='hidden'
                  id='file-upload'
                  disabled={!canDownloadTemplate}
                />
                <label htmlFor='file-upload'>
                  <Button
                    variant='outline'
                    className={`cursor-pointer ${!canDownloadTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}
                    asChild
                    disabled={!canDownloadTemplate}
                  >
                    <span>{t('choose_file_button')}</span>
                  </Button>
                </label>
                {!canDownloadTemplate && (
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                    {!selection.academicYearId ||
                    !selection.semesterId ||
                    !selection.classId
                      ? t('selection_prompt')
                      : classSubjects.length === 0
                        ? t('no_subjects_prompt')
                        : t('complete_all_steps_prompt')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>{t('uploading_progress_text')}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className='w-full' />
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <Alert className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertDescription className='text-green-800 dark:text-green-200'>
                {t('upload_success_message')}
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-800 dark:text-red-200'>
                <div className='space-y-3'>
                  <p className='font-medium'>{t('import_error_title')}</p>
                  <div className='flex gap-2'>
                    <Sheet
                      open={showErrorSheet}
                      onOpenChange={setShowErrorSheet}
                    >
                      <SheetTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-red-700 dark:text-red-400 border-red-300 dark:border-red-600'
                        >
                          {t('view_errors_button', {
                            errorCount: errorDetails.length
                          })}
                        </Button>
                      </SheetTrigger>
                      <SheetContent className='w-[90vw] sm:max-w-[90vw] max-w-none'>
                        <SheetHeader>
                          <SheetTitle>
                            {t('import_errors_sheet_title')}
                          </SheetTitle>
                          <SheetDescription>
                            {t('import_errors_sheet_description')}
                          </SheetDescription>
                        </SheetHeader>
                        <div className='mt-6 h-[calc(100vh-200px)] overflow-auto'>
                          {errorDetails.some(
                            (err) => !err.row || err.field === 'general'
                          ) && (
                            <div
                              className='mx-4 mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200
                                dark:border-red-800 rounded-lg'
                            >
                              <h3 className='font-semibold text-red-800 dark:text-red-200 mb-3'>
                                {t('general_import_errors_title')}
                              </h3>
                              <div className='space-y-2'>
                                {errorDetails
                                  .filter(
                                    (err) => !err.row || err.field === 'general'
                                  )
                                  .map((error, index) => (
                                    <div
                                      key={index}
                                      className='text-sm text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 p-2 rounded
                                        border dark:border-gray-600'
                                    >
                                      {error.message}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          <TooltipProvider>
                            {errorData.length > 0 && (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className='w-16'>
                                      {t('table_row_header')}
                                    </TableHead>
                                    {errorHeaders.map((header, index) => (
                                      <TableHead
                                        key={index}
                                        className='min-w-[120px]'
                                      >
                                        {header}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {errorData.map((row, rowIndex) => {
                                    const actualRowNumber = rowIndex + 2; // +2 for header row and 0-indexing
                                    const rowErrors = errorDetails.filter(
                                      (err) => err.row === actualRowNumber
                                    );
                                    const hasRowErrors = rowErrors.length > 0;

                                    return (
                                      <TableRow
                                        key={rowIndex}
                                        className={
                                          hasRowErrors
                                            ? 'bg-red-50/50 dark:bg-background dark:hover:bg-muted-foreground/20'
                                            : ''
                                        }
                                      >
                                        <TableCell
                                          className={`font-medium
                                          ${hasRowErrors ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}
                                        >
                                          {actualRowNumber}
                                        </TableCell>
                                        {errorHeaders.map(
                                          (header, colIndex) => {
                                            const cellError = rowErrors.find(
                                              (err) =>
                                                err.column === header ||
                                                err.field ===
                                                  header
                                                    .toLowerCase()
                                                    .replace(/\s+/g, '')
                                            );
                                            const hasError = !!cellError;

                                            return (
                                              <TableCell
                                                key={colIndex}
                                                className={
                                                  hasError
                                                    ? `bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600
                                                      text-red-800 dark:text-red-200`
                                                    : ''
                                                }
                                              >
                                                {hasError ? (
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <div className='text-red-800 dark:text-red-200 font-medium'>
                                                        {
                                                          (row[header] ??
                                                            '') as React.ReactNode
                                                        }
                                                      </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p className='font-lg'>
                                                        {cellError.message}
                                                      </p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                ) : (
                                                  <div>
                                                    {
                                                      (row[header] ??
                                                        '') as React.ReactNode
                                                    }
                                                  </div>
                                                )}
                                              </TableCell>
                                            );
                                          }
                                        )}
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            )}
                          </TooltipProvider>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className='max-h-32 overflow-y-auto space-y-1'>
                    {errorDetails.slice(0, 5).map((error, index) => (
                      <div
                        key={index}
                        className='text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded
                          border dark:border-gray-600'
                      >
                        <span className='font-medium'>
                          {t('table_row_header')} {error.row}:
                        </span>{' '}
                        {error.message}
                        {error.field !== 'general' && (
                          <span className='text-gray-600 dark:text-gray-400'>
                            (Column: {error.column})
                          </span>
                        )}
                      </div>
                    ))}
                    {errorDetails.length > 5 && (
                      <div className='text-xs text-gray-600 dark:text-gray-400'>
                        {t('more_errors_prompt', {
                          remainingCount: errorDetails.length - 5
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className='w-full md:w-auto'
            size='lg'
          >
            {isUploading ? (
              <>
                <Loader className='h-4 w-4 mr-2 animate-spin' />
                {t('processing_button')}
              </>
            ) : (
              <>
                <Upload className='h-4 w-4 mr-2' />
                {t('import_data_button')}
              </>
            )}
          </Button>

          {!canSubmit && !isUploading && (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {!canDownloadTemplate
                ? !selection.academicYearId ||
                  !selection.semesterId ||
                  !selection.classId
                  ? t('selection_prompt')
                  : classSubjects.length === 0
                    ? t('no_subjects_prompt')
                    : t('complete_selection_prompt')
                : !uploadedFile
                  ? t('file_required_toast_description')
                  : fileError
                    ? t('fix_file_error_prompt')
                    : t('complete_all_steps_prompt')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default XlsxImportForm;
