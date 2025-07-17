'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import { type AcademicYearResultViewWithDetails } from '@/actions/academic-result';
import { useTranslations } from 'next-intl';

interface DownloadButtonProps {
  resultData: AcademicYearResultViewWithDetails;
  gradeScales: Array<{
    grade: string;
    score: string;
  }>;
}

export function AcademicResultDownloadButton({
  resultData,
  gradeScales
}: DownloadButtonProps) {
  const t = useTranslations(
    'AcademicYearResultsPage.ResultView.DownloadButton'
  );
  const [isPending, startTransition] = useTransition();

  const generateWordFromTemplate = () => {
    startTransition(async () => {
      try {
        const { createReport } = await import('docx-templates');

        // Load template file
        const templateResponse = await fetch(
          '/templates/academic-result-template-default.docx'
        );
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
          totalCredits: resultData.totalCredits.toFixed(2),
          totalGp: resultData.totalGp.toFixed(2),
          status: resultData.status,
          className: resultData.semesterResults[0].enrollment.class.className,

          // Semester Results
          semesters: resultData.semesterResults
            .map((semesterResult, index) => ({
              semesterNumber: index + 1,
              semesterName: semesterResult.enrollment.semester.semesterName,
              className: semesterResult.enrollment.class.className,
              departmentCode: semesterResult.enrollment.class.departmentCode,
              gpa: semesterResult.gpa.toFixed(2),
              semesterCredits: semesterResult.totalCredits.toFixed(2),
              semesterGp: semesterResult.totalGp.toFixed(2),
              semesterStatus: semesterResult.status,

              // Grades for each subject in the semester
              grades: semesterResult.enrollment.grades.map(
                (grade, gradeIndex) => ({
                  no: gradeIndex + 1,
                  subjectName: grade.classSubject.subject.subjectName,
                  creditUnit: grade.classSubject.subject.creditHours.toFixed(2),
                  grade: grade.grade,
                  score: grade.score.toFixed(2),
                  point: grade.gp.toFixed(2),
                  examMark: grade.examMark,
                  assignMark: grade.assignMark,
                  finalMark: grade.finalMark
                })
              )
            }))
            .sort((a, b) => {
              const getSemesterNumber = (name: string) => {
                const numMatch = name.match(/(\d+)/);
                if (numMatch) return parseInt(numMatch[0]);
                const textualNumbers = [
                  'first',
                  'second',
                  'third',
                  'fourth',
                  'fifth',
                  'sixth'
                ];
                const lowerName = name.toLowerCase();
                for (let i = 0; i < textualNumbers.length; i++) {
                  if (lowerName.includes(textualNumbers[i])) return i + 1;
                }
                return 0;
              };
              return (
                getSemesterNumber(a.semesterName) -
                getSemesterNumber(b.semesterName)
              );
            }),

          gradeScales: gradeScales,

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
        alert(t('generate_error'));
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
      {isPending ? t('exporting') : t('export_docx')}
    </Button>
  );
}
