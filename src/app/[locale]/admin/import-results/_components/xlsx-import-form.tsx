'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Loader
} from 'lucide-react';
import {
  useAcademicYears,
  useSemesters,
  useClasses,
  useClassSubjects
} from '@/hooks/use-academic-data';
import { Skeleton } from '@/components/ui/skeleton';
import { generateStudentTemplate } from '@/actions/import-result';

interface UploadError {
  row: number;
  field: string;
  message: string;
}

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

const XlsxImportForm = () => {
  const [selection, setSelection] = useState<SelectionState>({
    academicYearId: null,
    semesterId: null,
    classId: null
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [errorDetails, setErrorDetails] = useState<UploadError[]>([]);

  // Queries with proper dependency chain
  const { data: academicYears = [], isLoading: loadingYears } =
    useAcademicYears();
  const { data: semesters = [], isLoading: loadingSemesters } = useSemesters(
    selection.academicYearId || undefined
  );
  const { data: classes = [], isLoading: loadingClasses } = useClasses(
    selection.semesterId || undefined
  );
  const { data: classSubjects = [] } = useClassSubjects(
    selection.classId || undefined
  );

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
      !!(selection.academicYearId && selection.semesterId && selection.classId),
    [selection]
  );

  const canSubmit = useMemo(
    () => canDownloadTemplate && uploadedFile && !isUploading,
    [canDownloadTemplate, uploadedFile, isUploading]
  );

  // Optimized selection handlers to prevent unnecessary re-renders
  const handleAcademicYearChange = useCallback((value: string) => {
    const academicYearId = parseInt(value);
    setSelection((prev) => ({
      academicYearId,
      semesterId: null,
      classId: null
    }));
    // Reset upload state when selection changes
    setUploadedFile(null);
    setUploadStatus(null);
    setErrorDetails([]);
  }, []);

  const handleSemesterChange = useCallback((value: string) => {
    const semesterId = parseInt(value);
    setSelection((prev) => ({
      ...prev,
      semesterId,
      classId: null
    }));
    setUploadedFile(null);
    setUploadStatus(null);
    setErrorDetails([]);
  }, []);

  const handleClassChange = useCallback((value: string) => {
    const classId = parseInt(value);
    setSelection((prev) => ({
      ...prev,
      classId
    }));
    setUploadedFile(null);
    setUploadStatus(null);
    setErrorDetails([]);
  }, []);

  const handleFileUpload = useCallback((files: File[]) => {
    const file = files[0];
    if (
      file &&
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      setUploadedFile(file);
      setUploadStatus(null);
      setErrorDetails([]);
    } else {
      alert('Please select a valid XLSX file');
    }
  }, []);

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
    },
    [handleFileUpload]
  );

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setUploadStatus(null);
    setErrorDetails([]);
  }, []);

  const downloadTemplate = useCallback(async () => {
    if (!canDownloadTemplate) {
      alert('Please select a class first');
      return;
    }

    try {
      // Create template with class subjects
      const templateData = {
        academicYear: selectedAcademicYear?.yearRange,
        semester: selectedSemester?.semesterName,
        class: selectedClass?.className,
        subjects: classSubjects.map((cs) => ({
          id: cs.subject.id,
          name: cs.subject.subjectName,
          creditHours: cs.subject.creditHours
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
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Failed to download template. Please try again.');
      console.error('Template download error:', error);
    }
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
      alert('Please select all fields and upload a file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    setErrorDetails([]);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile!);
      formData.append('academicYearId', selection.academicYearId!.toString());
      formData.append('semesterId', selection.semesterId!.toString());
      formData.append('classId', selection.classId!.toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/import/students', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
        setErrorDetails(result.errors || []);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorDetails([
        {
          row: 0,
          field: 'general',
          message: 'Upload failed. Please try again.'
        }
      ]);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [canSubmit, uploadedFile, selection]);

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='text-center space-y-2'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Student Results Import
        </h1>
        <p className='text-gray-600'>
          Import student enrollment data from Excel files
        </p>
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
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
          <Button
            onClick={downloadTemplate}
            disabled={!canDownloadTemplate}
            className='w-full md:w-auto'
          >
            <Download className='h-4 w-4 mr-2' />
            Download Excel Template
          </Button>
          {!canDownloadTemplate && (
            <p className='text-sm text-gray-500 mt-2'>
              Please select academic year, semester, and class first
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
                : uploadedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className='space-y-2'>
                <FileSpreadsheet className='h-8 w-8 mx-auto text-green-600' />
                <div className='flex items-center justify-center gap-2'>
                  <span className='text-sm font-medium'>
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
                    Please select academic year, semester, and class first
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
                <div className='space-y-2'>
                  <p className='font-medium'>Import completed with errors:</p>
                  <div className='max-h-32 overflow-y-auto space-y-1'>
                    {errorDetails.map((error, index) => (
                      <div
                        key={index}
                        className='text-xs bg-white p-2 rounded border'
                      >
                        <span className='font-medium'>Row {error.row}:</span>{' '}
                        {error.message}
                        {error.field !== 'general' && (
                          <span className='text-gray-600'>
                            {' '}
                            (Field: {error.field})
                          </span>
                        )}
                      </div>
                    ))}
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
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
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
              Please complete all selections and upload a file to proceed
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default XlsxImportForm;
