'use client';

import {
  generateStudentTemplate,
  importStudentResults
} from '@/actions/import-result';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface SelectionState {
  academicYearId: number | null;
  semesterId: number | null;
  classId: number | null;
}

export interface AcademicYear {
  id: number;
  yearRange: string;
  isCurrent: boolean;
}

export interface Semester {
  id: number;
  semesterName: string;
  academicYearId: number;
  isCurrent: boolean;
}

export interface Class {
  id: number;
  className: string;
  departmentCode: 'CS' | 'CT' | 'CST';
  semesterId: number;
}

export interface Subject {
  id: string;
  subjectName: string;
  creditHours: number;
  examWeight: number;
  assignWeight: number;
}

export interface ClassSubject {
  id: number;
  classId: number;
  subjectId: string;
  subject: Subject;
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

  // Optimized selection handlers to prevent unnecessary re-renders
  const handleAcademicYearChange = useCallback(
    (value: string) => {
      const academicYearId = parseInt(value);
      setSelection((prev) => ({
        academicYearId,
        semesterId: null,
        classId: null
      }));
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

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (
      file.type !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return 'Please select a valid XLSX file format.';
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'File size exceeds 10MB limit. Please use a smaller file.';
    }

    // Check file name extension
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return 'File must have .xlsx extension.';
    }

    return null;
  }, []);

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
        toast.error('Invalid File', {
          description: validationError
        });
        return;
      }

      setUploadedFile(file);
      setUploadStatus(null);
      setErrorDetails([]);
      toast.success('File Selected', {
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      });
    },
    [validateFile]
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
    toast.info('File Removed', {
      description: 'Please select another file to continue.'
    });
  }, []);

  const downloadTemplate = useCallback(() => {
    if (!canDownloadTemplate) {
      toast.error('Selection Required', {
        description: 'Please select academic year, semester, and class first.'
      });
      return;
    }

    if (classSubjects.length === 0) {
      toast.error('Download Failed', {
        description: 'No subjects found for this class'
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

          toast.success('Template Downloaded', {
            description: `${result.filename} has been downloaded successfully.`
          });
        } else {
          toast.error('Download Failed', {
            description: `Failed to download template: ${result.error || 'Failed to generate template'}`
          });
        }
      } catch (error) {
        console.error('Template download error:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        toast.error('Download Failed', {
          description: `Failed to download template: ${errorMessage}`
        });
      }
    });
  }, [
    canDownloadTemplate,
    selection.classId,
    selectedAcademicYear,
    selectedSemester,
    selectedClass,
    classSubjects
  ]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      if (!canDownloadTemplate) {
        toast.error('Selection Required', {
          description: 'Please select academic year, semester, and class first.'
        });
      } else if (!uploadedFile) {
        toast.error('File Required', {
          description: 'Please upload an Excel file to proceed.'
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
        toast.success('Import Successful', {
          description: `Successfully imported ${result.processedCount} student records!`
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
          toast.error('Import Failed', {
            description: `Import completed with ${errorCount} error${errorCount !== 1 ? 's' : ''}. Click 'View Errors' for details.`
          });
        } else {
          toast.error('Import Failed', {
            description: result.message || 'Import failed for unknown reasons.'
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setUploadStatus('error');
      setErrorDetails([
        {
          row: 0,
          column: 'general',
          field: 'general',
          message: `Upload failed: ${errorMessage}`
        }
      ]);

      toast.error('Upload Failed', {
        description: 'Failed to upload and process the file. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  }, [canSubmit, canDownloadTemplate, uploadedFile, selection]);

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Selection Form */}
      <Card>
        <CardHeader className='space-y-3'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Student Results Import
            </h1>
            <p className='text-gray-600'>
              Import student result data from Excel files
            </p>
          </div>
          <Separator />
          <CardTitle className='flex items-center gap-2'>
            <FileSpreadsheet className='h-5 w-5' />
            Select Academic Context
          </CardTitle>
          <CardDescription>
            Choose the academic year, semester, and class for data import
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Academic Year Selection */}
            <div className='space-y-3'>
              <Label htmlFor='academic-year'>
                Academic Year
                {loadingYears && (
                  <Loader className='ml-2 size-4 animate-spin' />
                )}
              </Label>
              {loadingYears ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <Select
                  value={selection.academicYearId?.toString() || ''}
                  onValueChange={handleAcademicYearChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select academic year' />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id.toString()}>
                        {year.yearRange} {year.isCurrent && '(Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Semester Selection */}
            <div className='space-y-3'>
              <Label htmlFor='semester'>
                Semester
                {loadingSemesters && (
                  <Loader className='ml-2 size-4 animate-spin' />
                )}
              </Label>
              {loadingSemesters ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <Select
                  value={selection.semesterId?.toString() || ''}
                  onValueChange={handleSemesterChange}
                  disabled={!selection.academicYearId || loadingSemesters}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select semester' />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem
                        key={semester.id}
                        value={semester.id.toString()}
                      >
                        {semester.semesterName}{' '}
                        {semester.isCurrent && '(Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Class Selection */}
            <div className='space-y-3'>
              <Label htmlFor='class'>
                Class
                {loadingClasses && (
                  <Loader className='ml-2 size-4 animate-spin' />
                )}
              </Label>
              {loadingClasses ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <Select
                  value={selection.classId?.toString() || ''}
                  onValueChange={handleClassChange}
                  disabled={!selection.semesterId || loadingClasses}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select class' />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.className} ({cls.departmentCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            Download Template
          </CardTitle>
          <CardDescription>
            Download the Excel template with the correct format for data entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!loadingclassSubjects && showNoSubjectsError && (
            <Alert className='border-red-200 bg-red-50 mb-4'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-800'>
                No subjects found for the selected class. Please ensure the
                class has subjects assigned before generating the template.
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
                Generating Template...
              </>
            ) : (
              <>
                <Download className='h-4 w-4 mr-2' />
                Download Excel Template
              </>
            )}
          </Button>
          {!loadingclassSubjects && !canDownloadTemplate && (
            <p className='text-sm text-gray-500 mt-2'>
              {!selection.academicYearId ||
              !selection.semesterId ||
              !selection.classId
                ? 'Please select academic year, semester, and class first'
                : classSubjects.length === 0
                  ? 'No subjects available for the selected class'
                  : 'Please complete all selections'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Import Excel File
          </CardTitle>
          <CardDescription>
            Upload your completed Excel file with student data
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : uploadedFile && !fileError
                  ? 'border-green-500 bg-green-50'
                  : fileError
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className='space-y-2'>
                <FileSpreadsheet
                  className={`h-8 w-8 mx-auto ${fileError ? 'text-red-600' : 'text-green-600'}`}
                />
                <div className='flex items-center justify-center gap-2'>
                  <span
                    className={`text-sm font-medium ${fileError ? 'text-red-700' : ''}`}
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
                  <Alert className='border-red-200 bg-red-50 mt-2'>
                    <AlertCircle className='h-4 w-4 text-red-600' />
                    <AlertDescription className='text-red-800 text-sm'>
                      {fileError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className='space-y-2'>
                <Upload className='h-8 w-8 mx-auto text-gray-400' />
                <div>
                  <p className='text-sm font-medium'>
                    Drop your Excel file here
                  </p>
                  <p className='text-xs text-gray-500'>or click to browse</p>
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
                    <span>Choose File</span>
                  </Button>
                </label>
                {!canDownloadTemplate && (
                  <p className='text-xs text-gray-500 mt-1'>
                    {!selection.academicYearId ||
                    !selection.semesterId ||
                    !selection.classId
                      ? 'Please select academic year, semester, and class first'
                      : classSubjects.length === 0
                        ? 'No subjects available for the selected class'
                        : 'Please complete all selections first'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Uploading and processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className='w-full' />
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertDescription className='text-green-800'>
                File uploaded and processed successfully! All student data has
                been imported.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert className='border-red-200 bg-red-50'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-800'>
                <div className='space-y-3'>
                  <p className='font-medium'>Import completed with errors:</p>
                  <div className='flex gap-2'>
                    <Sheet
                      open={showErrorSheet}
                      onOpenChange={setShowErrorSheet}
                    >
                      <SheetTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-red-700 border-red-300'
                        >
                          View Errors ({errorDetails.length})
                        </Button>
                      </SheetTrigger>
                      <SheetContent className='w-[90vw] sm:max-w-[90vw] max-w-none'>
                        <SheetHeader>
                          <SheetTitle>Import Errors</SheetTitle>
                          <SheetDescription>
                            Review the data with errors. Cells with errors are
                            highlighted in red.
                          </SheetDescription>
                        </SheetHeader>
                        <div className='mt-6 h-[calc(100vh-200px)] overflow-auto'>
                          {errorData.length > 0 && (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className='w-16'>Row</TableHead>
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
                                        hasRowErrors ? 'bg-red-50/50' : ''
                                      }
                                    >
                                      <TableCell
                                        className={`font-medium ${hasRowErrors ? 'text-red-700' : ''}`}
                                      >
                                        {actualRowNumber}
                                      </TableCell>
                                      {errorHeaders.map((header, colIndex) => {
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
                                                ? 'bg-red-100 border border-red-300 text-red-800'
                                                : ''
                                            }
                                          >
                                            <div
                                              className={
                                                hasError
                                                  ? 'text-red-800 font-medium'
                                                  : ''
                                              }
                                            >
                                              {
                                                (row[header] ??
                                                  '') as React.ReactNode
                                              }
                                            </div>
                                            {hasError && (
                                              <div className='text-xs text-red-600 mt-1 font-medium'>
                                                {cellError.message}
                                              </div>
                                            )}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className='max-h-32 overflow-y-auto space-y-1'>
                    {errorDetails.slice(0, 5).map((error, index) => (
                      <div
                        key={index}
                        className='text-xs bg-white p-2 rounded border'
                      >
                        <span className='font-medium'>Row {error.row}:</span>{' '}
                        {error.message}
                        {error.field !== 'general' && (
                          <span className='text-gray-600'>
                            {' '}
                            (Column: {error.column})
                          </span>
                        )}
                      </div>
                    ))}
                    {errorDetails.length > 5 && (
                      <div className='text-xs text-gray-600'>
                        ... and {errorDetails.length - 5} more errors
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
                Processing...
              </>
            ) : (
              <>
                <Upload className='h-4 w-4 mr-2' />
                Import Student Data
              </>
            )}
          </Button>

          {!canSubmit && !isUploading && (
            <p className='text-sm text-gray-500'>
              {!canDownloadTemplate
                ? !selection.academicYearId ||
                  !selection.semesterId ||
                  !selection.classId
                  ? 'Please complete all selections first'
                  : classSubjects.length === 0
                    ? 'No subjects available for the selected class'
                    : 'Please complete all selections'
                : !uploadedFile
                  ? 'Please upload a valid Excel file to proceed'
                  : fileError
                    ? 'Please fix the file error before proceeding'
                    : 'Please complete all steps to proceed'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default XlsxImportForm;
