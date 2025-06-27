'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import { type AcademicYearResultViewWithDetails } from '@/actions/academic-result';

interface DownloadButtonProps {
  resultData: AcademicYearResultViewWithDetails;
}

export function AcademicResultDownloadButton({
  resultData
}: DownloadButtonProps) {
  const [isPending, startTransition] = useTransition();

  const generateWordFromTemplate = () => {
    startTransition(async () => {
      try {
        const { createReport } = await import('docx-templates');

        // Load template file
        const templateResponse = await fetch('/templates/result_template.docx');
        const templateBuffer = await templateResponse.arrayBuffer();

        // Convert ArrayBuffer to Uint8Array
        const templateUint8Array = new Uint8Array(templateBuffer);

        // Prepare data for template
        const templateData = {
          // Student Information
          studentName: resultData.student.studentName,
          rollNumber: resultData.student.admissionId,
          academicYear: resultData.academicYear.yearRange,

          // Overall Result Information
          overallGpa: resultData.overallGpa.toFixed(2),
          totalCredits: resultData.totalCredits,
          totalGp: resultData.totalGp.toFixed(2),
          status: resultData.status,

          // Semester Results
          semesters: resultData.semesterResults.map(
            (semesterResult, index) => ({
              semesterNumber: index + 1,
              semesterName: semesterResult.enrollment.semester.semesterName,
              className: semesterResult.enrollment.class.className,
              departmentCode: semesterResult.enrollment.class.departmentCode,
              gpa: semesterResult.gpa.toFixed(2),
              semesterCredits: semesterResult.totalCredits,
              semesterGp: semesterResult.totalGp.toFixed(2),
              semesterStatus: semesterResult.status,

              // Grades for each subject in the semester
              grades: semesterResult.enrollment.grades.map(
                (grade, gradeIndex) => ({
                  no: gradeIndex + 1,
                  subjectName: grade.classSubject.subject.subjectName,
                  crdUnit: grade.classSubject.subject.creditHours,
                  grade: grade.grade,
                  score: grade.gp.toFixed(2),
                  point: (
                    grade.gp * grade.classSubject.subject.creditHours
                  ).toFixed(2),
                  examMark: grade.examMark,
                  assignMark: grade.assignMark,
                  finalMark: grade.finalMark
                })
              )
            })
          ),

          // Current date
          currentDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };

        // Generate document from template
        const report = await createReport({
          template: templateUint8Array,
          data: templateData,
          cmdDelimiter: ['{', '}'] // Use {variableName} in template
        });

        // Download the generated document
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resultData.student.studentName}_${resultData.student.admissionId}_Academic_Result.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating document from template:', error);
        alert(
          'Failed to generate document. Please ensure template file exists and data is correct.'
        );
      }
    });
  };

  return (
    <Button
      onClick={generateWordFromTemplate}
      disabled={isPending}
      variant='secondary'
      className='w-full sm:w-auto'
    >
      {isPending ? (
        <Loader className='mr-2 size-4 animate-spin' aria-hidden='true' />
      ) : (
        <Download className='h-4 w-4 mr-2' />
      )}
      {isPending ? 'Exporting...' : 'Export DOCX'}
    </Button>
  );
}
